const mongoose = require('mongoose')

const emrollmentSchema = new mongoose.Schema({
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
    courseName: {
        type: String,
        required: true
    },
    courseInstructor: {
        type: String,
        required: true
    },
    courseThumbnail: {
        type: String,
        required: true
    },
    courseType: {
        type: String,
        required: true
    },
    courseContent: {
        type:[{
            sectionTitle: String,
            sectionAbstract: String,
            sectionLessons: [{
                lessonNumber: Number,
                lessonName: String,
                lessonVideo: String,
                lessionThumbnail: String,
                lessonQuiz: [{
                    question: String,
                    answerOptions: [String],
                    correctAnswer: String
                }],
                completed: Boolean
            }]
        }],
        required: true
    },
    courseStats: {
        type: {
            countSections: Number,
            countLessons: Number,
            watchTime: String
        },
        required: true,
        default: {
            countSections: 0,
            countLessons: 0,
            watchTime: 'Not Available'
        }
    },
    registrationDate: {
        type: Date,
        required: true,
        default: Date.now()
    },
    completed: {
        type: Boolean,
        required: true,
        default: false
    },
    completedDate: {
        type: Date,
        default: null
    }
})

enrollmentModel = new mongoose.model('enrollment', emrollmentSchema)
module.exports = enrollmentModel