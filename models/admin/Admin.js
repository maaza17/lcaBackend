const mongoose = require('mongoose')

const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Suspended', 'Active', 'Deactivated'],
        required: false,
        default: "Active"
    }
})

const adminModel = new mongoose.model('admin', AdminSchema)
module.exports = adminModel