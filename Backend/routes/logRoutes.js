const express = require('express');
const router = express.Router();
const { getLogs, createLog, deleteLog } = require('../controllers/logController');

router.get('/', getLogs);
router.post('/', createLog);
router.delete('/:id', deleteLog);

module.exports = router;