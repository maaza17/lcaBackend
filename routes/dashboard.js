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
module.exports = router