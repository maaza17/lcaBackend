const mongoose = require('mongoose')

const enrollmentSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.ObjectId,
        ref: 'course',
        required: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true
    },
    score: {
        type: Number,
        required: false,
        default: 0
    },
    maxScore: {
        type: Number,
        required: false,
        default: 1
    },
    sectionIndex: {
        type: Number,
        required: false,
        default: 0
    },
    lessonIndex: {
        type: Number,
        required: false,
        default: 0
    },
    registrationDate: {
        type: Date,
        required: false,
        default: Date.now()
    },
    completed: {
        type: Boolean,
        required: false,
        default: false
    },
    completedDate: {
        type: Date,
        required: false,
        default: null
    }
})

enrollmentModel = new mongoose.model('enrollment', enrollmentSchema)
module.exports = enrollmentModel