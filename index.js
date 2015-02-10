'use strict';
var util = require('util');
var winston = require('winston');
var winex = require('winex');
var config = require('config').get('logging');

// winston syslog levels are in reverse. Therefore setup custom levels.
// See https://github.com/flatiron/winston/issues/307
//
var sysLogLevels = {
  levels: {
    emerg: 7,
    alert: 6,
    crit: 5,
    error: 4,
    warning: 3,
    notice: 2,
    info: 1,
    debug: 0
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
