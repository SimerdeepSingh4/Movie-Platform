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

// Serve frontend build
const frontendDistPath = path.join(__dirname, '../public');
app.use(express.static(frontendDistPath));

app.use((req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

module.exports = app
