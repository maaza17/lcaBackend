const mongoose = require('mongoose')

homeBannerSchema = new mongoose.Schema({
    mediaType: {
        type: String,
        required: true,
        default: 'home_banner'
    },
    bannerLink: {
        type: String,
        required: true,
        unique: true
    },
    altText: {
        type: String,
        required: true
    },
    lastModified: {
        type: Date,
        required: true,
        default: Date.now()
    }
})

homeBannerModel = new mongoose.model('homeBanner', homeBannerSchema)

module.exports = homeBannerModel