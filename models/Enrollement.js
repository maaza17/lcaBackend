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
    qa_forum: {
        type:[{
            queryAuthor: String,
            forumQuery: String,
            queryReplies:[{
                replyAuthor: String,
                replyText: String,
                dateAdded: Date
            }],
            dateAdded: Date
        }]
    }
})

enrollmentModel = new mongoose.model('course', emrollmentSchema)
module.exports = enrollmentModel