const jwt = require("jsonwebtoken")
const config = require('config')
const User = require("../models/User")
let alert = require('alert')
const userService = require("../services/userService")
// const { lte } = require("lodash")

exports.cookieJwtAuth = async (req, res, next) => {
   try {
    const token = req.cookies.token
    // const token = ''
    
    // console.log(`cookieJwtAuth-cookie-token ${req.cookies.token}`)
   if(!token){

    // res.clearCookie('token')
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
   res 
      .clearCookie("token")
      .clearCookie("refreshToken")
      .clearCookie("xtext")
      // next(err)
        return res.status(403).render('msg', {msg: "Ви не авторизовані"})
      
    } else {
      // res.clearCookie('refreshToken')
      // res.clearCookie('xtext')
      // res.clearCookie('token')
      // const refreshData = jwt.verify(refreshToken, config.get('JWT_REF_ACTIVATE'))
      // console.log(refreshData)
      // const id = refreshData.id
      //===
      // const tokens = await userService.refresh(refreshToken)
      // const token = tokens.token
      // console.log(`jwt-middl-token: ${token}`)
      //===
      
    //   res.cookie('token', token, {
    //     maxAge: 5000,
    //     httpOnly: true
    // })
    // res.cookie('refreshToken', tokens.refreshToken, {
    //     maxAge: 300000,
    //     httpOnly: true
    // })
    // console.log(`middlware-refreshToken: ${refreshToken}`)
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


