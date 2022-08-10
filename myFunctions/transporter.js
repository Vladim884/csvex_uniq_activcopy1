const nodemailer = require("nodemailer")
const config = require("config")

exports.transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: config.get('EMAIL'),
        accessToken: config.get('ACCESSTOKEN'),
        refreshToken: config.get('REFRESHTOKEN'),
        clientId: config.get('CLIENTID'),
        clientSecret: config.get('CLIENTSECRET'),
        accessUrl: config.get('ACCESSURL')
    }
})
