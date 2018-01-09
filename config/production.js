"use strict";

// eslint-disable-next-line no-process-env
const env = process.env;

module.exports = {
  "port": env.PORT,
  "api": {
    "key": env.API_KEY,
  },
  "token": {
    "issuer": env.TOKEN_ISSUER,
    "key": env.TOKEN_KEY,
  },
  "mongodb": env.MONGODB_URI,
};
