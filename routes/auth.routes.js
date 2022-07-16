const Router = require("express")
const express = require("express")
// const multer  = require("multer")
const app = express()
// const formidable = require('formidable')
const json2csv = require("json2csv")
const extfs = require('extfs')
const convertCsvToXlsx = require('@aternus/csv-to-xlsx')
const rimraf = require('rimraf')
const csv = require('csv-parser')
const alert = require('alert')
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const config = require("config")
// const fse = require('fs-extra')
const fs = require('fs')
// const uuidv1 = require('uuidv1')
const path = require('path')
// const shell = require('shelljs');
// var mv = require('mv')

const jwt = require("jsonwebtoken")
const {check, validationResult} = require("express-validator")
const router = new Router()
// const authMiddleware = require('../middleware/auth.middleware')
const {cookieJwtAuth} = require('../middleware/cookieJwtAuth')
const {filePathDeleter} = require('../myFunctions/filePathDeleter')
const {deleteFolder} = require('../myFunctions/deleteFolder')
const {moveFile} = require('../myFunctions/moveFile')
const { signup, activateAccount, forgotPassword, resetPassword } = require("../controllers/authController");
const {createDir} = require('../myFunctions/createFolder');

// const fileService = require('../services/fileService')
// const File = require('../models/File')
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
        let csvpath = req.cookies.csvpath
        let exelpath = req.cookies.exelpath
        let dirpath = req.cookies.dirpath //idNameFolder
        // filePathDeleter(randFilePath) //randNameFile in dest-folder
        filePathDeleter(csvpath)
        filePathDeleter(exelpath)
        console.log(dirpath)
        // deleteFolder(dirpath) // delete idNameFolder
        // rimraf(dirpath) // 
        res.clearCookie('newpath')
        res.clearCookie('cookid')
        try {
            const {email, password} = req.body
            const user = await User.findOne({email})
            if (!user) {
                return res.status(404).json({message: "User not found"})
            }
            const isPassValid = bcrypt.compareSync(password, user.password)
            if (!isPassValid) {
                return res.status(400).json({message: "Invalid password"})
            }
            const token = jwt.sign({id: user.id, email: user.email}, config.get("secretKey"), {expiresIn: "1h"})
            // res.cookie('originalFile', originalFile)
            dirpath = `${config.get('filePath')}\\${user.id}`
            deleteFolder(dirpath)
            res.cookie('cookid', user.id)
            res.cookie('token', token, {
                httpOnly: true
            })
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
            console.log(`loginFunc cookid: ${req.cookies.cookid}`)
            
            
            // console.log(`checkbox = ${req.body.flag}`)//checkbox value on login.hbs
            // if (req.body.flag) {
            //     return res.render('./start.hbs')
            // } else {
            //     return res.render('./message.hbs')
            // }
            return res.render('./start.hbs')   
            
        } catch (e){
            console.log(e)
        }
    }
)


router.post('/upload', 
cookieJwtAuth, 
async (req, res, next) => {
    let filedata = req.file
    let cookid = req.cookies.cookid
    let dirpath = `${config.get("filePath")}\\${cookid}` // path for dir 'files/thisId' in project-folder
    
    deleteFolder(dirpath)
    console.log(req.file)
    let originalFile = filedata.originalname

    
    let randFilePath = `${config.get("filePath")}\\${filedata.filename}` //path for  file .csv in 'dest/req.cookies.cookid/' in project-folder


    try {
    // let originalFile = `${req.cookies.originalFile}`
    let fileExt = path.extname(originalFile)
    if(fileExt !== '.csv') return res.send('Некоректне розширення файлу! Поверниться на крок назад, та оберить файл с розширенням ".csv" на прикінці.')
    
    await createDir(dirpath)
    
    await moveFile(randFilePath, `${dirpath}\\${filedata.filename}`)
    randFilePath = `${dirpath}\\${filedata.filename}`  
     // path for dir 'files/thisId' in project-folder
    console.log(randFilePath)
    res.cookie('randFilePath', randFilePath)
    res.cookie('dirpath', dirpath)

    res.render("upload01.hbs")
    
    } catch (error) {
        console.log(error)
    }
})

router.post('/upload01',
    cookieJwtAuth, 
    (req, res) => {
    results = []
    let resfind = []
    let resname = []
    let resgroup = []
    let randFilePath = req.cookies.randFilePath
    let dirpath = req.cookies.dirpath
    console.log(`randFilePath: ${randFilePath}`)
    console.log(`dirpath: ${dirpath}`)

    try {
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
    (req, res) => {
        console.log(req.cookies.cookid)
        let dirpath = (req.cookies.dirpath)
        console.log(`${dirpath}\\newcsv.csv`)
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
        console.log(req.body.req_find);
        //change data file
        for (let i = 0; i < results.length; i++) {
            console.log("req.body.req_find:")
            console.log(req.body.req_find[i]);
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
    (req, res) => {
        let dirpath = (req.cookies.dirpath)
        let randFilePath = (req.cookies.randFilePath)
        let csvpath = `${dirpath}newcsv.csv`
        let exelpath = `${dirpath}newxl.xlsx`

        res.cookie('csvpath', csvpath)
        res.cookie('exelpath', exelpath)
        
        res.download(`${dirpath}\\newxl.xlsx`, async function () {
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
            res
                .clearCookie("exelpath")  
                .clearCookie("randFilePath")  
                .clearCookie("csvpath")  
                .clearCookie("dirpath")  
                // .clearCookie("token")
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
      .clearCookie("exelpath")  
      .clearCookie("randFilePath")  
      .clearCookie("csvpath")  
      .clearCookie("dirpath")  
      .clearCookie("token")
      .clearCookie("cookid")
    return res.redirect('/enter')

    //   .status(200)
    //   .json({ message: "Successfully logged out 😏 🍀" })
       
  });



    



router.get('/auth', cookieJwtAuth,
    async (req, res) => {
        try {
            const user = await User.findOne({_id: req.user.id})
            const token = jwt.sign({id: user.id}, config.get("secretKey"), {expiresIn: "1h"})
            return res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    diskSpace: user.diskSpace,
                    usedSpace: user.usedSpace,
                    avatar: user.avatar
                }
            })
        } catch (e) {
            console.log(e)
            console.log("Server error")
            // res.send({message: "Server error"})
        }
    }
)

// router.get('/enter', (req, res)=>{
//     return res.render('./login.hbs')
// })

// router.get('/registr', (req, res)=>{
//     return res.render('./registration.hbs')
// })


module.exports = router
