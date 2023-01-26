const router = require('express').Router()
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const variableModel = require('../models/Variable')
const verifyAdminToken = require('../helpers/verifyAdminToken')

const userModel = require("../models/User");
const courseModel = require("../models/Course");
const trainingModel = require("../models/Trainings");
const enrollmentModel = require("../models/Enrollement");
const employeeModel = require("../models/Employee");

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

router.get('/getVariableStatistics', (req, res) => {
    let locationsCovered = 0;
    let totalParticipants = 0;
    let totalTrainingHours = 0;
    let numberOfTrainings = 0;
    trainingModel.find({}, (err, docs) => {
        if (docs) {
            let allLocs = [];
            docs.forEach((item) => {
                if (allLocs.indexOf(item.location) === -1) allLocs.push(item.location);
                totalParticipants = totalParticipants + item.participants.length;
                var diff = (item.startDate.getTime() - item.endDate.getTime()) / 1000;
                diff /= (60 * 60);
                totalTrainingHours = totalTrainingHours + Math.abs(Math.round(diff));
            })
            numberOfTrainings = docs.length;
            locationsCovered = allLocs.length;
            return res.status(200).json({
                error: false,
                locationsCovered: locationsCovered,
                totalParticipants: totalParticipants,
                totalTrainingHours: totalTrainingHours,
                numberOfTrainings: numberOfTrainings,
                message: "Here you go good sir"
            })
        } else return res.status(200).json({
            error: true,
            err: err,
            message: "An unexpected error occurred. Please try again later"
        })
    })
})


module.exports = router