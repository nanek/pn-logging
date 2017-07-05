# pn-logging

A logging wrapper around winston and sentry.

## Usage

```js
var Log = require('@spanishdict/pn-logging').Log;

var logger = new Log(config);

// Call methods
logger.info('Message', meta);

logger.error('Error message', err);
// or
logger.error('Error message', meta, err);

// Use Express middleware
app.use(logger.middleware());
```

### Report to [Sentry](https://getsentry.com)

If error object is passed to logger's logging methods, e.g. `error`, in addition to sending data to defined transporter (most likely Loggly), the error will also be sent to Sentry.

```js
var Log = require('@spanishdict/pn-logging').Log;
var logger = new Log(config);

logger.error('Error message', {
  tags: {key: 'value'}
}, err);
```

Refer to [sentry docs](https://docs.getsentry.com/hosted/clients/node/usage/#optional-attributes).

`tags`, `fingerprint`, and `level` properties of log meta object will be mapped to related sentry optional attributes. All other meta properties will become `extra` property in sentry optional attributes.

### Config

The `config` object passed to `Log` constructor should look like:

```js
var config = {
  transports: [
    {
      Console: {
        level: 'info',
        json: true,
        prettyPrint: true,
        silent: true // for test
      }
    },
    {
      Loggly: {
        level: 'warning',
        json: true,
        tag: 'APP_NAME',
        subdomain: process.env.LOGGLY_SUBDOMAIN,
        token: process.env.LOGGLY_TOKEN
      }
    }
  ],
  sentry: {
    // specify `false` here to disable sentry
    dsn: 'https://*****@app.getsentry.com/xxxxx',
    // pass directly to raven constructor refer to https://goo.gl/9Ud7Mz
    options: {}
  }
};
```
