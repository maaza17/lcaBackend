const validator = require('validator')
const isEmpty = require('is-empty')

const validateAdminRegisterInput = (data) => {
    let errors = []

    // Convert fields into empty string initially if missing data
    
    data.email = !isEmpty(data.email) ? data.email : ''
    data.password = !isEmpty(data.password) ? data.password : ''
    data.name = !isEmpty(data.name) ? data.name : ''
    

    // Email Check
    if (validator.isEmpty(data.email)) {
        errors.push("Email field is required")
    } else if (!validator.isEmail(data.email)) {
        errors.push('Email is invalid')
    }

    // Password Check
    if (validator.isEmpty(data.password)) {
        errors.push("Password field is required")
    }

    // Name Check
    if (validator.isEmpty(data.name)) {
        errors.push("Name is required")
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }

}

const validateAdminLoginInput = (data) => {
    let errors = []

    // Convert fields into empty string initially if missing data    
    data.email = !isEmpty(data.email) ? data.email : ''
    data.password = !isEmpty(data.password) ? data.password : ''
    

    // Email Check
    if (validator.isEmpty(data.email)) {
        errors.push("Email field is required")
    } else if (!validator.isEmail(data.email)) {
        errors.push('Email is invalid')
    }

    // Password Check
    if (validator.isEmpty(data.password)) {
        errors.push("Password field is required")
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }

}

module.exports = {validateAdminRegisterInput, validateAdminLoginInput}