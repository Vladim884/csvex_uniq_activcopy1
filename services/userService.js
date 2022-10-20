const UserDto = require("../dtos/user-dto")
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const config = require("config")
const jwt = require("jsonwebtoken")
const tokenService = require("./tokenService")

class UserService {



    async login(email, password){
        try {
            let user = await User.findOne({email})
            if (!user) {
                return res.status(404).json({message: "User not found"})
            }
            const isPassValid = bcrypt.compareSync(password, user.password)
            if (!isPassValid) {
                return res.status(400).json({message: "Invalid password"})
            }
            const userDto = new UserDto(user)
            const tokens = tokenService.generateTokens({...userDto})
            // const token = jwt.sign({id: user.id, email: user.email, userRole: user.status}, config.get("secretKey"), {expiresIn: "1h"})
            // const refreshToken = jwt.sign({id: user.id, email: user.email}, config.get("JWT_REF_ACTIVATE"), {expiresIn: "30d"})
            await tokenService.saveToken(user.id, tokens.refreshToken)
            return {...tokens, user}
        } catch (error) {
            console.log(error)
        }
            

    }
    async logout(refreshToken){
        const token = await tokenService.removeToken(refreshToken)
        return token
    }
    
    async refresh(refreshToken){
        if(!refreshToken) {
            throw ApiError.UnauthorizadError()
        }
        const userData = tokenService.validateRefreshToken(refreshToken)
        const tokenFromDb = await tokenService.findToken(refreshToken)
        if(!userData || !tokenFromDb){
            throw ApiError.UnauthorizadError()
        }
        const user = User.findById(userData.id)
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userData.id, tokens.refreshToken)
        return {...tokens, user: userDto}
    }
}

module.exports = new UserService()