const router = require('express').Router()
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const courseModel = require('../models/Course')
const verifyToken = require('../helpers/verifyToken')

router.get('/getListedCourses', (req, res) => {

    courseModel.find({status: 'Listed'}, {_id: true, courseName: true, courseThumbnail: true, courseAbstract: true, courseInstructor:true, courseType: true, courseStats: true, dateCreated: true}, (err, docs) => {
        if(err){
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occured. Please try again later.'
            })
        } else if(docs.length <= 0){
            return res.status(200).json({
                error: true,
                message: 'No active course listings found.'
            })
        } else {
            return res.status(200).json({
                error: false,
                message: 'Active course(s) found.',
                data: docs
            })
        }
    })
})

router.post('/getHiddenCourses', (req, res) => {

    if(!req.body.token){
        return res.status(200).json({
            error: true,
            message: 'Access denied. Admin token not provided.'
        })
    }

    verifyToken(req.body.token, (item) => {
        const isAdmin = item.isAdmin;
        const id = item.id;
        const name = item.name;
        if (!isAdmin) {
            return res.status(200).json({
                error: true,
                message: 'Access denied. Limited for admin(s).'
            })
        } else {
            courseModel.find({status: 'Hidden'}, {_id: true, courseName: true, courseThumbnail: true, courseAbstract: true, courseInstructor:true, courseType: true, courseStats: true, dateCreated: true}, (err, docs) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occured. Please try again later.'
                    })
                } else if(docs.length <= 0){
                    return res.status(200).json({
                        error: true,
                        message: 'No hidden course listings found.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Hidden course(s) found.',
                        data: docs
                    })
                }
            })
        }
    })
})

router.post('/hideListedCourse', (req, res) => {

    if(!req.body.token){
        return res.status(200).json({
            error: true,
            message: 'Access denied. Admin token not provided.'
        })
    }

    verifyToken(req.body.token, (item) => {
        const isAdmin = item.isAdmin;
        const id = item.id;
        const name = item.name;
        if (!isAdmin) {
            return res.status(200).json({
                error: true,
                message: 'Access denied. Limited for admin(s).'
            })
        } else {
            let courseID = req.body.courseID

            courseModel.findOneAndUpdate({_id: courseID, status: 'Listed'}, {status: 'Hidden'}, {new: true}, (err, hiddenCourse) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occured. Please try again later.'
                    })
                } else if(!hiddenCourse){
                    return res.status(200).json({
                        error: true,
                        message: 'Course is already hidden or attempt to hide an invalid course.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Course hidden successfully.',
                        data: hiddenCourse
                    })
                }
            })
        }
    })
})

router.post('/listHiddenCourse', (req, res) => {

    if(!req.body.token){
        return res.status(200).json({
            error: true,
            message: 'Access denied. Admin token not provided.'
        })
    }

    verifyToken(req.body.token, (item) => {
        const isAdmin = item.isAdmin;
        const id = item.id;
        const name = item.name;
        if (!isAdmin) {
            return res.status(200).json({
                error: true,
                message: 'Access denied. Limited for admin(s).'
            })
        } else {
            let courseID = req.body.courseID

            courseModel.findOneAndUpdate({_id: courseID, status: 'Hidden'}, {status: 'Listed'}, {new: true}, (err, listedCourse) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occured. Please try again later.'
                    })
                } else if(!listedCourse){
                    return res.status(200).json({
                        error: true,
                        message: 'Course is already listed or attempt to list an invalid course.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Course listed successfully.',
                        data: listedCourse
                    })
                }
            })
        }
    })
})

router.post('/addNewCourse', (req, res) => {

    if(!req.body.token){
        return res.status(200).json({
            error: true,
            message: 'Access denied. Admin token not provided.'
        })
    }

    verifyToken(req.body.token, (item) => {
        const isAdmin = item.isAdmin;
        const id = item.id;
        const name = item.name;
        if (!isAdmin) {
            return res.status(200).json({
                error: true,
                message: 'Access denied. Limited for admin(s).'
            })
        } else {
            if(!req.body.course){
                return res.status(200).json({
                    error: true,
                    message: 'Course to be added not provided.'
                })
            }

            let courseName = req.body.course.courseName
            let courseInstructor = req.body.course.courseInstructor
            let courseThumbnail = req.body.course.courseThumbnail
            let courseType = req.body.course.courseType
            let prerequisites = req.body.course.prerequisites
            let courseAbstract = req.body.course.courseAbstract
            let courseContent = req.body.course.courseContent
            let availability = req.body.course.availability
            let watchTime = req.body.course.watchTime

            // compute course stats
            let countSections=0
            let countLessons=0
            if(courseContent.length > 0){
                courseContent.forEach((section) => {
                    countSections = countSections + 1
                    section.forEach((lesson) => {
                        countLessons = countLessons + 1
                    })
                })
            }

            // create new Course object
            newCourse = new courseModel({
                courseName: courseName,
                courseInstructor: courseInstructor,
                courseThumbnail: courseThumbnail,
                courseType: courseType,
                prerequisites: prerequisites,
                courseAbstract: courseAbstract,
                courseContent: courseContent,
                availability: availability,
                courseStats: {countSections: countSections, countLessons: countLessons, watchTime: watchTime}
            })

            newCourse.save((err, course) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occured. Please try again later.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Course added successfully. Head over to the hidden courses section to review and list the course.',
                        data: course
                    })
                }
            })
        }
    })

})

module.exports = router