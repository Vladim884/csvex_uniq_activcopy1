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
// const {deleteFolder} = require('../myFunctions/myFunctions')
// const {moveFile} = require('../myFunctions/moveFile')
const {getUserfromToken} = require('../myFunctions/myFunctions')
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
const {clg, noteServiceEnd, getNumberOfDays, deleteFolder} = require('../myFunctions/myFunctions');
const { upload } = require("../controllers/uploadController")
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


router.post('/login', login)

router.post('/upload', [cookieJwtAuth], upload)

router.post('/upload01',
    [cookieJwtAuth], 
    async (req, res, next) => {
        // const token = req.cookies.token
        // if(!token){
            // return res.redirect('http://localhost:5000/enter')
            // return res.status(403).json({"message": "Ви не авторизувались"})
        // }
        // let user = await getUserfromToken(token)
        // if(!randFilePath){
        //     console.log('!!!!!')
        // }
        // fs.readFile(randFilePath, (err, result) => {
        //     if (err) {
        //       console.error(`err: ${err}`);
        //       return;
        //     }
        //     // Log the file contents if no error
            // console.log(result);
        //   });
        try {
            results = []
            let resfind = []
            let resname = []
            let resgroup = []
        // let randFilePath = req.cookies.randFilePath
        // let dirpath = req.cookies.dirpath
        // console.log(`randFilePath: ${user.temp[0].randFilePath}`)
        // let lengsFile = rand.length

        
            // if (!fs.existsSync(randFilePath)) {
            //     res.render('./login.hbs')
            // }
            
            // if(randFilePath === undefined){
            //     console.log('miss')
            // //     return res.json({'mrssage': 'randFilePath is not defined'})
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
        console.log('miss in api/auth/upload01')
        console.log(`e: ${e}`)
        next(e)
    }
})


router.post('/upload1', 
    cookieJwtAuth, 
    async (req, res) => {
        try {
            
        
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
    } catch (err) {
        console.log(`upload1-err: ${err}`)
    }
})

router.post('/upload2', cookieJwtAuth, 
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
            }
        )
        
            //====
            // deleteFolder(dirpath)
            // rimraf(`${dirpath}` + '*', function () { 
            //         console.log('Directory for temp-files is empty!'); 
            //     // !! if you remove the asterisk -> *, this folder will be deleted!
            //     })
    
    // return res.send('<a href="/">hello</a>')
})

router.get('/continueWork', cookieJwtAuth, continueWork)

router.get("/logout", cookieJwtAuth, logout)

router.get('/start', cookieJwtAuth, getAccessToStart)

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
