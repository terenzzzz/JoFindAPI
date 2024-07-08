const mongoose = require('mongoose');

const w2vSimilaritySchema = new mongoose.Schema({
    track: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track',
      required: true
    },
    topsimilar: {
        type: [
            {
                track: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Track',
                    required: true
                },
                value: {
                    type: Number,
                    required: true
                },
            }
        ], 
        required: true
    }
  }, { timestamps: true });

module.exports = {
    W2vSimilarity: mongoose.model('W2vSimilarity', w2vSimilaritySchema)
}