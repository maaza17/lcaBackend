const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    reviewerID: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true
    },
    reviewerName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    dateAdded: {
        type: Date,
        required: true,
        default: Date.now()
    }
})

const reviewModel = new mongoose.model('courseReview', reviewSchema)
module.exports = reviewModel