const fs = require('fs')

exports.createDir = async  (xy) => {
    fs.mkdirSync(xy, err => {
        if (err)
        throw err // не удалось создать папку
        console.log(`Папка ${cookid} успешно создана`)
    })
}

