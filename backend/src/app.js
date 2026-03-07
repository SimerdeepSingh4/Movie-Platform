const express = require('express');
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
    origin:'http://localhost:5173',
    credentials:true
}))
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/movies', movieRouter)
app.use('/api/admin', adminRouter)


module.exports = app
