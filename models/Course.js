const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
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
    prerequisites: {
        type: [{_id: mongoose.Schema.ObjectId, courseName: String, courseInstructor: String}],
        required: true,
        default: []
    },
    courseAbstract: {
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
                lessonThumbnail: String,
                isQuiz: Boolean,
                lessonQuiz: [{
                    question: String,
                    answerOptions: [{option1: String, option2: String, option3: String, option4: String}],
                    correctAnswer: String
                }]
            }]
        }],
        required: true,
        default: []
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
    availability: {
        type: {
            forEmployees: Boolean,
            forExternals: Boolean,
            employeeList: [{employeeID: mongoose.Schema.ObjectId}]
        },
        required: true,
        default: {
            forEmployees: false,
            forExternals: true,
            employeeList: []
        }
    },
    status:{
        type: String,
        enum: ['Listed', 'Hidden'],
        required: true,
        default: 'Hidden'
    },
    dateAdded: {
        type: Date,
        required: true,
        default: Date.now()
    }
})

courseModel = new mongoose.model('course', courseSchema)
module.exports = courseModel