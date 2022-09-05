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
    courseType: {
        type: String,
        required: true
    },
    prerequisites: {
        type: [String],
        required: true
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
                lessionThumbnail: String,
                lessonQuiz: [{
                    question: String,
                    answerOptions: [String],
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
        required: true
    },
    courseReviews: {
        type: [{
            user_name: String,
            rating: Number,
            reviewText: String
        }],
        required: true,
        default: []
    },
    availability: {
        type: {
            forEmployees: Boolean,
            forExternals: Boolean,
            employeeList: [String]
        },
        required: true,
        default: {
            forEmployees: false,
            forExternals: true,
            employeeList: []
        }
    }
})

courseModel = new mongoose.model('course', courseSchema)
module.exports = courseModel