const mongoose = require('mongoose')

const homeHeadlineSchema = new mongoose.Schema({
    entityType:{
        type: String,
        required: true,
        default: 'home_headilne'
    },
    headlineText: {
        type: String,
        required: true
    },
    headlineColor: {
        type: String,
        required: true
    },
    descriptionColor: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    lastModified: {
        type: Date,
        required: true,
        default: Date.now()
    }
})

const homeHeadlineModel = new mongoose.model('homeHeadline', homeHeadlineSchema)

module.exports = homeHeadlineModel