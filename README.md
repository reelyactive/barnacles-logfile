barnacles-logfile
=================

__barnacles-logfile__ writes IoT data to local logfiles in CSV (or equivalent) format for easy manipulation and analysis in spreadsheets.

![Overview of barnacles-logfile](https://reelyactive.github.io/barnacles-logfile/images/overview.png)

__barnacles-logfile__ ingests a real-time stream of _raddec_ and _dynamb_ objects from [barnacles](https://github.com/reelyactive/barnacles/) which it writes to a local logfile specific to each type.  It couples seamlessly with reelyActive's [Pareto Anywhere](https://www.reelyactive.com/pareto/anywhere/) open source IoT middleware.

__barnacles-logfile__ is a lightweight [Node.js package](https://www.npmjs.com/package/barnacles-logfile) that can run on resource-constrained edge devices as well as on powerful cloud servers and anything in between.


Pareto Anywhere integration
---------------------------

A common application of __barnacles-logfile__ is to write IoT data from [pareto-anywhere](https://github.com/reelyactive/pareto-anywhere) to local logfiles.  Simply follow our [Create a Pareto Anywhere startup script](https://reelyactive.github.io/diy/pareto-anywhere-startup-script/) tutorial using the script below:

```javascript
#!/usr/bin/env node

const ParetoAnywhere = require('../lib/paretoanywhere.js');

// Edit the options to customise the logfiles
const BARNACLES_LOGFILE_OPTIONS = {};

// ----- Exit gracefully if the optional dependency is not found -----
let BarnaclesLogfile;
try {
  BarnaclesLogfile = require('barnacles-logfile');
}
catch(err) {
  console.log('This script requires barnacles-logfile.  Install with:');
  console.log('\r\n    "npm install barnacles-logfile"\r\n');
  return console.log('and then run this script again.');
}
// -------------------------------------------------------------------

let pa = new ParetoAnywhere();
pa.barnacles.addInterface(BarnaclesLogfile, BARNACLES_LOGFILE_OPTIONS);
```


Hello barnacles-logfile
-----------------------

The following code will log _simulated_ [raddec](https://github.com/reelyactive/raddec/) data to a file named eventlog-YYMMDD-HHMMSS.csv where the date and time represent the local time the log was created.  The simulated data is provided by [barnowl](https://github.com/reelyactive/barnowl/) which is typically run in conjunction with [barnacles](https://github.com/reelyactive/barnacles/).  Install the _barnowl_, _barnacles_ and _barnacles-logfile_ packages using npm before running the code.

```javascript
const Barnowl = require('barnowl');
const Barnacles = require('barnacles');
const BarnaclesLogfile = require('barnacles-logfile');

let barnowl = new Barnowl();
barnowl.addListener(Barnowl, {}, Barnowl.TestListener, {});

let barnacles = new Barnacles({ barnowl: barnowl });
barnacles.addInterface(BarnaclesLogfile, { /* See options below */ });
```


Options
-------

__barnacles-logfile__ supports the following options:

| Property    | Default                    | Description                      | 
|:------------|:---------------------------|:---------------------------------|
| eventsToLog | { raddec: {}, dynamb: {} } | See default event-specific properties below |

For example, the complete (default) options would be specified as:

    {
      eventsToLog: {
        raddec: {
          folderPath: "./",
          logfileExtension: ".csv",
          logfileDelimiter: ",",
          minutesToRotation: 60,
          numberOfReceiversToLog: 1
        },
        dynamb: {
          folderPath: "./",
          logfileExtension: ".csv",
          logfileDelimiter: ",",
          minutesToRotation: 60,
          propertiesToLog: [ /* acceleration, ..., uptime */ ]
        }
      }
    }

| Event-specific property | Default | Description                           | 
|:------------------------|:--------|:--------------------------------------|
| folderPath              | "./"    | Path to folder where logfiles written |
| logfileExtension        | ".csv"  | File extension to use                 |
| logfileDelimiter        | ","     | Field delimiter                       |
| minutesToRotation       | 60      | Period between logfile rotations      |

| raddec-specific property | Default | Description                           | 
|:-------------------------|:--------|:--------------------------------------|
| numberOfReceiversToLog   | 1       | Number of receivers to log in columns |

| dynamb-specific property | Default | Description                         | 
|:-------------------------|:--------|:------------------------------------|
| propertiesToLog          | [ all ] | dynamb properties to log in columns |


Contributing
------------

Discover [how to contribute](CONTRIBUTING.md) to this open source project which upholds a standard [code of conduct](CODE_OF_CONDUCT.md).


Security
--------

Consult our [security policy](SECURITY.md) for best practices using this open source software and to report vulnerabilities.


License
-------

MIT License

Copyright (c) 2019-2024 [reelyActive](https://www.reelyactive.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.
