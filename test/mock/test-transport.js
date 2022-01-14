'use strict';

import util from 'util';
import Transport from 'winston-transport';

/**
 * Transporter
 *
 * @constructor
 * @param {object}   opts       Options
 * @param {string}   opts.level Log level
 * @param {function} opts.__log Callback to run when logging
 */
function TestTransport(opts) {
  this.name = 'test';
  this.level = opts.level;
  this.__log = opts.__log;
}

util.inherits(TestTransport, Transport);

TestTransport.prototype.log = function (level, msg, meta, callback) {
  this.__log(level, msg, meta);
  callback(null, true);
};

export default TestTransport;
