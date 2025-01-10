const mongoose = require('mongoose');

const ShapeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  geojson: { type: Object, required: true }, // GeoJSON data
  createdAt: { type: Date, default: Date.now },
  description: { type: String },
  tags: { type: [String] },
});

module.exports = mongoose.model('Shape', ShapeSchema);
