const jwt = require("jsonwebtoken")
const config = require('config')
const User = require("../models/User")
let alert = require('alert')
const userService = require("../services/userService")

exports.cookieJwtAuth = async (req, res, next) => {
   try {
    const token = req.cookies.token
   if(!token){
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
   res 
      .clearCookie("token")
      .clearCookie("refreshToken")
      .clearCookie("xtext")
      // next(err)
        return res.status(403).render('msg', {msg: "Ви не авторизовані"})
      
    } else {
      const user = jwt.verify(refreshToken, config.get('JWT_REF_ACTIVATE'))
      req.user = user
      next()
    }
    

   
   } else {
      //the important part
      const user = jwt.verify(token, config.get('JWT_ACC_ACTIVATE'))
      req.user = user
      next()
   }
   
       
   } catch (err) {
       console.log(`jsonwebtoken err: ${err}`)
    //    res.clearCookie('token')
      //  alert('Время сессии истекло, пожалуйста, выполните вход')
      // next(err)
       res 
         .clearCookie("token")
         .clearCookie("refreshToken")
         .clearCookie("xtext")
         .redirect('/enter')
   }
}


