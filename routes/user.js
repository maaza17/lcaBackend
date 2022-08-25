const router = require('express').Router()
const mongoose = require('mongoose')
const adminModel = require('../models/admin/Admin')
const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs')
const verifyToken = require('../helpers/verifyToken')
const {validateLoginInput, validateRegisterInput} = require('../validation/userAuthValidation')
const { sendUserRegistrationEmail, sendAccountVerificationEmail, sendAccountApprovalEmail }  = require('../helpers/nodemailer')
const getConfirmationCode = require('../helpers/getConfirmationCode')
const userModel = require('../models/User')

router.post('/registeruser', (req, res) => {
    
    const { errors, isValid } = validateRegisterInput(req.body)
    
    if(!isValid){
        return res.status(200).json({
            error: true,
            message: 'Check error messages below.',
            error_message: errors
        })
    } else {
        let {name, email, password, occupation, organization} = req.body

        newUser = new userModel({
            name: name,
            email: email,
            password: password,
            occupation: occupation,
            organization: organization,
            confirmationCode: getConfirmationCode()
        })

        bcrypt.genSalt(10, (saltErr, salt) => {
            if(saltErr){
                return res.status(200).json({
                    error: true,
                    message: "An unexpected error occured. Please try again later"
                })
            } else {
                bcrypt.hash(newUser.password, salt, (hashErr, hash) => {
                    if(hashErr){
                        return res.status(200).json({
                            error: true,
                            message: "An unexpected error occured. Please try again later"
                        })
                    } else {
                        newUser.password = hash
                        newUser.save((saveErr, saveDoc) => {
                            if(saveErr && saveErr.code == 11000){
                                // console.log(saveErr)
                                return res.status(200).json({
                                    error: true,
                                    message: "An account with this email already exists."
                                })
                            } else if(saveErr){
                                return res.status(200).json({
                                    error: true,
                                    message: "An unexpected error occured. Please try again later."
                                })
                            } else {

                                sendUserRegistrationEmail({name: saveDoc.name, email: saveDoc.email, confirmationCode: saveDoc.confirmationCode}, (mailErr, mailInfo) => {
                                    if(mailErr){
                                        return res.status(200).json({
                                            error: true,
                                            message: 'An unexpected error occured. Please try again later.',
                                            error_message: mailErr
                                        })
                                    } else {
                                        return res.status(200).json({
                                            error: false,
                                            message: 'User registered successfully. Check your inbox for email verification.',
                                            data: saveDoc
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }
})

router.post('/loginuser', (req, res) => {
    
    const { errors, isValid } = validateLoginInput(req.body)

    if(!isValid){
        return res.status(200).json({
            error: true,
            message: 'Check error messages below.',
            error_message: errors
        })
    } else {
        let {email, password} = req.body
        userModel.findOne({email: email}, (err, user) => {
            if(err){
                return res.status(200).json({
                    error: true,
                    message: 'Check error messages below.',
                    error_messages: errors
                })
            } else if(!user){
                return res.status(200).json({
                    error: true,
                    message: 'User not found!'
                })
            } else {
                if(user.status === 'Suspended'){
                    return res.status(200).json({
                        error: true,
                        message: 'Your learning account has been suspended. Please contact your organisation\'s POC for resolution.'
                    })
                } else if(user.status === 'Pending Approval'){
                    return res.status(200).json({
                        error: true,
                        message: 'The email registered with your learning account has not yet been verified. Please check your inbox to verify your email.'
                    })
                }

                bcrypt.compare(password, user.password).catch((passErr) => {
                    if(passErr){
                        return res.status(200).json({
                            error: true,
                            message: 'An unexpected error occured. Please Try again later'
                        })
                    }
                })
                .then((isMatch) => {
                    if(!isMatch){
                        return res.status(200).json({
                            error: true,
                            message: 'Incorrect password. Please try again later'
                        })
                    } else {
                        const payload = {
                            userID: user._id,
                            name: user.name,
                            email: user.email,
                            organization: user.organization,
                            isEmployee: user.isEmployee
                        }

                        jwt.sign(payload, process.env.ENCRYPTION_SECRET, {expiresIn: 172800}, (signErr, userToken) => {
                            if(signErr){
                                console.log('user token sign error')
                                return res.status(200).json({
                                    error: true,
                                    message: 'An unexpected error occured. Please try again later.'
                                })
                            } else {
                                console.log('user login success')
                                return res.status(200).json({
                                    error: false,
                                    token: userToken,
                                    userType: 'User'
                                })
                            }
                        })
                    }
                })

            }
        })
    }
})

router.post('/approveusers', (req, res) => {

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
            let userIDs = req.body.userIDs
            
            userModel.updateMany({_id: {$in: userIDs}, status: 'Pending Approval'}, {status: 'Active'}, (err, updatedUsers) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occured. Please try again later.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Users(s) approved succesfully.',
                        data: updatedUsers
                    })
                }
            })
        }
    })
})

router.post('/suspendusers', (req, res) => {

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
            let userIDs = req.body.userIDs
            
            userModel.updateMany({_id: {$in: userIDs}, status: 'Active'}, {status: 'Suspended'}, (err, updatedUsers) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occured. Please try again later.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Users(s) suspended succesfully.',
                        data: updatedUsers
                    })
                }
            })
        }
    })
})


router.post('/reinstateusers', (req, res) => {

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
            let userIDs = req.body.userIDs
            
            userModel.updateMany({_id: {$in: userIDs}, status: 'Suspended'}, {status: 'Active'}, (err, updatedUsers) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occured. Please try again later.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: 'Users(s) reinstated succesfully.',
                        data: updatedUsers
                    })
                }
            })
        }
    })
})


// change from update many to findOne and then manual update to consequently send email
router.post('/verifyuseremail', (req, res) => {

    if(!req.body.confirmationCode || req.body.confirmationCode.length <= 0){
        return res.status(200).json({
            error: true,
            message: 'Error: Confirmation code is required.'
        })
    }

    let confirmationCode = req.body.confirmationCode
            
    userModel.findOne({confirmationCode: confirmationCode, status: 'Pending Email Verification'}, (err, doc) => {
        if(err){
            console.log('find err')
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occured. Please try again later.'
            })
        } else if(!doc){
            console.log('doc not found')
            return res.status(200).json({
                error: true,
                message: 'Account verification attempt is invalid or account is already verified.'
            })
        } else {
            doc.status = 'Pending Approval'
            doc.confirmationCode = null

            doc.save((saveErr, saveDoc) => {
                if(saveErr){
                    console.log('save err')
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occured. Please try again later.'
                    })
                } else {
                    sendAccountVerificationEmail({name: saveDoc.name, email: saveDoc.email}, (mailErr, mailInfo) => {
                        if(mailErr){
                            console.log('mail err')
                            return res.status(200).json({
                                error: true,
                                message: 'An unexpected error occured. Please try again later.'
                            })
                        } else {
                            return res.status(200).json({
                                error: false,
                                message: 'Email verified succesfully. Kindly wait for admin approval to start learning.',
                                data: doc
                            })
                        }
                    })
                }
            })
        }
    })
})

module.exports = router