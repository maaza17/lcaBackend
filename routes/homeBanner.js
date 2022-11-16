const router = require('express').Router()
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const homeBannerModel = require('../models/HomeBanner')
const adminModel = require('../models/admin/Admin')
const verifyAdminToken = require('../helpers/verifyAdminToken')

router.get('/getHomeBanner', (req, res) => {
    homeBannerModel.findOne({mediaType: 'home_banner'}, (err, doc) => {
        if(err){
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occurred. Please try again later'
            })
        } else if(doc) {
            return res.status(200).json({
                error: false,
                message: 'Home baner found.',
                data: doc
            })
        } else {
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occurred. Please try again later'
            })
        }
    })
})

router.post('/changeBanner', (req, res) => {

    if(!req.body.token){
        return res.status(200).json({
            error: true,
            message: 'Access denied. Admin token not provided.'
        })
    }

    verifyAdminToken(req.body.token, (item) => {
        const isAdmin = item.isAdmin;
        const id = item.id;
        const name = item.name;
        if (!isAdmin) {
            return res.status(200).json({
                error: true,
                message: 'Access denied. Limited for admin(s).'
            })
        } else {
            let {bannerLink, altText} = req.body
            homeBannerModel.findOneAndUpdate({mediaType: 'home_banner'}, {bannerLink: bannerLink, altText: altText, lastModified: Date.now()}, {new: true}, (err, doc) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Baner changed successfully.',
                        data: doc
                    })
                }
            })
        }
    })
})


module.exports = router