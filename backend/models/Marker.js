const mongoose = require('mongoose');

const MarkerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User ', required: true },
  name: { type: String, required: true },
  coordinates: { type: [Number], required: true }, // [longitude, latitude]
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Marker', MarkerSchema);