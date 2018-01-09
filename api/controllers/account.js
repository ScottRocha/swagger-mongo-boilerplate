/* eslint-disable no-underscore-dangle */
"use strict";

const { mongo } = require("../../app");

const error = require("../helpers/error");
const password = require("../helpers/password");
const authentication = require("../helpers/authentication");

const moment = require("moment");
const Promise = require("bluebird");
const _ = require("lodash");

module.exports = {

  // POSTS
  "createAccount": (req, res) => {

    const accountInfo = req.swagger.params.accountInfo.value;

    accountInfo.createdAt = moment();

    const fields = [
      "userName",
      "firstName",
      "lastName",
      "password",
      "createdAt",
    ];

    const fieldsToInsert = {};

    const insertPromises = [];

    _.each(fields, (field) => {

      insertPromises.push(new Promise((resolve) => {

        fieldsToInsert[field] = field === "userName" ? accountInfo[field].toLowerCase() : accountInfo[field];
        return resolve();

      }));

    });

    const checkAccount = () => new Promise((resolve, reject) => {

      mongo.models.accounts.findOne({ "userName": accountInfo.userName.toLowerCase() }, (err, resultDocument) => {

        if (err || resultDocument) {

          return error.handleError("DUPLICATE_USERNAME", "Username already exists.", reject);

        }

        return resolve();

      });

    });

    const hashPassword = () => new Promise((resolve, reject) => {

      password.hash(fieldsToInsert.password).then((hash) => {

        fieldsToInsert.password = hash;
        return resolve();

      }).catch((err) => {

        return reject(err);

      });

    });

    const createAccount = () => new Promise((resolve, reject) => {

      mongo.models.accounts.create(fieldsToInsert, (err, account) => {

        if (err) {

          return error.handleError("CREATION_ERROR", "Error creating account.", reject);

        }

        return resolve(account);

      });

    });

    Promise.all(insertPromises)
      .then(checkAccount)
      .then(hashPassword)
      .then(createAccount)
      .then((account) => authentication.signJWT({
        "accountId": account._id,
        "userName": account.userName,
        "firstName": account.firstName,
        "lastName": account.lastName,
        "createdAt": account.createdAt,
      }))
      .then((token) => {

        return res.send(JSON.stringify({
          "message": "Registration Successful",
          "result": token,
        }));

      }).catch((err) => {

        return error.sendError(err, res);

      });

  },

  "tryLogin": (req, res) => {

    const loginInfo = req.swagger.params.loginInfo.value;

    const checkAccount = () => {

      return new Promise((resolve, reject) => {

        mongo.models.accounts.findOne({ "userName": loginInfo.userName.toLowerCase() }, (err, resultDocument) => {

          if (err) {

            return reject(err);

          } else if (!resultDocument) {

            return error.handleError("INVALID_ENTRY", "Account does not exist.", reject);

          }

          return resolve(resultDocument);

        });

      });

    };

    const checkPassword = (result) => {

      return new Promise((resolve, reject) => {

        if (result.password) {

          password.compare(loginInfo.password, result.password)
            .then((isValid) => {

              if (isValid) {

                return resolve(result);

              }

              return error.handleError("INCORRECT_CREDENTIALS", "Incorrect credentials entered.", reject);

            }).catch((err) => {

              return reject(err);

            });

        } else {

          return error.handleError("NO_PASSWORD", "Account exists, but no password assigned.", reject);

        }

      });

    };

    checkAccount()
      .then(checkPassword)
      .then((account) => authentication.signJWT({
        "accountId": account._id,
        "userName": account.userName,
        "firstName": account.firstName,
        "lastName": account.lastName,
        "createdAt": account.createdAt,
      }))
      .then((token) => {

        return res.send(JSON.stringify({
          "message": "Login Successful",
          "result": token,
        }));

      }).catch((err) => {

        return error.sendError(err, res);

      });

  },

  "getUser": (req, res) => {

    const checkAccount = () => {

      return new Promise((resolve, reject) => {

        mongo.models.accounts.findOne({ "userName": req.authentication.userName.toLowerCase() }, (err, resultDocument) => {

          if (err) {

            return reject(err);

          } else if (!resultDocument) {

            return error.handleError(null, "INVALID_ENTRY", "Account does not exist.", reject, null);

          }

          return resolve(resultDocument);

        });

      });

    };

    checkAccount()
      .then((result) => {

        return res.send(JSON.stringify({
          "message": "Account Retrieved",
          "result": {
            "accountId": result._id,
            "userName": result.userName,
            "firstName": result.firstName,
            "lastName": result.lastName,
            "createdAt": result.createdAt,
          },
        }));

      }).catch((err) => {

        return error.sendError(err, res);

      });

  },

};
