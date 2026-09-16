const mongoose = require('mongoose');

const vocabSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  definition: { type: String, required: true },
  exampleSentence: { type: String },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
    index: true
  },
  partOfSpeech: {
    type: String,
    enum: ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'idiom'],
    default: 'noun'
  },
  language: { type: String, default: 'en', index: true },
  timesServed: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Vocab', vocabSchema);
