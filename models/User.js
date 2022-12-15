const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    occupation: {
        type: String,
        required: true,
        default: 'Not Specified'
    },
    organization: {
        type: String,
        required: true
    },
    confirmationCode: {
        type: String,
        unique: true
    },
    status: {
        type: String,
        enum: ['Suspended', 'Active', 'Pending Approval', 'Pending Email Verification'],
        required: false,
        default: "Pending Email Verification"
    },
    isEmployee: {
        type: {
            isTrue: Boolean,
            employeeID: String,
            _id: false
        },
        required: true,
        default: { isTrue: false, employeeID: null }
    },
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now()
    },
    forgotPassword: {
        type: Boolean,
        required: true,
        default: false
    },
    department: {
        type: String,
        required: false,
        default: "Not Employed"
    }
})

const userModel = new mongoose.model('user', userSchema)
module.exports = userModel