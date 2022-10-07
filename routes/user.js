const router = require('express').Router()
const mongoose = require('mongoose')
const adminModel = require('../models/admin/Admin')
const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs')
const verifyAdminToken = require('../helpers/verifyAdminToken')
const verifyUserToken = require('../helpers/verifyUserToken')
const {validateLoginInput, validateRegisterInput} = require('../validation/userAuthValidation')
const adminAddUserValidation = require('../validation/adminAddUserValidation')
const {sendUserRegistrationEmail, sendAccountVerificationEmail, sendAccountApprovalEmail, sendAdminUserRegistrationEmail, sendLoggedInPasswordResetEmail, forgotPasswordUserAlert, forgotPasswordAdminAlert}  = require('../helpers/nodemailer')
const getConfirmationCode = require('../helpers/getConfirmationCode')
const generateUserPassword = require('../helpers/generateUserPassword')
const userModel = require('../models/User')
const employeeModel = require('../models/Employee')

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
                        message: 'Please wait until an admin from the LCA team approves your learning account.'
                    })
                } else if(user.status === 'Pending Email Verification'){
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

                        jwt.sign(payload, process.env.ENCRYPTION_SECRET_USER, {expiresIn: 172800}, (signErr, userToken) => {
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
                                    message: 'Login successful.',
                                    userType: 'User',
                                    user: {
                                        _id: user._id,
                                        name: user.name,
                                        email: user.email,
                                        isEmployee: user.isEmployee
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

router.post('/approveuser', (req, res) => {

    if(!req.body.token){
        return res.status(200).json({
            error: true,
            message: 'Access denied. Admin token not provided.'
        })
    }

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
            let userID = req.body.userID
            
            userModel.findOneAndUpdate({_id: userID, status: 'Pending Approval'}, {status: 'Active'}, {new: true}, (err, updatedUser) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occured. Please try again later.'
                    })
                } else if(!updatedUser){
                    return res.status(200).json({
                        error: true,
                        message: 'User not found/already approved.'
                    })
                }else {
                    sendAccountApprovalEmail({name: updatedUser.name, email: updatedUser.email}, (mailErr, mailInfo) => {
                        if(mailErr){
                            return res.status(200).json({
                                error: true,
                                message: 'An unexpected error occured. Please try again later.',
                                error_message: mailErr
                            })
                        } else {
                            return res.status(200).json({
                                error: false,
                                message: 'User approved succesfully.',
                                data: updatedUser
                            })
                        }
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
            let userIDs = req.body.userIDs
            
            userModel.updateMany({_id: {$in: userIDs}, status: 'Active'}, {status: 'Suspended'}, (err, updatedUsers) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occured. Please try again later.'
                    })
                } else if(updatedUsers.matchedCount <= 0){
                    return res.status(200).json({
                        error: true,
                        message: 'User(s) already suspended and/or invalid users flagged for suspension.'
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
            let userIDs = req.body.userIDs
            
            userModel.updateMany({_id: {$in: userIDs}, status: 'Suspended'}, {status: 'Active'}, (err, updatedUsers) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occured. Please try again later.'
                    })
                } else if(updatedUsers.matchedCount <= 0){
                    return res.status(200).json({
                        error: true,
                        message: 'User(s) already active and/or invalid users flagged for reinstatement.'
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

            doc.save((saveErr, saveDoc) => {
                if(saveErr){
                    console.log(saveErr)
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

router.post('/addUser_Admin', (req, res) => {

    if(!req.body.token){
        return res.status(200).json({
            error: true,
            message: 'Access denied. Admin token not provided.'
        })
    }

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
            const { errors, isValid } = adminAddUserValidation(req.body)
    
            if(!isValid){
                return res.status(200).json({
                    error: true,
                    message: 'Check error messages below.',
                    error_message: errors
                })
            } else {
                let empid = req.body.empid?req.body.empid:''
                let empname = req.body.empname?req.body.empname:''
                let empdesignation = req.body.empdesignation?req.body.empdesignation:''
                let empgrade = req.body.empgrade?req.body.empgrade:''
                let empdivision = req.body.empdivision?req.body.empdivision:''
                let emplinemanagerid = req.body.emplinemanagerid?req.body.emplinemanagerid:''
                let emplinemanagername = req.body.emplinemanagername?req.body.emplinemanagername:''
                let empemail = req.body.empemail?req.body.empemail:''

                let newEmp = new employeeModel({
                    empid: empid,
                    empname: empname,
                    empdesignation: empdesignation,
                    empgrade: empgrade,
                    empdivision: empdivision,
                    emplinemanagerid: emplinemanagerid,
                    emplinemanagername: emplinemanagername
                })

                newEmp.save((empSaveErr, empSaveDoc) => {
                    if(empSaveErr && empSaveErr.code == 11000){
                        employeeModel.findOne({empid: empid}, (findOneErr, findOneDoc) => {
                            if(findOneErr || !findOneDoc){
                                return res.status(200).json({
                                    error: true,
                                    message: 'An unexpected error occured. Please try again later.'
                                })
                            } else {
                                let userPass = generateUserPassword()
                                let newUser = new userModel({
                                    name: empname,
                                    email: empemail,
                                    password: userPass,
                                    occupation: empdesignation,
                                    organization: 'Muller & Phipps',
                                    confirmationCode: getConfirmationCode(),
                                    status: 'Active',
                                    isEmployee: {isTrue: true, employeeID: findOneDoc._id}
                                })

                                // 
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
                                                        sendAdminUserRegistrationEmail({name: saveDoc.name, username: saveDoc.email, password: userPass}, (mailErr, mailInfo) => {
                                                            if(mailErr){
                                                                return res.status(200).json({
                                                                    error: true,
                                                                    message: 'An unexpected error occured. Please try again later.',
                                                                    error_message: mailErr
                                                                })
                                                            } else {
                                                                return res.status(200).json({
                                                                    error: false,
                                                                    message: 'Employee registered as user successfully.',
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
                                // 

                            }
                        })
                    } else if(empSaveErr){
                        console.log(empSaveErr)
                        return res.status(200).json({
                            error: true,
                            message: 'An unexpected error occured. Please try again later.'
                        })
                    } else if(!empSaveDoc){
                        return res.status(200).json({
                            error: true,
                            message: 'An unexpected error occured. Please try again later.'
                        })
                    } else {
                        let userPass = generateUserPassword()
                        let newUser = new userModel({
                            name: empname,
                            email: empemail,
                            password: userPass,
                            occupation: empdesignation,
                            organization: 'Muller & Phipps',
                            confirmationCode: getConfirmationCode(),
                            status: 'Active',
                            isEmployee: {isTrue: true, employeeID: empSaveDoc._id}
                        })

                        // 
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
                                                sendAdminUserRegistrationEmail({name: saveDoc.name, username: saveDoc.email, password: userPass}, (mailErr, mailInfo) => {
                                                    if(mailErr){
                                                        return res.status(200).json({
                                                            error: true,
                                                            message: 'An unexpected error occured. Please try again later.',
                                                            error_message: mailErr
                                                        })
                                                    } else {
                                                        return res.status(200).json({
                                                            error: false,
                                                            message: 'Employee registered as user successfully.',
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
                        //
                    }
                })

            }
        }
    })

})

router.post('/getAllUsers', (req, res) => {

    if(!req.body.token){
        return res.status(200).json({
            error: true,
            message: 'Access denied. Admin token not provided.'
        })
    }

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
            userModel.find({}, {password: false, confirmationCode: false}, (err, docs) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occured. Please try again later.'
                    })
                } else if(docs.length <= 0){
                    return res.status(200).json({
                        error: false,
                        message: 'No users found.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: ''+ docs.length + ' total users found.',
                        data: docs
                    })
                }
            })
        }
    })

})

router.post('/resetUserPasswordLoggedIn', (req, res) => {
    if(!req.body.token){
        return res.status(200).json({
            error: true,
            message: 'User token is required to proceed.'
        })
    }

    verifyUserToken(req.body.token, (item) => {
        if((!item) || (!item.isValid)){
            return res.status(200).json({
                error: true,
                message: 'User session expired. Please log in again to proceed.'
            })
        } else {


            if(!req.body.oldPass){
                return res.status(200).json({
                    error: true,
                    message: 'Old password is required.'
                })
            }
            if(!req.body.newPass){
                return res.status(200).json({
                    error: true,
                    message: 'New password is required.'
                })
            }
            userModel.findOne({_id: item.user_id}, (err, doc) => {
                if(err){
                    return res.status(200).json({
                        error: true,
                        message: 'An Unexpected error occured. Please try again later.'
                    })
                } else if(!doc){
                    return res.status(200).json({
                        error: true,
                        message: 'Invalid user. Can not reset password.'
                    })
                } else {
                    
                    bcrypt.compare(req.body.oldPass, doc.password).catch((passErr) => {
                        if(passErr){
                            return res.status(200).json({
                                error: true,
                                message: 'An unexpected error ocurred. Please try again later.'
                            })
                        }
                    })
                    .then((isMatch) => {
                        if(isMatch){
                            bcrypt.genSalt(10, (saltErr, salt) => {
                                if(saltErr){
                                    return res.status(200).json({
                                        error: true,
                                        message: 'Unexpected error occured. Please try again later.'
                                    })
                                } else {
                                    bcrypt.hash(req.body.newPass, salt, (hashErr, hash) => {
                                        if(hashErr){
                                            return res.status(200).json({
                                                error: true,
                                                message: 'Unexpected error occured. Please try again later.'
                                            })
                                        } else {
                                            doc.password = hash
                                            doc.save((saveErr, saveDoc) => {
                                                if(saveErr){
                                                    return res.status(200).json({
                                                        error: true,
                                                        message: 'An Unexpected error occured. Please try again later.'
                                                    })
                                                } else {
                                                    // send password reset email here
                                                    sendLoggedInPasswordResetEmail({name: doc.name, email: doc.email}, (mailErr, mailInfo) => {
                                                        if(mailErr){
                                                            return res.status(200).json({
                                                                error: true,
                                                                message: 'An unexpected error occured. Please try again later.',
                                                                error_message: mailErr
                                                            })
                                                        } else {
                                                            return res.status(200).json({
                                                                error: false,
                                                                message: 'Password reset successfully.'
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        } else {
                            return res.status(200).json({
                                error: true,
                                message: 'Old password is incorrect. Please try again.'
                            })
                        }
                    })

                }
            })

        }
    })
})

router.post('/forgotPasswordRequest', (req, res) => {
    if(!req.body.email){
        return res.status(200).json({
            error: true,
            message: 'Email is required.'
        })
    }

    userModel.findOneAndUpdate({email: req.body.email}, {forgotPassword: true}, {new: true}, (err, newDoc) => {
        if(err || !newDoc){
            return res.status(200).json({
                error: true,
                message: 'Invalid email. Please make sure you are entering the correct email address associated with your LCA account.'
            })
        } else {
            // send email function here
            forgotPasswordUserAlert({name:newDoc.name, email:newDoc.email, confirmationCode:newDoc.confirmationCode}, (mailErr, mailInfo) => {
                if(mailErr){
                    return res.status(200).json({
                        error: true,
                        message: 'An unexpected error occured. Please try again later.'
                    })
                } else {
                    return res.status(200).json({
                        error: false,
                        message: "Please check your associated email address for the password reset link."
                    })
                }
            })
        }
    })
})

router.post('/forgotPasswordReset', (req, res) => {
    if(!req.body.confirmationCode || !req.body.email || !req.body.newPass){
        return res.status(200).json({
            error: true,
            message: 'Invalid credentials.'
        })
    }

    userModel.findOne({email: req.body.email, confirmationCode: req.body.confirmationCode, forgotPassword: true}, (err, doc) => {
        if(err || !doc){
            return res.status(200).json({
                error: true,
                message: 'Password reset link has expired or invalid credentials.'
            })
        } else {
            // ============================================
            bcrypt.genSalt(10, (saltErr, salt) => {
                if(saltErr){
                    return res.status(200).json({
                        error: true,
                        message: "An unexpected error occured. Please try again later"
                    })
                } else {
                    bcrypt.hash(req.body.newPass, salt, (hashErr, hash) => {
                        if(hashErr){
                            return res.status(200).json({
                                error: true,
                                message: "An unexpected error occured. Please try again later"
                            })
                        } else {
                            doc.password = hash
                            doc.forgotPassword = false
                            doc.save((saveErr, saveDoc) => {
                                if(saveErr){
                                    // console.log(saveErr)
                                    return res.status(200).json({
                                        error: true,
                                        message: "An unexpected error occurred."
                                    })
                                } else {
                                    return res.status(200).json({
                                        error: false,
                                        message: 'Your password has been reset. Please continue to the login page.'
                                    })
                                }
                            })
                        }
                    })
                }
            })
            // ============================================
        }
    })
})

router.post('/deleteUser', (req, res) => {
    if(!req.body.token){
        return res.status(200).json({
            error: true,
            message: 'Admin token required.'
        })
    }

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
            let userID = req.body.userID

            userModel.findOne({_id: userID}, (err, doc) => {
                if(err || !doc){
                    return res.status(200).json({
                        error: true,
                        message: 'User not found.'
                    })
                } else {
                    if(doc.isEmployee.isTrue){
                        userModel.deleteOne({_id: userID}, (err, user) => {
                            if(err){
                                return res.status(200).json({
                                    error: true,
                                    message: 'An unexpected error occured. Please try again later.'
                                })
                            } else {
                                employeeModel.deleteOne({_id: doc.isEmployee.employeeID}, (err, employee) => {
                                    if(err){
                                        return res.status(200).json({
                                            error: true,
                                            message: 'An unexpected error occured. Please try again later.'
                                        })
                                    } else {
                                        enrollmentModel.deleteMany({userId: userID}, (err, enrollments) => {
                                            if(err){
                                                return res.status(200).json({
                                                    error: true,
                                                    message: 'An unexpected error occured. Please try again later.'
                                                })
                                            } else {
                                                console.log(user, employee, enrollments)
                                                return res.status(200).json({
                                                    error: false,
                                                    message: 'Employee and associated entities removed successfully.'
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    } else {
                        userModel.deleteOne({_id: userID}, (err, doc) => {
                            if(err){
                                return res.status(200).json({
                                    error: true,
                                    message: 'An unexpected error occured. Please try again later.'
                                })
                            } else {
                                enrollmentModel.deleteMany({userId: userID}, (err, doc) => {
                                    if(err){
                                        return res.status(200).json({
                                            error: true,
                                            message: 'An unexpected error occured. Please try again later.'
                                        })
                                    } else {
                                        return res.status(200).json({
                                            error: false,
                                            message: 'User and associated entities removed successfully.'
                                        })
                                    }
                                })
                            }
                        })
                    }
                }
            })
        }
    })
})

module.exports = router