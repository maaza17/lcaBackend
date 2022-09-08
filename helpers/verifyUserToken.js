const jwt = require("jsonwebtoken")

function verifyUserToken(token, callback) {
    jwt.verify(token, process.env.ENCRYPTION_SECRET, (err, decoded) => {
        if (err) {
            // console.log(err)
            return callback({
                isValid: false,
                user_id: null,
                name: null,
                isEmployee: null
            });
        } else if (decoded) {
            return callback({
                isValid: true,
                user_id: decoded.userID,
                name: decoded.name,
                isEmployee: decoded.isEmployee
            })
        } else {
            return callback({
                isValid: false,
                user_id: null,
                name: null,
                isEmployee: null
            });
        }
    })
}

module.exports = verifyUserToken