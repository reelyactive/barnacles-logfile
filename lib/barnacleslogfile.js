/**
 * Copyright reelyActive 2019-2022
 * We believe in an open Internet of Things
 */


const fs = require('fs');
const Raddec = require('raddec');


const SUPPORTED_EVENTS = [ 'raddec', 'dynamb' ];
const DYNAMB_PROPERTIES = [ 'acceleration', 'angleOfRotation', 
                            'batteryPercentage', 'batteryVoltage', 'elevation',
                            'heading', 'heartRate', 'illuminance',
                            'interactionDigest', 'isButtonPressed',
                            'isContactDetected', 'isMotionDetected',
                            'magneticField', 'nearest', 'position', 'pressure',
                            'relativeHumidity', 'speed', 'temperature',
                            'txCount', 'unicodeCodePoints', 'uptime' ];
const DEFAULT_EVENTS_TO_LOG = { raddec: {}, dynamb: {} };
const DEFAULT_LOGFILE_PREFIX = 'eventlog';
const DEFAULT_LOGFILE_EXTENSION = '.csv';
const DEFAULT_MINUTES_TO_ROTATION = 60;
const DEFAULT_DELIMITER = ',';


/**
 * BarnaclesLogfile Class
 * Writes events to logfiles.
 */
class BarnaclesLogfile {

  /**
   * BarnaclesLogfile constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    options = options || {};

    let eventsToLog = options.eventsToLog || DEFAULT_EVENTS_TO_LOG;
    this.logfiles = {};

    for(const event in eventsToLog) {
      let isSupportedEvent = SUPPORTED_EVENTS.includes(event);

      if(isSupportedEvent) {
        let options;

        switch(event) {
          case 'raddec':
            options = eventsToLog[event];
            break;
          case 'dynamb':
            options = createDynambOptions(eventsToLog[event]);
            break;
        }

        this.logfiles[event] = createLogfile(this, event, options);
      }
    }
  }

  /**
   * Handle an outbound raddec.
   * @param {Raddec} raddec The outbound raddec.
   */
  handleRaddec(raddec) {
    if(this.logfiles.raddec) {
      handleRaddec(this.logfiles.raddec, raddec);
    }
  }

  /**
   * Handle an outbound event.
   * @param {String} name The outbound event name.
   * @param {Object} data The outbound event data.
   */
  handleEvent(name, data) {
    let self = this;
    let isEventToLog = self.logfiles.hasOwnProperty(name);

    if(isEventToLog) {
      let logfile = self.logfiles[name];

      switch(name) {
        case 'raddec':
          return self.handleRaddec(data);
        case 'dynamb':
          return handleDynamb(logfile, data);
      }
    }
  }

}


/**
 * Create the logfile and associated metadata.
 * @param {BarnaclesLogfile} instance The BarnaclesLogfile instance.
 * @param {String} event The name of the event to log.
 * @param {Object} options The (optional) logfile options.
 */
function createLogfile(instance, event, options) {
  let delimiter = options.delimiter || DEFAULT_DELIMITER;
  let logfile = {
      prefix: event,
      extension: options.logfileExtension || DEFAULT_LOGFILE_EXTENSION,
      minutesToRotation: options.minutesToRotation ||
                         DEFAULT_MINUTES_TO_ROTATION,
      header: createLogfileHeader(event, delimiter, options),
      delimiter: delimiter,
      lastRotationTime: 0
  }

  if(event === 'dynamb') {
    logfile.propertiesToLog = options.propertiesToLog;
  }

  return logfile;
}


/**
 * Create the logfile header.
 * @param {BarnaclesLogfile} instance The BarnaclesLogfile instance.
 */
function createLogfileHeader(event, delimiter, options) {
  let header = '"' + 'time' + '"' + delimiter;
  header += '"' + 'timestamp' + '"' + delimiter;

  switch(event) {
    case 'raddec':
      header += '"' + 'transmitterId' + '"' + delimiter;
      header += '"' + 'transmitterIdType' + '"' + delimiter;
      header += '"' + 'receiverId' + '"' + delimiter;
      header += '"' + 'receiverIdType' + '"' + delimiter;
      header += '"' + 'rssi' + '"' + delimiter;
      header += '"' + 'numberOfDecodings' + '"' + delimiter;
      header += '"' + 'numberOfReceivers' + '"' + delimiter;
      header += '"' + 'numberOfDistinctPackets' + '"' + delimiter;
      header += '"' + 'events' + '"' + '\r\n';
      break;
    case 'dynamb':
      header += '"' + 'deviceId' + '"' + delimiter;
      header += '"' + 'deviceIdType' + '"' + delimiter;
      options.propertiesToLog.forEach(function(property) {
        header += '"' + property + '"' + delimiter;
      });
      header += '\r\n';
      break;
  }

  return header;
}


