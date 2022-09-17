const nodemailer = require('nodemailer')

const transport = nodemailer.createTransport({
    host: process.env.NODEMAILER_OUT_SERVER,
    port: process.env.NODEMAILER_SMTP_PORT,
    secure: true,
    tls: {rejectUnauthorized: false},
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS
    }
});

function sendUserRegistrationEmail({name, email, confirmationCode}, callback){
    var mailOptions = {
        from: '"LCA" <' + process.env.NODEMAILER_USER + '>',
        to: email,
        subject: 'MNP LCA Account Verification',
        html: '<body><h3>Hello ' + name + '</h3><br /><p> Thank you for signing up for LCA.</p><br /><p> Lets get started. Please verify your account by following this link :</p><br /><br /><a href="'+process.env.REACT_APP_FRONTEND_URL+'/verify?code=' + confirmationCode + '">Verify Account</a><br /><br /><p>If you have questions, we are here to help. Email us at random@mulphico.com</p><br /><br /><p>Regards,</p><p>Team LCA</p></body>'
    }

    transport.sendMail(mailOptions, (mailErr, mailInfo) => {
        return callback(mailErr, mailInfo)
    })
}

function sendAdminUserRegistrationEmail({name, username, password}, callback){
    var mailOptions = {
        from: '"LCA" <' + process.env.NODEMAILER_USER + '>',
        to: username,
        subject: 'MNP LCA Account Credentials',
        html: '<body><h3>Hello ' + name + '</h3><br /><p> You have been authorised to begin learning on our LCA portal.</p><br /><p> Lets get started. Please find below the credentials to your LCA account :</p><br /><br /><p>Username: '+username+' <p/><br /><p>Password: '+password+' <p/><br /><br /><p>If you have questions, we are here to help. Email us at random@mulphico.com</p><br /><br /><p>Regards,</p><p>Team LCA</p></body>'
    }

    transport.sendMail(mailOptions, (mailErr, mailInfo) => {
        return callback(mailErr, mailInfo)
    })
}

function sendAccountVerificationEmail({name, email}, callback){
    var mailOptions = {
        from: '"LCA" <' + process.env.NODEMAILER_USER + '>',
        to: email,
        subject: 'MNP LCA Account Verified',
        html: '<body><h3>Hello ' + name + '</h3><br /><p> Thank you for verifying your email address with MNP LCA.</p><br /><p> Lets get started.<br /><br />Please wait for an admin to approve your learning account to begin learning.<br /><br />If you have questions, we are here to help. Email us at random@mulphico.com</p><br /><br /><p>Regards,</p><p>Team LCA</p></body>'
    }

    transport.sendMail(mailOptions, (mailErr, mailInfo) => {
        return callback(mailErr, mailInfo)
    })
}

function sendAccountApprovalEmail({name, email}, callback){
    var mailOptions = {
        from: '"LCA" <' + process.env.NODEMAILER_USER + '>',
        to: email,
        subject: 'MNP LCA Account Approved',
        html: '<body><h3>Hello ' + name + '</h3><br /><p> Thank you for your patience.</p><br /><p> Your LCA account has been approved.<br /><br />You can now log in to LCA to begin learning.<br /><br />If you have questions, we are here to help. Email us at random@mulphico.com</p><br /><br /><p>Regards,</p><p>Team LCA</p></body>'
    }

    transport.sendMail(mailOptions, (mailErr, mailInfo) => {
        return callback(mailErr, mailInfo)
    })
}

function sendLoggedInPasswordResetEmail({name, email}, callback){
    var mailOptions = {
        from: '"LCA" <' + process.env.NODEMAILER_USER + '>',
        to: email,
        subject: 'MNP LCA Password Reset',
        html: '<body><h3>Hello ' + name + '</h3><br /><p>Your account password was recently reset.</p><br /><p><br />If this action was not performed by you, or you think this is suspisious, please reset your password again by visiting this <a href="www.google.com">link.<a/><br /><br />If you have questions, we are here to help. Email us at random@mulphico.com</p><br /><br /><p>Regards,</p><p>Team LCA</p></body>'
    }

    transport.sendMail(mailOptions, (mailErr, mailInfo) => {
        return callback(mailErr, mailInfo)
    })
}

module.exports = {sendUserRegistrationEmail, sendAccountVerificationEmail, sendAccountApprovalEmail, sendAdminUserRegistrationEmail, sendLoggedInPasswordResetEmail}