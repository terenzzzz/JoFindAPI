const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        count: {
            type: Number,
            required: true
        }
    }, {
        timestamps: true
    }
);

module.exports = {
    Tag: mongoose.model('Tag', tagSchema)
}