"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Company = require("../models/Company");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");
const companyFilterSchema = require("../schemas/companyFilter.json")

const router = new express.Router();

/** GET /  =>  { companies: [{ handle, name }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 **/

router.get("/", async function (req, res, next) {
  try {
    console.log('GET /companies (with optional filter)')
    // Validate input JSON
    const validator = jsonschema.validate(req.body, companyFilterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    // Do the search
    const companies = await Company.findAllWithFilter(req.body)

    return res.json({ companies });
  } catch (err) {
    return next(err);
  }
});

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, num_employees, description, logo_url, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 **/

router.get("/:handle", async function (req, res, next) {
  console.log('GET /companies/:handle')

  try {
    const company = await Company.get(req.params.handle);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** POST / { company } =>  { company }
 *
 * company should be { handle, name, num_employees, description, logo_url }
 *
 * Returns { handle, name, num_employees, description, logo_url }
 *
 * Authorization required: admin
 **/

router.post("/", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  console.log('POST /companies/')

  try {
    const validator = jsonschema.validate(req.body, companyNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.create(req.body);
    return res.status(201).json({ company });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: {name, num_employees, description, logo_url}
 *
 * Returns {handle, name, num_employees, description, logo_url}
 *
 * Authorization required: admin
 **/

router.patch("/:handle", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  console.log('PATCH /companies/:handle')
  try {
    const validator = jsonschema.validate(req.body, companyUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.update(req.params.handle, req.body);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: admin
 **/

router.delete("/:handle", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  console.log('DELETE /companies/:handle')
  try {
    await Company.remove(req.params.handle);
    return res.json({ deleted: req.params.handle });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
