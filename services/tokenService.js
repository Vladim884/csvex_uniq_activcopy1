const jwt = require("jsonwebtoken")
const config = require("config")
const tokenModel = require('../models/Token')

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
        const longtoken = await tokenModel.create({user: userId, refreshToken})
        return longtoken
    }
    

}

module.exports = new TokenService()