/*eslint no-process-env:0 no-param-reassign:0*/

'use strict';

var util = require('util');
var winston = require('winston');
var winex = require('winex');
var sysLogLevels;

// Exposes `winston.transports.Loggly`.
require('winston-loggly');

sysLogLevels = {
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

/**
 * Create a log object for public consumption.
 *
 * Usage:
 *
 * l = new Log(options);
 * l.info('blah', {});
 * l.error('oops', {}, err);
 * app.use(l.middleware());
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
function Log(options) {
  var logTransports;
  var winstonOpts;
  var winstonLog;
  var doNop;

  if (!options || !options.transports) {
    throw new Error('No transports found');
  }

  logTransports = options.transports.map(function(t) {
    var cls = Object.keys(t)[0];
    var opts = t[cls];
    var Transport = winston.transports[cls];
    return new Transport(opts);
  });

  winstonOpts = {
    levels: sysLogLevels.levels,
    transports: logTransports
  };

  winstonLog = new winston.Logger(winstonOpts);
  // Possibly put this in config instead of reading process.env.
  doNop = {nop: !!(process.env.NODE_ENV === 'test')};
  this._winexConstructor = winex.factory(winstonLog, {}, doNop);
  this.middleware = this._winexConstructor.middleware;
}

/**
 * Helper function for attaching methods to the logger prototype.
 *
 * @param {string} level  Logging level, e.g. 'debug'.
 *
 * @return {Function} Logging method to attach to the Log prototype.
 */
function _logger(level) {
  return function(message, meta, error) {
    var log = new (this._winexConstructor)();

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
  Log.prototype[level] = _logger(level);
});

module.exports = {
  Log: Log,
};
