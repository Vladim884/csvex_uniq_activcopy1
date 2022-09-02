const Router = require("express")
const express = require("express")
const _ = require("lodash")
const json2csv = require("json2csv")
// const extfs = require('extfs')
const convertCsvToXlsx = require('@aternus/csv-to-xlsx')
const rimraf = require('rimraf')
const csv = require('csv-parser')
const alert = require('alert')
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const config = require("config")
const fs = require('fs')
const path = require('path')


const jwt = require("jsonwebtoken")
const {check, validationResult} = require("express-validator")
const router = new Router()
// const authMiddleware = require('../middleware/auth.middleware')
const {cookieJwtAuth} = require('../middleware/cookieJwtAuth')
const {filePathDeleter} = require('../myFunctions/filePathDeleter')
const {deleteFolder} = require('../myFunctions/deleteFolder')
const {moveFile} = require('../myFunctions/moveFile')
const {getUserfromToken} = require('../myFunctions/myFunctions')
const {writePaying} = require('../controllers/paymentController')
const { 
        signup, 
        activateAccount, 
        forgotPassword, 
        resetPassword,
        sendEndPay,
        getTokenUserData, 
        getAccessToStart} = require("../controllers/authController");
const {createDir} = require('../myFunctions/createFolder');
const {clg, noteServiceEnd, getNumberOfDays} = require('../myFunctions/myFunctions');
// const authMiddleware = require("../middleware/auth.middleware")

let results = []


router.post('/registration',
    [
        check('email', "Uncorrect email").isEmail(),
        check('password', 'Password must be longer than 3 and shorter than 12').isLength({min:3, max:12})
    ],
    signup)
   
router.post('/email-activate', activateAccount)
router.post('/forgot-password', forgotPassword)
router.post('/resset-pass', resetPassword)


router.post('/login',
    async (req, res) => {
        // let randFilePath = req.cookies.randFilePath // 
         //idNameFolder
        // filePathDeleter(randFilePath) //randNameFile in dest-folder
        
        // console.log(dirpath)
        // deleteFolder(dirpath) // delete idNameFolder
        // rimraf(dirpath) // 
        // res.clearCookie('newpath')
        // res.clearCookie('cookid')
        try {
            const {email, password} = req.body
            let user = await User.findOne({email})
            if (!user) {
                return res.status(404).json({message: "User not found"})
            }
            const isPassValid = bcrypt.compareSync(password, user.password)
            if (!isPassValid) {
                return res.status(400).json({message: "Invalid password"})
            }
            const token = jwt.sign({id: user.id, email: user.email}, config.get("secretKey"), {expiresIn: "1h"})
            const refreshToken = jwt.sign({id: user.id, email: user.email}, config.get("JWT_REF_ACTIVATE"), {expiresIn: "30d"})
            let dirpath = `${config.get('filePath')}\\${user.id}`
            if(user.temp[0]){
                let randFilePath = user.temp[0].randFilePath
                let csvpath = user.temp[0].csvpath
                let exelpath = user.temp[0].exelpath
                filePathDeleter(csvpath)
                filePathDeleter(exelpath)
                filePathDeleter(randFilePath)
            }
            res.cookie('token', token, {
                httpOnly: true
            })
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true
            })
            if(user.status === 'admin'){
                res.cookie('admin', 'admin')
            }
            if(user.status === 'user'){
                res.cookie('user', 'user')
            }
            let daysLeft = getNumberOfDays(new Date(), new Date(user.endDay))
            if(daysLeft < 0) daysLeft = 0
            let balance = daysLeft * 100 / 30
            if(balance < 0) balance = 0
            if (daysLeft !== user.daysLeft || balance !== user.balance) {
                let obj = {
                    daysLeft,
                    balance
                }
                user = _.extend(user, obj)
                user.save((err, result) => {
                    if(err){
                        return res.status(400).json({message: `Ошибка изменения оплати юзера ${email}`})
                    } else {
                        console.log('Баланс та залишок днів при логіні змінено???')
                    }})
            } else {
                console.log('Data has not changed')
            }
            
            // return res.json({
            //     token,
                // user: {
                //     id: user.id,
                //     email: user.email,
                //     diskSpace: user.diskSpace,
                //     usedSpace: user.usedSpace,
                //     avatar: user.avatar
                // }
            // })
            // console.log(`loginFunc cookid: ${req.cookies.cookid}`)
            
            return res.render('./cabinet.hbs') 
            //  return res.json({'message': 'login ok'}) 

            
        } catch (e){
            console.log(`/login e: ${e}`)
        }
    }
)

