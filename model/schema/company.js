const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        logo: {
            type: String,
            required: true
        },
        founded: {
            type: String,
            required: true
        },
        industry: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        },
        website: {
            type: String,
            required: false
        },
        location: {
            type: String,
            required: true
        },
        latitude: {
            type: String,
            required: true
        },
        longitude: {
            type: String,
            required: true
        },
        background: {
            type: String,
            required: true
        },
    }, {
        timestamps: true
    }
);

module.exports = {
    Company: mongoose.model('Company', companySchema)
}