const router = require('express').Router();
const trainingModel = require('../models/Trainings');
const verifyAdminToken = require('../helpers/verifyAdminToken');
const verifyUserToken = require('../helpers/verifyUserToken');
// create training registration email - for both self and manager nomination and import & use here

// for listing in admin panel
router.get('/getAllTrainings', (req, res) => {
    trainingModel.find({}, (err, trainings) => {
        if(err) {
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occurred. Please try again later.'
            })
        } else {
            return res.status(200).json({
                error: false,
                message: 'Trainings found.',
                data: trainings
            })
        }
    })
})

// for listing on landing page
router.post('/getAllActiveTrainings', (req, res) => {
    trainingModel.find({startDate: {$gte: Date.now()}}, (err, trainings) => {
        if(err){
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occurred. Please try again later.'
            })
        } else if(trainings.length <= 0){
            return res.status(200).json({
                error: false,
                message: 'No trainings found.',
                data: trainings
            })
        } else {
            return res.status(200).json({
                error: false,
                message: 'Trainings found.',
                data: trainings
            })
        }
    })
})

// for listing in user dashboard
router.post('/getActiveTrainingsForUser', (req, res) => {
    if(!req.body.token){
        return res.status(200).json({
            error: true,
            message: 'Login required.'
        })
    }

    verifyUserToken(req.body.token, (item) => {
        if ((!item) || (!item.isValid)) {
            return res.status(200).json({
                error: true,
                message: 'User session expired. Please log in again to proceed.'
            })
        } else {
            // continue here
            if(item.isEmployee.isTrue) openTo = {$in: ['internal', 'public']}
            else openTo = {$in: ['external', 'public']}

            trainingModel.find({startDate: {$gte: Date.now()}, openTo: openTo}, (err, trainings) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else if(trainings.length <= 0){
                    return res.status(200).json({
                        error: false,
                        message: 'No trainings found.',
                        data: trainings
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Trainings found.',
                        data: trainings
                    })
                }
            })
        }
    })
})

// self nomination

// nomination by manager

// add new training

// edit training

// delete training

module.exports = router;