// const config = require("config")
// const nodemailer = require("nodemailer")

// // exports.emailSender = {
//     exports.transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             type: 'OAuth2',
//             user: config.get('EMAIL'),
//             accessToken: config.get('ACCESSTOKEN'),
//             refreshToken: config.get('REFRESHTOKEN'),
//             clientId: config.get('CLIENTID'),
//             clientSecret: config.get('CLIENTSECRET'),
//             accessUrl: config.get('ACCESSURL')
//         }
//        })
//     // },
       
//        exports.mailOptions = {
//          from: 'vladim.volovenko@gmail.com', // sender address
//          to: 'vladim.volovenko@gmail.com', // list of receivers
//          subject: '',
//          text: ``
//        }
       
//        exports.sandmail = transporter.sendMail(mailOptions, function (err, info) {
//           if(err)
//             console.log(err)
//           else
//             console.log(info);
//             return res.render('./start.hbs')
//     })
