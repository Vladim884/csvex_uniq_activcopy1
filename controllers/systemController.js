const User = require("../models/User")
const config = require("config")
const fs = require('fs')
const rimraf = require('rimraf')
const path = require('path')
const csv = require('csv-parser')
const json2csv = require("json2csv")
const convertCsvToXlsx = require('@aternus/csv-to-xlsx')

const { 
    getUserfromToken, 
    moveFile,
    deleteFolder, 
    createDir, 
    getUserfromRefToken} = require("../myFunctions/myFunctions")
const userService = require("../services/userService")


class systemController {
    
    async getAccessToStart(req, res, next) {
        try {
            const testuser = req.user
            const user = await User.findOne({_id: req.user.id})
            if(+user.daysLeft === 0){
                res.render('/menu/cabinet', {
                    user : req.user, // get the user out of session and pass to template
                    msg: 'Немає коштів для отримання послуги'
                })
            } else  {
                res.render('/menu/start', {
                    user : req.user // get the user out of session and pass to template
                })
            }
        } catch (err) {
            next(err)
        }
    }

    async upload(req, res, next) {
        try {
            let token = req.cookies.token
            const {refreshToken} = req.cookies
            if(token){
                let user = await getUserfromToken(token)
            } else {
                // const {refreshToken} = req.cookies
                    if(!refreshToken){
                        return res.status(403).json({"message": "systemContr/upload Ви не авторизувались(!token)"})
                    } else {
                        const refData = await userService.refresh(refreshToken)
                        res.cookie('refreshToken', refData.refreshToken, {
                            maxAge: 24*30*60*60*1000,
                            httpOnly: true
                        })
                        token = refData.token
                    }
            }
            const user = await getUserfromToken(token)
            let dirpath = `${config.get("filePath")}\\${user.id}`
            let filedata = req.file
            deleteFolder(dirpath)
            let originalFile = filedata.originalname
            let randFilePath = `${config.get("filePath")}\\${filedata.filename}` //path for  file .csv in 'dest/req.cookies.cookid/' in project-folder
            let fileExt = path.extname(originalFile)
            // const origName = path.parse(originalFile).name  // file-name without ext-name (not used)
            
            if(fileExt !== '.csv') return res.send('Некоректне розширення файлу! Поверниться на крок назад, та оберить файл с розширенням ".csv" на прикінці.')
            await createDir(dirpath)
            
            await moveFile(randFilePath, `${dirpath}\\${filedata.filename}`)
            randFilePath = `${dirpath}\\${filedata.filename}` 
            let csvpath = `${dirpath}\\newcsv.csv`
            let exelpath = `${dirpath}\\newxl.xlsx` 
            
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
            res.render("service/userserv/upload01.hbs")
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    async upload01(req, res, next) {
        console.log('upl01')
        try {
            const {refreshToken} = req.cookies
            if(!refreshToken){
                return res.status(403).json({"message": "systemContr/upload01 Ви не авторизувались(!token)"})
            }
            let user = await getUserfromRefToken(refreshToken)
            let randFilePath = user.temp[0].randFilePath
            let dirpath = `${config.get("filePath")}\\${user.id}`
            let results = []
            let resfind = []
            let resname = []
            let resgroup = []
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
                
                res.render("service/userserv/upload1.hbs", {
                    req_name,
                    req_group,
                    req_find,
                    resfind,
                    resname,
                    resgroup
                })
            }) 
        } catch (err) {
            console.log(err)
            next(err)
        }
    }

    async upload1(req, res, next) {
        try {
            const {refreshToken} = req.cookies
            if(!refreshToken){
                return res.status(403).json({"message": "systemContr/upload01 Ви не авторизувались(!token)"})
            }
            let user = await getUserfromRefToken(refreshToken)
            let randFilePath = user.temp[0].randFilePath
            let dirpath = `${config.get("filePath")}\\${user.id}`
            let results = []
            fs.createReadStream(randFilePath)
            .pipe(csv())
            .on('data', (data) => {
                results.push(data)
            })
            .on('end', () => {
                if(fs.existsSync(`${dirpath}\\newcsv.csv`)) {
                    fs.unlinkSync(`${dirpath}\\newcsv.csv`)
                } 
                if (fs.existsSync(`${dirpath}\\newxl.xlsx`)) {
                    fs.unlinkSync(`${dirpath}\\newxl.xlsx`)
                } 
                for (let i = 0; i < results.length; i++) {
                    results[i]['Поисковые_запросы'] = req.body.req_find[i];
                    results[i]['Название_позиции'] = req.body.req_name[i];
                    results[i]['Название_группы'] = req.body.req_group[i]
                }
                let apiDataPull = Promise.resolve(results).then(data => {
                    if (!results[0]) {
                        console.log('results[0] in upload1 - ???');
                        // res.status(502);
                        // res.render('error', {errorMsg: `Server Error`});
                    }
                    return json2csv.parseAsync(data, {fields: Object.keys(results[0])}) // right variant
                }).then(csv => {
                    let myFirstPromise = new Promise((resolve, reject) => {
                        fs.writeFile(`${dirpath}\\newcsv.csv`, csv, function (err) {
                            if (err) {
                                console.log(err)
                                throw err
                            }
                            console.log('File Saved!')
                            
                            resolve("Temporary files created!")
                        });
                    });
                    myFirstPromise.then((message)=>{
                        let source = path.join(`${dirpath}`, 'newcsv.csv')
                        let destination = path.join(`${dirpath}`, 'newxl.xlsx')
                        
                        convertCsvToXlsx(source, destination)
                        console.log(message)
                    })
                })
            })
            
        } catch (err) {
            console.log(err)
            next(err)
        }
    }

    async upload2(req, res, next) {
        try {            
            const {refreshToken} = req.cookies
            if(!refreshToken){
                return res.status(403).json({"message": "Ви не авторизувались"})
            }
            
            let user = await getUserfromRefToken(refreshToken)
            let dirpath = `${config.get("filePath")}\\${user.id}`
            
            let randFilePath = user.temp[0].randFilePath
            let csvpath = user.temp[0].csvpath
            let exelpath = user.temp[0].exelpath
    
            res.download(exelpath, 
                function () {
                    deleteFolder(dirpath)
                }
            )
        } catch (err) {
            console.log(err)
            next(err)     
        }
    }
}

module.exports = new systemController()