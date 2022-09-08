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

module.exports = router