const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");


async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM jobs");
  await db.query('ALTER SEQUENCE jobs_id_seq RESTART WITH 1');


  await db.query(`
    INSERT INTO companies(handle, name, num_employees, description, logo_url)
    VALUES ('c1', 'C1', 1, 'Desc1', 'http://c1.img'),
           ('c2', 'C2', 2, 'Desc2', 'http://c2.img'),
           ('c3', 'C3', 3, 'Desc3', 'http://c3.img')`);

  let testPasswords = [
    await bcrypt.hash("password", BCRYPT_WORK_FACTOR),
    await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
  ];

  await db.query(`
    INSERT INTO users(username,
                      password,
                      first_name,
                      last_name,
                      email)
    VALUES ('test', $1, 'Test', 'Tester', 'test@test.com'),
           ('test2', $2, 'Test2', 'Tester2', 'test2@test.com')
  `, [...testPasswords]);

  await db.query(`
  INSERT INTO jobs(title,
                    salary,
                    equity,
                    company_handle)
  VALUES ('j1', 1, 0.1, 'c1'),
         ('j2', 2, 0.2, 'c2'),
         ('j3', 3, 0, 'c3')
`);
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


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};