// src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');
const authenticate = require('./auth');
const response = require('./response');

const logger = require('./logger');
const pino = require('pino-http')({
  // Use our default logger instance, which is already configured
  logger,
});

// Create an express app instance we can use to attach middleware and HTTP routes
const app = express();

// Use pino logging middleware
app.use(pino);

// Use helmetjs security middleware
app.use(helmet());

// Use CORS middleware so we can make requests across origins
app.use(cors());

// Use gzip/deflate compression middleware
app.use(compression());

// Set up our passport authentication middleware
passport.use(authenticate.strategy());
app.use(passport.initialize());

// Function that logs all environment variable when debugging
function printEnvironmentVariables(logger) {
  if (process.env.LOG_LEVEL === 'debug') {
    logger.info("Environment variables:");
    for (const [key, value] of Object.entries(process.env)) {
      logger.info(`${key}: ${value}`);
    }
  }
}

// Calls printEnvironmentVariable
app.use((req, res, next) => {
  printEnvironmentVariables(logger);
  next();
});
app.prototype.printEnvironmentVariables = printEnvironmentVariables;

// Define our routes
app.use('/', require('./routes'));

// Add 404 middleware to handle any requests for resources that can't be found
app.use((req, res) => {
  res.status(404).json(response.createErrorResponse(404, 'not found'));
});

// Add error-handling middleware to deal with anything else
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';
  // If this is a server error, log something so we can see what's going on.
  if (status > 499) {
    logger.error({ err }, `Error processing request`);
  }
  res.status(status).json(response.createErrorResponse(status, message));
});

// Export our `app` so we can access it in server.js
module.exports = app;