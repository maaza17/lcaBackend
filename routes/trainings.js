const router = require('express').Router();
const trainingModel = require('../models/Trainings');
const verifyAdminToken = require('../helpers/verifyAdminToken');
const verifyUserToken = require('../helpers/verifyUserToken');
// create training registration email - for both self and manager nomination and import & use here

router.post('/editTraining', (req, res) => {

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
                    message: "Training object id is required."
                })
            }
            trainingModel.findOneAndUpdate({ _id: req.body._id }, {
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                name: req.body.name,
                description: req.body.description,
                location: req.body.location,
                openTo: req.body.openTo,
                capacity: req.body.capacity,
                slotsLeft: req.body.slotsLeft,
                participants: req.body.participants,
                eventType: req.body.eventType,
            }, { new: true }, (err, doc) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else if (!doc) {
                    return res.status(200).json({
                        error: true,
                        message: 'Training not found. Please recheck object.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Training updated successfully.',
                        data: doc
                    })
                }
            })
        }
    })
})

router.post('/addTraining', (req, res) => {
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
            let newTraining = new trainingModel({
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                name: req.body.name,
                description: req.body.description,
                location: req.body.location,
                openTo: req.body.openTo.toLowerCase(),
                capacity: req.body.capacity,
                slotsLeft: req.body.slotsLeft,
                participants: req.body.participants,
                eventType: req.body.eventType.toLowerCase(),
            })
            newTraining.save((err, newDoc) => {
                if (err) {
                    console.log(err)
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Training added successfully.',
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
                    message: "Training object id is required."
                })
            }
            trainingModel.findOneAndUpdate({ _id: req.body.ID }, { isDeleted: true }, (err, doc) => {
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
            trainingModel.findOneAndUpdate({ _id: req.body.ID }, { isDeleted: false }, (err, doc) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else if (!doc) {
                    return res.status(200).json({
                        error: true,
                        message: 'Training not found. Please recheck object.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Training deleted successfully.',
                        data: doc
                    })
                }
            })
        }
    })
})


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
router.post('/selfNomiation', (req, res) => {
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
            trainingModel.findOneAndUpdate({_id: req.body.trainingID}, {participants: {$push: {userID: item.user_id, name: item.name, email: item.email, occupation: item.occupation, isEmployee: item.isEmployee}}}, (err, doc) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Self nomination successful.',
                        data: doc
                    })
                }
            })
        }
    })
})

// nomination by manager
router.post('/nominateByManager', (req, res) => {
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
            if(!req.body.nominations || req.body.nominations.length <= 0 || !req.body.trainingID){
                return res.status(200).json({
                    error: true,
                    message: 'Required parameters are missing.'
                })
            }

            trainingModel.findOneAndUpdate({_id: req.body.trainingID}, {participants: {$push: req.body.nominations}}, (err, doc) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Nominations successful.',
                        data: doc
                    })
                }
            })
        }
    })
})
module.exports = router;