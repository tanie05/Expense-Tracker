const express = require("express")
const cors = require('cors')
const mongoose = require('mongoose')

const transactionRouter =  require('./routes/transactionRouter')
const authRouter = require('./routes/authRouter')
const chatRouter = require('./routes/chatRouter')

require('dotenv').config()

// Validate required environment variables
const requiredEnvVars = ['MONGO_URL', 'JWT_SECRET', 'GEMINI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error(`Error: Missing required environment variables: ${missingEnvVars.join(', ')}`);
    console.error('Please create a .env file with the required variables.');
    process.exit(1);
}

const app = express()
const PORT = process.env.PORT || 5000

// CORS configuration with specific allowed origins
const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['http://localhost:3000'];
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json())

app.use('/transactions', transactionRouter);
app.use('/auth', authRouter)
app.use('/chat', chatRouter)

// Connect to database and start server
const startServer = async () => {
    try {
        const uri = process.env.MONGO_URL;
        await mongoose.connect(uri, {useNewUrlParser: true});
        console.log('MongoDB Connected Successfully');
        
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

startServer();