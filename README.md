# pn-logging

A common logging interface for pn projects.

## Config

Requires the `config` library, with the project's config files containing a key
with the log transports like so:

```js
logging: {
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
}
```

## Usage

```js
var logging = require('pn-logging');
logging.error(err.message, err);
logging.info('Server started');

// Or as middleware.
app.use(logging.Log.middleware());
```
