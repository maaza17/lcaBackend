const router = require('express').Router()
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const updatesModel = require('../models/Updates')
const verifyAdminToken = require('../helpers/verifyAdminToken')

router.get('/getUpdates', (req, res) => {
    updatesModel.find({}, (err, docs) => {
        if (docs) {
            return res.status(200).json({
                error: false,
                message: 'Here you go good sir.',
                data: docs
            })
        } else {
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occurred while fetching updates'
            })
        }
    }).sort({ date: "desc" })
})

router.post('/editUpdate', (req, res) => {

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
                message: 'Access denied. Limited for admin(s). Please try logging in again'
            })
        } else {
            if (!req.body._id) {
                return res.status(200).json({
                    error: true,
                    message: "Event object id is required."
                })
            }
            updatesModel.findOneAndUpdate({ _id: req.body._id }, {
                date: req.body.date,
                heading: req.body.heading,
                text: req.body.text,
                imageLink: req.body.imageLink,
                type: req.body.type
            }, { new: true }, (err, doc) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else if (!doc) {
                    return res.status(200).json({
                        error: true,
                        message: 'Event not found. Please recheck object.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Event updated successfully.',
                        data: doc
                    })
                }
            })
        }
    })
})

router.post('/addUpdate', (req, res) => {
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
            let newupdates = new updatesModel({
                date: req.body.date,
                heading: req.body.heading,
                text: req.body.text,
                imageLink: req.body.imageLink,
                type: (req.body.type) ? req.body.type : "work"
            })
            newupdates.save((err, newDoc) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Event added successfully.',
                        data: newDoc
                    })
                }
            })
        }
    })
})

router.post('/delete', (req, res) => {

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
            if (!req.body.ID) {
                return res.status(200).json({
                    error: true,
                    message: "Event object id is required."
                })
            }
            updatesModel.findOneAndUpdate({ _id: req.body.ID }, { isDeleted: true }, (err, doc) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else if (!doc) {
                    return res.status(200).json({
                        error: true,
                        message: 'Update not found. Please recheck object.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Update deleted successfully.',
                        data: doc
                    })
                }
            })
        }
    })
})

router.post('/retrieve', (req, res) => {

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
            if (!req.body.ID) {
                return res.status(200).json({
                    error: true,
                    message: "Update object id is required."
                })
            }
            updatesModel.findOneAndUpdate({ _id: req.body.ID }, { isDeleted: false }, (err, doc) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else if (!doc) {
                    return res.status(200).json({
                        error: true,
                        message: 'Event not found. Please recheck object.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Event deleted successfully.',
                        data: doc
                    })
                }
            })
        }
    })
})

module.exports = router