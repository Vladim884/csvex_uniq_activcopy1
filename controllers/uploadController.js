const config = require("config")
const { 
    getUserfromToken, 
    moveFile,
    deleteFolder, 
    createDir } = require("../myFunctions/myFunctions")
const path = require('path')


exports.upload = async (req, res, next) => {
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