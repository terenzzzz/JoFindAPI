const mongoose = require('mongoose');


const trackSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        album: {
            type: String,
            required: true
        },
        artist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Artist',
            required: true
        }, 
        year: {
            type: String,
            required: false
        },
        cover: {
            type: String,
            required: false
        },
        duration: {
            type: Number,
            required: false
        },
        lyric: {
            type: String,
            required: false
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
    Track: mongoose.model('Track', trackSchema)
}