router.post('/upload', 
cookieJwtAuth,
// authMiddleware,
async (req, res) => {
    const token = req.cookies.token
    const refreshToken = req.cookies.refreshToken
    console.log(`refreshToken: ${refreshToken}`)
    if(!token){
        // return res.redirect('http://localhost:5000/enter')
        return res.status(403).json({"message": "Ви не авторизувались"})
    }
    let user = await getUserfromToken(token)
    
    let dirpath = `${config.get("filePath")}\\${user.id}`

    let filedata = req.file
    // console.log(`dirpath: ${dirpath}`)
    deleteFolder(dirpath)
    let originalFile = filedata.originalname
    let randFilePath = `${config.get("filePath")}\\${filedata.filename}` //path for  file .csv in 'dest/req.cookies.cookid/' in project-folder

    try {
    let fileExt = path.extname(originalFile)
    if(fileExt !== '.csv') return res.send('Некоректне розширення файлу! Поверниться на крок назад, та оберить файл с розширенням ".csv" на прикінці.')
    await createDir(dirpath)
    
    await moveFile(randFilePath, `${dirpath}\\${filedata.filename}`)
    randFilePath = `${dirpath}\\${filedata.filename}` 
    let csvpath = `${dirpath}\\newcsv.csv`
    let exelpath = `${dirpath}\\newxl.xlsx` 
     // path for dir 'files/thisId' in project-folder
    console.log(randFilePath)
    // res.cookie('randFilePath', randFilePath)
    // res.cookie('dirpath', dirpath)
    
    // user.temp[user.temp.length-1].dirpath = dirpath
    // user.temp[0].randFilePath = randFilePath
    
    
    console.log(`user.payments[0].sum: ${user.payments[0].sum}`)
    console.log(`user.temp.length: ${user.temp.length}`)
    if (user.temp.length < 1 || !user.temp.length){
        user.temp.push({dirpath, randFilePath, csvpath, exelpath})
        await user.save((err, result) => {
            if(err){
                return res.status(400).json({message: `Помилка запису в temp-data: ${randFilePath} ${dirpath}`})
            } else {
                console.log('upload temp-data змінено')
            }}
        ) 
    } else {
        await user.updateOne(
                {temp: {dirpath, randFilePath, csvpath, exelpath} }
              ),
            function (err, docs) {
            if (err){
                console.log(err)
            }
            else{
                console.log("Updated Docs : ", docs);
            }
        }
    }
    
    
    
    res.render("upload01.hbs")
    } catch (error) {
        console.log(error)
    }
})

router.post('/upload01',
    cookieJwtAuth, 
    async (req, res) => {
        // const token = req.cookies.token
        // if(!token){
            // return res.redirect('http://localhost:5000/enter')
            // return res.status(403).json({"message": "Ви не авторизувались"})
        // }
        // let user = await getUserfromToken(token)
        results = []
        let resfind = []
        let resname = []
        let resgroup = []
        // let randFilePath = req.cookies.randFilePath
        // let dirpath = req.cookies.dirpath
        // console.log(`randFilePath: ${user.temp[0].randFilePath}`)
        // console.log(`dirpath: ${user.temp[0].dirpath}`)

        try {
            // if (!fs.existsSync(dirpath)) {
            //     res.render('./login.hbs')
            // }
        fs.createReadStream(randFilePath)
        .pipe(csv())
        .on('data', (data) => {
            results.push(data)
        })
        .on('end', () => {
            for (let i = 0; i < results.length; i++) {
                let data_f = results[i]['Поисковые_запросы'];
                let data_n = `${results[i]['Название_позиции']} ${results[i]['Поисковые_запросы']} ${results[i]['Название_группы']}`;
                let data_g = results[i]['Название_группы'];

                resfind.push(data_f)
                resname.push(data_n)
                resgroup.push(data_g)
            }
            let req_name = resname
            let req_group = resgroup;
            let req_find = resfind;
            res.render("upload1.hbs", {
                req_name: req_name,
                req_group: req_group,
                req_find: req_find,
                resfind: resfind,
                resname: resname,
                resgroup: resgroup
            })
        }) 
    } catch (e) {
        console.log(e)
    }
})


