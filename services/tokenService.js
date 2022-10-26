const jwt = require("jsonwebtoken")
const config = require("config")
const tokenModel = require('../models/Token')
const Token = require("../models/Token")


class TokenService {
    generateTokens(payload) {
        
        const token = jwt.sign(payload, config.get('JWT_ACC_ACTIVATE'), {expiresIn: '15m'})
        const refreshToken = jwt.sign(payload, config.get('JWT_REF_ACTIVATE'), {expiresIn: '30d'})
        return {
            token,
            refreshToken
        }
    }

    async saveToken (userId, refreshToken){
        const tokenData = await tokenModel.findOne({user: userId})
        if(tokenData){
            tokenData.refreshToken = refreshToken
            return tokenData.save()
        }
        const token = await tokenModel.create({user: userId, refreshToken})
        return token
    }

    async validateAccessToken(token){
        try {
            const userData = jwt.verify(token, config.get('JWT_ACC_ACTIVATE'))
            return userData
        } catch (error) {
            return null
        }
    }
    validateRefreshToken(refreshToken){
        console.log(refreshToken)
        try {
            const userData = jwt.verify(refreshToken, config.get('JWT_REF_ACTIVATE'))
            console.log(`validateRefreshToken-userData: ${userData}`)
            return userData
        } catch (error) {
            return null
        }
    }

    async removeToken(refreshToken){
        const userData = jwt.verify(refreshToken, config.get('JWT_REF_ACTIVATE'))
        const tokenData = await Token.deleteOne({user: userData.id})
        return tokenData
    }

    async findToken(refreshToken){
        const tokenData = await Token.findOne({refreshToken})
        return tokenData
    }
    

}

module.exports = new TokenService()