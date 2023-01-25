const router = require('express').Router()
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const testimonialModel = require('../models/Testimonials')
const adminModel = require('../models/admin/Admin')
const verifyAdminToken = require('../helpers/verifyAdminToken')

router.get('/getActiveTestimonials', (req, res) => {
    testimonialModel.find({isDeleted: false}, (err, docs) => {
        if(err){
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occurred. Please try again later.'
            })
        } else if(docs .length > 0) {
            return res.status(200).json({
                error: false,
                message: 'Testimonial(s) found.',
                data: docs
            })
        } else {
            return res.status(200).json({
                error: true,
                message: 'No testimonials found!'
            })
        }
    })
})

router.get('/getAllTestimonials', (req, res) => {
    testimonialModel.find({}, (err, docs) => {
        if(err){
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occurred. Please try again later.'
            })
        } else if(docs .length > 0) {
            return res.status(200).json({
                error: false,
                message: 'Testimonial(s) found.',
                data: docs
            })
        } else {
            return res.status(200).json({
                error: true,
                message: 'No testimonials found!'
            })
        }
    })
})

router.post('/editTestimonial', (req, res) => {

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
            let {_id, testimonial, authorName,authorDesignation, authorImage} = req.body
            if(!_id){
                return res.status(200).json({
                    error: true,
                    message: "Testimonial object id is required."
                })
            }
            testimonialModel.findOneAndUpdate({_id: _id}, {testimonial: testimonial, authorName: authorName,authorDesignation:authorDesignation, authorImage: authorImage}, {new: true}, (err, doc) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                }else if(!doc){
                    return res.status(200).json({
                        error: true,
                        message: 'Testimonial not found. Please check object id.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Testimonial updated successfully.',
                        data: doc
                    })
                }
            })
        }
    })
})

router.post('/hideTestimonial', (req, res) => {

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
            
            if(!req.body.testimonialID){
                return res.status(200).json({
                    error: true,
                    message: "Testimonial id is required."
                })
            }
            let testimonialID = req.body.testimonialID
            testimonialModel.findOneAndUpdate({_id: testimonialID, isDeleted: false}, {isDeleted: true}, {new: true}, (err, doc) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                }else if(!doc){
                    return res.status(200).json({
                        error: true,
                        message: 'Testimonial not found or is already hidden.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Testimonial hidden successfully.',
                        data: doc
                    })
                }
            })
        }
    })
})

router.post('/listTestimonial', (req, res) => {

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
            
            if(!req.body.testimonialID){
                return res.status(200).json({
                    error: true,
                    message: "Testimonial id is required."
                })
            }
            let testimonialID = req.body.testimonialID
            testimonialModel.findOneAndUpdate({_id: testimonialID, isDeleted: true}, {isDeleted: false}, {new: true}, (err, doc) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                }else if(!doc){
                    return res.status(200).json({
                        error: true,
                        message: 'Testimonial not found or is already listed.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Testimonial listed successfully.',
                        data: doc
                    })
                }
            })
        }
    })
})

router.post('/addTestimonial', (req, res) => {

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
            let {testimonial, authorName,authorDesignation, authorImage} = req.body
            let newTestimonial = new testimonialModel({testimonial: testimonial, authorName: authorName,authorDesignation:authorDesignation, authorImage: authorImage})
            newTestimonial.save((err, doc) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Testimonial added successfully.',
                        data: doc
                    })
                }
            })
        }
    })
})


module.exports = router