const express = require('express');
const { requireAuth } = require('@clerk/express');
const ctrl = require('../controllers/sessionController');

const router = express.Router();

router.use(requireAuth());
router.post('/', ctrl.create);
router.get('/streak', ctrl.getStreak);

module.exports = router;
