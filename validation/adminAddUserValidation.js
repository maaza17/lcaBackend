const validator = require('validator');
const isEmpty = require('is-empty');

const validateInput = (data) => {
  let errors = {};

  // Convert empty fields to an empty string so we can use validator functions
  let empid = !isEmpty(data.empid)?data.empid:""
  let empname = !isEmpty(data.empname)?data.empname:""
  let empdesignation = !isEmpty(data.empdesignation)?data.empdesignation:""
  let empgrade = !isEmpty(data.empgrade)?data.empgrade:""
  let empdivision = !isEmpty(data.empdivision)?data.empdivision:""
  let emplinemanagerid = !isEmpty(data.emplinemanagerid)?data.emplinemanagerid:""
  let emplinemanagername = !isEmpty(data.emplinemanagername)?data.emplinemanagername:""
  let empemail = !isEmpty(data.empemail)?data.empemail:""


  // Email checks
  if (validator.isEmpty(data.empemail)) {
    errors.empemail = "Email field is required"
  } else if (!validator.isEmail(data.empemail)) {
    errors.empemail = "Email is invalid"
  }

  // Employee ID checks
  if (validator.isEmpty(data.empid)) {
    errors.empid = "Employee ID is required"
  }

  // Name checks
  if (validator.isEmpty(data.empname)) {
    errors.empname = "Name field is required"
  }

  // Designation checks
  if (validator.isEmpty(data.empdesignation)) {
    errors.empdesignation = "Designation field is required"
  }

  // Grade checks
  if (validator.isEmpty(data.empgrade)) {
    errors.empgrade = "Grade field is required"
  }

  // Division checks
  if (validator.isEmpty(data.empdivision)) {
    errors.empdivision = "Division field is required"
  }

  // Line Manager ID checks
  if (validator.isEmpty(data.emplinemanagerid)) {
    errors.emplinemanagerid = "Line Manager ID is required"
  }

  // Line Manager Name checks
  if (validator.isEmpty(data.emplinemanagername)) {
    errors.emplinemanagername = "Line Manager Name is required"
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }
}

module.exports = validateInput