const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')


router.post('/verify', (req, res) => {
    if(!req.body.token){
        return res.status(200).json({
            error: true,
            verified: false,
            type: null
        })
    } else {
        let token = req.body.token
        jwt.verify(token, process.env.ENCRYPTION_SECRET_ADMIN, (err_admin, decoded_admin) => {
            if(decoded_admin){
                return res.status(200).json({
                    error: false,
                    verified: true,
                    type: 'admin'
                })
            } else if(err_admin){
                jwt.verify(token, process.env.ENCRYPTION_SECRET_USER, (err_user, decoded_user) => {
                    if(decoded_user){
                        return res.status(200).json({
                            error: false,
                            verified: true,
                            type: 'user'
                        })
                    } else {
                        return res.status(200).json({
                            error: true,
                            verified: false,
                            type: null
                        })
                    }
                })        
            }
        })
    }
})
module.exports = router
