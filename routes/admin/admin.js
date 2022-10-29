const router = require('express').Router()
const mongoose = require('mongoose')
const adminModel = require('../../models/admin/Admin')
const verifyAdminToken = require('../../helpers/verifyAdminToken')
const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs')
const { sendUserRegistrationEmail, sendAccountVerificationEmail, sendAccountApprovalEmail, sendAdminUserRegistrationEmail, sendLoggedInPasswordResetEmail, forgotPasswordUserAlert, forgotPasswordAdminAlert } = require('../../helpers/nodemailer')
const { validateAdminLoginInput, validateAdminRegisterInput } = require('../../validation/adminAuthValidation')
const getConfirmationCode = require('../../helpers/getConfirmationCode')

router.post('/loginAdmin', (req, res) => {
    let email = req.body.email
    let password = req.body.password

    const { errors, isValid } = validateAdminLoginInput({ email, password });

    // Check validation
    console.log('input validation')
    if (!isValid) {
        return res.status(200).json({
            error: true,
            error_message: errors,
            message: "Please enter a valid email ID and password"
        });
    }

    adminModel.findOne({ email: email }, (err, admin) => {
        if (err) {
            return res.status(200).json({
                error: true,
                message: "An unexpected error occured. Please try again"
            })
        } else if (admin) {
            // compare passwords and token generation here
            bcrypt.compare(password, admin.password).then((isMatch) => {
                if (isMatch) {
                    console.log('admin password match')
                    const payload = {
                        id: admin._id,
                        email: admin.email,
                        name: admin.name
                    }

                    // sign Token 
                    jwt.sign(payload, process.env.ENCRYPTION_SECRET_ADMIN, { expiresIn: 86400 }, (signErr, adminToken) => {
                        if (signErr) {
                            console.log('admin token sign error')
                            console.log(signErr)
                            return res.status.json({
                                error: true,
                                message: "An unexpected error occured. Please try again"
                            })
                        } else {
                            console.log('admin login success')
                            return res.status(200).json({
                                error: false,
                                token: adminToken,
                                userType: "Admin",
                                admin: { _id: admin._id, name: admin.name, email: admin.email }
                            });
                        }
                    })
                } else {
                    return res.status(200).json({
                        error: true,
                        message: "Incorrect password. Please retry."
                    })
                }
            })
        } else {
            return res.status(200).json({
                error: true,
                message: 'Admin does not exist. Please recheck your credentials'
            })
        }
    })
})


router.post('/registerAdmin', (req, res) => {
    let name = req.body.name
    let email = req.body.email
    let password = req.body.password

    const { errors, isValid } = validateAdminRegisterInput({ name, email, password })

    // Check validation
    console.log('input validation')
    if (!isValid) {
        return res.status(200).json({
            error: true,
            error_message: errors,
            message: "Input validation failed. Check error messages."
        })
    }

    let newAdmin = new adminModel({
        name: name,
        email: email,
        password: password,
        confirmationCode: getConfirmationCode()
    })

    bcrypt.genSalt(10, (err, salt) => {
        // console.log('gen salt error')
        bcrypt.hash(newAdmin.password, salt, (err, hash) => {
            // console.log(err, "hashing error")
            newAdmin.password = hash
            newAdmin.save()
                .then((doc) => {
                    return res.status(200).json({
                        error: false,
                        message: "Admin successfully registered",
                        data: doc
                    })
                })
                .catch((err) => {
                    return res.status(200).json({
                        error: true,
                        message: err.message
                    })
                })
        })
    })

})

