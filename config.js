"use strict";

/** Shared config for application; can be req'd many places. */

require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const PORT = +process.env.PORT || 3000;


// Use dev database, testing database, or via env var, production database
// const DB_URI = (process.env.NODE_ENV === "test")
//   ? "postgresql:///jobly_test"
//   : process.env.DATABASE_URL || "postgresql:///jobly";

const DB_URI = (process.env.NODE_ENV === "test")
  ? "postgresql://rainb:qwerty@localhost/jobly_test"
  : process.env.DATABASE_URL || "postgresql://rainb:qwerty@localhost/jobly";

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
//
// WJB: Evaluate in 2021 if this should be increased to 13 for non-test use
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;


module.exports = {
  SECRET_KEY,
  PORT,
  DB_URI,
  BCRYPT_WORK_FACTOR,
};

// admin
// INSERT INTO users (username, password, first_name, last_name, email, is_admin) VALUES ('admin', '$2b$12$N3gCT/MGetmAgLEQKgmLueWeo16D/3Z24yIRdmTYQvHuqyD4ZXhMC', 'admin', 'user', 'test@email.com', true);
// token "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaXNfYWRtaW4iOnRydWUsImlhdCI6MTU5Nzg2NDU0OX0.3K7KXWIMWM_bmQlJ_k_nfOoTFSCkqm6J3OEJ5maETsY"

// QUESTIONS
// 1. what does expect.assertions(1) do?