# pn-logging

A common logging interface for pn projects.

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

### Config

The `config` object passed to `Log` constructor should look like:

```js
var config = {
  transports: [
    {
      Console: {
        level: 'info',
        json: true,
        prettyPrint: true
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
  ]
};
```
