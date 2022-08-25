const router = require('express').Router()
const mongoose = require('mongoose')
const adminModel = require('../models/admin/Admin')
const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs')
const verifyToken = require('../helpers/verifyToken')
const {validateLoginInput, validateRegisterInput} = require('../validation/userAuthValidation')
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
                                return res.status(200).json({
                                    error: false,
                                    message: 'User registered successfully.',
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

module.exports = router