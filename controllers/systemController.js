const User = require("../models/User")
const config = require("config")
const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')
const json2csv = require("json2csv")
const convertCsvToXlsx = require('@aternus/csv-to-xlsx')

const { 
    getUserfromToken, 
    moveFile,
    deleteFolder, 
    createDir } = require("../myFunctions/myFunctions")

let results = []

class systemController {
    async getAccessToStart(req, res, next) {
        try {
            const user = await User.findOne({_id: req.user.id})
            if(+user.daysLeft < 1){
                res.render('./cabinet', {
                    user : req.user // get the user out of session and pass to template
                })
            } else
            //   if  (+user.daysLeft === 1 || +user.daysLeft > 1)
                   {
                res.render('./start', {
                    user : req.user // get the user out of session and pass to template
                })
            }
        } catch (err) {
            next(err)
        }
    }

    async upload(req, res, next) {
        try {
            const token = req.cookies.token
            if(!token){
                return res.status(403).json({"message": "Ви не авторизувались(!token)"})
            }
            const refreshToken = req.cookies.refreshToken
            console.log(`refreshToken: ${refreshToken}`)
            let user = await getUserfromToken(token)
            let dirpath = `${config.get("filePath")}\\${user.id}`
            let filedata = req.file
            deleteFolder(dirpath)
            let originalFile = filedata.originalname
            let randFilePath = `${config.get("filePath")}\\${filedata.filename}` //path for  file .csv in 'dest/req.cookies.cookid/' in project-folder
    
            
            let fileExt = path.extname(originalFile)
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
            res.render("upload01.hbs")
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    async upload01(req, res, next) {
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
            console.log(`upload01-randFilePath: ${randFilePath}`)
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
            console.log('miss in api/ststem/upload01')
            console.log(`e: ${e}`)
            next(e)
        }
    }

    async upload1(req, res, next) {
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
            console.log('upload1-func')
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
            next(err)
        }
    }

    async upload2(req, res, next) {
        try {
            
        
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
        } catch (err) {
            next(err)     
        }
    }

}

module.exports = new systemController()