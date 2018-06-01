/*eslint no-process-env:0 no-param-reassign:0*/

"use strict";

const util = require("util");
const winston = require("winston");
const winex = require("winex");
const raven = require("raven");
const omit = require("lodash/object/omit");
const merge = require("lodash/object/merge");
const parent = require("parent-package-json");

// Exposes `winston.transports.Loggly`.
require("winston-loggly");

const versionOfParent = (() => {
  try {
    return parent(__dirname).parse().version;
  } catch (error) {
    return undefined;
  }
})();

const sysLogLevels = {
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
 * @param {Object} options.sentry Config passed to sentry raven instance.
 *                                Should look like:
 *                                {
 *                                  // the account token
 *                                  dsn: string;
 *                                  // pass directly to raven constructor
 *                                  // refer to https://goo.gl/9Ud7Mz
 *                                  options: Object;
 *                                }
 *
 * @return {void}
 */
function Log(options) {
  if (!options || !options.transports) {
    throw new Error("No transports found");
  }

  const logTransports = options.transports.map(function(t) {
    const cls = Object.keys(t)[0];
    const opts = t[cls];
    const Transport = winston.transports[cls];
    return new Transport(opts);
  });

  const winstonOpts = {
    levels: sysLogLevels.levels,
    transports: logTransports
  };

  const winstonLog = new winston.Logger(winstonOpts);
  this._winexConstructor = winex.factory(winstonLog, {});
  this.middleware = this._winexConstructor.middleware;

  if (options.sentry) {
    this.ravenClient = new raven.Client(options.sentry.dsn, options.sentry.options);
  } else {
    this.ravenClient = new raven.Client(false);
  }
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
    const log = new this._winexConstructor();

    if (util.isError(meta)) {
      error = meta;
      meta = null;
    }

    if (meta) {
      log.addMeta(meta);
      if (versionOfParent) {
        log.addMeta({ version: versionOfParent });
      }
    }

    if (error) {
      this.ravenClient.captureException(error, _getSentryMeta(meta));
      log.addError(error);
    }

    log[level](message);
  };
}

/**
 * Format log meta to sentry optional attribute. See:
 * https://docs.getsentry.com/hosted/clients/node/usage/#optional-attributes
 *
 * @param {Object} [meta] Meta data passed to logger
 *
 * @return {Object} Optional attributes for sentry. Default will look like:
 *                  {
 *                    tags: {
 *                      env: 'development'
 *                    }
 *                  }
 */
function _getSentryMeta(meta) {
  const _meta = meta || {};

  return merge(
    {
      tags: {
        env: process.env.NODE_ENV || "development"
      }
    },
    {
      extra: omit(_meta, ["tags", "fingerprint", "level"]),
      tags: _meta.tags,
      fingerprint: _meta.fingerprint,
      level: _meta.level,
      version: versionOfParent
    }
  );
}

Object.keys(sysLogLevels.levels).forEach(function(level) {
  Log.prototype[level] = _logger(level);
});

module.exports = {
  Log: Log,
  _getSentryMeta: _getSentryMeta
};
