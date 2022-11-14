const router = require('express').Router()
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const employeeModel = require('../models/Employee')
const verifyAdminToken = require('../helpers/verifyAdminToken')


router.post('/isEmployee', (req, res) => {

    let empID = req.body.empID

    employeeModel.findOne({empid: empID}, {_id: true, empname: true, empdesignation: true, empid: true}, (err, employee) => {
        if(err){
            return res.status(200).json({
                error: true,
                message: err.message
            })
        } else if(!employee){
            return res.status(200).json({
                error: true,
                message: "Employee does not exist."
            })
        } else {
            return res.status(200).json({
                error: false,
                message: "Employee found succesfully.",
                data: employee
            })
        }
    })

})

router.post('/getEmployeeDetails', (req, res) => {

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
            let empID = req.body.empID

            employeeModel.findOne({_id: empID}, (err, employee) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: err.message
                    })
                } else if(!employee){
                    return res.status(200).json({
                        error: false,
                        message: "Employee does not exist."
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: "Employee found succesfully.",
                        data: employee
                    })
                }
            })
        }
    })
})

router.post('/bulkRewriteEmployees', (req, res) => {
    console.log(req.body.token)
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
            let empArray = req.body.empArray
            console.log(empArray.length)
            console.log(empArray[5])
            employeeModel.deleteMany({})
            .then(() => {
                employeeModel.insertMany(empArray, (err, docs) => {
                    if(err){
                        return res.status(200).json({
                            error: true,
                            text:err,
                            message: 'An unexpected error occurred. Please try again later.'
                        })
                    } else {
                        return res.status(200).json({
                            error: false,
                            message: 'Employee list successfully updated.'
                        })
                    }
                })
            })
            .catch((delErr) => {
                if(delErr){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                }
            })
        }
    })
})

router.post('/getUnderlings', (req, res) => {

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
            employeeModel.find({emplinemanagerid: req.body.employeeid}, (err, docs) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else if(docs.length <= 0){
                    return res.status(200).json({
                        error: false,
                        message: 'This emplyee does not have any reportees.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Found ' + docs.length + ' reportees for this employee.',
                        data: docs
                    })
                }
            })
        }
    })

})

module.exports = router