const UserDto = require("../dtos/user-dto")
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const config = require("config")
const jwt = require("jsonwebtoken")
const tokenService = require("./tokenService")
const moment = require("moment")

class UserService {
    async login(email, password, req, res, next){
        try {
            let user = await User.findOne({email})
            if (!user) {
                return res.status(404).render('error', {msg: "Користувача не знайдено"})
            }
            const isPassValid = bcrypt.compareSync(password, user.password)
            if (!isPassValid) {
                // return res.status(400).json({message: "Invalid password"})
                return res.status(400).render('error', {msg: "Невірний пароль"})
            }
            const userDto = new UserDto(user)
            const tokens = tokenService.generateTokens({...userDto})
            // console.log(`UserService-login-refreshToken ${tokens.refreshToken}`)
            await tokenService.saveToken(user.id, tokens.refreshToken)
            return {...tokens, user}
        } catch (error) {
            console.log(error)
            return res.status(400).render('error', {msg: "Помилка"})
        }
            

    }
    async logout(refreshToken){
        // console.log(`UserService-logout-refreshToken: ${refreshToken}`)
        const token = await tokenService.removeToken(refreshToken)
        return token
    }
    
    async refresh(refreshToken){
        if(!refreshToken) {
            console.log('UserService/refresh(refreshToken): !refreshToken')
            // return 
        }
        const userData = tokenService.validateRefreshToken(refreshToken)
        // const userData = jwt.verify(refreshToken, config.get('JWT_REF_ACTIVATE'))
        // console.log(`UserService-refresh-userData: ${Object.values(userData)}`)
        const tokenFromDb = await tokenService.findToken(refreshToken)
        if(!userData || !tokenFromDb){
            console.log('UserService/refresh(refreshToken): !userData || !tokenFromDb')
        }
        const user = await User.findById({_id: userData.id})

        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userData.id, tokens.refreshToken)
        return {...tokens, user: userDto}

    }

    async getCabinetFields(user){
        // console.log(user)
        return {
            nicname: user.nicname,
            email: user.email,
            registrDate: moment(user.registrDate).format('DD.MM.YYYY'),
            role: user.status,
            // tegService: `Активовано на ${user.finData[0].daysLeft} дні`,
            tegService: '${user.finData[0].daysLeft} дні',
            // balance: user.finData[0].balance,
            balance: 'user.finData[0].balance',
            // lastPaymentCab: lastPaymentCab,
            lastPaymentCab: 'lastPaymentCab',
            linkHistory: 'Перейти',
            linkPay: 'Сплатити'
        }
    }
}

module.exports = new UserService()