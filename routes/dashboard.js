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
                    let score = 0;
                    let total = 0;
                    coursesCount = enrollmentDocs.length
                    enrollmentDocs.forEach((item) => {
                        score = score + parseInt(item.score);
                        total = total + parseInt(item.maxScore);
                    })
                    if (total === 0) overallScore = 0;
                    else overallScore = ((score / total) * 100).toFixed(1);

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
                                        percentage: (enrollmentDocs[i].score / enrollmentDocs[i].maxScore) * 100,
                                        courseData: courseObj,
                                        progress: (sum / courseObj.courseStats.countLessons) * 100,
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
                                        percentage: (enrollmentDocs[i].score / enrollmentDocs[i].maxScore) * 100,
                                        courseData: courseObj,
                                        progress: (sum / courseObj.courseStats.countLessons) * 100,
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

router.post("/getUnderlingStats", (req, res) => {
    if (!req.body.token) {
        return res.status(200).json({
            error: true,
            message: "Token is required to proceed.",
        });
    } else {
        verifyUserToken(req.body.token, (item) => {
            const isValid = item.isValid;
            if (!isValid) {
                return res.status(200).json({
                    error: true,
                    message: "Access denied. Invalid token. Please login again.",
                });
            } else {
                courseModel.find({}, (courseErr, courseDocs) => {
                    trainingModel.find({}, (trainingErr, trainingDocs) => {
                        employeeModel.find({ emplinemanagerid: item.internalID }, (underErr, underDocs) => {
                            if (underDocs) {
                                if (underDocs.length > 0) {
                                    let final = []
                                    let underIDs = [];
                                    underDocs.forEach((item) => {
                                        underIDs.push(item._id);
                                        final.push({
                                            name: item.empname,
                                            employeeID: item.empid,
                                            mongoEmpId: item._id,
                                            userId: null,
                                            totalScore: 0,
                                            totalMaxScore: 0,
                                            recentEnrollment: "",
                                            courseList: [],
                                            trainingList: []
                                        })
                                    });
                                    userModel.find({ "isEmployee.employeeID": { $in: underIDs } }, (userErr, userDocs) => {
                                        if (userDocs) {
                                            if (userDocs.length > 0) {
                                                let userIDs = [];
                                                // console.log(userDocs);
                                                // console.log(final);
                                                userDocs.forEach((item) => {
                                                    userIDs.push(item._id);
                                                    final.forEach((fItem, index) => {
                                                        if (item.isEmployee.employeeID && fItem.mongoEmpId && fItem.mongoEmpId.equals(item.isEmployee.employeeID)) {
                                                            final[index] = {
                                                                name: final[index].name,
                                                                mongoEmpId: final[index].mongoEmpId,
                                                                employeeID: final[index].employeeID,
                                                                userId: item._id,
                                                                totalScore: 0,
                                                                totalMaxScore: 0,
                                                                recentEnrollment: "",
                                                                courseList: [],
                                                                trainingList: []
                                                            }
                                                        }
                                                    })
                                                });
                                                // console.log(userIDs)
                                                enrollmentModel.find({ "userId": { $in: userIDs } }).sort({ registrationDate: 1 }).then((enrollDocs) => {
                                                    // console.log(enrollDocs)
                                                    if (enrollDocs.length > 0) {
                                                        final.forEach((fItem, index) => {
                                                            let tempEnrolls = enrollDocs.filter(item => item.userId.equals(fItem.userId))
                                                            let totalScore = 0;
                                                            let totalMaxScore = 0;
                                                            let courseList = [];
                                                            let scoreList = [];
                                                            let trainingList = [];
                                                            let recentEnrollment = null;
                                                            tempEnrolls.forEach((item, index) => {
                                                                totalScore = totalScore + item.score;
                                                                totalMaxScore = totalMaxScore + item.maxScore;
                                                                courseList.push(courseDocs.find(subitem => subitem._id.equals(item.courseId)));
                                                                scoreList.push({"score":item.score,"maxScore":item.maxScore});
                                                                trainingList.push(trainingDocs.filter((trainItem) => { if (trainItem.participants.find(subitem => subitem.userID && item.userId && subitem.userID.equals(item.userId))) return trainItem; })[0])
                                                                if (index === tempEnrolls.length - 1) recentEnrollment = courseDocs.find(subitem => subitem._id.equals(item.courseId))
                                                            })
                                                            final[index] = {
                                                                name: final[index].name,
                                                                mongoEmpId: final[index].mongoEmpId,
                                                                employeeID: final[index].employeeID,
                                                                userId: final[index].userId,
                                                                totalScore: totalScore,
                                                                totalMaxScore: totalMaxScore,
                                                                recentEnrollment: recentEnrollment,
                                                                courseList: courseList,
                                                                scoreList: scoreList,
                                                                trainingList: trainingList
                                                            }
                                                        })
                                                        return res.status(200).json({
                                                            error: false,
                                                            data: final,
                                                        });
                                                    }
                                                    else return res.status(200).json({
                                                        error: false,
                                                        data: final,
                                                        message: "No enrollments found.",
                                                    });

                                                }).catch((err) => {
                                                    return res.status(200).json({
                                                        err: err,
                                                        error: true,
                                                        message: "An unexpected error occurred. Please try again later 1",
                                                    });
                                                })
                                            }
                                            else return res.status(200).json({
                                                error: false,
                                                data: final,
                                                message: "No users found.",
                                            });
                                        }
                                        else return res.status(200).json({
                                            err: userErr,
                                            error: true,
                                            message: "An unexpected error occurred. Please try again later 2",
                                        });
                                    })
                                }
                                else return res.status(200).json({
                                    error: false,
                                    data: [],
                                    message: "No underlings found.",
                                });
                            }
                            else return res.status(200).json({
                                err: underErr,
                                error: true,
                                message: "An unexpected error occurred. Please try again later 3",
                            });
                        })
                    })
                })
            }
        });
    }
});


module.exports = router