const router = require('express').Router()
const mongoose = require('mongoose')
const verifyAdminToken = require('../helpers/verifyAdminToken')
const verifyUserToken = require('../helpers/verifyUserToken')
const enrollmentModel = require('../models/Enrollement')
const courseModel = require('../models/Course')
const userModel = require('../models/User')
const bcrypt = require('bcryptjs')


router.post('/haris', (req, res) => {
    userModel.findOne({ _id: "633ec0357f2160b220c36acb" }, (err, doc) => {
        bcrypt.genSalt(10, (saltErr, salt) => {
            if (saltErr) {
                return res.status(200).json({
                    error: true,
                    message: 'Unexpected error occurred. Please try again later.'
                })
            } else {
                bcrypt.hash("abc123", salt, (hashErr, hash) => {
                    if (hashErr) {
                        return res.status(200).json({
                            error: true,
                            message: 'Unexpected error occurred. Please try again later.'
                        })
                    } else {
                        doc.password = hash
                        doc.save((saveErr, saveDoc) => {
                            if (saveErr) {
                                return res.status(200).json({
                                    error: true,
                                    message: 'An Unexpected error occurred. Please try again later.'
                                })
                            } else {
                                // send password reset email here
                                return res.status(200).json({
                                    error: false,
                                    message: 'Password reset successfully.',
                                    data: saveDoc
                                })
                            }
                        })
                    }
                })
            }
        })
    })
})

