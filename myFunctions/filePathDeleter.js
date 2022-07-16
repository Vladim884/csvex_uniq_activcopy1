const fs = require('fs')

exports.filePathDeleter = (x_path) => {
            if(fs.existsSync(x_path)) {
                fs.unlinkSync(x_path)
            }else{
                console.log(`this file ${x_path} is not exist`)
            }
        }