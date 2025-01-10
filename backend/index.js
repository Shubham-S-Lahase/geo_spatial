const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");

const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up session middleware
app.use(session({
    secret: process.env.JWT_SECRET, // Use the secret key from the .env file
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, 
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

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