router.post('/enrollCourse', (req, res) => {
    if (!req.body.token) {
        return res.status(200).json({
            error: true,
            message: 'User token is required to proceed.'
        })
    }
    verifyUserToken(req.body.token, (item) => {
        if ((!item) || (!item.isValid)) {
            return res.status(200).json({
                error: true,
                message: 'User session expired. Please log in again to proceed with enrollment.'
            })
        } else {
            let courseID = req.body.courseID ? req.body.courseID : null
            if (!courseID) {
                return res.status(200).json({
                    error: true,
                    message: 'Course id not provided.'
                })
            }
            enrollmentModel.find({ userId: item.user_id }, (enrolledCourseErr, enrolledCourseDocs) => {
                if (!enrolledCourseErr) {
                    courseModel.findOne({ _id: courseID, status: 'Listed' }, (courseErr, course) => {
                        if (courseErr) {
                            return res.status(200).json({
                                error: true,
                                message: 'An unexpected error occurred. Please try again later.'
                            })
                        } else if (!course) {
                            return res.status(200).json({
                                error: true,
                                message: 'Attempt to enroll in an invalid course.'
                            })
                        } else {
                            courseComplete = false;
                            courseProcess = false;
                            let temp = [];
                            for (var i = 0; i < enrolledCourseDocs.length; i++) {
                                if (enrolledCourseDocs[i].courseId == courseID && !enrolledCourseDocs[i].completed) {
                                    courseProcess = true;
                                    break;

                                } else if (enrolledCourseDocs[i].courseId == courseID && enrolledCourseDocs[i].completed) {
                                    courseComplete = true;
                                    break;
                                }
                                course.prerequisites.forEach((prereq) => {
                                    if (enrolledCourseDocs[i].courseId.toString() == prereq._id.toString()) {
                                        temp.push(enrolledCourseDocs[i]);
                                    }
                                })
                            }

                            if (courseProcess) {
                                return res.status(200).json({
                                    error: true,
                                    message: 'You are already enrolled in this course.'
                                })
                            } else if (courseComplete) {
                                return res.status(200).json({
                                    error: true,
                                    message: 'You have already completed this course. You can review it in your courses page'
                                })
                            } else {
                                let incompleteReqs = false;
                                if (temp.length < course.prerequisites.length) incompleteReqs = true;
                                else {
                                    temp.forEach((mycourse) => {
                                        course.prerequisites.forEach((prereq) => {
                                            if (mycourse.courseId.toString() == prereq._id.toString() && !mycourse.completed) {
                                                incompleteReqs = true;
                                            }
                                        })
                                    })
                                }
                                if (incompleteReqs) {
                                    return res.status(200).json({
                                        error: true,
                                        message: 'You have not completed the required pre-requisites for this course.'
                                    })
                                } else {
                                    let newEnrollment = new enrollmentModel({
                                        courseId: courseID,
                                        userId: item.user_id,
                                    })
                                    newEnrollment.save((saveErr, saveDoc) => {
                                        if (saveErr) {
                                            console.log(saveErr)
                                            return res.status(200).json({
                                                error: true,
                                                message: 'An unexpected error occurred. Please try again later.'
                                            })
                                        } else {
                                            return res.status(200).json({
                                                error: false,
                                                message: 'Enrollment successful.',
                                                data: saveDoc
                                            })
                                        }
                                    })
                                }
                            }
                        }
                    })
                } else {
                    return res.status(200).json({
                        error: true,
                        err: enrolledCourseErr,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                }
            })
        }
    })
})

router.post('/deEnrollCourse', (req, res) => {
    if (!req.body.token) {
        return res.status(200).json({
            error: true,
            message: 'User token is required to proceed.'
        })
    }

    verifyUserToken(req.body.token, (item) => {
        if ((!item) || (!item.isValid)) {
            return res.status(200).json({
                error: true,
                message: 'User session expired. Please log in again to proceed with de-enrollment.'
            })
        } else {
            if (!req.body.enrollmentID) {
                return res.status(200).json({
                    error: true,
                    message: "Course enrollment ID is required. Please try again later."
                })
            }
            enrollmentModel.findOneAndDelete({ _id: req.body.enrollmentID }, (err, deleted) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else if (!deleted) {
                    return res.status(200).json({
                        error: true,
                        message: 'Invalid course enrollment. Can not de-enroll.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'De-enrollment successful.'
                    })
                }
            })
        }
    })
})

router.post('/updateProgress', (req, res) => {
    if (!req.body.token) {
        return res.status(200).json({
            error: true,
            message: 'User token is required to proceed.'
        })
    }

    verifyUserToken(req.body.token, (item) => {

        if ((!item) || (!item.isValid)) {
            return res.status(200).json({
                error: true,
                message: 'User session expired. Please log in again to proceed.'
            })
        } else {
            if (!req.body.enrollmentID || req.body.sectionIndex === null || req.body.lessonIndex === null) {
                return res.status(200).json({
                    error: true,
                    message: 'Parameter(s) missing.'
                })
            }

            enrollmentModel.findOne({ _id: req.body.enrollmentID }, (err, doc) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else if (doc.sectionIndex < req.body.sectionIndex || (doc.sectionIndex === req.body.sectionIndex && doc.lessonIndex < req.body.lessonIndex)) {
                    doc.sectionIndex = req.body.sectionIndex;
                    doc.lessonIndex = req.body.lessonIndex;
                    enrollmentModel.findOneAndUpdate({ _id: req.body.enrollmentID }, doc, { new: true }, (newErr, newDoc) => {
                        if (newErr) {
                            return res.status(200).json({
                                error: true,
                                message: 'An unexpected error occurred. Please try again later.'
                            })
                        } else {
                            return res.status(200).json({
                                error: false,
                                message: 'Updated successfully.',
                                data: newDoc
                            })
                        }
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'This lesson is already cleared.',
                        data: doc
                    })
                }
            })
        }
    })
})

router.post('/score', (req, res) => {
    if (!req.body.token) {
        return res.status(200).json({
            error: true,
            message: 'User token is required to proceed.'
        })
    }

    verifyUserToken(req.body.token, (item) => {
        if ((!item) || (!item.isValid)) {
            return res.status(200).json({
                error: true,
                message: 'User session expired. Please log in again to proceed.'
            })
        } else {
            if (!req.body.enrollmentID || !req.body.score || !req.body.maxScore) {
                return res.status(200).json({
                    error: true,
                    message: 'Parameter(s) missing.'
                })
            }

            enrollmentModel.findOne({ _id: req.body.enrollmentID }, (err, doc) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else {
                    doc.score = doc.score + req.body.score;
                    doc.maxScore = doc.maxScore + req.body.maxScore;
                    enrollmentModel.findOneAndUpdate({ _id: req.body.enrollmentID }, doc, { new: true }, (newErr, newDoc) => {
                        if (newErr) {
                            return res.status(200).json({
                                error: true,
                                message: 'An unexpected error occurred. Please try again later.'
                            })
                        } else {
                            return res.status(200).json({
                                error: false,
                                message: 'Quiz Submitted.',
                                data: newDoc
                            })
                        }
                    })
                }
            })
        }
    })
})

