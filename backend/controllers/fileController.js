const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const fs = require('fs');
const File = require('../models/File'); 

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

    const { description, tags } = req.body; // Get metadata from request body

    const newFile = new File({
      userId: req.user.id,
      fileName: req.file.filename,
      gridFsId: req.file.id,
      contentType: req.file.contentType,
      description, 
      tags,
    });

    await newFile.save();

    res.status(201).json({
      message: 'File uploaded successfully',
      file: newFile,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error uploading file' });
  }
};

// Update file metadata
exports.updateFileMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, tags } = req.body; 

    const updatedFile = await File.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { description, tags }, 
      { new: true }
    );

    if (!updatedFile) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.status(200).json({ message: 'File metadata updated successfully', file: updatedFile });
  } catch (error) {
    res.status(500).json({ error: 'Error updating file metadata' });
  }
};

// Retrieve user's uploaded files
exports.getUserFiles = async (req, res) => {
  try {
    const files = await File.find({ userId: req.user.id });
    res.status(200).json({ files });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving files' });
  }
};

// Download a file
exports.downloadFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findOne({ _id: new mongoose.Types.ObjectId(id) });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const readStream = gfs.createReadStream(file.gridFsId);
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
    await File.deleteOne({ _id: id, userId: req.user.id }); // Also delete from the File collection
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting file' });
  }
};