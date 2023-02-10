const router = require('express').Router()
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const employeeModel = require('../models/Employee')
const userModel = require('../models/User')
const verifyAdminToken = require('../helpers/verifyAdminToken')
const getConfirmationCode = require('../helpers/getConfirmationCode')
const bcrypt = require('bcryptjs')

function makeRandom() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < 15) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

router.post('/isEmployee', (req, res) => {

    let empID = req.body.empID

    employeeModel.findOne({ empid: empID }, { _id: true, empname: true, empdesignation: true, empid: true }, (err, employee) => {
        if (err) {
            return res.status(200).json({
                error: true,
                message: err.message
            })
        } else if (!employee) {
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

            employeeModel.findOne({ _id: empID }, (err, employee) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: err.message
                    })
                } else if (!employee) {
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

router.post('/haris', (req, res) => {
    employeeModel.deleteMany({ empid: { $in: ["1234", "5678", "318", "319"] } }, (err, doc) => {
        return res.status(200).json({
            message: "done",
            doc: doc
        })
    })
})

router.post('/bulkRewriteEmployees', (req, res) => {
    // console.log(req.body.token)
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
            // console.log(empArray)
            // console.log(empArray[5])
            employeeModel.find({}, (err, empDocs) => {
                // employeeModel.insertMany(empArray, (err, empDocs) => {
                if (empDocs && empDocs.length > 0) {
                    deltaEmps = []
                    empArray.forEach((in_item) => {
                        let found = false;
                        empDocs.forEach((item) => {
                            // console.log(in_item);
                            // console.log("input" + in_item.empid)
                            // console.log("data" + item.empid)
                            // console.log("comp" + (in_item.empid === item.empid))
                            if (in_item.empid === item.empid) {
                                found = in_item
                                // console.log(in_item.empid + " found")
                            }
                        })
                        if (!found) deltaEmps.push(in_item);
                    })
                    // console.log(deltaEmps);
                    // return res.status(200).json({
                    //     error: false,
                    //     message: deltaEmps
                    // })
                    employeeModel.insertMany(deltaEmps, () => {
                        employeeModel.find({}, (err, newEmpDocs) => {
                            // console.log(newEmpDocs);
                            newUsers = [];
                            // console.log(item);
                            let password = "ABC_123"
                            bcrypt.genSalt(10, (saltErr, salt) => {
                                // if (saltErr) console.log(saltErr);
                                bcrypt.hash(password, salt, (hashErr, hash) => {
                                    // if (hashErr) console.log(hashErr);
                                    // console.log(hash);
                                    deltaEmps.forEach((item) => {
                                        newUsers.push({
                                            name: item.empname,
                                            email: item.empemail,
                                            password: hash,
                                            occupation: item.empdesignation,
                                            organization: "Muller & Phipps",
                                            confirmationCode: getConfirmationCode(),
                                            status: 'Active',
                                            department: item.empdivision,
                                            isEmployee: { isTrue: true, employeeID: newEmpDocs.filter(obj => obj.empid === item.empid)[0]._id }
                                        })
                                    })
                                    console.log(newUsers);
                                    userModel.insertMany(newUsers, (err, userDocs) => {
                                        if (userDocs) {
                                            return res.status(200).json({
                                                error: false,
                                                message: 'Employee list successfully updated.',
                                                data: userDocs
                                            })
                                        } else {
                                            return res.status(200).json({
                                                error: true,
                                                text: err,
                                                message: 'An unexpected error occurred. Please try again later.'
                                            })
                                        }
                                    })
                                })
                            })
                        })
                    })
                    // userModel.find({}, (err, userDocs) => {
                    //     if (userDocs && userDocs.length > 0) {
                    //         let idFromUsers = [];
                    //         userDocs.forEach((item) => { if (item.isEmployee && item.isEmployee.isTrue && item.isEmployee.employeeID) idFromUsers.push(item.isEmployee.employeeID) })
                    //         let idFromEmps = [];
                    //         empDocs.forEach((item) => { if (item._id) idFromEmps.push(item._id) })
                    //         let newEmps = [];
                    //         idFromEmps.forEach((item) => { if (idFromUsers.indexOf(item) === -1) newEmps.push(item) })
                    //         newUsers = [];
                    //         empDocs.forEach((item) => {
                    //             if (newEmps.indexOf(item.empid) !== -1) {
                    //                 let password = "ABC_" + item.empid
                    //                 bcrypt.genSalt(10, (saltErr, salt) => {
                    //                     bcrypt.hash(password, salt, (hashErr, hash) => {
                    //                         newUsers.push({
                    //                             name: item.empname,
                    //                             email: item.empemail,
                    //                             password: hash,
                    //                             occupation: item.empdesignation,
                    //                             organization: "Muller & Phipps",
                    //                             confirmationCode: getConfirmationCode(),
                    //                             status: 'Active',
                    //                             department: item.empdivision,
                    //                             isEmployee: { isTrue: true, employeeID: item._id }
                    //                         })
                    //                     })
                    //                 })
                    //             }
                    //         })
                    //         userModel.insertMany(newUsers, (err, userDocs) => {
                    //             if (userDocs) return res.status(200).json({
                    //                 error: false,
                    //                 message: 'Employee list successfully updated.'
                    //             })
                    //         })
                    //     } else {
                    //         return res.status(200).json({
                    //             error: true,
                    //             text: err,
                    //             message: 'An unexpected error occurred. Please try again later.'
                    //         })
                    //     }
                    // })
                } else {
                    employeeModel.insertMany(empArray, (err, docs) => {
                        if (err) {
                            return res.status(200).json({
                                error: true,
                                text: err,
                                message: 'An unexpected error occurred. Please try again later.'
                            })
                        } else {
                            return res.status(200).json({
                                error: false,
                                message: 'Employee list successfully updated.'
                            })
                        }
                    })
                }
            })
            // })
            // .catch((delErr) => {
            //     if (delErr) {
            //         return res.status(200).json({
            //             error: true,
            //             message: 'An unexpected error occurred. Please try again later.'
            //         })
            //     }
            // })
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
            employeeModel.find({ emplinemanagerid: req.body.employeeid }, (err, docs) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                } else if (docs.length <= 0) {
                    return res.status(200).json({
                        error: false,
                        message: 'This employee does not have any underlings.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Found ' + docs.length + ' underlings for this employee.',
                        data: docs
                    })
                }
            })
        }
    })

})

module.exports = router