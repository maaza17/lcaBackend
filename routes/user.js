const router = require('express').Router()
const mongoose = require('mongoose')
const adminModel = require('../../models/admin/Admin')
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
        let {name, email, password, organization} = req.body

        newUser = new userModel({
            name: name,
            email: email,
            password: password,
            organization: organization
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
                        newuser.save((saveErr, saveDoc) => {
                            if(saveErr){
                                return res.status(200).json({
                                    error: true,
                                    message: "An unexpected error occured. Please try again later"
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

module.exports = router