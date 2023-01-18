const router = require('express').Router()
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const variableModel = require('../models/Variable')
const verifyAdminToken = require('../helpers/verifyAdminToken')

router.post('/newVariable', (req, res) => {
    variableModel.findOne({ name: req.body.name }, (err, doc) => {
        if (doc) {
            return res.status(200).json({
                error: true,
                message: "Variable with this name already exists"
            })
        } else if (err) {
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occurred. Please try again later'
            })
        } else {
            newVar = new variableModel({
                name: req.body.name,
                value: req.body.value,
                lastModified: Date.now(),
                modifiedBy: "Yours Truly",
            })
            newVar.save((err, newDoc) => {
                if (newDoc) {
                    return res.status(200).json({
                        error: false,
                        message: 'Variable added successfully',
                        data: newDoc
                    })
                } else {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later'
                    })
                }
            })
        }
    })
})

router.post('/getVariable', (req, res) => {
    variableModel.findOne({ name: req.body.name }, (err, doc) => {
        if (doc) {
            return res.status(200).json({
                error: false,
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

router.post('/getManyVariables', (req, res) => {
    variableModel.find({ name: { $in: req.body.names } }, (err, doc) => {
        if (doc) {
            return res.status(200).json({
                error: false,
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

router.post('/changeVariable', (req, res) => {

    if (!req.body.token) {
        return res.status(200).json({
            error: true,
            message: 'Access denied. Admin token not provided.'
        })
    }

    verifyAdminToken(req.body.token, (item) => {
        const isAdmin = item.isAdmin;
        if (!isAdmin) {
            return res.status(200).json({
                error: true,
                message: 'Access denied. Limited for admin(s).'
            })
        } else {

            variableModel.findOneAndUpdate({ name: req.body.name }, { value: req.body.value, lastModified: Date.now(), modifiedBy: item.name }, { new: true }, (err, doc) => {
                if (doc) {
                    return res.status(200).json({
                        error: false,
                        message: 'Variable changed successfully.',
                        data: doc
                    })
                } else {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                }
            })
        }
    })
})

module.exports = router