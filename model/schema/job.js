const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: false
        },
        website: {
            type: String,
            required: true
        },
        department: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true
        },
        experience: {
            type: Number,
            required: true
        },
        degree: {
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
        salaryFrom: {
            type: Number,
            required: true
        },
        salaryTo: {
            type: Number,
            required: true
        },
        advFrom: {
            type: Date,
            required: true
        },
        advTo: {
            type: Date,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        requirements: {
            type: String,
            required: true
        },
        summary: {
            type: String,
            required: true
        },
    }, {
        timestamps: true
    }
);

module.exports = {
    Job: mongoose.model('Job', jobSchema)
}