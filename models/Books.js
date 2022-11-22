const mongoose = require('mongoose')

const booksSchema = new mongoose.Schema({
    available: {
        type: Boolean,
        required: false,
        default: true
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    imageLink: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        required: false,
        default: Date.now()
    },
    bookingDate: {
        type: Date,
        required: false,
        default: null
    },
    bookedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: false,
        default: null
    },
    isDeleted: {
        type: Boolean,
        required: false,
        default: false
    }
})

const booksModel = new mongoose.model('books', booksSchema)
module.exports = booksModel