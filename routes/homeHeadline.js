const router = require('express').Router()
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const homeHeadlineModel = require('../models/HomeHeadline')
const adminModel = require('../models/admin/Admin')
const verifyToken = require('../helpers/verifyToken')

router.get('/getHomeHeadline', (req, res) => {
    homeHeadlineModel.findOne({}, (err, doc) => {
        if(err){
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occured. Please try again later'
            })
        } else if(doc) {
            return res.status(200).json({
                error: false,
                message: 'Headline found.',
                data: doc
            })
        } else {
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occured. Please try again later'
            })
        }
    })
})

router.post('/changeHeadline', (req, res) => {

    if(!req.body.token){
        return res.status(200).json({
            error: true,
            message: 'Access denied. Admin token not provided.'
        })
    }

    verifyToken(req.body.token, (item) => {
        const isAdmin = item.isAdmin;
        const id = item.id;
        const name = item.name;
        if (!isAdmin) {
            return res.status(200).json({
                error: true,
                message: 'Access denied. Limited for admin(s).'
            })
        } else {
            let {headlineText, description} = req.body
            homeHeadlineModel.findOneAndUpdate({entityType: 'home_headline'}, {headlineText: headlineText, description: description, lastModified: Date.now()}, {new: true}, (err, doc) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occured. Please try again later.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Headline changed successfully.',
                        data: doc
                    })
                }
            })
        }
    })
})


module.exports = router