const User = require("../models/User")
const _ = require("lodash")
const jwt = require("jsonwebtoken")
const config = require("config")

const {
    formatDate, 
    formatNowDate, 
    clg,
    emailOptionsSend,
    getNumberOfDays, 
    getUserfromToken,
    decryptToken} = require('../myFunctions/myFunctions')



exports.writePaying = async (req, res) => {
    const xtext = req.cookies.xtext
    const token = decryptToken(xtext, config.get('secretKeyForToken1'))
    if(!token){
        return res.status(403).json({"message": "Ви не авторизувались"})
    }
    const datatoken = jwt.verify(token, config.get('secretKey'))
    let userRole = datatoken.userRole
    if(userRole !== 'admin') return res.render('msg', {msg: 'У Вас не має права доступу!'})
    let {email, sumpay} = req.body
    let user = await User.findOne({email})
        if (!user) {
            return res.status(404).json({message: "User not found"})
        }
    //==================
    let number = ++user.paymentNumber
    user.paymentNumber = number
    user.payments.push({number, date: new Date, sum: sumpay})
    //==================
    let lastPayment = user.payments[user.payments.length - 1]
    //=================================
    let daysPaying = lastPayment.sum / (100/30)
    // console.log(daysPaying)
    //=====================
    // console.log(lastPayment.date)
    // console.log(user.endDay)
    let datesDifferent = getNumberOfDays(lastPayment.date, user.endDay)
    // console.log(`datesDifferent: ${datesDifferent}`)
    // let lastPaymentDate = lastPayment.date
    let sumdays = datesDifferent + daysPaying
    let D = new Date(lastPayment.date)
    
    //paymentDateEnd:
    //datsLeftActiveServise
    if(datesDifferent > 0) {
        user.endDay = D.setDate(D.getDate() + sumdays)
        user.daysLeft = datesDifferent + daysPaying
        clg(`3 lastPayment.date: ${lastPayment.date}`)
    } else {
        user.endDay = D.setDate(D.getDate() + daysPaying)
        user.daysLeft = daysPaying
    }
    // console.log(`user.endDay: ${user.endDay}`)
    // console.log(`user.daysLeft: ${user.daysLeft}`)

    //========================

    user.sumpay = +user.sumpay + +lastPayment.sum
    // console.log(`user.sumpay: ${user.sumpay}`)
    //===========================
    user.balance = user.daysLeft * 100 / 30
    // console.log(`user.balance: ${user.balance}`)
        
    let obj1 = {
        payingDate: lastPayment.date,
        daysPaying,
    }
    user = _.extend(user, obj1)
    user.save((err, result) => {
        if(err){
            return res.status(400).render('msg', {msg: `Ошибка изменения оплати юзера ${email}`})
        } else {
            console.log(`7 lastPayment.date: ${lastPayment.date}`)
            let payingDateForPeople = formatNowDate(lastPayment.date)
            emailOptionsSend(
                'ivladim95@gmail.com',
                'Оплата на CSV TO EXCEL.',
                `${user.nicname}, Вас вітає команда CSV TO EXCEL!
                Дякуємо, що Ви обрали наш сервіс!
                 ${payingDateForPeople} Ви оплатили ${sumpay}грн. та отримали активацію сервісу CSV TO EXCEL 
                 на ${daysPaying} днів.
                 ===============================================
                 Якщо цей лист потрапив до вас випадково, 
                 видалить його та не звертайте уваги.
                `
            )
            // return res.status(200).json({message: `Оплату юзера ${email} змінено`})
            return res.status(200).render('msg', {msg: `Оплату юзера ${email} успішно змінено`})
        }
    })
}