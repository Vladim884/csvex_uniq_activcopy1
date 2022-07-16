const fs = require('fs')

exports.moveFile = async (fromPath, toPath) => {
    fs.rename(fromPath, toPath, err => {
// fs.rename(`${randFilePath}`, `${dirpath}\\mycsv.csv`, err => {
    if(err) throw err; // не удалось переместить файл
        console.log('Файл успешно перемещён');
        randFilePath = toPath
    })
}