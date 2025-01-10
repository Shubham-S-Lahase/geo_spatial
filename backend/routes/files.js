const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/gridFsStorage');
const {
  uploadFile,
  getUserFiles,
  downloadFile,
  deleteFile,
} = require('../controllers/fileController');

const router = express.Router();

router.post('/upload', authMiddleware, upload.single('file'), uploadFile);
router.get('/', authMiddleware, getUserFiles);
router.get('/download/:id', authMiddleware, downloadFile);
router.delete('/:id', authMiddleware, deleteFile);

module.exports = router;
