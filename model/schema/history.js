const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
        track: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Track',
            required: true
        },
        artist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Artist',
            required: true
        }, 
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        duration: {
            type: Number,
            required: true
        }
    }, {
        timestamps: true
    }
);

module.exports = {
    History: mongoose.model('History', historySchema)
}