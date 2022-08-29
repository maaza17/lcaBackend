const mongoose = require('mongoose')

const testimonialSchema = new mongoose.Schema({
    testimonial: {
        type: String,
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    authorImage: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    dateAdded: {
        type: Date,
        required: true,
        default: Date.now()
    }
})

const testimonialModel = new mongoose.model('testimonial', testimonialSchema)

module.exports = testimonialModel