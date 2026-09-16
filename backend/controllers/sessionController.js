const Session = require('../models/Session');
const { getAuth } = require('@clerk/express');

exports.create = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: 'Please sign in' });

    const { topicId, topicText, category, difficulty } = req.body;

    if (!topicId || !topicText) {
      return res.status(400).json({ error: 'Topic data is required' });
    }

    const session = await Session.create({
      userId,
      topicId,
      topicText,
      category,
      difficulty,
      completedAt: new Date()
    });

    res.status(201).json({ session });
  } catch (err) {
    next(err);
  }
};

exports.getStreak = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: 'Please sign in' });

    const sessions = await Session.find({ userId })
      .select('completedAt')
      .sort({ completedAt: -1 })
      .lean();

    const days = new Set(
      sessions.map(session => new Date(session.completedAt).toISOString().slice(0, 10))
    );

    let streak = 0;
    const date = new Date();

    while (days.has(date.toISOString().slice(0, 10))) {
      streak++;
      date.setUTCDate(date.getUTCDate() - 1);
    }

    // If the user has not practiced today, a streak from yesterday is still active.
    if (streak === 0) {
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      if (days.has(yesterday.toISOString().slice(0, 10))) {
        streak = 1;
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        while (days.has(yesterday.toISOString().slice(0, 10))) {
          streak++;
          yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        }
      }
    }

    res.json({ streak });
  } catch (err) {
    next(err);
  }
};
