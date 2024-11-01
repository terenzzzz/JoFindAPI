const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
            required: false
        },
        role: {
            type: Number,
            required: true
        },
        seekingStatus: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SeekingStatus',
            required: false
        },
        role: {
            type: Number,
            required: true
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: false
        },
        resume: {
            type: Number,
            required: false
        },
    }, {
        timestamps: true
    }
);

module.exports = {
    User: mongoose.model('User', userSchema)
}