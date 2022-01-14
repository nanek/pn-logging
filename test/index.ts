/*eslint vars-on-top:0*/

"use strict";

// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'chai... Remove this comment to see the full error message
import { expect } from "chai";
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'sino... Remove this comment to see the full error message
import sinon from "sinon";
import winston from "winston";
import TestTransport from "./mock/test-transport";
import index from "../index";

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("index", function () {
  var sandbox: any;

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(function () {
    sandbox.restore();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe("Log constructor", function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should return a Log instance", function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      var log = new index.Log({ transports: [] });

      expect(log).to.be.an.instanceOf(index.Log);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should complain if no transports provided", function () {
      function tryMakeBadLog() {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
        return new index.Log();
      }
      expect(tryMakeBadLog).to.throw(/No transports found/);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should have a debug method", function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      var log = new index.Log({ transports: [] });

      expect(log).to.respondTo("debug");
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should have a info method", function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      var log = new index.Log({ transports: [] });

      expect(log).to.respondTo("info");
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should have a notice method", function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      var log = new index.Log({ transports: [] });

      expect(log).to.respondTo("notice");
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should have a warning method", function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      var log = new index.Log({ transports: [] });

      expect(log).to.respondTo("warning");
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should have a error method", function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      var log = new index.Log({ transports: [] });

      expect(log).to.respondTo("error");
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should have a crit method", function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      var log = new index.Log({ transports: [] });

      expect(log).to.respondTo("crit");
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should have a alert method", function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      var log = new index.Log({ transports: [] });

      expect(log).to.respondTo("alert");
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should have a emerg method", function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      var log = new index.Log({ transports: [] });

      expect(log).to.respondTo("emerg");
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should support winston-loggly", function () {
      expect(winston.transports).to.have.property("Loggly");
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe("Log usage", function () {
    var log;
    var spy: any;

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
    beforeEach(function () {
      sandbox.stub(winston, "transports", { TestTransport: TestTransport });

      spy = sinon.spy();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should include default meta in log messages", function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      log = new index.Log({
        transports: [
          {
            TestTransport: {
              level: "debug",
              __log: spy,
            },
          },
        ],
        meta: {
          type: "server",
          key1: "value1",
        },
      });

      log.info("msg", { key2: "value2" });

      sinon.assert.calledOnce(spy);

      const firstArg = spy.firstCall.args[0];
      expect(firstArg).to.equal("info");

      const secondArg = spy.firstCall.args[1];
      expect(secondArg).to.equal("msg");

      const metaArgs = spy.firstCall.args[2];
      expect(metaArgs.type).to.equal("server");
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe("log methods", function () {
    var log: any;
    var spy: any;

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
    beforeEach(function () {
      sandbox.stub(winston, "transports", { TestTransport: TestTransport });

      spy = sinon.spy();
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      log = new index.Log({
        transports: [
          {
            TestTransport: {
              level: "debug",
              __log: spy,
            },
          },
        ],
      });
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should default transport to console when none are provided", function () {
      sandbox.restore();
      let stub = sandbox.stub(console, "error");
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      log = new index.Log({ transports: [] });
      log.debug("i should not throw an error");

      sinon.assert.neverCalledWith(stub);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should log a message", function () {
      log.debug("say what?");

      sinon.assert.calledOnce(spy);
      sinon.assert.calledWith(spy, "debug", "say what?");
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should log error properties", function () {
      log.error("oops", {}, new Error("dangit"));

      var args = spy.args[0];

      expect(args[2]).to.have.property("errMsg", "dangit");
      expect(args[2]).to.have.property("errStack");
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should log error as the second arg", function () {
      log.error("oops", new Error("dangit"));

      var args = spy.args[0];

      expect(args[2]).to.have.property("errMsg", "dangit");
      expect(args[2]).to.have.property("errStack");
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should log metadata", function () {
      log.debug("hi", { name: "Dan" });

      var args = spy.args[0];

      expect(args[2]).to.have.property("name", "Dan");
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should support req and res arguments", function () {
      const req = {
        headers: {
          host: "guest",
        },
        method: "take",
        connection: {
          remoteAddress: "4.3.2.1",
        },
        url: "ptth://guest/req/path?will this work",
        pathname: "/req/path",
      };

      const res = {
        statusCode: 1000000,
      };
      log.info("hi", { name: "Dan" }, null, req, res);

      var args = spy.args[0];

      expect(args[2]).to.have.property("name", "Dan");
      expect(args[2]).to.have.property("reqHost", "guest");
      expect(args[2]).to.have.property("resStatus", "1000000");
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should support req with undefined url", function () {
      const req = {
        headers: {
          host: "guest",
        },
        method: "take",
        connection: {
          remoteAddress: "4.3.2.1",
        },
        pathname: "/req/path",
      };

      const res = {
        statusCode: 1000000,
      };
      log.info("hi", { name: "Dan" }, null, req, res);

      var args = spy.args[0];

      expect(args[2]).to.have.property("name", "Dan");
      expect(args[2]).to.have.property("reqHost", "guest");
      expect(args[2]).to.have.property("resStatus", "1000000");
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should support opts hash", function () {
      const err = new Error("zot");
      const req = {
        headers: {
          host: "guest",
        },
        method: "take",
        connection: {
          remoteAddress: "4.3.2.1",
        },
        url: "ptth://guest/req/path?will this work",
        pathname: "/req/path",
      };

      const res = {
        statusCode: 1000000,
      };
      const opts = {
        message: "hi",
        meta: {
          key1: "val1",
        },
        error: err,
        req: req,
        res: res,
      };
      log.debug(opts);

      var args = spy.args[0];

      expect(args[1]).to.equal("hi");
      expect(args[2]).to.have.property("key1", "val1");
      expect(args[2]).to.have.property("errMsg", "zot");
      expect(args[2]).to.have.property("reqHost", "guest");
      expect(args[2]).to.have.property("resStatus", "1000000");
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should mixin or favor explicit arguments over opts hash values", function () {
      const opts = {
        message: "hi",
        meta: {
          key1: "val1",
        },
        error: null,
      };
      log.debug(opts, { key2: "val2" }, new Error("zot"));

      var args = spy.args[0];

      expect(args[1]).to.equal("hi");
      expect(args[2]).to.have.property("key1", "val1");
      expect(args[2]).to.have.property("key2", "val2");
      expect(args[2]).to.have.property("errMsg", "zot");
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe("Winex Log class", () => {
    function makeReq(props: any) {
      return Object.assign({ url: "http://example.com/path" }, props);
    }

    function makeRes(props: any) {
      return Object.assign(
        { locals: {}, statusCode: 200, end: () => {} },
        props
      );
    }

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should be lending its middleware handler to pn-logging Log class", function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      var log = new index.Log({ transports: [] });
      expect(log.middleware).to.equal(log._winexConstructor.middleware);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should allow adding to meta via several methods", () => {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      var log = new index.Log({ transports: [] });
      const WinexLog = log._winexConstructor;
      const winexLog = new WinexLog();

      expect(winexLog).to.have.property("meta");
      expect(winexLog.meta).to.eql({});

      var metaMeta = {
        newField: "soWhat",
      };
      winexLog.addMeta(metaMeta);
      expect(winexLog.meta).to.eql(metaMeta);

      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
      var req = makeReq();
      winexLog.addReq(req);
      var reqMeta = {
        reqPath: "/path",
        reqQuery: "",
        reqQueryChars: 0,
      };
      expect(winexLog.meta).to.contain(metaMeta);
      expect(winexLog.meta).to.contain(reqMeta);

      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
      var res = makeRes();
      winexLog.addRes(res);
      var resMeta = {
        resStatus: "200",
      };
      expect(winexLog.meta).to.contain(metaMeta);
      expect(winexLog.meta).to.contain(reqMeta);
      expect(winexLog.meta).to.contain(resMeta);

      const err = new Error("zoinks");
      Object.assign(err, {
        type: "unusual",
        stack: "blessedly short",
        code: -42,
      });
      const errMeta = {
        errType: "unusual",
        errStack: "blessedly short",
        errCode: -42,
      };
      winexLog.addError(err);
      expect(winexLog.meta).to.contain(reqMeta);
      expect(winexLog.meta).to.contain(resMeta);
      expect(winexLog.meta).to.contain(metaMeta);
      expect(winexLog.meta).to.contain(errMeta);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe("middleware", function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should have middleware on the instance", function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      var log = new index.Log({ transports: [] });

      expect(log).to.have.property("middleware");
      expect(log.middleware).to.be.a("function");
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should produce a middleware function", function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      var log = new index.Log({ transports: [] });
      var middleware = log.middleware();

      expect(middleware).to.be.a("function");
      expect(middleware).to.have.length(3);
    });

    function makeReq(props: any) {
      return Object.assign({ url: "http://example.com/path" }, props);
    }

    function makeRes(props: any) {
      return Object.assign(
        { locals: {}, statusCode: 200, end: () => {} },
        props
      );
    }

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should patch res.end and emit an info log instance for a 200 response", function (done: any) {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      var log = new index.Log({ transports: [] });
      var middleware = log.middleware();

      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
      var req = makeReq();
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
      var res = makeRes();

      middleware(req, res, (err: any) => {
        expect(err).to.be.undefined;
        expect(res.end).to.be.a("function");
        expect(res.locals._log).to.be.ok;
        expect(res.locals._log.info).to.be.a("function");
        const infoStub = sinon.stub(res.locals._log, "info");
        res.end();
        sinon.assert.calledOnce(infoStub);
        sinon.assert.calledWithExactly(infoStub, "request");
        const logObj = res.locals._log;
        expect(logObj).to.have.property("meta");
        expect(logObj.meta).to.eql({
          reqPath: "/path",
          reqQuery: "",
          reqQueryChars: 0,
          resStatus: "200",
        });
        done();
      });
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should patch res.end and emit a warning log instance for a 400 response", function (done: any) {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      var log = new index.Log({ transports: [] });
      var middleware = log.middleware();

      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
      var req = makeReq();
      var res = makeRes({ statusCode: 400 });

      middleware(req, res, (err: any) => {
        expect(err).to.be.undefined;
        expect(res.end).to.be.a("function");
        expect(res.locals._log).to.be.ok;
        expect(res.locals._log.info).to.be.a("function");
        const warningStub = sinon.stub(res.locals._log, "warning");
        res.end();
        sinon.assert.calledOnce(warningStub);
        const logObj = res.locals._log;
        expect(logObj).to.have.property("meta");
        expect(logObj.meta).to.eql({
          reqPath: "/path",
          reqQuery: "",
          reqQueryChars: 0,
          resStatus: "400",
        });
        done();
      });
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should patch res.end and emit a warning log instance for a 404 response", function (done: any) {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      var log = new index.Log({ transports: [] });
      var middleware = log.middleware();

      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
      var req = makeReq();
      var res = makeRes({ statusCode: 404 });

      middleware(req, res, (err: any) => {
        expect(err).to.be.undefined;
        expect(res.end).to.be.a("function");
        expect(res.locals._log).to.be.ok;
        expect(res.locals._log.info).to.be.a("function");
        const warningStub = sinon.stub(res.locals._log, "warning");
        res.end();
        sinon.assert.calledOnce(warningStub);
        const logObj = res.locals._log;
        expect(logObj).to.have.property("meta");
        expect(logObj.meta).to.eql({
          reqPath: "/path",
          reqQuery: "",
          reqQueryChars: 0,
          resStatus: "404",
        });
        done();
      });
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should patch res.end and emit an info log instance for a 404 response with info404 option", function (done: any) {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      var log = new index.Log({ transports: [] });
      var middleware = log.middleware({ info404: true });

      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
      var req = makeReq();
      var res = makeRes({ statusCode: 404 });

      middleware(req, res, (err: any) => {
        expect(err).to.be.undefined;
        expect(res.end).to.be.a("function");
        expect(res.locals._log).to.be.ok;
        expect(res.locals._log.info).to.be.a("function");
        const infoStub = sinon.stub(res.locals._log, "info");
        const warningStub = sinon.stub(res.locals._log, "warning");
        res.end();
        sinon.assert.calledOnce(infoStub);
        sinon.assert.notCalled(warningStub);
        const logObj = res.locals._log;
        expect(logObj).to.have.property("meta");
        expect(logObj.meta).to.eql({
          reqPath: "/path",
          reqQuery: "",
          reqQueryChars: 0,
          resStatus: "404",
        });
        done();
      });
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should patch res.end and emit an error log instance for a 500 response", function (done: any) {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      var log = new index.Log({ transports: [] });
      var middleware = log.middleware();

      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
      var req = makeReq();
      var res = makeRes({ statusCode: 500 });

      middleware(req, res, (err: any) => {
        expect(err).to.be.undefined;
        expect(res.end).to.be.a("function");
        expect(res.locals._log).to.be.ok;
        expect(res.locals._log.info).to.be.a("function");
        const errorStub = sinon.stub(res.locals._log, "error");
        res.end();
        sinon.assert.calledOnce(errorStub);
        const logObj = res.locals._log;
        expect(logObj.meta).to.eql({
          reqPath: "/path",
          reqQuery: "",
          reqQueryChars: 0,
          resStatus: "500",
        });
        done();
      });
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should allow overriding the level with log.level", function (done: any) {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      var log = new index.Log({ transports: [] });
      var middleware = log.middleware({ info404: true });

      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
      var req = makeReq();
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
      var res = makeRes();

      middleware(req, res, (err: any) => {
        expect(err).to.be.undefined;

        // log a 200 as a warning
        res.locals._log.level = "warning";
        const infoStub = sinon.stub(res.locals._log, "info");
        const warningStub = sinon.stub(res.locals._log, "warning");
        res.end();
        sinon.assert.notCalled(infoStub);
        sinon.assert.calledOnce(warningStub);
        const logObj = res.locals._log;
        expect(logObj).to.have.property("meta");
        expect(logObj.meta).to.eql({
          reqPath: "/path",
          reqQuery: "",
          reqQueryChars: 0,
          resStatus: "200",
        });
        done();
      });
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("should correctly count multibyte characters in url query", function (done: any) {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      var log = new index.Log({ transports: [] });
      var middleware = log.middleware({ info404: true });

      var req = makeReq({ url: "http://smi.li/?q=💩" });
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
      var res = makeRes();

      middleware(req, res, (err: any) => {
        expect(err).to.be.undefined;

        res.locals._log.level = "warning";
        const infoStub = sinon.stub(res.locals._log, "info");
        const warningStub = sinon.stub(res.locals._log, "warning");
        res.end();
        sinon.assert.notCalled(infoStub);
        sinon.assert.calledOnce(warningStub);
        const logObj = res.locals._log;
        expect(logObj).to.have.property("meta");
        expect(logObj.meta).to.eql({
          reqPath: "/",
          reqQuery: "q=💩",
          reqQueryChars: 3,
          resStatus: "200",
        });
        done();
      });
    });
  });
});
