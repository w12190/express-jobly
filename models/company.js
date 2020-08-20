"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");
const sql = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Return all companies that optionally match given name, minEmployees, and/or maxEmployees.
  *  Data should be { name, minEmployees, maxEmployees } but none are required. 
  *  Returns [{ handle, name }, ...] (empty list if none found)
  */
 // it should be stable w/ what it returns, don't change select
  static async findAllWithFilter(searchCriteria = {}) {
    console.log('findAllWithFilter()')//DEBUG
    const whereClause = []
    const queryValues = []

    let selectClause = ''
    let showNumEmployees = false
    let counter = 1

    // If minEmployees > maxEmployees, throw error
    if (searchCriteria.minEmployees > searchCriteria.maxEmployees) throw new BadRequestError();

    //If no search, display name column
    if (Object.keys(searchCriteria).length === 0) selectClause += ', name'

    // Construct whereClause, populate queryValues, construct selectClause
    for (let criterion in searchCriteria) {
      if (criterion === 'name') {
        // use ILIKE
        whereClause.push(`upper(name) LIKE '%' || $${counter++} || '%'`)
        queryValues.push(searchCriteria[criterion].toUpperCase())
        selectClause += ', name'
      }
      else if (criterion.includes('Employees')) {
        const inequalitySign = (criterion === 'maxEmployees') ? '<=' : '>='
        whereClause.push(`num_employees ${inequalitySign} $${counter++}`)
        queryValues.push(searchCriteria[criterion])
        selectClause += showNumEmployees ? '' : ', num_employees'
        showNumEmployees = true
      }
    }   

    const results = await db.query(
        `SELECT handle ${selectClause} FROM companies`                                   // SELECT clause 
        + ` ${whereClause.length === 0 ? '' : (`WHERE ${whereClause.join(' AND ')}`)}`   // WHERE clause
        + ` ORDER BY handle`,                                                            // ORDER BY clause
         queryValues);

    return results.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, num_employees, description, logo_url }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle, name, num_employees, description, logo_url
           FROM companies
           WHERE handle = $1`,
      [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, num_employees, description, logo_url }
   *
   * Returns { handle, name, num_employees, description, logo_url }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, num_employees, description, logo_url }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies
           (handle, name, num_employees, description, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, num_employees, description, logo_url`,
      [
        handle,
        name,
        num_employees,
        description,
        logo_url,
      ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, num_employees, description, logo_url}
   *
   * Returns {handle, name, num_employees, description, logo_url}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    if (Object.keys(data).length === 0) throw new BadRequestError("No data");

    const { setCols, values } = sqlForPartialUpdate(data);
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                num_employees, 
                                description, 
                                logo_url`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
