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
        if (err) {
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
    trainingModel.find({ startDate: { $gte: Date.now() } }, (err, trainings) => {
        if (err) {
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occurred. Please try again later.'
            })
        } else if (trainings.length <= 0) {
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
    if (!req.body.token) {
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
            if (item.isEmployee.isTrue) openTo = { $in: ['internal', 'public'] }
            else openTo = { $in: ['external', 'public'] }

            trainingModel.find({ startDate: { $gte: Date.now() }, openTo: openTo }, (err, trainings) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else if (trainings.length <= 0) {
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

// for listing in user dashboard
router.post('/getNominatedTrainingsForUser', (req, res) => {
    if (!req.body.token) {
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
            if (item.isEmployee.isTrue) openTo = { $in: ['internal', 'public'] }
            else openTo = { $in: ['external', 'public'] }

            trainingModel.find({ startDate: { $gte: Date.now() }, openTo: openTo, isDeleted: false }, (err, trainings) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else if (trainings.length <= 0) {
                    return res.status(200).json({
                        error: false,
                        message: 'No trainings found.',
                        data: []
                    })
                } else {
                    let output = [];
                    for (var h = 0; h < trainings.length; h++) {
                        let input = trainings[h].participants;
                        for (var i = 0; i < input.length; i++) {
                            if (input[i].userID == item.user_id) {
                                output.push(trainings[h]);
                                break;
                            }
                        }
                    }
                    return res.status(200).json({
                        error: false,
                        message: 'Trainings found.',
                        data: output
                    })
                }
            })
        }
    })
})

// self nomination
router.post('/selfNomination', (req, res) => {
    if (!req.body.token) {
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
            trainingModel.findOne({ _id: req.body.trainingID }, (err, doc) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else {
                    let obj = {
                        userID: item.user_id,
                        name: item.name,
                        email: item.email,
                        isEmployee: item.isEmployee
                    }
                    let found = false;
                    doc.participants.forEach((item) => {
                        if (obj.userID && item.userID && obj.userID == item.userID) {
                            found = true;
                        }
                    })
                    if (!found) {
                        doc.participants.push(obj)
                        doc.save((err, saveDoc) => {
                            if (saveDoc) {
                                return res.status(200).json({
                                    error: false,
                                    message: 'Self nomination successful.',
                                    data: saveDoc
                                })
                            } else {
                                return res.status(200).json({
                                    error: true,
                                    err: err,
                                    message: 'An unexpected error occurred. Please try again later.'
                                })
                            }
                        })
                    } else {
                        return res.status(200).json({
                            error: false,
                            message: 'Already nominated for this training.'
                        })
                    }
                }
            })
        }
    })
})

// nomination by manager
router.post('/nominateByManager', (req, res) => {
    if (!req.body.token) {
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
            if (!req.body.nominations || req.body.nominations.length <= 0 || !req.body.trainingID) {
                return res.status(200).json({
                    error: true,
                    message: 'Required parameters are missing.'
                })
            }
            trainingModel.findOne({ _id: req.body.trainingID }, (err, doc) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else {
                    let count = 0;
                    for (var i = 0; i < req.body.nominations.length; i++) {
                        let obj = {
                            userID: req.body.nominations[i].user_id,
                            name: req.body.nominations[i].name,
                            email: req.body.nominations[i].email,
                            isEmployee: req.body.nominations[i].isEmployee
                        }
                        let found = false;
                        doc.participants.forEach((item) => {
                            if (obj.userID && item.userID && obj.userID == item.userID) {
                                found = true;
                            }
                        })
                        if (!found) {
                            doc.participants.push(obj)
                            count++;
                        }
                    }
                    doc.save((err, saveDoc) => {
                        if (saveDoc) {
                            return res.status(200).json({
                                error: false,
                                message: 'Nominations successful.',
                                data: saveDoc,
                                addCount: count,
                                repeatCount: req.body.nominations.length - count
                            })
                        } else {
                            return res.status(200).json({
                                error: true,
                                err: err,
                                message: 'An unexpected error occurred. Please try again later.'
                            })
                        }
                    })
                }
            })
        }
    })
})


module.exports = router;