"use strict"

const request = require("supertest");

const app = require("../app");
const db = require("../db");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("POST /jobs", function () {
  test("ok for admins", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "j4",
          salary: 4,
          equity: 0.4,
          company_handle: "c3",
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: 4,
        title: "j4",
        salary: 4,
        equity: "0.4",
        company_handle: "c3"
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "j4",
          salary: 4,
          equity: 0.4,
          company_handle: "c3",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for users", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "j4",
          salary: 4,
          equity: 0.4,
          company_handle: "c3",
          _token: u1Token
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("fails with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          equity: 0.4,
          company_handle: "c3",
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(400);
  });

  test("fails with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "j4",
          salary: "not_an_integer",
          equity: "not_an_integer",
          company_handle: "c3",
          _token: adminToken
        });
    expect(resp.statusCode).toEqual(400);
  });
});

describe("GET /jobs", function () {
  test("works with filtering", async function () {
    const resp = await request(app)
      .get("/jobs")
      .send({
        minSalary: 2
      })
    expect(resp.body).toEqual({
      jobs:
          [
            { id: 2, title: 'j2' },
            { id: 3, title: 'j3' }
          ],
    });
  });

  test("works with no filtering", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
          [
            { id: 1, title: 'j1' },
            { id: 2, title: 'j2' },
            { id: 3, title: 'j3' }
          ],
    });
  });

  test("test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .send({ _token: u1Token });
    expect(resp.statusCode).toEqual(500);
  });
});


describe("GET /jobs/:id", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get(`/jobs/1`);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "j1",
        salary: 1,
        equity: "0.1",
        company_handle: "c1"
      },
    });
  });

  test("fails for job missing", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});


describe("PATCH /jobs/:id", function () {
  test("ok for admin", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: "j1-new",
          _token: adminToken,
        });
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "j1-new",
        salary: 1,
        equity: "0.1",
        company_handle: "c1"
      },
    });
  });

  test("fails for users", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: "j1-new",
          _token: u1Token,
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("fails for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: "j1-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("fails on id change attempt", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          id: 1,
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(400);
  });

  test("fails on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          salary: "not-an-integer",
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(400);
  });
});


describe("DELETE /jobs/:id", function () {
  test("ok for admin", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`)
        .send({
          _token: adminToken,
        });
    expect(resp.body).toEqual({ deleted: "1" });
  });

  test("fails for users", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`)
        .send({
          _token: u1Token,
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("fails for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("fails for missing job", async function () {
    const resp = await request(app)
        .delete(`/jobs/0`)
        .send({
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(404);
  });
});