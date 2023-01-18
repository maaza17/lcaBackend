const mongoose = require('mongoose')

variableSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    },
    modifiedBy: {
        type: String,
        required: true
    },
    lastModified: {
        type: Date,
        required: true,
        default: Date.now()
    }
})

variableModel = new mongoose.model('variable', variableSchema)

module.exports = variableModel