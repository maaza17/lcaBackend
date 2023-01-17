const router = require("express").Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userModel = require("../models/User");
const courseModel = require("../models/Course");
const trainingModel = require("../models/Trainings");
const enrollmentModel = require("../models/Enrollement");
const employeeModel = require("../models/Employee");

const verifyUserToken = require("../helpers/verifyUserToken");

router.post("/getCounts", (req, res) => {
    if (!req.body.token) {
        return res.status(200).json({
            error: true,
            message: "Token is required to proceed.",
        });
    }

    verifyUserToken(req.body.token, (item) => {
        const isValid = item.isValid;
        const user_id = item.user_id;
        const name = item.name;
        const managerID = item.lineManagerID;
        if (!isValid) {
            return res.status(200).json({
                error: true,
                message: "Access denied. Invalid token. Please login again.",
            });
        } else {
            let coursesCount, overallScore, trainingsAttended = 0
            let reportsTo = "Not Found"
            let openTo = {};
            enrollmentModel.find({ userId: user_id })
                .then((enrollmentDocs) => {
                    let score, total = 0;
                    coursesCount = enrollmentDocs.length

                    enrollmentDocs.forEach((item) => {
                        score = score + item.score;
                        total = total + item.maxScore;
                    })
                    if (total === 0) overallScore = 0;
                    else overallScore = score / total;

                    if (item.isEmployee.isTrue) openTo = { $in: ['internal', 'public'] }
                    else openTo = { $in: ['external', 'public'] }

                    trainingModel.find({ startDate: { $lte: Date.now() }, openTo: openTo })
                        .then((trainingsDocs) => {
                            trainingsDocs.forEach((item) => {
                                item.participants.forEach((subItem) => {
                                    if (subItem.userID == user_id) trainingsAttended++;
                                })
                            })
                            if (item.isEmployee.isTrue) {
                                employeeModel.findOne({ _id: item.isEmployee.employeeID }).then((empDoc) => {
                                    if (empDoc && empDoc.emplinemanagername) reportsTo = empDoc.emplinemanagername;
                                    return res.status(200).json({
                                        error: false,
                                        data: { coursesCount, overallScore, reportsTo, trainingsAttended }
                                    })
                                })
                            } else {
                                reportsTo = "Not an Employee"
                                return res.status(200).json({
                                    error: false,
                                    data: { coursesCount, overallScore, reportsTo, trainingsAttended }
                                })
                            }
                        })
                })
                .catch((err) => {
                    console.log(err);
                    return res.status(200).json({
                        error: true,
                        err: err,
                        message: "An unexpected error occurred. Please try again later"
                    })
                })
        }
    });
});

router.post("/getMyCourses2", (req, res) => {
    if (!req.body.token) {
        return res.status(200).json({
            error: true,
            message: "Token is required to proceed.",
        });
    }

    verifyUserToken(req.body.token, (item) => {
        const isValid = item.isValid;
        const user_id = item.user_id;
        if (!isValid) {
            return res.status(200).json({
                error: true,
                message: "Access denied. Invalid token. Please login again.",
            });
        } else {
            let courseIDs = [];
            enrollmentModel.find({ userId: user_id }).sort({ registrationDate: -1 })
                .then((enrollmentDocs) => {
                    for (var i = 0; i < enrollmentDocs.length; i++) {
                        courseIDs.push(enrollmentDocs[i].courseId)
                    }
                    courseModel.find({ _id: { $in: courseIDs } }).then((courseDocs) => {
                        return res.status(200).json({
                            courses: courseDocs,
                            enrolls: enrollmentDocs
                        })
                    })
                })
        }
    })
})

