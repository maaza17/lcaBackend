const router = require('express').Router()
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const booksModel = require('../models/Books')
const verifyAdminToken = require('../helpers/verifyAdminToken')

router.get('/getBooks', (req, res) => {
    booksModel.find({}, (err, docs) => {
        if (docs) {
            return res.status(200).json({
                error: false,
                message: 'Here you go good sir.',
                data: docs
            })
        } else {
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occurred while fetching books'
            })
        }
    }).sort({ dateCreated: "desc" })
})

router.post('/editBook', (req, res) => {

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
                    message: "Book object id is required."
                })
            }
            booksModel.findOneAndUpdate({ _id: req.body._id }, {
                available: req.body.available,
                title: req.body.title,
                author: req.body.author,
                imageLink: req.body.imageLink,
                bookingDate: req.body.bookingDate,
                bookedBy: req.body.bookedBy,
                isDeleted: req.body.isDeleted,
            }, { new: true }, (err, doc) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else if (!doc) {
                    return res.status(200).json({
                        error: true,
                        message: 'Book not found. Please recheck object.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Book updated successfully.',
                        data: doc
                    })
                }
            })
        }
    })
})

router.post('/addBook', (req, res) => {
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
            let newbooks = new booksModel({
                available: true,
                title: req.body.title,
                author: req.body.author,
                imageLink: req.body.imageLink,
                bookingDate: null,
                bookedBy: null,
                isDeleted: false,
            })
            newbooks.save((err, newDoc) => {
                if (err) {
                    console.log(err)
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Book added successfully.',
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
                    message: "Book object id is required."
                })
            }
            booksModel.findOneAndUpdate({ _id: req.body.ID }, { isDeleted: true, available: true, bookingDate: null, bookedBy: null }, (err, doc) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else if (!doc) {
                    return res.status(200).json({
                        error: true,
                        message: 'Book not found. Please recheck object.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Book deleted successfully.',
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
                    message: "Book object id is required."
                })
            }
            booksModel.findOneAndUpdate({ _id: req.body.ID }, { isDeleted: false }, (err, doc) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else if (!doc) {
                    return res.status(200).json({
                        error: true,
                        message: 'Book not found. Please recheck object.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Book deleted successfully.',
                        data: doc
                    })
                }
            })
        }
    })
})

router.post('/addBooking', (req, res) => {
    if (!req.body.ID || !req.body.bookedBy) {
        return res.status(200).json({
            error: true,
            message: "Please send all required data."
        })
    }
    let todayDate = Date.now();
    booksModel.findOneAndUpdate({ _id: req.body.ID, isDeleted: false, available: true }, { available: false, bookedBy: req.body.bookedBy, bookingDate: todayDate, }, (err, doc) => {
        if (err) {
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occurred. Please try again later.'
            })
        } else if (!doc) {
            return res.status(200).json({
                error: true,
                message: 'Book unavailable/not found. Please recheck object.'
            })
        } else {
            return res.status(200).json({
                error: false,
                message: 'Booking added successfully.',
            })
        }
    })
})

router.post('/addBookingByAdmin', (req, res) => {
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
                    message: "Book object id is required."
                })
            }
            let todayDate = Date.now();
            booksModel.findOneAndUpdate({ _id: req.body.ID }, { available: false, bookingDate: todayDate, bookedBy: null }, (err, doc) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else if (!doc) {
                    return res.status(200).json({
                        error: true,
                        message: 'Book not found. Please recheck object.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Booking added successfully.',
                        data: doc
                    })
                }
            })
        }
    })
})

router.post('/endBooking', (req, res) => {
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
                    message: "Book object id is required."
                })
            }
            booksModel.findOneAndUpdate({ _id: req.body.ID }, { available: true, bookingDate: null, bookedBy: null }, (err, doc) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else if (!doc) {
                    return res.status(200).json({
                        error: true,
                        message: 'Book not found. Please recheck object.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Booking concluded successfully.',
                        data: doc
                    })
                }
            })
        }
    })
})

module.exports = router