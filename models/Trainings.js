const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    openTo: {
        type: String,
        enum: ['internal', 'external', 'public'],
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    slotsLeft: {
        type: Number,
        required: true
    },
    participants: [{
        userID: { type: mongoose.Schema.ObjectId, ref: 'user', unique: true },
        name: String,
        email: String,
        occupation: String,
        isEmployee: {
            isTrue: Boolean,
            employeeID: String,
            _id: false
        },
        _id: false
    }],
    eventType: {
        type: String,
        enum: ['online', 'physical'],
        required: true,
        default: 'Physical'
    },
    dateCreated: {
        type: Date,
        required: false,
        default: Date.now()
    },
    isDeleted: {
        type: Boolean,
        required: false,
        default: false
    }
})

const trainingModel = new mongoose.model('training', trainingSchema);
module.exports = trainingModel;