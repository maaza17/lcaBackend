const jwt = require("jsonwebtoken")

function verifyUserToken(token, callback) {
    jwt.verify(token, process.env.ENCRYPTION_SECRET_USER, (err, decoded) => {
        if (err) {
            // console.log('err block')
            return callback({
                isValid: false,
                user_id: null,
                name: null,
                isEmployee: null
            });
        } else if (decoded) {
            // console.log('decoded block')
            return callback({
                isValid: true,
                user_id: decoded.userID,
                name: decoded.name,
                isEmployee: decoded.isEmployee,
                occupation: decoded.occupation,
                email: decoded.email
            })
        } else {
            // console.log('null block')
            return callback({
                isValid: false,
                user_id: null,
                name: null,
                isEmployee: null,
                occupation: null,
                email: null
            });
        }
    })
}

module.exports = verifyUserToken