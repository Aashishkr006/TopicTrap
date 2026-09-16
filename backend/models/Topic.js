const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'tech', 'finance', 'roast', 'pitch', 'worst-take', 'eli5', 'conspiracy', 'hot-takes', 'millennial', 'gen-z', 'interview'],
    index: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard'],
    index: true
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'de', 'zh', 'it', 'ar', 'pt', 'ko', 'ja', 'th', 'ur'],
    index: true
  },
  exampleSentence: {
    type: String,
    trim: true,
    maxlength: 500
  },
  speakingAngle: {
    type: String,
    trim: true,
    maxlength: 300
  },
  tags: [{ type: String, trim: true }],
  timesServed: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true, index: true }
}, {
  timestamps: true
});

topicSchema.index({ category: 1, difficulty: 1, language: 1, isActive: 1 });
topicSchema.index({ tags: 1 });

module.exports = mongoose.model('Topic', topicSchema);
