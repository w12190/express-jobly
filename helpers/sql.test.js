"use strict";

const request = require("supertest");
const {sqlForPartialUpdate} = require("./sql");
const app = require("../app");

// const {
//   commonBeforeAll,
//   commonBeforeEach,
//   commonAfterEach,
//   commonAfterAll,
// } = require("../routes/_testCommon");

// beforeAll(commonBeforeAll);
// beforeEach(commonBeforeEach);
// afterEach(commonAfterEach);
// afterAll(commonAfterAll);

// describe("")

// expected output
test("works as expected", function() {
  const testData = {
                  name: "Applepie",
                  num_employees: "100",
                  description: "Apple post-layoffs"
                };
  expect(sqlForPartialUpdate(testData)).toEqual({
               setCols: `name=$1, num_employees=$2, description=$3`,
               values: ["Applepie", "100", "Apple post-layoffs"]
              });
});

// empty case
test("Throws BadRequestError if given empty object", function() {
  expect.assertions(1);
  try {
    sqlForPartialUpdate();
  } catch (err) {
    expect(err).toBeTruthy();
  }
});

// bad case
test("Throws BadRequestError if given something other than a POJO", function() {
  expect.assertions(1);
  try {
    sqlForPartialUpdate([1,2,3]);
  } catch (err) {
    expect(err).toBeTruthy();
  }
});
