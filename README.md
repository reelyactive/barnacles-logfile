barnacles-logfile
=================

Logfile interface for [barnacles](https://github.com/reelyactive/barnacles/) open source software.  Writes events to log files.  We believe in an open Internet of Things.


Installation
------------

    npm install barnacles-logfile


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

| Event-specific property | Default | Description                      | 
|:------------------------|:--------|:---------------------------------|
| logfileExtension        | ".csv"  | File extension to use            |
| logfileDelimiter        | ","     | Field delimiter                  |
| minutesToRotation       | 60      | Period between logfile rotations |


License
-------

MIT License

Copyright (c) 2019-2021 [reelyActive](https://www.reelyactive.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.
