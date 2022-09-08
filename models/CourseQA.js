const mongoose = require('mongoose')

const QnASchema = new mongoose.Schema({
    authorID: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true
    },
    courseID: {
        type: mongoose.Schema.ObjectId,
        ref: 'course',
        required: true
    },
    queryAuthor: {
        type: String,
        required: true
    },
    forumQuery: {
        type: String,
        required: true
    },
    queryReplies:{
        type: [{
        replyAuthor: String,
        replyText: String,
        dateAdded: Date
        }],
        required: true,
        default: false
    },
    dateAdded: {
        type: Date,
        required: true,
        default: Date.now()
    }
})

QnAModel = new mongoose.model('courseqna', QnASchema)
module.exports = QnAModel