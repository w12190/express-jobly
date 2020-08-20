"use strict";
const { BadRequestError } = require("../expressError");

/** Generates SQL WHERE clause for a parameterized UPDATE query.
 * Accepts POJO of key:value pairs, returns POJO with SQL WHERE clause string and array of associated values.
 * Input: sqlForPartialUpdate({
 *                             name: "Applepie",
 *                             num_employees: "100",
 *                             description: "Apple post-layoffs"
 *                             })
 * Output: {
 *           setCols: `name=$1, num_employees=$2, description=$3`,
 *           values: ["Applepie", "100", "Apple post-layoffs"]
 *         }
 */
function sqlForPartialUpdate(dataToUpdate = {}) {
  if (Object.getPrototypeOf(dataToUpdate) !== Object.prototype
    || Object.keys(dataToUpdate).length === 0) throw new BadRequestError("No data to update.");
  // Maps POJO keys to parameterized WHERE clause string
  const cols = Object.keys(dataToUpdate).map(
      (col, idx) => `${col}=$${idx + 1}`);

  // Collects and returns everything in an object
  return {
    setCols: cols.join(", "),
    // Collects update values into array
    values: Object.values(dataToUpdate),
  };
}

module.exports = {sqlForPartialUpdate};