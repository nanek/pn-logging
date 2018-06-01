/*eslint vars-on-top:0*/

"use strict";

const expect = require("chai").expect;
const sinon = require("sinon");
const winston = require("winston");
const TestTransport = require("./mock/test-transport");
const index = require("../index");

describe("index", function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe("Log constructor", function() {
    it("should return a Log instance", function() {
      const log = new index.Log({ transports: [], sentry: {} });

      expect(log).to.be.an.instanceOf(index.Log);
    });

    it("should complain if no transports provided", function() {
      function tryMakeBadLog() {
        return new index.Log();
      }
      expect(tryMakeBadLog).to.throw(/No transports found/);
    });

    it("should have a debug method", function() {
      const log = new index.Log({ transports: [], sentry: {} });

      expect(log).to.respondTo("debug");
    });

    it("should have a info method", function() {
      const log = new index.Log({ transports: [], sentry: {} });

      expect(log).to.respondTo("info");
    });

    it("should have a notice method", function() {
      const log = new index.Log({ transports: [], sentry: {} });

      expect(log).to.respondTo("notice");
    });

    it("should have a warning method", function() {
      const log = new index.Log({ transports: [], sentry: {} });

      expect(log).to.respondTo("warning");
    });

    it("should have a error method", function() {
      const log = new index.Log({ transports: [], sentry: {} });

      expect(log).to.respondTo("error");
    });

    it("should have a crit method", function() {
      const log = new index.Log({ transports: [], sentry: {} });

      expect(log).to.respondTo("crit");
    });

    it("should have a alert method", function() {
      const log = new index.Log({ transports: [], sentry: {} });

      expect(log).to.respondTo("alert");
    });

    it("should have a emerg method", function() {
      const log = new index.Log({ transports: [], sentry: {} });

      expect(log).to.respondTo("emerg");
    });

    it("should support winston-loggly", function() {
      expect(winston.transports).to.have.property("Loggly");
    });
  });

  describe("log methods", function() {
    let log;
    let spy;

    beforeEach(function() {
      sandbox.stub(winston, "transports").value({ TestTransport: TestTransport });

      spy = sinon.spy();
      log = new index.Log({
        transports: [
          {
            TestTransport: {
              level: "debug",
              __log: spy
            }
          }
        ],
        sentry: {}
      });
    });

    it("should log a message", function() {
      log.debug("say what?");

      sinon.assert.calledOnce(spy);
      sinon.assert.calledWith(spy, "debug", "say what?");
    });

    it("should log error properties", function() {
      log.error("oops", {}, new Error("dangit"));

      const args = spy.args[0];

      expect(args[2]).to.have.property("errMsg", "dangit");
      expect(args[2]).to.have.property("errStack");
    });

    it("should log error as the second arg", function() {
      log.error("oops", new Error("dangit"));

      const args = spy.args[0];

      expect(args[2]).to.have.property("errMsg", "dangit");
      expect(args[2]).to.have.property("errStack");
    });

    it("should log metadata", function() {
      log.debug("hi", { name: "Dan" });

      const args = spy.args[0];
      expect(args[2]).to.have.property("name", "Dan");
    });
  });

  describe("middleware", function() {
    it("should have middleware on the instance", function() {
      const log = new index.Log({ transports: [], sentry: {} });

      expect(log).to.have.property("middleware");
      expect(log.middleware).to.be.a("function");
    });

    it("should produce a middleware function", function() {
      const log = new index.Log({ transports: [], sentry: {} });
      const middleware = log.middleware();

      expect(middleware).to.be.a("function");
      expect(middleware).to.have.length(3);
    });
  });

  describe("_getSentryMeta", function() {
    it("should return just tags if meta is not defined", function() {
      const result = index._getSentryMeta();

      expect(result).to.be.eql({
        extra: {},
        tags: {
          env: "test"
        }
      });
    });

    it("should add tags property", function() {
      const input = {
        tags: {
          key1: "value1",
          key2: "value2"
        }
      };

      const result = index._getSentryMeta(input);
      expect(result).to.have.property("tags");
      expect(result.tags).to.have.property("key1", "value1");
      expect(result.tags).to.have.property("key2", "value2");
    });

    it("should add fingerprint property", function() {
      const input = {
        fingerprint: "fingerprintValue"
      };

      const result = index._getSentryMeta(input);

      expect(result).to.have.property("fingerprint", "fingerprintValue");
    });

    it("should add level property", function() {
      const input = {
        level: "error"
      };

      const result = index._getSentryMeta(input);

      expect(result).to.have.property("level", "error");
    });

    it("should exclude tags, fingerprint, and level in extra", function() {
      const input = {
        level: "error",
        tags: "tagsValue",
        fingerprint: "fingerprintValue",
        key1: "value1",
        key2: "value2"
      };

      const result = index._getSentryMeta(input);

      expect(result).to.have.property("extra");
      expect(result.extra).to.not.have.property("level");
      expect(result.extra).to.not.have.property("tags");
      expect(result.extra).to.not.have.property("fingerprint");
    });

    it("should include other property in extra", function() {
      const input = {
        level: "error",
        tags: "tagsValue",
        fingerprint: "fingerprintValue",
        key1: "value1",
        key2: "value2"
      };

      const result = index._getSentryMeta(input);

      expect(result).to.have.property("extra");
      expect(result.extra).to.have.property("key1", "value1");
      expect(result.extra).to.have.property("key2", "value2");
    });

    it("should add tags if no tags are defined", function() {
      const input = {};

      const result = index._getSentryMeta(input);

      expect(result).to.have.property("extra");
      expect(result.tags).to.have.property("env", "test");
    });

    it("should add env to tags if no env is defined", function() {
      const input = {
        tags: {
          key1: "value1",
          key2: "value2"
        }
      };

      const result = index._getSentryMeta(input);

      expect(result.tags).to.have.property("env", "test");
    });

    it("should not change env in tags if env is defined", function() {
      const input = {
        tags: {
          key1: "value1",
          key2: "value2",
          env: "production"
        }
      };

      const result = index._getSentryMeta(input);

      expect(result.tags).to.have.property("env", "production");
    });

    it("should not mutate input", function() {
      const input = {
        tags: {
          key1: "value1",
          key2: "value2"
        }
      };

      index._getSentryMeta(input);

      expect(input).to.eql({
        tags: {
          key1: "value1",
          key2: "value2"
        }
      });
    });
  });
});