router.post('/getGrade', (req, res) => {
    if (!req.body.token) {
        return res.status(200).json({
            error: true,
            message: 'User token is required to proceed.'
        })
    }

    verifyUserToken(req.body.token, (item) => {
        if ((!item) || (!item.isValid)) {
            return res.status(200).json({
                error: true,
                message: 'User session expired. Please log in again to proceed.'
            })
        } else {
            if (!req.body.enrollmentID) {
                return res.status(200).json({
                    error: true,
                    message: 'Parameter(s) missing.'
                })
            }

            enrollmentModel.findOne({ _id: req.body.enrollmentID }, (err, doc) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else {
                    if (doc.maxScore === 0) {
                        return res.status(200).json({
                            error: true,
                            message: 'You have not attended any quizzes yet',
                            grade: 0
                        })
                    }
                    else return res.status(200).json({
                        error: false,
                        message: 'Here you go good sir',
                        grade: (doc.score / doc.maxScore) * 100
                    })
                }
            })
        }
    })
})

router.post('/markAsCompleted', (req, res) => {
    if (!req.body.token) {
        return res.status(200).json({
            error: true,
            message: 'User token is required to proceed.'
        })
    }

    verifyUserToken(req.body.token, (item) => {
        if ((!item) || (!item.isValid)) {
            return res.status(200).json({
                error: true,
                message: 'User session expired. Please log in again to proceed.'
            })
        } else {
            if (!req.body.enrollmentID) {
                return res.status(200).json({
                    error: true,
                    message: 'Parameter(s) missing.'
                })
            }

            enrollmentModel.findOne({ _id: req.body.enrollmentID }, (err, doc) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else {
                    doc.completed = true;
                    doc.completedDate = Date.now();
                    enrollmentModel.findOneAndUpdate({ _id: req.body.enrollmentID }, doc, { new: true }, (newErr, newDoc) => {
                        if (newErr) {
                            return res.status(200).json({
                                error: true,
                                message: 'An unexpected error occurred. Please try again later.'
                            })
                        } else {
                            return res.status(200).json({
                                error: false,
                                message: 'Course Completed.',
                                data: newDoc
                            })
                        }
                    })
                }
            })
        }
    })
})

router.post('/getSingleEnrolled', (req, res) => {
    if (!req.body.token) {
        return res.status(200).json({
            error: true,
            message: 'User token is required.'
        })
    } else {
        verifyUserToken(req.body.token, (item) => {
            if ((!item) || (!item.isValid)) {
                return res.status(200).json({
                    error: true,
                    message: 'User session expired. Please log in again to proceed.'
                })
            } else {
                let courseID = req.body.courseID ? req.body.courseID : ''
                enrollmentModel.findOne({ userId: item.user_id, courseId: courseID }, (err, doc) => {
                    if (err || !doc) {
                        return res.status(200).json({
                            error: true,
                            message: 'An unexpected error occurred. Please try again later.'
                        })
                    } else {
                        courseModel.findOne({ _id: courseID }, (err, document) => {
                            if (err || !document) {
                                return res.status(200).json({
                                    error: true,
                                    message: 'An unexpected error occurred while fetching course details. Please try again later.'
                                })
                            } else {
                                return res.status(200).json({
                                    error: false,
                                    message: 'Enrolled course found.',
                                    data: doc,
                                    course: document
                                })
                            }
                        })
                    }
                })
            }
        })
    }
})

module.exports = router