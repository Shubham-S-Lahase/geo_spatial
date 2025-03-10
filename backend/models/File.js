const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  fileName: { type: String, required: true }, 
  contentType: { type: String, required: true }, 
  uploadedAt: { type: Date, default: Date.now },
  description: { type: String },
  tags: { type: [String] },
});

module.exports = mongoose.model('File', FileSchema);
