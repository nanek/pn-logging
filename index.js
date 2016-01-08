/*eslint no-process-env:0 no-param-reassign:0*/

'use strict';

var util = require('util');
var winston = require('winston');
var winex = require('winex');

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

var loggingModule = {
  Log: null,
};

// Transports are defined in configs as:
//
// logging: {
//   transports:
// }
//

/**
 * Setup loggings
 *
 * @param {Object}   options            Options
 * @param {Object[]} options.transports Should look like:
 *                                      [
 *                                        {
 *                                          Console: {
 *                                            level: 'info',
 *                                            json: true,
 *                                            prettyPrint: true
 *                                          }
 *                                        },
 *                                        {
 *                                          ...
 *                                        }
 *                                      ]
 *
 * @return {void}
 */
loggingModule.config = function (options) {
  var logTransports;
  var winstonOpts;
  var winstonLog;
  var doNop;

  if (loggingModule.Log) {
    throw new Error('config cannot be called twice');
  }

  logTransports = options.transports.map(function(t) {
    var cls = Object.keys(t)[0];
    var opts = t[cls];
    var Transport;
    if (cls === 'Loggly') {
      require('winston-loggly');
    }
    Transport = winston.transports[cls];
    return new Transport(opts);
  });

  winstonOpts = {
    levels: sysLogLevels.levels,
    transports: logTransports
  };

  winstonLog = new winston.Logger(winstonOpts);
  doNop = {nop: !!(process.env.NODE_ENV === 'test')};
  loggingModule.Log = winex.factory(winstonLog, {}, doNop);
};

function _logger(level) {
  return function(message, meta, error) {
    var log = new loggingModule.Log();

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

Object.keys(sysLogLevels.levels).forEach(function (level) {
  loggingModule[level] = _logger(level);
});

module.exports = loggingModule;
