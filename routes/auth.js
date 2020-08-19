"use strict";

/** Routes for authentication. */

const jsonschema = require("jsonschema");

const User = require("../models/User");
const express = require("express");
const router = new express.Router();
const { createToken } = require("../helpers/tokens");
const userAuthSchema = require("../schemas/userAuth.json");
const userRegisterSchema = require("../schemas/userRegister.json");
const { BadRequestError } = require("../expressError");

/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/token", async function (req, res, next) {
  console.log('POST /auth/token')
  try {
    const validator = jsonschema.validate(req.body, userAuthSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    const token = createToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});
// admin
// INSERT INTO users (username, password, first_name, last_name, email, is_admin) VALUES ('admin', '$2b$12$N3gCT/MGetmAgLEQKgmLueWeo16D/3Z24yIRdmTYQvHuqyD4ZXhMC', 'admin', 'user', 'test@email.com', true);
// token "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaXNfYWRtaW4iOnRydWUsImlhdCI6MTU5Nzg2NDU0OX0.3K7KXWIMWM_bmQlJ_k_nfOoTFSCkqm6J3OEJ5maETsY"

/** POST /auth/register:   { user } => { token }
 *
 * user must include { username, password, first_name, last_name, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/register", async function (req, res, next) {
  console.log('POST /auth/register')

  try {
    const validator = jsonschema.validate(req.body, userRegisterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const newUser = await User.register({ ...req.body, is_admin: false });
    const token = createToken(newUser);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