router.post("/getMyCourses", (req, res) => {
    if (!req.body.token) {
        return res.status(200).json({
            error: true,
            message: "Token is required to proceed.",
        });
    }

    verifyUserToken(req.body.token, (item) => {
        const isValid = item.isValid;
        const user_id = item.user_id;
        if (!isValid) {
            return res.status(200).json({
                error: true,
                message: "Access denied. Invalid token. Please login again.",
            });
        } else {
            let courses = [];
            let courseIDs = [];
            enrollmentModel.find({ userId: user_id, completed: false }).sort({ registrationDate: -1 })
                .then((enrollmentDocs) => {
                    // console.log(enrollmentDocs)
                    if (enrollmentDocs && enrollmentDocs.length >= 5) {
                        console.log(enrollmentDocs);
                        // console.log('here');
                        for (var i = 0; i < 5; i++) {
                            courseIDs.push(enrollmentDocs[i].courseId)
                        }
                        courseModel.find({ _id: { $in: courseIDs } }).then((courseDocs) => {
                            console.log(courseDocs);
                            for (var i = 0; i < 5; i++) {
                                let courseObj = courseDocs.find(obj => obj._id.equals(enrollmentDocs[i].courseId));
                                if (courseObj) {
                                    let sum = 0;
                                    for (var j = 0; j < enrollmentDocs[i].sectionIndex; j++) {
                                        for (var k = 0; k < enrollmentDocs[i].lessonIndex; k++) {
                                            sum = sum + 1;
                                        }
                                    }
                                    courses.push({
                                        percentage: enrollmentDocs[i].score / enrollmentDocs[i].maxScore,
                                        courseData: courseObj,
                                        progress: sum / courseObj.courseStats.countLessons,
                                        text: "From Recent Courses Enrolled"
                                    })
                                }
                            }
                            return res.status(200).json({
                                error: false,
                                data: courses
                            })
                        })

                    } else if (enrollmentDocs && enrollmentDocs.length > 0) {
                        for (var i = 0; i < enrollmentDocs.length; i++) {
                            courseIDs.push(enrollmentDocs[i].courseId)
                        }
                        courseModel.find({ _id: { $in: courseIDs } }).then((courseDocs) => {
                            for (var i = 0; i < enrollmentDocs.length; i++) {
                                let courseObj = courseDocs.find(obj => enrollmentDocs[i].courseId.equals(obj._id));
                                if (courseObj) {
                                    console.log(courseObj)
                                    let sum = 0;
                                    for (var j = 0; j < enrollmentDocs[i].sectionIndex; j++) {
                                        for (var k = 0; k < enrollmentDocs[i].lessonIndex; k++) {
                                            sum = sum + 1;
                                        }
                                    }
                                    courses.push({
                                        percentage: enrollmentDocs[i].score / enrollmentDocs[i].maxScore,
                                        courseData: courseObj,
                                        progress: sum / courseObj.courseStats.countLessons,
                                        text: "From Recent Courses Enrolled"
                                    })
                                }
                            }
                            courseModel.find({ status: "Listed" }).sort({ dateAdded: -1 }).then((course_docs) => {
                                // console.log(course_docs.length);
                                let limit = 5 - courses.length
                                for (var x = 0; x < limit; x++) {
                                    courses.push({
                                        courseData: course_docs[x],
                                        text: "From Recent Courses Uploaded"
                                    })
                                }
                                return res.status(200).json({
                                    error: false,
                                    data: courses
                                })
                            })
                        })
                    } else {
                        courseModel.find({ status: "Listed" }).sort({ dateAdded: -1 }).then((courseDocs) => {
                            console.log(courseDocs);
                            for (var i = 0; i < 5; i++) {
                                courses.push({
                                    courseData: courseDocs[i],
                                    text: "From Recent Courses Uploaded"
                                })
                            }
                            return res.status(200).json({
                                error: false,
                                data: courses
                            })
                        })
                    }
                })
                .catch((err) => {
                    console.log(err);
                    return res.status(200).json({
                        error: true,
                        err: err,
                        message: "An unexpected error occurred. Please try again later"
                    })
                })
        }
    });
});
module.exports = router