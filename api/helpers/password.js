"use strict";

const Promise = require("bluebird");
const bcrypt = require("bcrypt-nodejs");

const error = require("../helpers/error");

const saltRounds = 10;

module.exports = {

  "hash": (password) => {

    const createSalt = () => {

      return new Promise((resolve, reject) => {

        bcrypt.genSalt(saltRounds, (err, result) => {

          if (err) {

            return reject(err);

          }

          return resolve(result);

        });

      });

    };

    const hashPassword = (salt) => {

      return new Promise((resolve, reject) => {

        bcrypt.hash(password, salt, null, (err, result) => {

          if (err) {

            return reject(err);

          }

          return resolve(result);

        });

      });

    };

    return new Promise((resolve, reject) => {

      // promise chain
      createSalt()
        .then(hashPassword)
        .then((hash) => {

          return resolve(hash);

        }).catch((err) => {

          return reject(err);

        });

    });

  },

  "compare": (password, hashedPassword) => {

    return new Promise((resolve, reject) => {

      bcrypt.compare(password, hashedPassword, (err, success) => {

        if (err) {

          return error.handleError("INVALID_PASSWORD", err, reject);

        }

        return resolve(success);

      });

    });

  },

};
