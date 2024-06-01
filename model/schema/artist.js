const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        tags: [{
            tag: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Tag'
            },
            count: {
              type: Number,
              default: 0
            }
          }],
        familiarity: {
            type: Number,
            required: true,
            default: 0.0
        },
        hotness: {
            type: Number,
            required: true,
            default: 0.0
        },
        avatar: {
            type: String,
            required: false
        },
        summary: {
            type: String,
            required: false
        },
        published: {
            type: String,
            required: false
        },
    }, {
        timestamps: true
    }
);

module.exports = {
    Artist: mongoose.model('Artist', artistSchema)
}