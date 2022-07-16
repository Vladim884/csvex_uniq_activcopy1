const fs = require('fs')

exports.deleteFolder = (p) => {
    console.log('-deleteFolder-')
    try {
        let files = [];
        if( fs.existsSync(p) ) {
            files = fs.readdirSync(p);
            files.forEach(function(file, index){
                let curPath = p + "/" + file;
                if(fs.statSync(curPath).isDirectory()) {
                    deleteFolder(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(p);
        } else {
            console.log('randomNameFolder not exists')
        }
    } catch (e) {
        console.log(e)
    }
}