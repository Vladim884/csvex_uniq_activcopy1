const Router = require("express")
// const express = require("express")
const _ = require("lodash")
// const json2csv = require("json2csv")
// const extfs = require('extfs')
// const convertCsvToXlsx = require('@aternus/csv-to-xlsx')
// const rimraf = require('rimraf')
// const csv = require('csv-parser')
// const alert = require('alert')
const User = require("../models/User")
// const bcrypt = require("bcryptjs")
// const config = require("config")
// const fs = require('fs')
// const path = require('path')


const jwt = require("jsonwebtoken")
const {check, validationResult} = require("express-validator")
const router = new Router()
// const authMiddleware = require('../middleware/auth.middleware')
const {cookieJwtAuth} = require('../middleware/cookieJwtAuth')
// const {filePathDeleter} = require('../myFunctions/filePathDeleter')
// const {deleteFolder} = require('../myFunctions/myFunctions')
// const {moveFile} = require('../myFunctions/moveFile')
// const {getUserfromToken} = require('../myFunctions/myFunctions')
const {writePaying} = require('../controllers/paymentController')
const { 
        signup, 
        activateAccount, 
        forgotPassword, 
        resetPassword,
        sendEndPay,
        getTokenUserData, 
        getAccessToStart,
        continueWork,
        logout,
        login} = require("../controllers/authController");
// const {createDir} = require('../myFunctions/myFunctions');
// const {clg, noteServiceEnd, getNumberOfDays, deleteFolder} = require('../myFunctions/myFunctions');
const { upload, upload01, upload1, upload2 } = require("../controllers/uploadController")
// const authMiddleware = require("../middleware/auth.middleware")

// let results = []


router.post('/registration',
    [
        check('email', "Uncorrect email").isEmail(),
        check('password', 'Password must be longer than 3 and shorter than 12').isLength({min:3, max:12})
    ],
    signup)
   
router.post('/email-activate', activateAccount)
router.post('/forgot-password', forgotPassword)
router.post('/resset-pass', resetPassword)


router.post('/login', login)

// router.post('/upload', [cookieJwtAuth], upload)

// router.post('/upload01', [cookieJwtAuth], upload01)


// router.post('/upload1', cookieJwtAuth, upload1)
// router.post('/upload2', cookieJwtAuth, upload2)

router.get("/logout", cookieJwtAuth, logout)


router.get("/user", async function(req, res){
    const user = await User.findOne({email: 'vov2@gmail.com'})
    console.log(`users-users: ${user}`)
    // res.end({user: `${user}`})
    // res.end({user: {
    //     id: user.id,
    //     email: user.email,
    //     diskSpace: user.diskSpace,
    //     usedSpace: user.usedSpace,
    //     avatar: user.avatar
    // }});
    res.json({user: {
            id: user.id,
            email: user.email,
            diskSpace: user.diskSpace,
            usedSpace: user.usedSpace,
            avatar: user.avatar
        }})
            
});

router.post('/writepaying', cookieJwtAuth, writePaying)
router.post('/sendendpay', cookieJwtAuth, sendEndPay)
router.get('/usercabinet', cookieJwtAuth, getTokenUserData)
router.get('/payhistory', cookieJwtAuth, getTokenUserData)

module.exports = router
