const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
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
    organization: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Suspended', 'Active', 'Deactivated'],
        required: false,
        default: "Active"
    },
    isEmployee: {
        type: {
            isTrue: Boolean,
            employeeID: { type: mongoose.Schema.ObjectId, ref: 'employee' }
        },
        required: true,
        default: { isTrue: false, employeeID: null }
    },
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now()
    }
})

const userModel = new mongoose.model('user', userSchema)
module.exports = userModel