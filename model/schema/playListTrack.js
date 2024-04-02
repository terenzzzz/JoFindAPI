const mongoose = require('mongoose');

const playListTrackSchema = new mongoose.Schema({
    playList: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PlayList',
        required: true
    },
    track: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Track',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = {
    PlayListTrack: mongoose.model('playListTrack', playListTrackSchema)
}