'use strict';

var util = require('util');
var winston = require('winston');

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

util.inherits(TestTransport, winston.Transport);

TestTransport.prototype.log = function (level, msg, meta, callback) {
  this.__log(level, msg, meta);
  callback(null, true);
};

module.exports = TestTransport;
