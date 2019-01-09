/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS203: Remove `|| {}` from converted for-own loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const cluster = require('cluster');
const os = require('os');
const url = require('url');

const extend = require('deep-extend');

// Constants.
const HOST_NAME = os.hostname();
const WORKER_ID = (function() {
  let left;
  const wid =
    (left =
      process.env.NODE_WORKER_ID != null
        ? process.env.NODE_WORKER_ID
        : cluster.worker != null
        ? cluster.worker.id
        : undefined) != null
      ? left
      : null;
  if (wid) {
    return `w${wid}`;
  } else {
    return 'm';
  }
})();

// Default internal logger until set by factory.
// Yes, this is mutable global state, but factory should only be set once.
// Future extension is allow handlers to take own log class.
let _Log = {
  error(...args) {
    return console.log.apply(this, ['[ERROR]'].concat(args));
  },
};

//##############################################################################
// Generic logging handlers.
//##############################################################################
const uncaughtLogger = function(err, cleanup) {
  let log;
  if (cleanup == null) {
    cleanup = function() {};
  }
  try {
    log = new _Log({
      type: 'uncaught_exception',
      error: err,
    });
    return log.error('Uncaught exception');
  } catch (other) {
    console.log(err ? (err.stack != null ? err.stack : err) : 'Unknown');
    console.log('Error: Hit additional error logging the previous error.');
    return console.log(
      other ? (other.stack != null ? other.stack : other) : 'Unknown'
    );
  } finally {
    if (typeof cleanup === 'function') {
      cleanup();
    }
  }
};

const Handlers = {
  // Only log uncaught exception. Cleanup must handled elsewhere.
  //
  logUncaughtException(err) {
    return uncaughtLogger(err);
  },

  // Log uncaught exception and immediately kill process.
  //
  uncaughtException(err) {
    return uncaughtLogger(err, () => process.exit(1));
  },

  // Returns server-aware handler that attempts to gracefully close server before
  // killing process.
  //
  createUncaughtHandler(server, opts) {
    if (opts == null) {
      opts = { timeout: 30000 };
    }
    const kill = () => process.exit(1);

    return err =>
      uncaughtLogger(err, function() {
        const timeout = setTimeout(kill, opts.timeout);
        if (server != null) {
          return server.close(function() {
            clearTimeout(timeout);
            return kill();
          });
        } else {
          return kill();
        }
      });
  },

  // Return handler function for express exceptions.
  //
  createExpressHandler(express, opts) {
    // Stash the configured express handler.
    const expressHandler = express.errorHandler(opts);

    // Wrap with our log.
    return function(err, req, res, next) {
      const log = new _Log({
        req,
        res,
        error: err,
        meta: { type: 'unhandled_error' },
      });

      log.error('unhandled error');
      return expressHandler(err, req, res, next);
    };
  },
};

//##############################################################################
// Helpers
//##############################################################################
// Strip nulls off object.
//
const stripNulls = function(obj) {
  for (let k of Object.keys(obj || {})) {
    const v = obj[k];
    if (v === null) {
      delete obj[k];
    }
  }
  return obj;
};

// Return client IP address.
//
// Follows 'x-forwarded-for'. See:
//  - http://catapulty.tumblr.com/post/8303749793/
//           heroku-and-node-js-how-to-get-the-client-ip-address
//  - http://awsdocs.s3.amazonaws.com/ElasticLoadBalancing/latest/elb-dg.pdf
//
const clientIp = function(req) {
  let ipAddr = __guard__(
    req != null ? req.connection : undefined,
    x => x.remoteAddress
  );
  const forwards = __guardMethod__(req, 'header', o =>
    o.header('x-forwarded-for')
  );

  if (forwards) {
    // Use header forwards if possible.
    const ips = forwards.split(',');
    const firstIp = ((ips != null ? ips[0] : undefined) != null
      ? ips != null
        ? ips[0]
        : undefined
      : ''
    ).replace(/^\s+|\s+$/, '');
    if (firstIp) {
      ipAddr = firstIp;
    }
  }

  return ipAddr;
};

