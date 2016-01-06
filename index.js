/*eslint no-process-env:0 no-param-reassign:0*/

'use strict';

var util = require('util');
var winston = require('winston');
var winex = require('winex');
var config = require('config').get('logging');

var sysLogLevels = {
  levels: {
    emerg: 0,
    alert: 1,
    crit: 2,
    error: 3,
    warning: 4,
    notice: 5,
    info: 6,
    debug: 7
  }
};

// Transports are defined in configs as:
//
// logging: {
//   transports: [
//     {
//       Console: {
//         level: 'info',
//         json: true,
//         prettyPrint: true
//       }
//     },
//     {
//       ...
//     }
//   ]
// }
//
var logTransports = config.transports.map(function(t) {
  var cls = Object.keys(t)[0];
  var opts = t[cls];
  var Transport;
  if (cls === 'Loggly') {
    require('winston-loggly');
  }
  Transport = winston.transports[cls];
  return new Transport(opts);
});

var winstonOpts = {
  levels: sysLogLevels.levels,
  transports: logTransports
};

var winstonLog = new winston.Logger(winstonOpts);
var doNop = {nop: !!(process.env.NODE_ENV === 'test')};
var Log = winex.factory(winstonLog, {}, doNop);

function _logger(level) {
  return function(message, meta, error) {
    var log = new Log();

    if (util.isError(meta)) {
      error = meta;
      meta = null;
    }

    if (meta) {
      log.addMeta(meta);
    }

    if (error) {
      log.addError(error);
    }

    log[level](message);
  };
}

module.exports = {
  Log: Log
};

Object.keys(winstonOpts.levels).forEach(function (level) {
  module.exports[level] = _logger(level);
});
