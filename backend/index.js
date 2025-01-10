const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDB();

// Routes
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');
const shapeRoutes = require('./routes/shapes');
const markerRoutes = require('./routes/markers');


app.get("/", (req, res) => { res.send("Hello World!"); });
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/shapes', shapeRoutes);
app.use('/api/markers', markerRoutes);

// Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));