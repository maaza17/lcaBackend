const validator = require('validator');
const isEmpty = require('is-empty');

const validateLoginInput = (data) => {
  let errors = {};

  // Convert empty fields to an empty string so we can use validator functions
  data.email = !isEmpty(data.email) ? data.email : ""
  data.password = !isEmpty(data.password) ? data.password : ""

  // Email checks
  if (validator.isEmpty(data.email)) {
    errors.email = "Email field is required"
  } else if (!validator.isEmail(data.email)) {
    errors.email = "Email is invalid"
  }

  // Password checks
  if (validator.isEmpty(data.password)) {
    errors.password = "Password field is required"
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }
}

const validateRegisterInput = (data) => {
    let errors = {};
  
    // Convert empty fields to an empty string so we can use validator functions
    data.name = !isEmpty(data.name) ? data.name : ""
    data.email = !isEmpty(data.email) ? data.email : ""
    data.password = !isEmpty(data.password) ? data.password : ""
    data.organization = !isEmpty(data.organization) ? data.organization : ""
    
    // Name checks
    if (validator.isEmpty(data.name)) {
        errors.name = "Name field is required"
    }
    
    // Email checks
    if (validator.isEmpty(data.email)) {
      errors.email = "Email field is required"
    } else if (!validator.isEmail(data.email)) {
      errors.email = "Email is invalid"
    }
  
    // Password checks
    if (validator.isEmpty(data.password)) {
      errors.password = "Password field is required"
    }

    // Name checks
    if (validator.isEmpty(data.organization)) {
        errors.organization = "Organization field is required"
    }
  
    return {
      errors,
      isValid: isEmpty(errors)
    }
  }

module.exports = {validateLoginInput, validateRegisterInput}