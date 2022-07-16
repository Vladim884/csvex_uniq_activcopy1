const User = require("../models/User")
const bcrypt = require("bcryptjs")
const _ = require("lodash")
const jwt = require("jsonwebtoken")
const config = require("config")
const nodemailer = require("nodemailer")
const {check, validationResult} = require("express-validator")

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

exports.signup = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({message: "Uncorrect request", errors})
        }
        if (!req.body.flag) {
            return res.render('./message.hbs')
        }
        console.log(req.body)
        const {email, password} = req.body
        const candidate = await User.findOne({email})
        if(candidate) {
            return res.status(400).json({message: `Пользователь с email: ${email} уже существует`})
        }
        if (!req.body.flag) {
            return res.status(400).json({message: `Для регистрации неоходимо согласие с правилами и договором`})
        }
        const token = jwt.sign({email, password}, config.get('JWT_ACC_ACTIVATE'), {expiresIn: 60 * 60})
        const mailOptions = {
            from: config.get('EMAIL'), // sender address
             to: 'ivladim95@gmail.com', // list of receivers
            subject: 'ACTIVATE YOUR ACCOUNT',
            html: `
                <h4>Кликните на ссылку для активации Вашего аккаунта</h4>
                <p>${config.get('CLIENT_URL')}/api/auth/activate?token=${token}</p>
                `
        }
        transporter.sendMail(mailOptions, function (err, info) {
            if(err) console.log(err)
            console.log(info);
            return res.json({message: `Вам отправлено письмо активации на ${email}, активируйте свой аккаунт.`})
        })

    } catch(err) {
        console.log(err)
    }
}
    
exports.activateAccount = async (req, res) => {
    const token = req.body.name
    if (token) {
        const {email, password} = jwt.verify(token, config.get('JWT_ACC_ACTIVATE'))
        console.log(email)
        console.log(password)
    try {
        const hashPassword = await bcrypt.hash(password, 8)
        const user = new User({email, password: hashPassword})
        await user.save()

        // const transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         type: 'OAuth2',
        //         user: config.get('EMAIL'),
        //         accessToken: config.get('ACCESSTOKEN'),
        //         refreshToken: config.get('REFRESHTOKEN'),
        //         clientId: config.get('CLIENTID'),
        //         clientSecret: config.get('CLIENTSECRET'),
        //         accessUrl: config.get('ACCESSURL')
        //     }
        //    });
           
           const mailOptions = {
             from: config.get('EMAIL'), // sender address
             to: 'ivladim95@gmail.com', // list of receivers
             subject: 'Регистрация на CSV-UNIQ.',
             text: `
             Спасибо, что Вы зарегистрировались на CSV-UNIQ!
             ===============================================
             Ваши 
             логин: ${email} 
             пароль: ${password}
             Сохраните эти данные в надёжном месте 
             и удалите это сообщение.
             `
           }
           
           transporter.sendMail(mailOptions, function (err, info) {
              if(err)
                console.log(err)
              else
                console.log(info);
                return res.render('./start.hbs')
        })
    } catch(err) {
        console.log(err)
        res.json({error: 'Что-то пошло не так!'})
    }
}}

exports.forgotPassword = (req, res) => {
    const {email} = req.body
    const user = User.findOne({email}, (err, user) => {
        if(err || !user) {
            return res.status(400).json({message: `Пользователя с email: ${email} не существует`})
        }
    })
    const token = jwt.sign({_id: user._id, email}, config.get('RESET_PASSWORD_KEY'), {expiresIn: '20m'})
    const mailOptions = {
        from: config.get('EMAIL'), // sender address
         to: 'ivladim95@gmail.com', // list of receivers
        subject: 'RESET YOUR PASSWORD',
        html: `
            <h4>Кликните на ссылку для сброса Вашего пароля</h4>
            <p>${config.get('CLIENT_URL')}/resetpass?resetlink=${token}</p>
            `
    }
    return user.updateOne({resetLink: token}, (err, succces) => {
        if(err){
            return res.status(400).json({message: `Ошибка ссылки сброса пароля`})
        } else {
            transporter.sendMail(mailOptions, function (err, info) {
                if(err) console.log(err)
                console.log(info);
                return res.json({message: `Вам отправлена ссылка сброса пароля на ${email}.`})
            })
        }
    })
}

exports.resetPassword = (req, res) => {
    const {resetLink, newPass} = req.body
    if (resetLink) {
        jwt.verify(resetLink, config.get('RESET_PASSWORD_KEY'), (err, decodeData) => {
            if (err) {
                res.status(401).json({message: 'Некорректная или устаревшая ссылка сброса пароля'})
            }
            User.findOne({resetLink}, async (err, user) => {
                if(err || !user) {
                    return res.status(400).json({message: `Пользователя с таким токеном не существует`})
                }
                const hashPassword = await bcrypt.hash(newPass, 8)
                const obj = {
                    password: hashPassword
                }
                user = _.extend(user, obj)
                user.save((err, result) => {
                    if(err){
                        return res.status(400).json({message: `Ошибка сброса пароля`})
                    } else {
                        return res.status(200).json({message: `Пароль был изменен`})
                    }
                })
            })
        })
        
    } else {
        res.status(401).json({message: 'Ошибка аутентификации!!!'})
    }
}