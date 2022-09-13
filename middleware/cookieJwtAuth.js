const jwt = require("jsonwebtoken")
const config = require('config')
const User = require("../models/User")
let alert = require('alert')

exports.cookieJwtAuth = (req, res, next) => {
   try {
    const token = req.cookies.token
    
    // console.log(`cookieJwtAuth-cookie-token ${req.cookies.token}`)
   if(!token){
    res 
      .clearCookie("token")
      .clearCookie("user")
      .clearCookie("admin")
      next(err)
    // return res.redirect('http://localhost:5000/enter')
    return res.status(403).json({"message": "Ви не авторизувались"})
   }
   
   
    
       //the important part
       const user = jwt.verify(token, config.get('secretKey'))
       req.user = user
    //    console.log(`user-jwt: ${user.email}`)
    next()
   } catch (err) {
      
       console.log(`err: ${err}`)
    //    res.clearCookie('token')
       alert('Время сессии истекло, пожалуйста, выполните вход')
       res 
         .clearCookie("token")
         .clearCookie("user")
         .clearCookie("admin")
         // .redirect('http://localhost:5000/enter')
         .redirect('/enter')
   }
}


