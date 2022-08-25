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
        html: '<body><h3>Hello ' + name + '</h3><br /><p> Thank you for signing up for LCA.</p><br /><p> Lets get started. Please verify your account by following this link :</p><br /><br /><a href="https://www.google.com/verify?code=' + confirmationCode + '">Verify Account</a><br /><br /><p>If you have questions, we are here to help. Email us at random@mulphico.com</p><br /><br /><p>Regards,</p><p>Team LCA</p></body>'
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

module.exports = {sendUserRegistrationEmail, sendAccountVerificationEmail, sendAccountApprovalEmail}