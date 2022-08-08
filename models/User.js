const {Schema, model, ObjectId} = require("mongoose")


const User = new Schema({
    email: {
        type: String, 
        trim: true, 
        required: true, 
        unique: true,
        lowercase: true
    },
    password: {type: String, required: true},
    payingDate: {type: Date, default: new Date('01/01/2001')},
    endDay: {type: Date, default: new Date('01/01/2001')},
    sumpay: {type: Number, default: 0},
    daysPaying: {type: Number, default: 0},
    resetLink: {data: String, default: ''},
    status: {type: String, default: 'user'},
    diskSpace: {type: Number, default: 1024**3*10},
    usedSpace: {type: Number, default: 0},
    avatar: {type: String},
    files : [{type: ObjectId, ref:'File'}]
})

module.exports = model('User', User)
