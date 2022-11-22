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
        _id: mongoose.Schema.ObjectId,
        name: String,
        email: String,
        occupation: String,
        isEmployee: Boolean
    }],
    eventType: {
        type: String,
        enum: ['Online', 'Physical'],
        required: true,
        default: 'Physical'
    },
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now()
    }
})

const trainingModel = new mongoose.model('training', trainingSchema);
module.exports = trainingModel;