/**
 * Return a time/date string in the form YYMMDD-HHMMSS
 * @return {String} The thirteen-digit string.
 */
function createCurrentTimeString() {
  let date = new Date();
  let timestring = date.getFullYear().toString().slice(-2);
  timestring += ('0' + (date.getMonth() + 1)).slice(-2);
  timestring += ('0' + date.getDate()).slice(-2);
  timestring += '-';
  timestring += ('0' + date.getHours()).slice(-2);
  timestring += ('0' + date.getMinutes()).slice(-2);
  timestring += ('0' + date.getSeconds()).slice(-2);

  return timestring;
}


/**
 * Handle the given raddec by writing to the given logfile.
 * @param {Object} logfile The logfile properties.
 * @param {Raddec} raddec The raddec data.
 */
function handleRaddec(logfile, raddec) {
  let flatRaddec = raddec.toFlattened();
  let isoTime = new Date(flatRaddec.timestamp).toISOString();
  let time = isoTime.substr(0,10) + ' ' + isoTime.substr(11,8);

  let line = '"' + time + '"' + logfile.delimiter; 
  line += flatRaddec.timestamp + logfile.delimiter;
  line += '"' + flatRaddec.transmitterId + '"' + logfile.delimiter;
  line += flatRaddec.transmitterIdType + logfile.delimiter;
  line += '"' + flatRaddec.receiverId + '"' + logfile.delimiter;
  line += flatRaddec.receiverIdType + logfile.delimiter;
  line += flatRaddec.rssi + logfile.delimiter;
  line += flatRaddec.numberOfDecodings + logfile.delimiter;
  line += flatRaddec.numberOfReceivers + logfile.delimiter;
  line += flatRaddec.numberOfDistinctPackets + logfile.delimiter;
  line += '"' + flatRaddec.events + '"' + '\r\n';

  manageRotation(logfile);
  fs.appendFile(logfile.filename, line, handleError);
}


/**
 * Handle the given dynamb by writing to the given logfile.
 * @param {Object} logfile The logfile properties.
 * @param {Object} dynamb The dynamb data.
 */
function handleDynamb(logfile, dynamb) {
  let isoTime = new Date(dynamb.timestamp).toISOString();
  let time = isoTime.substr(0,10) + ' ' + isoTime.substr(11,8);
  let hasPropertyToLog = false;

  let line = '"' + time + '"' + logfile.delimiter;
  line += dynamb.timestamp + logfile.delimiter;
  line += '"' + dynamb.deviceId + '"' + logfile.delimiter;
  line += dynamb.deviceIdType + logfile.delimiter;
  logfile.propertiesToLog.forEach(function(property) {
    if(dynamb.hasOwnProperty(property)) {
      let value = dynamb[property];
      hasPropertyToLog = true;

      if(typeof value === 'object') {
        value = JSON.stringify(value).replace(/"/g, '');
      }

      if(typeof value === 'number') {
        line += value;
      }
      else {
        line += '"' + value + '"';
      }
    }
    line += logfile.delimiter;
  });

  line += '\r\n';

  if(hasPropertyToLog) {
    manageRotation(logfile);
    fs.appendFile(logfile.filename, line, handleError);
  }
}


/**
 * Manage the rotation, if due, of the given logfile.
 * @param {Object} logfile The logfile properties.
 */
function manageRotation(logfile) {
  let isDueForRotation = (Date.now() - logfile.lastRotationTime) >=
                          (logfile.minutesToRotation * 60000);

  if(isDueForRotation) {
    logfile.filename = logfile.prefix + '-' + createCurrentTimeString() +
                       logfile.extension;
    fs.appendFile(logfile.filename, logfile.header, handleError);
    logfile.lastRotationTime = Date.now();
  }
}


/**
 * Create the dynamb optios.
 * @param {Object} options The (optional) logfile options.
 */
function createDynambOptions(options) {
  if(!options.hasOwnProperty('propertiesToLog') ||
     !Array.isArray(options.propertiesToLog)) {
    options.propertiesToLog = Array.from(DYNAMB_PROPERTIES);
  }

  return options;
}


/**
 * Handle any error in the callback of a logfile append.
 * @param {Error} err The appendFile error.
 */
function handleError(error) {
  if(error) {
    console.error('barnacles-logfile error code:', error.code);
  }
}


module.exports = BarnaclesLogfile;