router.post('/resetAdminPasswordLoggedIn', (req, res) => {
    if (!req.body.token) {
        return res.status(200).json({
            error: true,
            message: 'Admin token is required to proceed.'
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


            if (!req.body.oldPass) {
                return res.status(200).json({
                    error: true,
                    message: 'Old password is required.'
                })
            }
            if (!req.body.newPass) {
                return res.status(200).json({
                    error: true,
                    message: 'New password is required.'
                })
            }
            adminModel.findOne({ _id: item.id }, (err, doc) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        message: 'An Unexpected error occured. Please try again later.'
                    })
                } else if (!doc) {
                    return res.status(200).json({
                        error: true,
                        message: 'Invalid admin. Can not reset password.'
                    })
                } else {
                    // =====================

                    bcrypt.compare(req.body.oldPass, doc.password).catch((passErr) => {
                        if (passErr) {
                            return res.status(200).json({
                                error: true,
                                message: 'An unexpected error ocurred. Please try again later.'
                            })
                        }
                    })
                        .then((isMatch) => {
                            if (isMatch) {
                                bcrypt.genSalt(10, (saltErr, salt) => {
                                    if (saltErr) {
                                        return res.status(200).json({
                                            error: true,
                                            message: 'Unexpected error during new system-generated password creation. Please try again later.'
                                        })
                                    } else {
                                        bcrypt.hash(req.body.newPass, salt, (hashErr, hash) => {
                                            if (hashErr) {
                                                return res.status(200).json({
                                                    error: true,
                                                    message: 'Unexpected error during new system-generated password creation. Please try again later.'
                                                })
                                            } else {
                                                doc.password = hash
                                                doc.save((saveErr, saveDoc) => {
                                                    if (saveErr) {
                                                        return res.status(200).json({
                                                            error: true,
                                                            message: 'An Unexpected error occured. Please try again later.'
                                                        })
                                                    } else {
                                                        // send password reset email here
                                                        sendLoggedInPasswordResetEmail({ name: doc.name, email: doc.email }, (mailErr, mailInfo) => {
                                                            if (mailErr) {
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
                    // =====================
                }
            })

        }
    })
})

router.post('/forgotPasswordRequest', (req, res) => {
    if (!req.body.email) {
        return res.status(200).json({
            error: true,
            message: 'Email is required.'
        })
    }

    adminModel.findOneAndUpdate({ email: req.body.email }, { forgotPassword: true }, { new: true }, (err, newDoc) => {
        if (err || !newDoc) {
            return res.status(200).json({
                error: true,
                message: 'Invalid email. Please make sure you are entering the correct email address associated with your LCA account.'
            })
        } else {
            // send email function here
            forgotPasswordAdminAlert({ name: newDoc.name, email: newDoc.email, confirmationCode: newDoc.confirmationCode }, (mailErr, mailInfo) => {
                if (mailErr) {
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
    if (!req.body.confirmationCode || !req.body.email || !req.body.newPass) {
        return res.status(200).json({
            error: true,
            message: 'Invalid credentials.'
        })
    }

    adminModel.findOne({ email: req.body.email, confirmationCode: req.body.confirmationCode }, (err, doc) => {
        if (err) {
            return res.status(200).json({
                error: true,
                message: 'An unexpected error occured retrieving your details. Please try again.'
            })
        } else if (!doc) {
            return res.status(200).json({
                error: true,
                message: 'We could not find a user with this email and reset link. Please issue another reset request.'
            })
        } else {
            if ((doc.forgotPassword === false)) {
                return res.status(200).json({
                    error: true,
                    message: 'Your reset link has expired. Please issue another one.'
                })
            } else {
                // ============================================
                bcrypt.genSalt(10, (saltErr, salt) => {
                    if (saltErr) {
                        return res.status(200).json({
                            error: true,
                            message: "An unexpected error occured processing your request. Please try again later"
                        })
                    } else {
                        bcrypt.hash(req.body.newPass, salt, (hashErr, hash) => {
                            if (hashErr) {
                                return res.status(200).json({
                                    error: true,
                                    message: "An unexpected error occured in the server. Please try again later"
                                })
                            } else {
                                doc.password = hash
                                doc.forgotPassword = false
                                doc.save((saveErr, saveDoc) => {
                                    if (saveErr) {
                                        // console.log(saveErr)
                                        return res.status(200).json({
                                            error: true,
                                            message: "An unexpected error occurred while saving your data. Please try again"
                                        })
                                    } else {
                                        return res.status(200).json({
                                            error: false,
                                            message: 'Your password has been reset successfully.'
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
            // ============================================
        }
    })
})


module.exports = router