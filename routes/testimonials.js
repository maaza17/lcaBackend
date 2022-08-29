const router = require('express').Router()
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const testimonialModel = require('../models/Testimonials')
const adminModel = require('../models/admin/Admin')
const verifyToken = require('../helpers/verifyToken')

router.get('/getActiveTestimonials', (req, res) => {
    testimonialModel.find({isDeleted: false}, (err, docs) => {
        if(err){
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occured. Please try again later.'
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
                message: 'An unexpected error occured. Please try again later.'
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
            let {_id, testimonial, authorName, authorImage, rating} = req.body
            if(!_id){
                return res.status(200).json({
                    error: true,
                    message: "Testimonial object id is required."
                })
            }
            testimonialModel.findOneAndUpdate({_id: _id}, {testimonial: testimonial, authorName: authorName, authorImage: authorImage, rating: rating}, {new: true}, (err, doc) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occured. Please try again later.'
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

router.post('/addTestimonial', (req, res) => {

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
            let {testimonial, authorName, authorImage, rating} = req.body
            let newTestimonial = new testimonialModel({testimonial: testimonial, authorName: authorName, authorImage: authorImage, rating: rating})
            newTestimonial.save((err, doc) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occured. Please try again later.'
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