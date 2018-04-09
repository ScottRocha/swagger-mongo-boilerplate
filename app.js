"use strict";

global.Promise = require("bluebird");
global.app = require("express")();

const logger = require("./handlers/logger/index");
logger.debug("Overriding \"Express\" logger");
global.app.use(require("morgan")("combined", { "stream": logger.stream }));

const helmet = require("helmet");
global.app.use(helmet());

const mongo = require("./handlers/mongodb")(logger);
global.app.mongo = mongo;

const jobs = require("./jobs");
jobs.startAllJobs(logger, mongo);

// accept cross origin requests.
const cors = require("cors");
global.app.use(cors());

const config = require("config");
const path = require("path");
const authentication = require("./api/helpers/authentication");

const SwaggerExpress = require("swagger-express-mw");
SwaggerExpress.create({
  "appRoot": __dirname,
  "configDir": path.join(__dirname, "api/config"),
  "swaggerSecurityHandlers": {
    "GlobalSecurity": (req, res, callback) => {

      if (config.api.key === req.headers.api_key) {

        return callback();

      }

      return callback(new Error("access denied!"));

    },
    "Authentication": (req, res, callback) => {

      authentication.verifyJWT(req.headers.authorization)
        .then((payload) => {

          req.authentication = payload;
          return callback();

        }).catch((error) => {

          return callback(error);

        });

    },
  },
}, (swaggerError, swaggerExpress) => {

  if (swaggerError) {

    throw swaggerError;

  }

  swaggerExpress.register(app);

  const YAML = require("js-yaml");
  const fs = require("fs");
  const path = require("path");
  const swaggerYaml = YAML.safeLoad(fs.readFileSync(path.join(__dirname, "/api/swagger/swagger.yaml")));

  const auth = require("http-auth");
  const basic = auth.basic({ "realm": "swagger-ui", "skipUser": true }, (username, password, callback) => {

    return callback(username === config.ui.username && password === config.ui.password);

  });

  basic.on("error", (err, res) => {

    logger.error(err);

    return res.json({
      "message": "Internal error occurred",
      "code": "INTERNAL_ERROR",
    });

  });

  global.app.use("/ui", auth.connect(basic));

  const swaggerUi = require("swagger-ui-express");
  global.app.use("/ui", swaggerUi.serve, swaggerUi.setup(swaggerYaml));

  global.app.use((err, req, res, next) => {

    if (err) {

      if (err.hasOwnProperty("errors")) {

        return res.status(400).json({
          "code": err.errors[0].code,
          "message": err.errors[0].message,
        });

      } else if (!err.hasOwnProperty("code" && !err.hasOwnProperty("message"))) {

        return res.status(400).json({
          "code": "INTERNAL_ERROR",
          "message": "Internal error occurred, consult an administrator.",
        });

      } else if (err.name === "UnauthorizedError") {

        res.status(401);
        res.json({
          "error": err.name,
          "message": err.message,
        });

      } else {

        res.status(400);
        res.json({
          "error": err.name,
          "message": err.message,
        });

      }

    } else {

      return next();

    }

  });

  // eslint-disable-next-line no-process-env
  const port = process.env.PORT || config.port;
  global.app.listen(port);

  logger.info("API Server running on port " + port);

});
