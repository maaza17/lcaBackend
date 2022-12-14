const jwt = require("jsonwebtoken")

function verifyAdminToken(token, callback) {
    jwt.verify(token, process.env.ENCRYPTION_SECRET_ADMIN, (err, decoded) => {
        if (err) {
            // console.log(err)
            return callback({
                isAdmin: false,
                err: err,
                message: err.message,
            });
        } else if (decoded) {
            return callback({
                isAdmin: true,
                id: decoded.id,
                name: decoded.name
            })
        } else {
            return callback(null);
        }
    })
}

module.exports = verifyAdminToken