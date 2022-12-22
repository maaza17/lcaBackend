const AWS = require('aws-sdk')

const SES = new AWS.SES({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY,
    region: process.env.AWS_REGION
})

function sendAWSEmail(destEmail, source, html, subject, callback) {
    let params = {
        Destination: { ToAddresses: [destEmail] },
        Message: { /* required */
            Body: { /* required */
                Html: {
                    Charset: "UTF-8",
                    Data: html
                },
                Text: {
                    Charset: "UTF-8",
                    Data: 'Text'
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject
            }
        },
        Source: source, /* required */
        ReplyToAddresses: []  /* required */
    }

    SES.sendEmail(params).promise().then(data => {
        console.log(data)
        return callback({ mailErr: null, mailInfo: "Email sent successfully" })
    }).catch(err => {
        console.log(err)
        return callback({ mailErr: "An unexpected error occurred while sending mail.", mailInfo: null })
    })
}

function getBeautifulDateTime(date) {
    return (
        new Date(date).toLocaleDateString(undefined,
            { weekday: "short", year: "numeric", month: "short", day: "numeric", time: "short", }
        ) +
        " at " +
        new Date(date).toTimeString().slice(0, 8))
}

function test({ email }, callback) {
    var mailOptions = {
        from: '"LCA" <' + process.env.NODEMAILER_USER + '>',
        to: email,
        subject: 'MNP LCA Account Verification',
        html: '<body><h3>Hello </h3><br /><p> Thank you for signing up for LCA.</p></body>'
    }
    return sendAWSEmail(mailOptions.to, mailOptions.from, mailOptions.html, mailOptions.subject, (mailErr, mailInfo) => {
        return callback(mailErr, mailInfo)
    })
}

module.exports = { test }