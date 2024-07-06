const mongoose = require('mongoose');

const topWordSchema = new mongoose.Schema({
    track: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track',
      required: true
    },
    topwords: [
      {
        word:{
          type: String,
          required: false
        },
        value:{
          type: Number,
          require: false
        }
      }
    ]
  }, { timestamps: true });

module.exports = {
    TopWord: mongoose.model('TopWord', topWordSchema)
}