"use strict";

const CronJob = require("cron").CronJob;

let wipeAllJob = null;

module.exports = {

  "startAllJobs": (logger, mongo) => {

    wipeAllJob = new CronJob("00 00 00 * * 0", () => {

      logger.info("Removing all accounts");
      mongo.models.accounts.remove({});

    }, null, true);

  },

  "stopAllJobs": () => {

    wipeAllJob && wipeAllJob.stop();

  },

};
