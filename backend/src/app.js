const express = require('express');
const path = require('path');
const authRouter = require('./routes/auth.routes');
const userRouter = require('./routes/user.routes');
const movieRouter = require('./routes/movie.routes');
const adminRouter = require('./routes/admin.routes');
const cookieParser = require('cookie-parser');
const cors = require('cors');


const app = express();

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: ['http://localhost:5173', 'https://movie-platform-1-3xep.onrender.com'],
  credentials: true
}))

// API Routes
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/movies', movieRouter)
app.use('/api/admin', adminRouter)

// Health Check Endpoint for Monitors
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running normally' });
});

// Serve frontend build
const frontendDistPath = path.join(__dirname, '../public');
app.use(express.static(frontendDistPath));

// API 404 Handler - If an API route doesn't exist, return JSON 404
app.use('/api', (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// React Router Fallback - Ensure frontend routes work
app.use((req, res, next) => {
  // If the request accepts HTML (like a browser navigation), send the React app
  if (req.accepts('html')) {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  } else {
    next();
  }
});

// Global 404 Fallback for anything else (like missing assets)
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
});

module.exports = app
