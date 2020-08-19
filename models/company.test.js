"use strict";

const db = require("../db.js");
const Company = require("./Company.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("findAll", function () {
  test("all", async function () {
    let companies = await Company.findAll();
    expect(companies).toEqual([
      { handle: "c1", name: "C1" },
      { handle: "c2", name: "C2" },
      { handle: "c3", name: "C3" },
    ]);
  });
});

// (handle, name, num_employees, description, logo_url)
// ('c1', 'C1', 1, 'Desc1', 'http://c1.img'),
// ('c2', 'C2', 2, 'Desc2', 'http://c2.img'),
// ('c3', 'C3', 3, 'Desc3', 'http://c3.img')`);


describe("filterAll", function () {
  test("filter by name", async function () {
    const companies = await Company.filterAll({"name": "2"});
    expect(companies).toEqual([
      {
        handle: "c2",
        name: "C2"
      }
    ]);
  });

  test("filter by minEmployees", async function () {
    const companies = await Company.filterAll({"minEmployees": "2"});
    expect(companies).toEqual([
      {
        handle: "c2",
        num_employees: 2
      },
      {
        handle: "c3",
        num_employees: 3
      }
    ]);
  });

  test("filter by maxEmployees", async function () {
    const companies = await Company.filterAll({"maxEmployees": "2"});
    expect(companies).toEqual([
      {
        handle: "c1",
        num_employees: 1
      },
      {
        handle: "c2",
        num_employees: 2
      }
    ]);
  });

  test("filter by name, minEmployees, maxEmployees", async function () {
    const companies = await Company.filterAll({"name": "2", "minEmployees": "1", "maxEmployees": "2"});
    expect(companies).toEqual([
      {
        handle: "c2",
        name: "C2",
        num_employees: 2
      }
    ]);
  });
})


describe("get", function () {
  test("succeeds", async function () {
    let company = await Company.get("c1");
    expect(company).toEqual({
      handle: "c1",
      name: "C1",
      num_employees: 1,
      description: "Desc1",
      logo_url: "http://c1.img",
    });
  });

  test("fails", async function () {
    expect.assertions(1);
    try {
      await Company.get("nope");
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});

describe("create", function () {
  test("succeeds", async function () {
    let company = await Company.create({
      handle: "test",
      name: "Test",
      num_employees: 1,
      description: "Test Description",
      logo_url: "http://test.img",
    });
    expect(company).toEqual({
      handle: "test",
      name: "Test",
      num_employees: 1,
      description: "Test Description",
      logo_url: "http://test.img",
    });
    const result = await db.query(`SELECT *
                                   FROM companies
                                   WHERE handle = 'test'`);
    expect(result.rows).toEqual([
      {
        handle: "test",
        name: "Test",
        num_employees: 1,
        description: "Test Description",
        logo_url: "http://test.img",
      },
    ]);
  });

  test("fails with dupe", async function () {
    expect.assertions(1);
    try {
      await Company.create({
        handle: "c1",
        name: "Test",
        num_employees: 1,
        description: "Test Description",
        logo_url: "http://test.img",
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});

describe("update", function () {
  test("succeeds", async function () {
    let company = await Company.update("c1", {
      name: "New",
    });
    expect(company).toEqual({
      handle: "c1",
      name: "New",
      num_employees: 1,
      description: "Desc1",
      logo_url: "http://c1.img",
    });

    const result = await db.query(`SELECT *
                                   FROM companies
                                   WHERE handle = 'c1'`);
    expect(result.rows).toEqual([
      {
        handle: "c1",
        name: "New",
        num_employees: 1,
        description: "Desc1",
        logo_url: "http://c1.img",
      },
    ]);
  });

  test("fails if not found", async function () {
    expect.assertions(1);
    try {
      await Company.update("nope", {
        name: "New",
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test("fails with no data", async function () {
    expect.assertions(1);
    try {
      await Company.update("c1", {});
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});


describe("remove", function () {
  test("succeeds", async function () {
    await Company.remove("c1");
    const res = await db.query(
        "SELECT * FROM companies WHERE handle=$1", ["c1"]);
    expect(res.rows.length).toEqual(0);
  });

  test("fails if not found", async function () {
    expect.assertions(1);
    try {
      await Company.remove("nope");
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});
