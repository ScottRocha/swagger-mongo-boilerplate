"use strict";

const Promise = require("bluebird");

const sendError = (type, message, results, res) => {

  if (res) {

    const errorObject = {
      message,
      "code": type,
      results,
    };

    return res.status(400).send(JSON.stringify(errorObject));

  }

};

const makeError = (type, message) => {

  return new Promise((resolve) => {

    const err = new Error();

    err.name = type;
    err.message = message;

    return resolve(err);

  });

};

module.exports = {

  "handleError": (name, message, reject) => {

    return makeError(name, message).then((error) => {

      return reject(error);

    });

  },

  "sendError": (err, res) => {

    return sendError(err.name, err.message, err.results, res);

  },

};
