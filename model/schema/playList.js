const mongoose = require('mongoose');

const playListSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        cover: {
            type: String,
            required: false
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    }, {
        timestamps: true
    }
);

module.exports = {
    PlayList: mongoose.model('PlayList', playListSchema)
}