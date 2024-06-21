const mongoose = require('mongoose');


const trackVecSchema = new mongoose.Schema({
        track: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Track',
            required: true
        }, 
        
        vec: {
            type: [Number],  // 存储为数组类型
            required: false,
            default:[]
        },
    }, {
        timestamps: true
    }
);


module.exports = {
    TrackVec: mongoose.model('trackVec', trackVecSchema)
}