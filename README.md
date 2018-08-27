# pn-logging

A logging wrapper around winston and sentry.

## Usage

### Ad-hoc log message

```js
var Log = require('pn-logging').Log;

var logger = new Log(config);

// Call methods
logger.info('Message', meta);

logger.error('Error message', err);
// or
logger.error('Error message', meta, err);
```

### Request/response middleware

```js
// Use Express middleware
app.use(logger.middleware());

app.get('/', (req, res, next) => {
  // ...
  res.locals._log.addMeta({ keyName: 'value' });
  // ...
})
```

The big picture idea is that every req/res gets one log message, the level of
which is set according to the final response status code:
- 200s = info
- 400s = warning (usually)
- 500s = error

The middleware attaches a log object to every req/res lifecycle as
`res.locals_log`. This object exposes methods like `addMeta` and `addError` that
attach fields to the final log for that req/res cycle.

`addMeta` attaches useful and relevant info about that req/res cycle as k/v
pairs on its `meta` property. `addError` is a helper method that takes an
`Error`, extracts useful info from it, and attaches it to `meta`.

(Errors within a req/res lifecycle may also warrant their own ad-hoc log
messages, such as if an API request to a service fails.)

### Report to [Sentry](https://getsentry.com)

If error object is passed to logger's logging methods, e.g. `error`, in addition to sending data to defined transporter (most likely Loggly), the error will also be sent to Sentry.

```js
var Log = require('pn-logging').Log;
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
