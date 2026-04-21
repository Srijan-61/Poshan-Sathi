const express = require('express');
const router = express.Router();
const { getLogs, createLog, updateLog, deleteLog } = require('../controllers/logController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getLogs);
router.post('/', protect, createLog);
router.patch('/:id', protect, updateLog);
router.delete('/:id', protect, deleteLog);

module.exports = router;