//##############################################################################
// Factory
//##############################################################################
// Create a logger class.
//
// Winex needs an instance of a Winston logger to wrap.
//
// @param        [Object] winstonLogger Winston logger.
// @param        [Object] classMeta     Extra meta for every log call.
// @param        [Object] opts          Extra options for every log call.
// @config opts  [Object] nop           Use NOP logger instead.
const factory = function(winstonLogger, classMeta, opts) {
  if (classMeta == null) {
    classMeta = {};
  }
  if (opts == null) {
    opts = {};
  }
  const useNop = opts.nop === true;

  // Logger.
  //
  class Log {
    static initClass() {
      // Default request type if not specified.
      this.prototype.DEFAULT_TYPE = 'request';

      // Modify and aggregate list of metas.
      //
      this.aggregateMeta = (...metas) => {
        return this.patchMeta.apply(this, [{}].concat(metas));
      };

      // Modify and aggregate list of metas.
      //
      this.patchMeta = (...metas) => {
        // Filter the metas
        metas = (() => {
          const result = [];
          for (let m of Array.from(metas)) {
            if (m != null) {
              result.push(m);
            }
          }
          return result;
        })();

        // Get first to operate on.
        const obj = metas.length > 0 ? metas[0] : {};

        // Patch first with others.
        for (let meta of Array.from(metas.slice(1))) {
          for (let key of Object.keys(meta || {})) {
            const value = meta[key];
            if (typeof value === 'number') {
              // Number.
              obj[key] = (obj[key] != null ? obj[key] : 0) + value;
            } else if ((value != null ? value.concat : undefined) != null) {
              // Array-like object.
              if (obj[key] == null) {
                obj[key] = [];
              }
              obj[key] = obj[key].concat(value);
            } else {
              obj[key] = value;
            }
          }
        }

        return obj;
      };

      // Dynamically add in the actual log methods (wrapping Winston).
      for (let level of Array.from(Object.keys(winstonLogger.levels))) {
        // Need to wrap the invocation for safety / jshint.
        (level => {
          return (this.prototype[level] = function(msg, metaOrCb, cb = null) {
            // Params: 2nd, 3rd arguments switch for Winston. Parse out.
            let callback, meta;
            if (metaOrCb == null) {
              metaOrCb = {};
            }
            if (cb != null) {
              meta = metaOrCb != null ? metaOrCb : {};
              callback = cb;
            } else if (metaOrCb != null) {
              meta = typeof metaOrCb === 'object' ? metaOrCb : {};
              callback = typeof metaOrCb === 'function' ? metaOrCb : null;
            }

            // Create final meta.
            meta = this._makeMeta(level, meta);

            // Call the real logger.
            return winstonLogger[meta.level].apply(Log, [msg, meta, callback]);
          });
        })(level);
      }
    }

    constructor(opts) {
      // Member variables.
      this.baseMeta = this.baseMeta.bind(this);
      if (opts == null) {
        opts = {};
      }
      this.meta = extend({}, opts.meta != null ? opts.meta : {});
      this.type = opts.type != null ? opts.type : null;
      this.errNoStack = opts.errNoStack === true;

      // Patch in incoming data.
      if (opts.req) {
        this.addReq(opts.req);
      }
      if (opts.res) {
        this.addRes(opts.res);
      }
      if (opts.error) {
        this.addError(opts.error);
      }
    }

    // Middleware.
    //
    static middleware(opts) {
      if (opts == null) {
        opts = {};
      }
      return function(req, res, next) {
        // Create logger.
        const log = new Log(opts);
        log.addReq(req);

        // Attach to request.
        res.locals._log = log;

        // Proxy end (what connect.logger does).
        const _end = res.end;
        res.end = function(chunk, encoding) {
          res.end = _end;
          res.end(chunk, encoding);

          // Allow controllers to wipe out the object.
          if (!res.locals._log) {
            return;
          }

          let level = 'info';
          if (400 <= res.statusCode && res.statusCode < 500) {
            level = 'warn';
          }
          if (res.statusCode >= 500) {
            level = 'error';
          }

          // Allow overriding the level.
          if (log.level != null) {
            ({ level } = log);
          }

          log.addRes(res);
          return log[level]('request');
        };

        return next();
      };
    }

    // Add request to instance meta.
    addReq(req) {
      if (req == null) {
        req = {};
      }
      const maxChars = 200;
      const urlObj = url.parse(req != null ? req.url : undefined);
      let path = urlObj != null ? urlObj.pathname : undefined;
      let query =
        (urlObj != null ? urlObj.query : undefined) != null
          ? urlObj != null
            ? urlObj.query
            : undefined
          : '';
      const queryChars = query != null ? query.length : undefined;
      const pathLength =
        (path != null ? path.length : undefined) != null
          ? path != null
            ? path.length
            : undefined
          : 0;
      if (pathLength > maxChars) {
        path = path.substr(0, maxChars);
      }
      if (queryChars > maxChars) {
        query = query.substr(0, maxChars);
      }

      return (this.meta = extend(
        this.meta,
        stripNulls({
          reqClient: clientIp(req),
          reqHost:
            __guard__(req != null ? req.headers : undefined, x => x.host) !=
            null
              ? __guard__(req != null ? req.headers : undefined, x => x.host)
              : null,
          reqMethod:
            (req != null ? req.method : undefined) != null
              ? req != null
                ? req.method
                : undefined
              : null,
          reqPath: path,
          reqQuery: query,
          reqQueryChars: queryChars,
          reqUser:
            __guard__(req != null ? req.user : undefined, x1 => x1.email) !=
            null
              ? __guard__(req != null ? req.user : undefined, x1 => x1.email)
              : null,
        })
      ));
    }

    addRes(res) {
      if (res == null) {
        res = {};
      }
      return (this.meta = extend(this.meta, { resStatus: res.statusCode }));
    }

    addMeta(meta) {
      if (meta == null) {
        meta = {};
      }
      return (this.meta = extend(this.meta, meta));
    }

    // Add error to instance meta.
    addError(error) {
      if (error == null) {
        error = 'unknown';
      }
      const errObj = {
        errMsg:
          (error != null ? error.message : undefined) != null
            ? error != null
              ? error.message
              : undefined
            : error.toString(),
      };

      if (!this.errNoStack) {
        extend(
          errObj,
          stripNulls({
            errArgs: ((error != null ? error.arguments : undefined) != null
              ? error != null
                ? error.arguments
                : undefined
              : ''
            )
              .toString()
              .substr(0, 100),
            errType:
              (error != null ? error.type : undefined) != null
                ? error != null
                  ? error.type
                  : undefined
                : null,
            errStack:
              (error != null ? error.stack : undefined) != null
                ? error != null
                  ? error.stack
                  : undefined
                : null,
            errKnown: 0,
          })
        );
      }

      return (this.meta = extend(this.meta, errObj));
    }

    // Create base meta for additions.
    //
    baseMeta(meta, level = null) {
      if (meta == null) {
        meta = {};
      }
      return extend(
        {
          date: new Date().toISOString(),
          level: level || meta.level,
          env: process.env.NODE_ENV,
          type:
            (meta != null ? meta.type : undefined) != null
              ? meta != null
                ? meta.type
                : undefined
              : this.DEFAULT_TYPE,
          serverHost: HOST_NAME,
          serverId: WORKER_ID,
          serverPid: process.pid,
        },
        classMeta,
        meta
      );
    }

    // Create a final meta object, merging base, constructed, incoming.
    //
    _makeMeta(level, meta) {
      // Store type of of meta first.
      let left, left1;
      if (meta == null) {
        meta = {};
      }
      const type =
        (left =
          (left1 = meta.type != null ? meta.type : this.meta.type) != null
            ? left1
            : this.type) != null
          ? left
          : this.DEFAULT_TYPE;

      // Create full meta object, then override type.
      meta = extend(this.baseMeta(null, level), this.meta, meta);
      meta.type = type;

      // Return finished object.
      return meta;
    }
  }
  Log.initClass();

  // NOP Logger.
  //
  class NopLog extends Log {
    static initClass() {
      // Dynamically add in the dummy log methods.
      for (let level of Array.from(Object.keys(winstonLogger.levels))) {
        (level => {
          return (this.prototype[level] = function() {});
        })(level);
      }
    }

    // Nop middleware.
    //
    static middleware() {
      return function(req, res, next) {
        res.locals._log = new NopLog();
        return next();
      };
    }
  }
  NopLog.initClass();

  // Set internal logger.
  _Log = Log;
  if (useNop === true) {
    _Log = NopLog;
  }

  // Explicitly return created class.
  return _Log;
};

module.exports = {
  Handlers,
  factory,
};

function __guard__(value, transform) {
  return typeof value !== 'undefined' && value !== null
    ? transform(value)
    : undefined;
}
function __guardMethod__(obj, methodName, transform) {
  if (
    typeof obj !== 'undefined' &&
    obj !== null &&
    typeof obj[methodName] === 'function'
  ) {
    return transform(obj, methodName);
  } else {
    return undefined;
  }
}
