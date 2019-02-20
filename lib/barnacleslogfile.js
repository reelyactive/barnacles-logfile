/**
 * Copyright reelyActive 2019
 * We believe in an open Internet of Things
 */


const fs = require('fs');
const Raddec = require('raddec');


const DEFAULT_LOGFILE_PREFIX = 'eventlog';
const DEFAULT_LOGFILE_EXTENSION = '.csv';
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

    this.logfilePrefix = options.logfilePrefix || DEFAULT_LOGFILE_PREFIX;
    this.logfileExtension = options.logfileExtension ||
                            DEFAULT_LOGFILE_EXTENSION;
    this.delimiter = options.delimiter || DEFAULT_DELIMITER;
    this.logfileName = this.logfilePrefix + this.logfileExtension;

    createLogfile(this);
  }

  /**
   * Handle an outbound raddec.
   * @param {Raddec} raddec The outbound raddec.
   */
  handleRaddec(raddec) {
    let flatRaddec = raddec.toFlattened();
    let isoTime = new Date(flatRaddec.timestamp).toISOString();
    let time = isoTime.substr(0,10) + ' ' + isoTime.substr(11,8);

    let line = '"' + time + '"' + this.delimiter; 
    line += flatRaddec.timestamp + this.delimiter;
    line += '"' + flatRaddec.transmitterId + '"' + this.delimiter;
    line += flatRaddec.transmitterIdType + this.delimiter;
    line += '"' + flatRaddec.receiverId + '"' + this.delimiter;
    line += flatRaddec.receiverIdType + this.delimiter;
    line += flatRaddec.rssi + this.delimiter;
    line += flatRaddec.numberOfDecodings + this.delimiter;
    line += flatRaddec.numberOfReceivers + this.delimiter;
    line += flatRaddec.numberOfDistinctPackets + this.delimiter;
    line += '"' + flatRaddec.events + '"' + '\r\n';
    
    fs.appendFile(this.logfileName, line, handleError);
  }
}


/**
 * Create the logfile with header.
 * @param {Object} err The appendFile error.
 */
function createLogfile(instance) {
  let header = '"' + 'time' + '"' + instance.delimiter;
  header += '"' + 'timestamp' + '"' + instance.delimiter;
  header += '"' + 'transmitterId' + '"' + instance.delimiter;
  header += '"' + 'transmitterIdType' + '"' + instance.delimiter;
  header += '"' + 'receiverId' + '"' + instance.delimiter;
  header += '"' + 'receiverIdType' + '"' + instance.delimiter;
  header += '"' + 'rssi' + '"' + instance.delimiter;
  header += '"' + 'numberOfDecodings' + '"' + instance.delimiter;
  header += '"' + 'numberOfReceivers' + '"' + instance.delimiter;
  header += '"' + 'numberOfDistinctPackets' + '"' + instance.delimiter;
  header += '"' + 'events' + '"' + '\r\n';

  fs.appendFile(instance.logfileName, header, handleError);
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
