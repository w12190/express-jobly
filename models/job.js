"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


class Job {
  /** Return all jobs that optionally match given title, minSalary, and/or hasEquity.
  *  Data should be { title, minSalary, hasEquity } but none are required. 
  *  Returns [{ id, title }, ...] (empty list if none found)
  */
  static async findAllWithFilter(searchCriteria = {}) {
    const whereClause = []
    const queryValues = []

    let counter = 1

    // Construct whereClause, populate queryValues
    for (let criterion in searchCriteria) {
      if (criterion === 'title') {
        whereClause.push(`title ILIKE '%' || $${counter++} || '%'`)
        queryValues.push(searchCriteria[criterion])
      }
      else if (criterion === 'minSalary') {
        whereClause.push(`salary >= $${counter++}`)
        queryValues.push(searchCriteria[criterion])
      }
      else if (criterion === 'hasEquity' && searchCriteria[criterion]) {
        // console.log("this is criterion", criterion)
        whereClause.push(`equity > 0`);
        // queryValues.push(searchCriteria[criterion])
      }
    }   
    // console.log("this is queryValues", queryValues)
    console.log(`SELECT id, title FROM jobs`                                   
    + ` ${whereClause.length === 0 ? '' : (`WHERE ${whereClause.join(' AND ')}`)}`    // WHERE clause
    + ` ORDER BY id`, queryValues)

    const results = await db.query(
        `SELECT id, title FROM jobs`                                   
        + ` ${whereClause.length === 0 ? '' : (`WHERE ${whereClause.join(' AND ')}`)}`    // WHERE clause
        + ` ORDER BY id`,                                                                 // ORDER BY clause
         queryValues);
    return results.rows;
  }

  /** Given a job title, return data about job.
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
      `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = $1`,
      [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws BadRequestError if job already in database.
   * */

  static async create({ title, salary, equity, company_handle }) {
    const duplicateCheck = await db.query(
      `SELECT title
           FROM jobs
           WHERE title = $1`, [title]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate job: ${id}`);

    const result = await db.query(
      `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle`,
      [
        title,
        salary,
        equity,
        company_handle,
      ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    if (Object.keys(data).length === 0) throw new BadRequestError("No data");

    const { setCols, values } = sqlForPartialUpdate(data);
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
      [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}


module.exports = Job;