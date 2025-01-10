// controllers/shapeController.js
const Shape = require('../models/Shape');

// Save a new shape
exports.saveShape = async (req, res) => {
  try {
    const { name, geojson, description, tags } = req.body; // Get metadata from request body

    const newShape = new Shape({
      userId: req.user.id,
      name,
      geojson,
      description, 
      tags,
    });

    await newShape.save();

    res.status(201).json({
      message: 'Shape created successfully',
      shape: newShape,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error creating shape' });
  }
};

// Edit an existing shape (including metadata)
exports.editShape = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, geojson, description, tags } = req .body; 

    const updatedShape = await Shape.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { name, geojson, description, tags }, 
      { new: true }
    );

    if (!updatedShape) {
      return res.status(404).json({ error: 'Shape not found' });
    }

    res.status(200).json({ message: 'Shape updated successfully', shape: updatedShape });
  } catch (error) {
    res.status(500).json({ error: 'Error updating shape' });
  }
};

// Retrieve user's shapes
exports.getUserShapes = async (req, res) => {
  try {
    const shapes = await Shape.find({ userId: req.user.id });
    res.status(200).json({ shapes });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving shapes' });
  }
};

// Download shape as GeoJSON
exports.downloadShape = async (req, res) => {
  try {
    const { id } = req.params;

    const shape = await Shape.findOne({ _id: id, userId: req.user.id });

    if (!shape) {
      return res.status(404).json({ error: 'Shape not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${shape.name}.geojson"`);
    res.status(200).send(JSON.stringify(shape.geojson));
  } catch (error) {
    res.status(500).json({ error: 'Error downloading shape' });
  }
};

// Delete a shape
exports.deleteShape = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedShape = await Shape.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!deletedShape) {
      return res.status(404).json({ error: 'Shape not found' });
    }

    res.status(200).json({ message: 'Shape deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting shape' });
  }
};