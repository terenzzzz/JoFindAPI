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
        }
    }, {
        timestamps: true
    }
);

module.exports = {
    User: mongoose.model('User', userSchema)
}