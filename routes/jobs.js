"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/Job");

const jobFilterSchema = require("../schemas/jobFilter.json");

const router = new express.Router();

router.get("/", async function (req, res, next) {
  try {
    console.log('GET /jobs (with optional filter)')
    // Validate input JSON
    const validator = jsonschema.validate(req.body, jobFilterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    // Do the search
    const jobs = await Job.findAllWithFilter(req.body)

    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;