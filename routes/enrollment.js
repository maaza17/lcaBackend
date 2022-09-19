const router = require('express').Router()
const mongoose = require('mongoose')
const verifyAdminToken = require('../helpers/verifyAdminToken')
const verifyUserToken = require('../helpers/verifyUserToken')
const enrollmentModel = require('../models/Enrollement')
const courseModel = require('../models/Course')

router.post('/enrollCourse', (req, res) => {
    if(!req.body.token){
        return res.status(200).json({
            error: true,
            message: 'User token is required to proceed.'
        })
    }

    verifyUserToken(req.body.token, (item) => {
        if((!item) || (!item.isValid)){
            return res.status(200).json({
                error: true,
                message: 'User session expired. Please log in again to proceed with enrollment.'
            })
        } else {
            let courseID = req.body.courseID?req.body.courseID:null
            if(!courseID){
                return res.status(200).json({
                    error: true,
                    message: 'Course id not provided.'
                })
            }
            
            enrollmentModel.findOne({courseId: courseID, userId: item.user_id}, (findOneErr, findOneDoc) => {
                if(!findOneDoc){
                    
                    courseModel.findOne({_id: courseID, status: 'Listed'}, (courseErr, course) => {
                        if(courseErr){
                            return res.status(200).json({
                                error: true,
                                message: 'An unexpected error occured. Please try again later.'
                            })
                        } else if(!course){
                            return res.status(200).json({
                                error: true,
                                message: 'Attempt to enroll in an invalid course.'
                            })
                        } else {
                            let content = []
                            course.courseContent.forEach(section => {
                                let tempSection = {_id: section._id, sectionTitle: section.sectionTitle, sectionAbstract: section.sectionAbstract, sectionLessons: []}
                                section.sectionLessons.forEach(lesson => {
                                    let tempLesson = {
                                        _id: lesson._id, lessonNumber: lesson.lessonNumber, lessonName: lesson.lessonName,
                                        lessonVideo: lesson.lessonVideo, lessonThumbnail: lesson.lessonThumbnail,
                                        lessonQuiz: lesson.lessonQuiz, completed: false
                                    }
                                    tempSection.sectionLessons.push(tempLesson)
                                })
                                content.push(tempSection)
                            })
                            
                            let newEnrollment = new enrollmentModel({
                                courseId: courseID,
                                userId: item.user_id,
                                courseName: course.courseName,
                                courseInstructor: course.courseInstructor,
                                courseType: course.courseType,
                                courseContent: content,
                            })
        
                            newEnrollment.save((saveErr, saveDoc) => {
                                if(saveErr){
                                    console.log(saveErr)
                                    return res.status(200).json({
                                        error: true,
                                        message: 'An unexpected error occured. Please try again later.'
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
                    })
                } else {
                    return res.status(200).json({
                        error: true,
                        message: 'Already enrolled.'
                    })
                }
            })
        }
    })
})

router.post('/deEnrollCourse', (req, res) => {
    if(!req.body.token){
        return res.status(200).json({
            error: true,
            message: 'User token is required to proceed.'
        })
    }

    verifyUserToken(req.body.token, (item) => {
        if((!item) || (!item.isValid)){
            return res.status(200).json({
                error: true,
                message: 'User session expired. Please log in again to proceed with de-enrollment.'
            })
        } else {
            if(!req.body.enrollmentID){
                return res.status(200).json({
                    error: true,
                    message: "Course enrollment ID is required. Please try again later."
                })
            }
            enrollmentModel.findOneAndDelete({_id: req.body.enrollmentID}, (err, deleted) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occured. Please try again later.'
                    })
                } else if(!deleted){
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

router.post('/markLessonCompleted', (req, res) => {
    // console.log(req.body)
    if(!req.body.token){
        return res.status(200).json({
            error: true,
            message: 'User token is required to proceed.'
        })
    }

    verifyUserToken(req.body.token, (item) => {
        if((!item) || (!item.isValid)){
            return res.status(200).json({
                error: true,
                message: 'User session expired. Please log in again to proceed.'
            })
        } else {
            if(!req.body.enrollmentID || !req.body.sectionID || !req.body.lessonID){
                return res.status(200).json({
                    error: true,
                    message: 'Parameter(s) missing.'
                })
            }

            enrollmentModel.findOne({_id: req.body.enrollmentID}, (err, doc) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occured. Please try again later.'
                    })
                } else {
                    let temp = doc.courseContent
                    temp = temp.map(section => {
                        if(section._id == req.body.sectionID){
                            let temp_lessons = section.sectionLessons
                            temp_lessons = temp_lessons.map(lesson => {
                                if(lesson._id == req.body.lessonID){
                                    return {...lesson, completed: true}
                                }
                            })
                            section.sectionLessons = temp_lessons
                            return section
                        }
                    })
                    doc.courseContent = temp

                    enrollmentModel.findOneAndUpdate({_id: req.body.enrollmentID}, doc, {new: true}, (newErr, newDoc) => {
                        if(newErr){
                            return res.status(200).json({
                                error: true,
                                message: 'An unexpected error occured. Please try again later.'
                            })
                        } else {
                            return res.status(200).json({
                                error: false,
                                message: 'Updated successfully.',
                                data: newDoc
                            })
                        }
                    })
                }
            })
        }
    })
})

module.exports = router