const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  addMarker,
  getUserMarkers,
  updateMarker,
  deleteMarker,
} = require('../controllers/markerController');

const router = express.Router();

router.post('/', authMiddleware, addMarker); 
router.get('/', authMiddleware, getUserMarkers); 
router.put('/:id', authMiddleware, updateMarker);
router.delete('/:id', authMiddleware, deleteMarker);

module.exports = router;