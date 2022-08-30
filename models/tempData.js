const TempData = new Schema({
    dirpath: {type: String, default: ''},
    randFilePath: {type: String, default: ''},
    csvpath: {type: String, default: ''},
    exelpath: {type: String, default: ''},
})

module.exports = model('TempData', TempData)
