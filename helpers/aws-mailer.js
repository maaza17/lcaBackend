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

function sendAWSMultipleEmail(destEmails, source, html, subject, callback) {
    let params = {
        Destination: { BccAddresses: [destEmails] },
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

// function test({ email }, callback) {
//     var mailOptions = {
//         from: '"LCA" <' + process.env.NODEMAILER_USER + '>',
//         to: email,
//         subject: 'MNP LCA Account Verification',
//         html: '<body><h3>Hello </h3><br /><p> Thank you for signing up for LCA.</p></body>'
//     }
//     return sendAWSEmail(mailOptions.to, mailOptions.from, mailOptions.html, mailOptions.subject, (mailErr, mailInfo) => {
//         return callback(mailErr, mailInfo)
//     })
// }

function managerNominationEmail({ emails, training, manager, name }, callback) {
    var mailOptions = {
        from: '"LCA" <' + process.env.NODEMAILER_USER + '>',
        to: emails,
        subject: 'MNP LCA Confirmation for Training Nomination by ' + manager,
        html: '<body><h3>Hello ' + name + '</h3><br /><p>Your were nominated by your manager, ' + manager + ' to Training : ' + training.name + '.</p><br /><p>Following are the details for your training : </p><br /><p>Start : ' + getBeautifulDateTime(training.startDate) + '</p><br /><p>End : ' + getBeautifulDateTime(training.endDate) + '</p><br /><p>Location : ' + training.location + '</p><br /><p>Hoping for you to have fun and learn new things in this session!</p><br />If you have questions, we are here to help. Email us at random@mulphico.com</p><br /><br /><p>Regards,</p><p>Team LCA</p></body>'
    }

    return sendAWSMultipleEmail(mailOptions.to, mailOptions.from, mailOptions.html, mailOptions.subject, (mailErr, mailInfo) => {
        return callback(mailErr, mailInfo)
    })
}

module.exports = { managerNominationEmail }