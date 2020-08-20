"use strict";

const db = require("../db.js");
const Job = require("./Job.js");
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

describe("Job.findAllWithFilter() tests", function () {
  test("gets all jobs successfully", async function () {
    const res = await Job.findAllWithFilter({})

    // Array of all jobs in DB
    const allDbJobs = [
      {
        id: 1,
        title: "j1",
        salary: 1,
        equity: 1,
        company_handle: "c1"
      },
      {
        id: 2,
        title: "j2",
        salary: 2,
        equity: 2,
        company_handle: "c2"
      },
      {
        id: 3,
        title: "j3",
        salary: 3,
        equity: 0,
        company_handle: "c3"
      }
    ]

    expect(res.rows).toEqual(allDbJobs)
  })

  test("filters all jobs by title", async function () {
    const results = await Job.findAllWithFilter({ title: 'j1' })
    expect(results).toEqual([{
      id: 1,
      title: "j1",
      salary: 1,
      equity: 1,
      company_handle: "c1"
    }])
  })

  test("filter all jobs by minimum salary", async function () {
    const results = Job.findAllWithFilter({ minSalary: 3 })
    expect(results).toEqual([{
      id: 3,
      title: "j3",
      salary: 3,
      equity: 0,
      company_handle: "c1"
    }])
  })

  test("filter all jobs WITH equity successfully", async function () {
    //Find all jobs with minimum equity of 1
    const results = await Job.findAllWithFilter({ hasEquity: true })
    expect(results).toEqual([{
      id: 1,
      title: "j1",
      salary: 1,
      equity: 1,
      company_handle: "c1"
    },
    {
      id: 2,
      title: "j2",
      salary: 2,
      equity: 2,
      company_handle: "c2"
    }])
  })

  test("filter all jobs WITHOUT equity successfully", async function () {
    //Find all jobs with minimum equity of 1
    const results = await Job.findAllWithFilter({ hasEquity: false })
    expect(results).toEqual([{
      id: 3,
      title: "j3",
      salary: 3,
      equity: 0,
      company_handle: "c3"
    }])
  })

  test("filter all jobs by minimum salary, has equity, and name", async function () {
    const results = await Job.findAllWithFilter(
      {
        title: "j2",
        minSalary: 2,
        hasEquity: true
      })
    expect(result).toEqual(
      [{
        id: 2,
        title: "j2",
        salary: 2,
        equity: 2,
        company_handle: "c2"
      }])
  })

})

describe("Job.get() tests", function (){
  test("gets a specific job by id correctly", async function (){
    let job = await Job.get('1')
    expect(job).toEqual({
      id: 1,
      title: "j1",
      salary: 1,
      equity: 1,
      company_handle: "c1"
    })
  })

  test("fails when we try to get a nonexistent job", async function (){
    try{
      const fakeJob = await Job.get('0')
      fail('No error was thrown, test failed.')
    }
    catch(err){
      expect(error).toBeTruthy()
    }
  })
})

describe("Job.create() tests", function () {
  test("creates a job correctly", async function () {
    const correctJobData = { id: 4, title: 'j4', salary: 4, equity: 4, company_handle: 'c3' }
    const newJob = await Job.create({ title: 'j4', salary: 4, equity: 4, company_handle: 'c3' })

    //Check the returned job is correct
    expect(newJob).toEqual(correctJobData)

    // Check the created job is correct in database
    const res = db.query('SELECT * FROM jobs WHERE title = $1', ['j4'])
    expect(res.rows[0]).toEqual(correctJobData)
  })

  test("fails when try to create a duplicate job", async function () {
    try {
      //Try to create a duplicate job, should fail
      const newJob = await Job.create({ title: 'j1', salary: 1, equity: 1, company_handle: 'c1' })
      fail('No error was thrown, test failed.')
    }
    catch (err) {
      expect(err).toBeTruthy()
    }
  })
})

describe("Job.update() tests", function () {
  test("updates correctly", async function () {
    const updatedJob = await Job.update("j1", { title: 'updated_j1', salary: 10, equity: 10 })

    //Check if job is correctly returned by Job.update()
    expect(updatedJob).toEqual(
      {
        id: 1,
        title: 'updated_j1',
        salary: 10,
        equity: 10,
        company_handle: 'c1'
      })

    //Check if job is correct in database
    const res = await db.query(
      "SELECT * FROM jobs WHERE title=updated_j1"
    )
    expect(res.rows[0]).toEqual(
      {
        id: 1,
        title: 'updated_j1',
        salary: 10,
        equity: 10,
        company_handle: 'c1'
      })
  })

  test("updates with no data fail", async function () {
    try {
      const updatedJob = await Job.update("j1", {})
      fail('No error was thrown, test failed.')
    }
    catch (err) {
      expect(err).toBeTruthy()
    }
  })

  test("updates to non-existent entries fail", async function () {
    try {
      await Job.update("not_j1", { title: 'updated_j1', salary: 10, equity: 10 })
      fail('No error was thrown, test failed.')
    }
    catch (err) {
      expect(err).toBeTruthy()
    }
  })
})

describe("Job.remove() tests", function () {
  test("removes correctly", async function () {
    await Job.remove("j1");
    const res = await db.query(
      "SELECT * FROM jobs WHERE title=$1", ["j1"]);
    expect(res.rows.length).toEqual(0);
  });

  test("fails if trying to remove nonexistent job", async function () {
    try {
      await Job.remove("nope");
      fail('No error was thrown, test failed.')
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
})