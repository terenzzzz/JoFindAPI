const mongoose = require('mongoose');

const tfidfSimilaritySchema = new mongoose.Schema({
    track: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track',
      required: true
    },
    topsimilar: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Track',
                required: true
            }
        ], 
        required: true
    }
  }, { timestamps: true });

module.exports = {
    TfidfSimilarity: mongoose.model('TfidfSimilarity', tfidfSimilaritySchema)
}