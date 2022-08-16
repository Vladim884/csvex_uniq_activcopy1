const {Schema, model, ObjectId} = require("mongoose")


const User = new Schema({
    email: {
        type: String, 
        trim: true, 
        required: true, 
        unique: true,
        lowercase: true
    },
    nicname: {
        type: String, 
        trim: true, 
        required: true, 
        unique: false,
        lowercase: true
    },
    password: {type: String, required: true},
    registrDate: {
        type: Date, 
        default: new Date(new Date().getTime() + 3*60*60*1000)
    },
    paymentNumber: {type: Number, default: 0},
    payingDate: {type: Date, default: new Date('01/01/2001').getTime() + 3*60*60*1000},
    endDay: {type: Date, default: new Date('01/01/2001').getTime() + 3*60*60*1000},
    sumpay: {type: Number, default: 0},
    daysLeft: {type: Number, default: 0},
    resetLink: {data: String, default: ''},
    status: {type: String, default: 'user'},
    diskSpace: {type: Number, default: 1024**3*10},
    usedSpace: {type: Number, default: 0},
    avatar: {type: String},
    files: [{type: ObjectId, ref:'File'}],
    payments: [{type: Object, ref:'Payment'}]
})

module.exports = model('User', User)
