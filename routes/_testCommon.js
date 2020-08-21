"use strict";

const db = require("../db.js");
const User = require("../models/User");
const Job = require("../models/Job");
const Company = require("../models/Company");
const { createToken } = require("../helpers/tokens");

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM jobs");

  await Company.create(
      { handle: "c1", name: "C1", num_employees: 1, description: "Desc1" });
  await Company.create(
      { handle: "c2", name: "C2", num_employees: 2, description: "Desc2" });
  await Company.create(
      { handle: "c3", name: "C3", num_employees: 3, description: "Desc3" });

  await User.register({
    username: "u1",
    first_name: "UF1",
    last_name: "UL1",
    email: "user1@user.com",
    password: "password1",
    is_admin: false,
  });
  await User.register({
    username: "u2",
    first_name: "UF2",
    last_name: "UL2",
    email: "user2@user.com",
    password: "password2",
    is_admin: false,
  });
  await User.register({
    username: "u3",
    first_name: "UF3",
    last_name: "UL3",
    email: "user3@user.com",
    password: "password3",
    is_admin: false,
  });
  // admin user
  await User.register({
    username: "u4",
    first_name: "UF4",
    last_name: "UL4",
    email: "user4@user.com",
    password: "password4",
    is_admin: true,
  });

  //TODO: confirm id's are generated froms 0/1
  await Job.create({
    title: "j1",
    salary: 1,
    equity: 0.1,
    company_handle: "c1"
  })

  await Job.create({
    title: "j2",
    salary: 2,
    equity: 0.2,
    company_handle: "c2"
  })

  //Note: This job has 0 equity
  await Job.create({
    title: "j3",
    salary: 3,
    equity: 0,
    company_handle: "c3"
  })
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


const u1Token = createToken({ username: "u1", is_admin: false });
const adminToken = createToken({ username: "u4", is_admin: true });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
};
