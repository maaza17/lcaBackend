const mongoose = require('mongoose')

const updatesSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    heading: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    imageLink: {
        type: String,
        required: true
    },
    type: {
        enum: ['education', 'work'],
        type: String,
        required: false,
        default: "work"
    },
    dateCreated: {
        type: Date,
        required: false,
        default: Date.now()
    }
})

const updatesModel = new mongoose.model('updates', updatesSchema)
module.exports = updatesModel