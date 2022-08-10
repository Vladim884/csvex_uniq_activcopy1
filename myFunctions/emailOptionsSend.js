const {transporter} = require('./transporter')
const config = require("config")

exports.emailOptionsSend = (userEmail, subjectText='', emailText='', htmltext=``) => {
    const mailOptions = {
        from: config.get('EMAIL'), // sender address
        to: userEmail, // list of receivers
        subject: subjectText,
        text: emailText,
        html: htmltext
    }
    try {
    transporter.sendMail(mailOptions, function (err, info) {
        if(err)
            console.log(err)
        else
            console.log(info)
        })
    } catch (error) {
        console.log(error)
    }
}
