"use strict";

const mongoose = require("mongoose");

module.exports = (mongodb) => {

  const AccountsSchema = new mongoose.Schema({
    "userName": { "type": String, "required": true, "trim": true },
    "firstName": { "type": String, "required": true, "trim": true },
    "lastName": { "type": String, "required": true, "trim": true },
    "password": { "type": String, "required": true, "trim": true },
    "createdAt": { "type": Date, "required": true, "default": Date.now() },
  }, { "versionKey": false, "strict": true, "collection": "accounts" });

  return mongodb.model("accounts", AccountsSchema);

};
