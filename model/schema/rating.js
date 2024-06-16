const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    item: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'itemType',
      required: true
    },
    itemType: {
      type: String,
      required: true,
      enum: ['Track', 'Artist']
    },
    rate: {
      type: Number,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
  }, { timestamps: true });

module.exports = {
    Rating: mongoose.model('Rating', ratingSchema)
}