"use strict";

const jwt = require("jsonwebtoken");

const config = require("config");
const error = require("./error");

module.exports = {

  "verifyJWT": (token) => {

    return new Promise((resolve, reject) => {

      try {

        jwt.verify(token, config.token.key, (err, decoded) => {

          if (err) {

            return error.handleError("INVALID_TOKEN", err.message, reject);

          }

          if (decoded.exp >= Math.floor(Date.now() / 1000)) {

            return resolve(decoded);

          }

          return error.handleError("EXPIRED_TOKEN", "JWT has expired.", reject);

        });

      } catch (err) {

        return error.handleError("INVALID_TOKEN", err.message, reject);

      }

    });

  },

  "signJWT": (payload, exp) => {

    return new Promise((resolve) => {

      return resolve(jwt.sign({ ...payload, ...{
        "issuer": config.token.issuer,
        "exp": exp && exp > Math.floor(Date.now() / 1000) ? exp : Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      } }, config.token.key));

    });

  },

};
