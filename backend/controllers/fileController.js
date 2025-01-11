const fs = require('fs');
const path = require('path');
const File = require('../models/File');

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
      contentType: req.file.mimetype,
      uploadedAt: Date.now(),
      description,
      tags: tags.split(',').map(tag => tag.trim()), // Convert tags to an array
    });

    await newFile.save();

    res.status(201).json({
      message: 'File uploaded successfully',
      file: newFile,
    });
  } catch (error) {
    console.error("Error uploading file:", error); 
    res.status(500).json({ error: 'Error uploading file' });
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

// Serve a file
exports.downloadFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findOne({ _id: id, userId: req.user.id });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(__dirname, '../../uploads', file.fileName);
    res.download(filePath, file.fileName); // Serve the file for download
  } catch (error) {
    res.status(500).json({ error: 'Error downloading file' });
  }
};

// Delete a file
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findOne({ _id: id, userId: req.user.id });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete the file from the filesystem
    const filePath = path.join(__dirname, '../../uploads', file.fileName);
    fs.unlinkSync(filePath);

    await File.deleteOne({ _id: id, userId: req.user.id }); // Also delete from the File collection
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting file' });
  }
};