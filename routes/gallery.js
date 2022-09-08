const router = require('express').Router()
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const galleryModel = require('../models/Gallery')
const adminModel = require('../models/admin/Admin')
const verifyAdminToken = require('../helpers/verifyAdminToken')

router.get('/getRecentGalleryMedia', (req, res) => {
    galleryModel.find({mediaType: 'gallery_image', isDeleted: false}, (err, docs) => {
        if(err){
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occured. Please try again later'
            })
        } else if(docs.length > 0) {
            return res.status(200).json({
                error: false,
                message: 'Recent gallery uploads found.',
                data: docs
            })
        } else {
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occured. Please try again later'
            })
        }
    })
    .sort({dateAdded: "desc"})
    .limit(10)
})

router.get('/getActiveGalleryMedia', (req, res) => {
    galleryModel.find({mediaType: 'gallery_image', isDeleted: false}, (err, docs) => {
        if(err){
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occured. Please try again later'
            })
        } else if(docs.length > 0) {
            return res.status(200).json({
                error: false,
                message: 'Active gallery media found.',
                data: docs
            })
        } else {
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occured. Please try again later'
            })
        }
    })
    .sort({dateAdded: "desc"})
})

router.get('/getAllGalleryMedia', (req, res) => {
    galleryModel.find({mediaType: 'gallery_image'}, (err, docs) => {
        if(err){
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occured. Please try again later'
            })
        } else if(docs.length > 0) {
            return res.status(200).json({
                error: false,
                message: 'Gallery media found.',
                data: docs
            })
        } else {
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occured. Please try again later'
            })
        }
    })
    .sort({dateAdded: "desc"})
})

router.post('/uploadGalleryMedia', (req, res) => {

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
            let newMedia = req.body.newMedia
            // newMedia = [
            //     {
            //         "altText": "gallery.jpeg",
            //         "imageLink": "www.gmail.com"
            //     },
            //     {
            //         "altText": "gallery.jpeg",
            //         "imageLink": "www.gmail.com"
            //     }
            // ]
            galleryModel.insertMany(newMedia)
            .then((media) => {
                return res.status(200).json({
                    error: false,
                    message: 'Images successfully uploaded to gallery.',
                    data: media
                })
            })
            .catch((err) => {
                return res.status(200).json({
                    error: true,
                    message: 'An unexpected error ocured. Please try again later.',
                    err_message: err.message
                })
            })
        }
    })
})

router.post('/deleteGalleryMedia', (req, res) => {

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
            let mediaIDs = req.body.mediaIDs?req.body.mediaIDs:[]
            if(mediaIDs.length <= 0){
                return res.status(200).json({
                    error: true,
                    message: 'No media identified for deletion.'
                })
            }
            // console.log(mediaIDs)
            galleryModel.updateMany({_id: {$in: mediaIDs}}, {isDeleted: true}, (err, docs) => {
                if(err){
                    return res.status(200).json({
                        error: false,
                        message: 'An unexpected error occured. Please try again later.'
                    })
                } else if(docs.modifiedCount <= 0){
                    return res.status(200).json({
                        error: false,
                        message: 'No matching records found. No gallery images affected.'
                    })
                }else {
                    return res.status(200).json({
                        error: false,
                        message: 'Soft delete successful',
                        data: docs
                    })
                }
            })
        }
    })
})


module.exports = router