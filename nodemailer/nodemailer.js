const nodemailer = require('nodemailer')
const config = require('config')

const transporter = nodemailer.createTransport(
  {
    pool: true,
    service: 'Gmail',  
    auth: {
        type: 'OAuth2',
        user: config.get('EMAIL'),
        accessToken: config.get('ACCESSTOKEN'),
        expires: 1664907671439 + 60000,
        refreshToken: config.get('REFRESHTOKEN'),
        clientId: '631769748026-3pnknff7fivb6n3s61f4944ffob42hrj.apps.googleusercontent.com',
        clientSecret: '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',
        }
  },
  {
    from: `Mailer Test <${process.env.EMAIL}>`
  }
)
// accessToken: 'ya29.a0Aa4xrXMMMjPRevDE7Uby_xq47OlK5p_TVpQYW0DFblkPBCs6h7a2nA4m0q8xFWQ4ZgdWdvj1t3_UqCHrPKFvRtsoLXSso3AZrBj2GJ4EpHuEQru-smC9pc9QkPNqc5B6suDv62VfTFZbkJWDrBYcTmGChcQLaCgYKATASARISFQEjDvL9EfQd4Uz3wJBWiLpaS9Z6Gg0163',
// expires: 1664907671439 + 60000,

// accessUrl: 'https://oauth2.googleapis.com/token'
        
transporter.verify((error, success) => {
  if (error) return console.log(`transporter.verify err: ${error}`)
  console.log('Server is ready to take our messages: ', success)
  transporter.on('token', token => {
    console.log('A new access token was generated')
    console.log('User: %s', token.user)
    console.log('Access Token: %s', token.accessToken)
    console.log('Expires: %s', new Date(token.expires))
  })
})

const mailer = message => {
  transporter.sendMail(message, (err, info) => {
    if (err) return console.log(`transporter.sendMail err: {err}`)
    // console.log('Email sent: ', info)
  })
}

module.exports = mailer
