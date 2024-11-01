const mongoose = require('mongoose');

const seekingStatusSchema = new mongoose.Schema({
        status: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
    }, {
        timestamps: true
    }
);

module.exports = {
    SeekingStatus: mongoose.model('SeekingStatus', seekingStatusSchema)
}