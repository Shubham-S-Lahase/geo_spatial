const Marker = require('../models/Marker');

// Add a new marker
exports.addMarker = async (req, res) => {
  try {
    const { name, coordinates } = req.body;

    const newMarker = new Marker({
      userId: req.user.id,
      name,
      coordinates,
    });

    await newMarker.save();

    res.status(201).json({ message: 'Marker added successfully', marker: newMarker });
  } catch (error) {
    res.status(500).json({ error: 'Error adding marker' });
  }
};

// Get all markers for a user
exports.getUserMarkers = async (req, res) => {
  try {
    const markers = await Marker.find({ userId: req.user.id });
    res.status(200).json({ markers });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving markers' });
  }
};

// Update a marker
exports.updateMarker = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, coordinates } = req.body;

    const updatedMarker = await Marker.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { name, coordinates },
      { new: true }
    );

    if (!updatedMarker) {
      return res.status(404).json({ error: 'Marker not found' });
    }

    res.status(200).json({ message: 'Marker updated successfully', marker: updatedMarker });
  } catch (error) {
    res.status(500).json({ error: 'Error updating marker' });
  }
};

// Delete a marker
exports.deleteMarker = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMarker = await Marker.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!deletedMarker) {
      return res.status(404).json({ error: 'Marker not found' });
    }

    res.status(200).json({ message: 'Marker deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting marker' });
  }
};