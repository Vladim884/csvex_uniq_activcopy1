const UserDto = require("../dtos/user-dto")
const User = require("../models/User")
const tokenService = require("./tokenService")

class UserService {
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