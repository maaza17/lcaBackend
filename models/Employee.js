const mongoose = require('mongoose')

employeeSchema = new mongoose.Schema({
    empid: {
        type: String,
        required: true,
        unique: true
    },
    empname: {
        type: String,
        required: true
    },
    empdesignation: {
        type: String,
        required: true
    },
    empgrade: {
        type: String,
        required: true
    },
    empdivision: {
        type: String,
        required: true
    },
    emplinemanagerid: {
        type: String,
        required: true
    },
    emplinemanagername: {
        type: String,
        required: true
    }
})

const employeeModel = new mongoose.model('employee', employeeSchema)

module.exports = employeeModel