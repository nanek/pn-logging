'use strict';

var util = require('util');
var Transport = require('winston-transport');

/**
 * Transporter
 *
 * @constructor
 * @param {object}   opts       Options
 * @param {string}   opts.level Log level
 * @param {function} opts.__log Callback to run when logging
 */
function BadConnectionTransport(opts) {
  this.name = 'test';
  this.level = opts.level;
  this.__log = opts.__log;
}

util.inherits(BadConnectionTransport, Transport);

// eslint-disable-next-line no-unused-vars
BadConnectionTransport.prototype.log = function (level, msg, meta, callback) {
  throw new Error("connection failed");
};

module.exports = BadConnectionTransport;
