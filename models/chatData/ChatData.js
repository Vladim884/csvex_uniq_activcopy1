const {Schema, model, ObjectId} = require("mongoose")
const moment = require("moment")

const ChatData = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    nicname: { type: String, required: true },
    linkHref: { type: String, required: true },
    createData: {type: Date, default: moment().format()},
    messages: [{type: Object, ref:'Message'}],
})

module.exports = model('ChatData', ChatData)