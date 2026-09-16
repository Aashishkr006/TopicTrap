const Topic = require('../models/Topic');

// GET /api/topics/random
exports.getRandom = async (req, res, next) => {
  try {
    const { category, difficulty, language = 'en' } = req.query;
    const filter = { isActive: true, language };

    if (category && category !== 'random') filter.category = category;
    if (difficulty && difficulty !== 'random') filter.difficulty = difficulty;

    const count = await Topic.countDocuments(filter);
    if (!count) return res.status(404).json({ error: 'No topics found' });

    const index = Math.floor(Math.random() * count);
    const topic = await Topic.findOne(filter).skip(index).lean();

    if (!topic) return res.status(404).json({ error: 'No topics found' });

    Topic.findByIdAndUpdate(topic._id, { $inc: { timesServed: 1 } }).catch(() => {});
    res.json({ topic });
  } catch (err) {
    next(err);
  }
};

// GET /api/topics
exports.getAll = async (req, res, next) => {
  try {
    const { category, difficulty, language, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (language) filter.language = language;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [topics, total] = await Promise.all([
      Topic.find(filter).sort({ timesServed: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Topic.countDocuments(filter)
    ]);

    res.json({ topics, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    next(err);
  }
};

// POST /api/topics (admin)
exports.create = async (req, res, next) => {
  try {
    const topic = new Topic(req.body);
    await topic.save();
    res.status(201).json({ topic });
  } catch (err) {
    next(err);
  }
};

// PUT /api/topics/:id (admin)
exports.update = async (req, res, next) => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    res.json({ topic });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/topics/:id (admin - soft delete)
exports.remove = async (req, res, next) => {
  try {
    await Topic.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Topic deactivated' });
  } catch (err) {
    next(err);
  }
};

// GET /api/topics/categories
exports.getCategories = async (req, res, next) => {
  try {
    const ids = await Topic.distinct('category', { isActive: true });
    const labels = {
      general: ['General', '💬'],
      tech: ['Tech', '💻'],
      finance: ['Finance', '💰'],
      roast: ['Roast A Popular Thing', '🔥'],
      pitch: ['One-Minute Pitch', '💡'],
      'worst-take': ['Defend The Worst Take', '🤡'],
      eli5: ["Explain It Like You're 5", '👶'],
      conspiracy: ['Conspiracy Corner', '👽'],
      'hot-takes': ['Hot Takes', '🌶️'],
      millennial: ['Millennial', '📱'],
      'gen-z': ['Gen Z', '🧃'],
      interview: ['Interview Prep', '🎙️']
    };

    const categories = [
      { id: 'random', label: 'Random', emoji: '🎯' },
      ...ids.sort().map(id => ({
        id,
        label: labels[id]?.[0] || id,
        emoji: labels[id]?.[1] || '💬'
      }))
    ];

    res.json({ categories });
  } catch (err) {
    next(err);
  }
};
