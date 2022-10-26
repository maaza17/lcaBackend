const mongoose = require('mongoose')

const gallerySchema = new mongoose.Schema({
    mediaType:{
        type: String,
        required: true,
        default: 'gallery_image'
    },
    event:{
        type: String,
        required: true,
        default: 'other'
    },
    imageLink: {
        type: String,
        required: true
    },
    altText: {
        type: String,
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

const galleryModel = new mongoose.model('gallery', gallerySchema)

module.exports = galleryModel