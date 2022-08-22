const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
       return next()
    }

    try {
        const data = req.headers
        
        const token = req.headers.authorization.split(' ')[1]
        console.log(`token in auth.middleware: ${token}`)
        if (!token) {
            return res.status(401).json({message: 'token error'})
        }
        const decoded = jwt.verify(token, config.get('secretKey'))
        req.user = decoded
        next()
    } catch (e) {
        console.log(e)
        return res.status(401).json({message: 'Auth errors'})
    }
}
