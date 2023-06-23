const express = require("express")
const cors = require('cors')
const mongoose = require('mongoose')

const transactionRouter =  require('./routes/transactionRouter')
const authRouter = require('./routes/authRouter')

require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({origin: true, credentials: true}));
app.use(express.json())

const uri = process.env.MONGO_URL
const conn = mongoose.connect(uri, {useNewUrlParser: true,});

console.log(`MongoDB Connected: ${conn}`);

app.use('/transactions', transactionRouter);
app.use('/auth', authRouter)

app.listen(PORT, () => {
    console.log(`server is listening on port ${PORT}`)
})