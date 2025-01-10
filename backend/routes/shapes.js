const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  saveShape,
  editShape,
  getUserShapes,
  downloadShape,
  deleteShape,
} = require('../controllers/shapeController');

const router = express.Router();

router.post('/', authMiddleware, saveShape);
router.put('/:id', authMiddleware, editShape);
router.get('/', authMiddleware, getUserShapes);
router.get('/download/:id', authMiddleware, downloadShape);
router.delete('/:id', authMiddleware, deleteShape);

module.exports = router;
