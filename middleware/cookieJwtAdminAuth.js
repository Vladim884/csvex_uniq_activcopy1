const jwt = require("jsonwebtoken")
const config = require('config')
const User = require("../models/User")
let alert = require('alert')
const userService = require("../services/userService")
const { getUserfromToken } = require("../myFunctions/myFunctions")

exports.cookieJwtAdminAuth = {
   cookAuth: async (req, res, next) => {
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
            console.log('authCoocie')
            req.user = user
            next()
         }
      
         
      } catch (err) {
         console.log(`jwt err: ${err}`)
         res 
            .clearCookie("token")
            .clearCookie("refreshToken")
            .clearCookie("xtext")
            .redirect('/enter')
      }
   },

   adminAuth: async (req, res, next) => {
      try {
         // console.log('middlware-adminauth')
         let token = req.cookies.token
         let refreshToken = req.cookies.refreshToken
         let admin

            if(token){
                admin = await getUserfromToken(token)
            } else {
               if(!refreshToken){
                  return res.status(403).json({"message": "systemContr/upload Ви не авторизувались(!token)"})
               } else {
                  const refData = await userService.refresh(refreshToken)
                  res.cookie('refreshToken', refData.refreshToken, {
                     maxAge: 24*30*60*60*1000,
                     httpOnly: true
                  })
                  token = refData.token
                  admin = await getUserfromToken(token)
            }
         }
         const userRole = admin.status
            // console.log(`userRole: ${userRole}`)
         if(userRole !== 'admin') return res.status(401).render('error', {msg: "Поомилка доступу"})
         next()
      } catch (error) {
         console.log(error)
         next(error)
      }
   }
}