router.post('/upload1', 
    cookieJwtAuth, 
    async (req, res) => {
        const token = req.cookies.token
        if(!token){
            // return res.redirect('http://localhost:5000/enter')
            return res.status(403).json({"message": "Ви не авторизувались"})
        }
        let user = await getUserfromToken(token)
        let dirpath = `${config.get("filePath")}\\${user.id}`
        // console.log(req.cookies.cookid)
        // let dirpath = (req.cookies.dirpath)
        // console.log(`${dirpath}\\newcsv.csv`)
        if(fs.existsSync(`${dirpath}\\newcsv.csv`)) {
            fs.unlinkSync(`${dirpath}\\newcsv.csv`)
            console.log('csv deleted')
        } 
        if (fs.existsSync(`${dirpath}\\newxl.xlsx`)) {
            fs.unlinkSync(`${dirpath}\\newxl.xlsx`)
            console.log('xl deleted')
        } 
        console.log('upload-func')
        /// console.log(results)
        if(!req.body) return response.sendStatus(400);
        // console.log(req.body.req_find);
        //change data file
        for (let i = 0; i < results.length; i++) {
            console.log("req.body.req_find:")
            // console.log(req.body.req_find[i]);
            results[i]['Поисковые_запросы'] = req.body.req_find[i];
            results[i]['Название_позиции'] = req.body.req_name[i];
            results[i]['Название_группы'] = req.body.req_group[i]
        }
        let apiDataPull = Promise.resolve(results).then(data => {
            if (!results[0]) {
                return res.render('/start.hbs')
            }
            console.log(`results[0]: ${Object.keys(results[0])}`)
            return json2csv.parseAsync(data, {fields: Object.keys(results[0])}) // right variant
        }).then(csv => {
            //==================
            // if (!fs.existsSync(`${dirpath}\\newcsv.csv`)) {
            //     res.render('./breakdown.hbs')
            // }
            let myFirstPromise = new Promise((resolve, reject) => {
                fs.writeFile(`${dirpath}\\newcsv.csv`, csv, function (err) {
                    if (err) {
                        //= return res.render('/login')
                        console.log(err)
                        throw err
                    }
                    console.log('File Saved!')
                    // console.log(req.cookies.cookid)
                    //= ind++;
                    //= console.log(ind);
                    resolve("Temporary files created!")
                });
            });
            myFirstPromise.then((message)=>{
                let source = path.join(`${dirpath}`, 'newcsv.csv')
                let destination = path.join(`${dirpath}`, 'newxl.xlsx')
                
                try {
                convertCsvToXlsx(source, destination)
                } catch (e) {
                console.error(e.toString())
                }
                /// rimraf(`${dirpath}/newxl.xlsx/`+'*', function () { 
                ///     console.log('Directory ./files is empty!'); 
                ///  !! if you remove the asterisk -> *, this folder will be deleted!
                // / });
                console.log(message)
            });
        })
        
    }
)

