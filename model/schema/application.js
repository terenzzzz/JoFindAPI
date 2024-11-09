const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    step: {
        type: Number,
        required: true
    },
    isClosed: {
        type: Boolean,
        required: true,
        default: false
    },
    }, {
        timestamps: true
    }
);

module.exports = {
    Application: mongoose.model('Application', applicationSchema)
}