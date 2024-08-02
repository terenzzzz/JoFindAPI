const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    topic_id: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true,
      default: ""
    },
    words: [
      {
        word:{
          type: String,
          required: false
        },
        weight:{
          type: Number,
          require: false
        }
      }
    ]
  }, { timestamps: true });

module.exports = {
  Topic: mongoose.model('Topic', topicSchema)
}