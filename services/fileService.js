const fs = require('fs')
const File = require('../models/File')
const config = require('config')
const { filePathDeleter } = require('../myFunctions/filePathDeleter')

class FileService {

    createDir(file) {
        const filePath = `${config.get('filePath')}\\${file.user}\\${file.path}`
        return new Promise(((resolve, reject) => {
            try {
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath)
                    return resolve({message: 'File was created'})
                } else {
                    return reject({message: "File already exist"})
                }
            } catch (e) {
                return reject({message: 'File error'})
            }
        }))
    }

    deleterOldFile(user){
        if(user.temp[0]){
            let randFilePath = user.temp[0].randFilePath
            let csvpath = user.temp[0].csvpath
            let exelpath = user.temp[0].exelpath
            filePathDeleter(csvpath)
            filePathDeleter(exelpath)
            filePathDeleter(randFilePath)
        }
    }

}


module.exports = new FileService()
