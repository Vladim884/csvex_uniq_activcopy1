const { getUserfromToken } = require("../myFunctions/myFunctions")
const userService = require("./userService")

class AdminService {
    async getUserStatus(res, refreshToken){
        console.log(`AdminService-getUserStatus refreshToken: ${refreshToken}`)
        const refData = await userService.refresh(refreshToken)
        res.cookie('refreshToken', refData.refreshToken, {
            maxAge: 24*30*60*60*1000,
            httpOnly: true
        })
        token = refData.token
        user = await getUserfromToken(token)
        return user.status
    }
}

module.exports = new AdminService()