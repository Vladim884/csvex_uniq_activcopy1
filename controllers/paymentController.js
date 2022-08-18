const User = require("../models/User")
const _ = require("lodash")
const {
    formatDate, 
    formatNowDate, 
    clg,
    emailOptionsSend,
    getNumberOfDays } = require('../myFunctions/myFunctions')


exports.writePaying = async (req, res) => {
    let {email, sumpay} = req.body
    //==============
    let user = await User.findOne({email})
        if (!user) {
            return res.status(404).json({message: "User not found"})
        }
        clg('user', user)
    console.log(`func-writePaying-user: ${user.nicname}`)
    //==================
    let newsumpay = +sumpay + +user.sumpay
    // clg(`sumpay: ${sumpay}`)
    
    clg(`user.endDay: ${user.endDay}`)
    
    let lastDaysLeft = getNumberOfDays(new Date(), new Date(user.endDay))//??? "+ 1" -because the function getNumberOfDays(start, end) does not include the last date
    const oneDayPay = 100 / 30
    const daysPaying = Math.trunc(sumpay / oneDayPay)
    lastDaysLeft += daysPaying

    const payingDate = new Date().getTime() + 3*60*60*1000
    const payingDayforPeople = formatNowDate()
    
    const endDay = new Date(new Date(user.endDay).getTime() + (daysPaying * 24 * 60 * 60 * 1000)); 
         const endDayForPeople = formatDate(daysPaying)
    const number = ++user.paymentNumber
    user.payments.push({number, date: new Date, sum: sumpay})
        
    let obj1 = {
        payingDate,
        sumpay: newsumpay,
        daysPaying,
        endDay,
        daysLeft: lastDaysLeft
    }
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
}