router.post('/upload2',
    cookieJwtAuth, 
    async (req, res) => {

        const token = req.cookies.token
        if(!token){
            // return res.redirect('http://localhost:5000/enter')
            return res.status(403).json({"message": "Ви не авторизувались"})
        }
        let user = await getUserfromToken(token)
        let dirpath = `${config.get("filePath")}\\${user.id}`
        

        // let dirpath = (req.cookies.dirpath)
        // let randFilePath = (req.cookies.randFilePath)
        // let csvpath = `${dirpath}newcsv.csv`
        // let exelpath = `${dirpath}newxl.xlsx`
        let randFilePath = user.temp[0].randFilePath
        let csvpath = user.temp[0].csvpath
        let exelpath = user.temp[0].exelpath


        // res.cookie('csvpath', csvpath)
        // res.cookie('exelpath', exelpath)
        
        // res.download(`${dirpath}\\newxl.xlsx`,
        res.download(exelpath,
         async function () {
            // filePathDeleter(csvpath)
            // filePathDeleter(exelpath)
            // filePathDeleter(randFilePath)
            deleteFolder(dirpath)
            await res.render('./login.hbs')
        })
        
            //====
            // deleteFolder(dirpath)
            // rimraf(`${dirpath}` + '*', function () { 
            //         console.log('Directory for temp-files is empty!'); 
            //     // !! if you remove the asterisk -> *, this folder will be deleted!
            //     })
    
    // return res.send('<a href="/">hello</a>')
  })

  router.get('/work', 
    cookieJwtAuth, 
    (req, res, next) => {
        try {
            let dirpath = (req.cookies.dirpath)
            deleteFolder(dirpath)
            res.clearCookie("token")
                // .clearCookie("token")
            return res.render('./start.hbs')
        } catch (e) {
            console.log(e)
        }
        
    })

  router.get("/logout", (req, res) => {
    // alert('Вы вышли из системы') 
    let dirpath = (req.cookies.dirpath)
    // if(!dirpath) return res.redirect('/')
    
    // extfs.isEmpty(dirpath, function (empty) {
    //     console.log(empty)
    // });
    deleteFolder(dirpath)
    
    res
    //   .clearCookie("exelpath")  
    //   .clearCookie("randFilePath")  
    //   .clearCookie("csvpath")  
    //   .clearCookie("dirpath")  
      .clearCookie("token")
      .clearCookie("user")
      .clearCookie("admin")
    //   .clearCookie("cookid")
    //   .clearCookie("admin")
    //   .status(200)
    // return res.redirect('/enter')
    return res
      .status(302)
      .redirect('/enter')
    //   .json({ message: "Successfully logged out 😏 🍀" })
       
  });

  router.get('/start', cookieJwtAuth, getAccessToStart)
//   router.get('/start', cookieJwtAuth, getAccessToStart)

// router.get('/auth', cookieJwtAuth,
//     async (req, res) => {
//         try {
//             const user = await User.findOne({_id: req.user.id})
//             const user = await User.findOne({_id: req.user.id})
//             const token = jwt.sign({id: user.id}, config.get("secretKey"), {expiresIn: "1h"})
//             const token = jwt.sign({id: user.id}, config.get("secretKey"), {expiresIn: "1h"})
//             return res.json({
//                 token,
//                 user: {
//                     id: user.id,
//                     email: user.email,
//                     diskSpace: user.diskSpace,
//                     usedSpace: user.usedSpace,
//                     avatar: user.avatar
//                 }
//             })
//         } catch (e) {
//             console.log(e)
//             console.log("Server error")
//             // res.send({message: "Server error"})
//         }
//     }
// )

// router.get('/enter', (req, res)=>{
//     return res.render('./login.hbs')
// })

// router.get('/registr', (req, res)=>{
//     return res.render('./registration.hbs')
// })

router.get("/user", async function(req, res){
    const user = await User.findOne({email: 'vov2@gmail.com'})
    // const user = await User.findOne({email: 'vov2@gmail.com'})
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

// router.post('/writepaying', cookieJwtAuth, writePaying)
router.post('/writepaying', cookieJwtAuth, writePaying)
router.post('/sendendpay', cookieJwtAuth, sendEndPay)
router.get('/usercabinet', cookieJwtAuth, getTokenUserData)
router.get('/payhistory', cookieJwtAuth, getTokenUserData)
// router.get('/usercabinet', cookieJwtAuth, getTokenUserData)

module.exports = router
