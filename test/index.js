/*eslint no-process-env:0*/

'use strict';

var proxyquire = require('proxyquire');
var expect = require('chai').expect;
var sinon = require('sinon');
var winston = require('winston');
var TestTransport = require('./mock/test-transport');

describe('config', function () {

  var subjectModule;
  var subjectFunc;

  beforeEach(function () {
    subjectModule = proxyquire('../index', {});
    subjectFunc = subjectModule.config;
  });

  it('should assign `Log` export', function () {
    expect(subjectModule.Log).null;

    subjectFunc({transports: []});

    expect(subjectModule.Log).not.null;
  });

  it('should throw error if called twice', function () {
    subjectFunc({transports: []});

    function run() {
      subjectFunc();
    }

    expect(run).throw('config cannot be called twice');
  });

  it('should require winston-loggly if Loggly opts is provided', function () {
    var theWinston = proxyquire('winston', {});
    var theModule;

    expect(theWinston.transports).not.property('Loggly');

    theModule = proxyquire('../index', {
      winston: theWinston
    });

    theModule.config({transports: [
      {
        Loggly: {
          subdomain: 'a loggly domain',
          token: 'a token'
        }
      }
    ]});

    expect(theWinston.transports).property('Loggly');
  });

});

describe('Log', function () {

  var subjectModule;
  var Log;
  var tmpEnv;
  var __log;

  winston.transports.TestTransport = TestTransport;

  beforeEach(function () {
    tmpEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    subjectModule = proxyquire('../index', {
      winston: winston
    });
    __log = sinon.stub();
    subjectModule.config({transports: [
      {
        TestTransport: {
          level: 'debug',
          __log: __log
        }
      }
    ]});
    Log = subjectModule.Log;
  });

  afterEach(function () {
    process.env.NODE_ENV = tmpEnv;
  });

  it('should log message', function () {
    var log = new Log();

    log.info('message');

    sinon.assert.calledOnce(__log);
    sinon.assert.alwaysCalledWithMatch(
      __log,
      'info',
      'message',
      sinon.match.any);
  });

  it('should log meta', function () {
    var log = new Log();

    log.info('message', {type: 'meta'});

    sinon.assert.calledOnce(__log);
    sinon.assert.alwaysCalledWithMatch(
      __log,
      sinon.match.any,
      sinon.match.any,
      sinon.match.has('type', 'meta'));
  });

});

describe('info', function () {

  var subjectModule;
  var subjectFunc;
  var tmpEnv;
  var __log;

  winston.transports.TestTransport = TestTransport;

  beforeEach(function () {
    tmpEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    subjectModule = proxyquire('../index', {
      winston: winston
    });
    __log = sinon.stub();
    subjectModule.config({transports: [
      {
        TestTransport: {
          level: 'debug',
          __log: __log
        }
      }
    ]});
    subjectFunc = subjectModule.info;
  });

  afterEach(function () {
    process.env.NODE_ENV = tmpEnv;
  });

  it('should log message', function () {
    subjectFunc('message');

    sinon.assert.calledOnce(__log);
    sinon.assert.alwaysCalledWithMatch(
      __log,
      'info',
      'message',
      sinon.match.any);
  });

  it('should log meta', function () {
    subjectFunc('message', {type: 'meta'});

    sinon.assert.calledOnce(__log);
    sinon.assert.alwaysCalledWithMatch(
      __log,
      sinon.match.any,
      sinon.match.any,
      sinon.match.has('type', 'meta'));
  });

});

describe('error', function () {

  var subjectModule;
  var subjectFunc;
  var tmpEnv;
  var __log;

  winston.transports.TestTransport = TestTransport;

  beforeEach(function () {
    tmpEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    subjectModule = proxyquire('../index', {
      winston: winston
    });
    __log = sinon.stub();
    subjectModule.config({transports: [
      {
        TestTransport: {
          level: 'debug',
          __log: __log
        }
      }
    ]});
    subjectFunc = subjectModule.error;
  });

  afterEach(function () {
    process.env.NODE_ENV = tmpEnv;
  });

  it('should log error message', function () {
    subjectFunc('message');

    sinon.assert.calledOnce(__log);
    sinon.assert.alwaysCalledWithMatch(
      __log,
      'error',
      'message',
      sinon.match.any);
  });

  it('should log meta', function () {
    subjectFunc('message', {type: 'meta'});

    sinon.assert.calledOnce(__log);
    sinon.assert.alwaysCalledWithMatch(
      __log,
      sinon.match.any,
      sinon.match.any,
      sinon.match.has('type', 'meta'));
  });

  it('should log error', function () {
    subjectFunc('message', new Error('an error'));

    sinon.assert.calledOnce(__log);
    sinon.assert.alwaysCalledWithMatch(
      __log,
      sinon.match.any,
      sinon.match.any,
      sinon.match.has('errMsg', 'an error'));
  });

});
