const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const fs = require('fs');

let gfs;

// Initialize GridFS stream
mongoose.connection.once('open', () => {
  gfs = Grid(mongoose.connection.db, mongoose.mongo);
  gfs.collection('uploads'); // Matches the bucketName from storage configuration
});

// Upload a file
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: req.file.id,
        filename: req.file.filename,
        contentType: req.file.contentType,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error uploading file' });
  }
};

// Retrieve user's uploaded files
exports.getUserFiles = async (req, res) => {
  try {
    gfs.files.find({ 'metadata.userId': req.user.id }).toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({ error: 'No files found' });
      }
      res.status(200).json(files);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving files' });
  }
};

// Download a file
exports.downloadFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await gfs.files.findOne({ _id: new mongoose.Types.ObjectId(id) });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const readStream = gfs.createReadStream(file.filename);
    res.setHeader('Content-Type', file.contentType);
    readStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Error downloading file' });
  }
};

// Delete a file
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    await gfs.remove({ _id: new mongoose.Types.ObjectId(id), root: 'uploads' });
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting file' });
  }
};
