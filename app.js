"use strict";

/** Express app for jobly. */

// Imports
const express = require("express");
const companiesRoutes = require("./routes/companies");
const authRoutes = require("./routes/auth");
const morgan = require("morgan");
const { NotFoundError } = require("./expressError");
const { authenticateJWT } = require("./middleware/auth");

const app = express();


// Middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

// Routers
app.use("/companies", companiesRoutes);
app.use("/auth", authRoutes);



/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});


// Exports
module.exports = app;