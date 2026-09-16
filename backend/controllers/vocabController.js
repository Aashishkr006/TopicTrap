const Vocab = require('../models/Vocab');

exports.getRandom = async (req, res, next) => {
  try {
    const count = await Vocab.countDocuments({ isActive: true });
    if (!count) return res.status(404).json({ error: 'No vocabulary found' });

    const index = Math.floor(Math.random() * count);
    const vocab = await Vocab.findOne({ isActive: true }).skip(index).lean();

    if (!vocab) return res.status(404).json({ error: 'No vocabulary found' });
    res.json({ vocab });
  } catch (err) {
    next(err);
  }
};
