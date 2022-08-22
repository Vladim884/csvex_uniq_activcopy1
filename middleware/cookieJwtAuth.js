const jwt = require("jsonwebtoken")
const config = require('config')
const User = require("../models/User")
let alert = require('alert')

exports.cookieJwtAuth = (req, res, next) => {
    const token = req.cookies.token
    // console.log(`cookieJwtAuth-cookie-token ${req.cookies.token}`)
   if(!token){
    res
          .clearCookie("exelpath")  
          .clearCookie("randFilePath")  
          .clearCookie("csvpath")  
          .clearCookie("dirpath")  
          .clearCookie("token")
          .clearCookie("cookid")
    // return res.redirect('http://localhost:5000/enter')
    return res.status(403).json({"message": "Ви не авторизувались"})
   }
   
   try {
    
       //the important part
       const user = jwt.verify(token, config.get('secretKey'))
       req.user = user
    //    console.log(`user-jwt: ${user.email}`)
       next()
   } catch (err) {
       console.log(`err: ${err}`)
    //    res.clearCookie('token')
       alert('Время сессии истекло, пожалуйста, выполните вход')
       res.clearCookie('cookid')
       res.clearCookie('token')
       res.clearCookie('dirpath')
       res.clearCookie('randFilePath')
       res.redirect('http://localhost:5000/enter')
            // .clearCookie('cookid')
   }
}


