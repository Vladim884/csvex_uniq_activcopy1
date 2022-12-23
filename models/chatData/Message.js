const {Schema, model, ObjectId} = require("mongoose")
const moment = require("moment")

const Message = new Schema({
    message: { type: String, default: ''},
    date: {type: Date, default: moment().format()},
})

module.exports = model('Message', Message)