const router = require("express").Router();
const mongoose = require("mongoose");
const adminModel = require("../../models/admin/Admin");
const userModel = require("../../models/User");
const courseModel = require("../../models/Course");
const bookModel = require("../../models/Books");
const trainingModel = require("../../models/Trainings");
const verifyAdminToken = require("../../helpers/verifyAdminToken");
const jwt = require("jsonwebtoken");
const booksModel = require("../../models/Books");

router.post("/getCounts", (req, res) => {
  if (!req.body.token) {
    return res.status(200).json({
      error: true,
      message: "Admin token is required to proceed.",
    });
  }

  verifyAdminToken(req.body.token, (item) => {
    const isAdmin = item.isAdmin;
    const id = item.id;
    const name = item.name;
    if (!isAdmin) {
      return res.status(200).json({
        error: true,
        message: "Access denied. Limited for admin(s).",
      });
    } else {
        let coursesCount, booksCount,usersCount,trainingsCount = 0

      userModel.find({}, { _id: true })
      .then((usersDocs)=>{
        usersCount=usersDocs.length
        courseModel.find({},{_id: true })
        .then((coursesDocs)=>{
            coursesCount=coursesDocs.length
            booksModel.find({},{_id: true })
            .then((booksDocs)=>{
                booksCount= booksDocs.length
                trainingModel.find({},{_id: true })
                .then((trainingsDocs)=>{
                    trainingsCount=trainingsDocs.length
                    return res.status(200).json({
                        error: false,
                        message: "Counts found.",
                        data: {coursesCount,booksCount,usersCount,trainingsCount},
                      });
                })
            })
        })

      })
      .catch((err)=>{

      })
    }
  });
});
module.exports = router