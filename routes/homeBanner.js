const router = require('express').Router()
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const homeBannerModel = require('../models/HomeBanner')
const adminModel = require('../models/admin/Admin')
const verifyAdminToken = require('../helpers/verifyAdminToken')

router.get('/getHomeBanner', (req, res) => {
    homeBannerModel.findOne({ mediaType: 'home_banner' }, (err, doc) => {
        if (err) {
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occurred. Please try again later'
            })
        } else if (doc) {
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

    if (!req.body.token) {
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
            let { bannerLink, altText } = req.body
            homeBannerModel.findOneAndUpdate({ mediaType: 'home_banner' }, { bannerLink: bannerLink, altText: altText, lastModified: Date.now() }, { new: true }, (err, doc) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Banner changed successfully.',
                        data: doc
                    })
                }
            })
        }
    })
})


router.get('/getHomeVideo', (req, res) => {
    homeBannerModel.findOne({ mediaType: 'home_video' }, (err, doc) => {
        if (err) {
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occurred. Please try again later'
            })
        } else if (doc) {
            return res.status(200).json({
                error: false,
                message: 'Home video found.',
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

router.post('/changeHomeVideo', (req, res) => {
    if (!req.body.token) {
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
            let { videoLink } = req.body
            homeBannerModel.findOneAndUpdate({ mediaType: 'home_video' }, { bannerLink: videoLink, altText: "", lastModified: Date.now() }, { new: true, returnNewDocument: true }, (err, doc) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Home Video changed successfully.',
                        data: doc
                    })
                }
            })
        }
    })
})


module.exports = router