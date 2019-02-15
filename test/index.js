/*eslint vars-on-top:0*/

'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var winston = require('winston');
var TestTransport = require('./mock/test-transport');
var index = require('../index');

describe('index', function() {
  var sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('Log constructor', function() {
    it('should return a Log instance', function() {
      var log = new index.Log({ transports: [], sentry: {} });

      expect(log).to.be.an.instanceOf(index.Log);
    });

    it('should complain if no transports provided', function() {
      function tryMakeBadLog() {
        return new index.Log();
      }
      expect(tryMakeBadLog).to.throw(/No transports found/);
    });

    it('should take transports from defaults', function() {
      index.Log.setDefaults({
        winstonOpts: {
          transports: []
        }
      })
      var log = new index.Log();

      expect(log).to.be.an.instanceOf(index.Log);
    });

    it('should have a debug method', function() {
      var log = new index.Log({ transports: [], sentry: {} });

      expect(log).to.respondTo('debug');
    });

    it('should have a info method', function() {
      var log = new index.Log({ transports: [], sentry: {} });

      expect(log).to.respondTo('info');
    });

    it('should have a notice method', function() {
      var log = new index.Log({ transports: [], sentry: {} });

      expect(log).to.respondTo('notice');
    });

    it('should have a warning method', function() {
      var log = new index.Log({ transports: [], sentry: {} });

      expect(log).to.respondTo('warning');
    });

    it('should have a error method', function() {
      var log = new index.Log({ transports: [], sentry: {} });

      expect(log).to.respondTo('error');
    });

    it('should have a crit method', function() {
      var log = new index.Log({ transports: [], sentry: {} });

      expect(log).to.respondTo('crit');
    });

    it('should have a alert method', function() {
      var log = new index.Log({ transports: [], sentry: {} });

      expect(log).to.respondTo('alert');
    });

    it('should have a emerg method', function() {
      var log = new index.Log({ transports: [], sentry: {} });

      expect(log).to.respondTo('emerg');
    });

    it('should support winston-loggly', function() {
      expect(winston.transports).to.have.property('Loggly');
    });
  });

  describe('log methods with defaults', function() {
    var log;
    var spy;

    beforeEach(function() {
      index.Log.setDefaults({
        meta: {
          hacky: true
        },
      })
      sandbox.stub(winston, 'transports', { TestTransport: TestTransport });

      spy = sinon.spy();
      log = new index.Log({
        transports: [
          {
            TestTransport: {
              level: 'debug',
              __log: spy,
            },
          },
        ],
        sentry: {},
      });
    });

    it('should log defaults', function() {
      log.debug('hi', { name: 'Dan' });

      var args = spy.args[0];

      expect(args[2]).to.have.property('name', 'Dan');
      expect(args[2]).to.have.property('hacky', true);
    })
  })

  describe('log methods', function() {
    var log;
    var spy;

    beforeEach(function() {
      sandbox.stub(winston, 'transports', { TestTransport: TestTransport });

      spy = sinon.spy();
      log = new index.Log({
        transports: [
          {
            TestTransport: {
              level: 'debug',
              __log: spy,
            },
          },
        ],
        sentry: {},
      });
    });

    it('should log a message', function() {
      log.debug('say what?');

      sinon.assert.calledOnce(spy);
      sinon.assert.calledWith(spy, 'debug', 'say what?');
    });

    it('should log error properties', function() {
      log.error('oops', {}, new Error('dangit'));

      var args = spy.args[0];

      expect(args[2]).to.have.property('errMsg', 'dangit');
      expect(args[2]).to.have.property('errStack');
    });

    it('should log error as the second arg', function() {
      log.error('oops', new Error('dangit'));

      var args = spy.args[0];

      expect(args[2]).to.have.property('errMsg', 'dangit');
      expect(args[2]).to.have.property('errStack');
    });

    it('should log metadata', function() {
      log.debug('hi', { name: 'Dan' });

      var args = spy.args[0];

      expect(args[2]).to.have.property('name', 'Dan');
    });
  });

  describe('Winex Log class', () => {
    function makeReq(props) {
      return Object.assign({ url: 'http://example.com/path' }, props);
    }

    function makeRes(props) {
      return Object.assign(
        { locals: {}, statusCode: 200, end: () => {} },
        props
      );
    }

    it('should be lending its middleware handler to pn-logging Log class', function() {
      var log = new index.Log({ transports: [], sentry: {} });
      expect(log.middleware).to.equal(log._winexConstructor.middleware);
    });

    it('should allow adding to meta via several methods', () => {
      var log = new index.Log({ transports: [], sentry: {} });
      const WinexLog = log._winexConstructor;
      const winexLog = new WinexLog();

      expect(winexLog).to.have.property('meta');
      expect(winexLog.meta).to.eql({});

      var metaMeta = {
        newField: 'soWhat',
      };
      winexLog.addMeta(metaMeta);
      expect(winexLog.meta).to.eql(metaMeta);

      var req = makeReq();
      winexLog.addReq(req);
      var reqMeta = {
        reqPath: '/path',
        reqQuery: '',
        reqQueryChars: 0,
      };
      expect(winexLog.meta).to.contain(metaMeta);
      expect(winexLog.meta).to.contain(reqMeta);

      var res = makeRes();
      winexLog.addRes(res);
      var resMeta = {
        resStatus: '200',
      };
      expect(winexLog.meta).to.contain(metaMeta);
      expect(winexLog.meta).to.contain(reqMeta);
      expect(winexLog.meta).to.contain(resMeta);

      const err = new Error('zoinks');
      Object.assign(err, {
        type: 'unusual',
        stack: 'blessedly short',
        code: -42,
      });
      const errMeta = {
        errType: 'unusual',
        errStack: 'blessedly short',
        errCode: -42,
      };
      winexLog.addError(err);
      expect(winexLog.meta).to.contain(reqMeta);
      expect(winexLog.meta).to.contain(resMeta);
      expect(winexLog.meta).to.contain(metaMeta);
      expect(winexLog.meta).to.contain(errMeta);
    });
  });

  describe('middleware', function() {
    it('should have middleware on the instance', function() {
      var log = new index.Log({ transports: [], sentry: {} });

      expect(log).to.have.property('middleware');
      expect(log.middleware).to.be.a('function');
    });

    it('should produce a middleware function', function() {
      var log = new index.Log({ transports: [], sentry: {} });
      var middleware = log.middleware();

      expect(middleware).to.be.a('function');
      expect(middleware).to.have.length(3);
    });

    function makeReq(props) {
      return Object.assign({ url: 'http://example.com/path' }, props);
    }

    function makeRes(props) {
      return Object.assign(
        { locals: {}, statusCode: 200, end: () => {} },
        props
      );
    }

    it('should patch res.end and emit an info log instance for a 200 response', function(done) {
      var log = new index.Log({ transports: [], sentry: {} });
      var middleware = log.middleware();

      var req = makeReq();
      var res = makeRes();

      middleware(req, res, err => {
        expect(err).to.be.undefined;
        expect(res.end).to.be.a('function');
        expect(res.locals._log).to.be.ok;
        expect(res.locals._log.info).to.be.a('function');
        const infoStub = sinon.stub(res.locals._log, 'info');
        res.end();
        sinon.assert.calledOnce(infoStub);
        sinon.assert.calledWithExactly(infoStub, 'request');
        const logObj = res.locals._log;
        expect(logObj).to.have.property('meta');
        expect(logObj.meta).to.eql({
          reqPath: '/path',
          reqQuery: '',
          reqQueryChars: 0,
          resStatus: '200',
        });
        done();
      });
    });

    it('should patch res.end and emit a warning log instance for a 400 response', function(done) {
      var log = new index.Log({ transports: [], sentry: {} });
      var middleware = log.middleware();

      var req = makeReq();
      var res = makeRes({ statusCode: 400 });

      middleware(req, res, err => {
        expect(err).to.be.undefined;
        expect(res.end).to.be.a('function');
        expect(res.locals._log).to.be.ok;
        expect(res.locals._log.info).to.be.a('function');
        const warningStub = sinon.stub(res.locals._log, 'warning');
        res.end();
        sinon.assert.calledOnce(warningStub);
        const logObj = res.locals._log;
        expect(logObj).to.have.property('meta');
        expect(logObj.meta).to.eql({
          reqPath: '/path',
          reqQuery: '',
          reqQueryChars: 0,
          resStatus: '400',
        });
        done();
      });
    });

    it('should patch res.end and emit a warning log instance for a 404 response', function(done) {
      var log = new index.Log({ transports: [], sentry: {} });
      var middleware = log.middleware();

      var req = makeReq();
      var res = makeRes({ statusCode: 404 });

      middleware(req, res, err => {
        expect(err).to.be.undefined;
        expect(res.end).to.be.a('function');
        expect(res.locals._log).to.be.ok;
        expect(res.locals._log.info).to.be.a('function');
        const warningStub = sinon.stub(res.locals._log, 'warning');
        res.end();
        sinon.assert.calledOnce(warningStub);
        const logObj = res.locals._log;
        expect(logObj).to.have.property('meta');
        expect(logObj.meta).to.eql({
          reqPath: '/path',
          reqQuery: '',
          reqQueryChars: 0,
          resStatus: '404',
        });
        done();
      });
    });

    it('should patch res.end and emit an info log instance for a 404 response with info404 option', function(done) {
      var log = new index.Log({ transports: [], sentry: {} });
      var middleware = log.middleware({ info404: true });

      var req = makeReq();
      var res = makeRes({ statusCode: 404 });

      middleware(req, res, err => {
        expect(err).to.be.undefined;
        expect(res.end).to.be.a('function');
        expect(res.locals._log).to.be.ok;
        expect(res.locals._log.info).to.be.a('function');
        const infoStub = sinon.stub(res.locals._log, 'info');
        const warningStub = sinon.stub(res.locals._log, 'warning');
        res.end();
        sinon.assert.calledOnce(infoStub);
        sinon.assert.notCalled(warningStub);
        const logObj = res.locals._log;
        expect(logObj).to.have.property('meta');
        expect(logObj.meta).to.eql({
          reqPath: '/path',
          reqQuery: '',
          reqQueryChars: 0,
          resStatus: '404',
        });
        done();
      });
    });

    it('should patch res.end and emit an error log instance for a 500 response', function(done) {
      var log = new index.Log({ transports: [], sentry: {} });
      var middleware = log.middleware();

      var req = makeReq();
      var res = makeRes({ statusCode: 500 });

      middleware(req, res, err => {
        expect(err).to.be.undefined;
        expect(res.end).to.be.a('function');
        expect(res.locals._log).to.be.ok;
        expect(res.locals._log.info).to.be.a('function');
        const errorStub = sinon.stub(res.locals._log, 'error');
        res.end();
        sinon.assert.calledOnce(errorStub);
        const logObj = res.locals._log;
        expect(logObj.meta).to.eql({
          reqPath: '/path',
          reqQuery: '',
          reqQueryChars: 0,
          resStatus: '500',
        });
        done();
      });
    });

    it('should allow overriding the level with log.level', function(done) {
      var log = new index.Log({ transports: [], sentry: {} });
      var middleware = log.middleware({ info404: true });

      var req = makeReq();
      var res = makeRes();

      middleware(req, res, err => {
        expect(err).to.be.undefined;

        // log a 200 as a warning
        res.locals._log.level = 'warning';
        const infoStub = sinon.stub(res.locals._log, 'info');
        const warningStub = sinon.stub(res.locals._log, 'warning');
        res.end();
        sinon.assert.notCalled(infoStub);
        sinon.assert.calledOnce(warningStub);
        const logObj = res.locals._log;
        expect(logObj).to.have.property('meta');
        expect(logObj.meta).to.eql({
          reqPath: '/path',
          reqQuery: '',
          reqQueryChars: 0,
          resStatus: '200',
        });
        done();
      });
    });

    it('should correctly count multibyte characters in url query', function(done) {
      var log = new index.Log({ transports: [], sentry: {} });
      var middleware = log.middleware({ info404: true });

      var req = makeReq({ url: 'http://smi.li/?q=💩' });
      var res = makeRes();

      middleware(req, res, err => {
        expect(err).to.be.undefined;

        res.locals._log.level = 'warning';
        const infoStub = sinon.stub(res.locals._log, 'info');
        const warningStub = sinon.stub(res.locals._log, 'warning');
        res.end();
        sinon.assert.notCalled(infoStub);
        sinon.assert.calledOnce(warningStub);
        const logObj = res.locals._log;
        expect(logObj).to.have.property('meta');
        expect(logObj.meta).to.eql({
          reqPath: '/',
          reqQuery: 'q=💩',
          reqQueryChars: 3,
          resStatus: '200',
        });
        done();
      });
    });
  });

  describe('_getSentryMeta', function() {
    it('should return just tags if meta is not defined', function() {
      var result = index._getSentryMeta();

      expect(result).to.deep.equal({
        extra: {},
        tags: {
          env: 'test',
        },
        fingerprint: undefined,
        level: undefined,
      });
    });

    it('should add tags property', function() {
      var input = {
        tags: {
          key1: 'value1',
          key2: 'value2',
        },
      };

      var result = index._getSentryMeta(input);

      expect(result).to.have.property('tags');
      expect(result.tags).to.have.property('key1', 'value1');
      expect(result.tags).to.have.property('key2', 'value2');
    });

    it('should add fingerprint property', function() {
      var input = {
        fingerprint: 'fingerprintValue',
      };

      var result = index._getSentryMeta(input);

      expect(result).to.have.property('fingerprint', 'fingerprintValue');
    });

    it('should add level property', function() {
      var input = {
        level: 'error',
      };

      var result = index._getSentryMeta(input);

      expect(result).to.have.property('level', 'error');
    });

    it('should exclude tags, fingerprint, and level in extra', function() {
      var input = {
        level: 'error',
        tags: 'tagsValue',
        fingerprint: 'fingerprintValue',
        key1: 'value1',
        key2: 'value2',
      };

      var result = index._getSentryMeta(input);

      expect(result).to.have.property('extra');
      expect(result.extra).to.not.have.property('level');
      expect(result.extra).to.not.have.property('tags');
      expect(result.extra).to.not.have.property('fingerprint');
    });

    it('should include other property in extra', function() {
      var input = {
        level: 'error',
        tags: 'tagsValue',
        fingerprint: 'fingerprintValue',
        key1: 'value1',
        key2: 'value2',
      };

      var result = index._getSentryMeta(input);

      expect(result).to.have.property('extra');
      expect(result.extra).to.have.property('key1', 'value1');
      expect(result.extra).to.have.property('key2', 'value2');
    });

    it('should add tags if no tags are defined', function() {
      var input = {};

      var result = index._getSentryMeta(input);

      expect(result).to.have.property('extra');
      expect(result.tags).to.have.property('env', 'test');
    });

    it('should add env to tags if no env is defined', function() {
      var input = {
        tags: {
          key1: 'value1',
          key2: 'value2',
        },
      };

      var result = index._getSentryMeta(input);

      expect(result.tags).to.have.property('env', 'test');
    });

    it('should not change env in tags if env is defined', function() {
      var input = {
        tags: {
          key1: 'value1',
          key2: 'value2',
          env: 'production',
        },
      };

      var result = index._getSentryMeta(input);

      expect(result.tags).to.have.property('env', 'production');
    });

    it('should not mutate input', function() {
      var input = {
        tags: {
          key1: 'value1',
          key2: 'value2',
        },
      };

      index._getSentryMeta(input);

      expect(input).to.eql({
        tags: {
          key1: 'value1',
          key2: 'value2',
        },
      });
    });
  });
});
