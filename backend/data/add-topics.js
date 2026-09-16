require('dotenv').config();
const mongoose = require('mongoose');
const Topic = require('../models/Topic');
const topics = require('./topics-extra.json');

async function addTopics() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ MongoDB connected');

    const result = await Topic.insertMany(topics);

    console.log(`✅ Added ${result.length} topics`);

    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  } catch (error) {
    console.error('❌ Error adding topics:', error.message);
    process.exit(1);
  }
}

addTopics();