const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const config = require("config")
const alert = require('alert')



exports.formatDate = (sum) => {
    // payingDay = new Date()
    const date = new Date(new Date().getTime() + (sum * 24 * 60 * 60 * 1000) + 3*60*60*1000)
    // console.log(`date: ${date}`)
      let dd = date.getDate()
      if (dd < 10) dd = '0' + dd
    
      let mm = date.getMonth() + 1
      if (mm < 10) mm = '0' + mm
    
      let yy = date.getFullYear() % 100
      if (yy < 10) yy = '0' + yy
    
      return dd + '.' + mm + '.' + yy
}

exports.formatNowDate = () => {
    const date = new Date().getTime()
    console.log(`date: ${date}`)
    let dd = date.getDate()
    console.log(`dd: ${dd}`)
    if (dd < 10) dd = '0' + dd

    let mm = date.getMonth() + 1
    if (mm < 10) mm = '0' + mm

    let yy = date.getFullYear() % 100
    if (yy < 10) yy = '0' + yy

    return dd + '.' + mm + '.' + yy
}

exports.clg = (name, variable) => {
    console.log(`${name}: ${variable}`)
}

const transporter = nodemailer.createTransport({
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

exports.noteServiceEnd = (days) => {
    if (days < 9 && days > 0) {
        alert(`Оплата закінчується. До кінця дії сервісу генератора тегів лишилось ${days} дні`)
    }
}

exports.getNumberOfDays = (start, end) => { 
    const date1 = new Date(start); 
    const date2 = new Date(end); 
    
    // One day in milliseconds 
    const oneDay = 1000 * 60 * 60 * 24; 
    
    // Calculating the time difference between two dates 
    const diffInTime = date2.getTime() - date1.getTime(); 
    
    // Calculating the no. of days between two dates 
    const diffInDays = Math.round(diffInTime / oneDay); 
    
    return diffInDays; 
} 
    
// console.log(getNumberOfDays("2/1/2021", "3/1/2021"))

exports.getUserfromToken = (token) => {
    const datatoken = jwt.verify(token, config.get('secretKey'))
    let email = datatoken.email
    let user = User.findOne({email})
    if (!user) {
        return res.status(404).json({message: "User not found"})
    }
    return user
}

