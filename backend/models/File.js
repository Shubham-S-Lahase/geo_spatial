const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  fileName: { type: String, required: true }, 
  gridFsId: { type: mongoose.Schema.Types.ObjectId, required: true },
  contentType: { type: String, required: true }, 
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('File', FileSchema);
