const User = require("../models/User")
const _ = require("lodash")

// const config = require("config")
// const {formatNowDate} = require('../myFunctions/formatNowDate')
const {
    formatDate, 
    formatNowDate, 
    clg,
    emailOptionsSend } = require('../myFunctions/myFunctions')


exports.writePaying = (req, res) => {
    const {email, sumpay} = req.body
    const oneDayPay = 100 / 30
    const daysPaying = Math.trunc(sumpay / oneDayPay)
    const payingDate = new Date().getTime() + 3*60*60*1000
    const payingDayforPeople = formatNowDate()
    // console.log(`payingDayforPeople: ${payingDayforPeople}`)
    const endDay = new Date(payingDate.getTime() + (daysPaying * 24 * 60 * 60 * 1000)); 
    const endDayForPeople = formatDate(daysPaying)
    // console.log(`endDay: ${endDay}`)
    User.findOne({email}, (err, user) => {
        if(err || !user) {
            return res.status(400).json({message: `Пользователя с email: ${email} не существует`})
        }
    const number = ++user.paymentNumber
    user.payments.push({number, date: new Date, sum: sumpay})
        //console.log(`resPayArr: ${resPayArr}`)
    let obj1 = {
        payingDate,
        sumpay,
        daysPaying,
        endDay
    }
    console.log(obj1)
    user = _.extend(user, obj1)
    user.save((err, result) => {
        if(err){
            return res.status(400).json({message: `Ошибка изменения оплати юзера ${email}`})
        } else {
            emailOptionsSend(
                'ivladim95@gmail.com',
                'Оплата на CSV TO EXCEL.',
                `
                 ${payingDayforPeople} Ви оплатили ${sumpay}грн. та отримали сервіс CSV TO EXCEL 
                 на протязі ${daysPaying} днів до ${endDayForPeople} включно.
                
                 ===============================================
                 Ваши 
                 логин: ${email} 
                 Якщо цей лист потрапив до вас випадково, 
                 видалить його та не звертайте уваги.
                `
            )
            return res.status(200).json({message: `Оплату юзера ${email} змінено`})
        }
    })
    })
    
}