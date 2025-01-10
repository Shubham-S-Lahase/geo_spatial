const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  saveShape,
  editShape,
  getUserShapes,
  downloadShape,
} = require('../controllers/shapeController');

const router = express.Router();

router.post('/', authMiddleware, saveShape);
router.put('/:id', authMiddleware, editShape);
router.get('/', authMiddleware, getUserShapes);
router.get('/download/:id', authMiddleware, downloadShape);

module.exports = router;
