const mongoose = require('mongoose')

employeeSchema = new mongoose.Schema({
    empid: {
        type: String,
        required: true,
        unique: true
    },
    empemail: {
        type: String,
        required: false,
        default: "demo@demo.com"
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
    },
    dateAdded: {
        type: Date,
        required: true,
        default: Date.now()
    }
})

const employeeModel = new mongoose.model('employee', employeeSchema)

module.exports = employeeModel