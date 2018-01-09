"use strict";

/* eslint-disable no-process-env */

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

module.exports = (logger) => {

  logger.info("Using MongoDB database...");

  const config = require("config");
  const dbConnectionString = config.mongodb;

  const connection = mongoose.createConnection(dbConnectionString, {
    "socketTimeoutMS": 0,
    "keepAlive": true,
    "reconnectTries": 30,
    "useMongoClient": true,
  });

  const accounts = require("./models/Accounts")(connection);

  connection.on("connecting", () => {

    logger.info("connecting to MongoDB...");

  });

  connection.on("error", (error) => {

    logger.error("Error in MongoDb connection: " + error);
    mongoose.disconnect();

  });

  connection.on("open", () => {

    logger.info("MongoDB connection opened!");

  });

  connection.on("connected", () => {

    logger.info("MongoDB connected!");

  });

  connection.on("reconnected", () => {

    logger.info("MongoDB reconnected!");

  });

  connection.on("disconnected", () => {

    logger.info("MongoDB disconnected!");

    mongoose.connect(dbConnectionString, { "server": { "auto_reconnect": true } });

  });

  return {
    connection,
    "models": { accounts },
  };

};
