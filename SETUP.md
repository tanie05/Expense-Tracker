# Expense Tracker - Local Setup Guide

This guide will help you set up and run the Expense Tracker application locally on your machine.

## Project Overview

This is a full-stack MERN (MongoDB, Express, React, Node.js) application for tracking personal expenses with user authentication.

**Features:**
- User registration and authentication (JWT-based)
- Create, read, update, and delete expenses
- Categorize expenses
- Filter expenses by type and category
- Real-time expense tracking

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

1. **Node.js** (v14 or higher) and **npm**
   - Download from: https://nodejs.org/
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. **MongoDB**
   - Option A: Install MongoDB locally from https://www.mongodb.com/try/download/community
   - Option B: Use MongoDB Atlas (cloud database) - https://www.mongodb.com/cloud/atlas
     - Create a free account
     - Create a new cluster
     - Get your connection string

3. **Git** (if cloning the repository)
   - Download from: https://git-scm.com/

---

## Installation Steps

### Step 1: Clone or Navigate to the Project

If you already have the project, navigate to the project directory:
```bash
cd /path/to/Expense-Tracker
```

### Step 2: Set Up Backend

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install backend dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file in the `backend` directory:**
   ```bash
   touch .env
   ```

4. **Add the following environment variables to the `.env` file:**
   ```
   MONGO_URL=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_secret_key_here
   ```

   **Example:**
   - For local MongoDB:
     ```
     MONGO_URL=mongodb://localhost:27017/expense-tracker
     PORT=5000
     JWT_SECRET=mySecretKey123!@#
     ```
   
   - For MongoDB Atlas:
     ```
     MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker?retryWrites=true&w=majority
     PORT=5000
     JWT_SECRET=mySecretKey123!@#
     ```

   **Important Notes:**
   - Replace `your_mongodb_connection_string` with your actual MongoDB connection string
   - Replace `your_secret_key_here` with a strong, random secret key for JWT
   - Keep your `.env` file secure and never commit it to version control

### Step 3: Set Up Frontend (Client)

1. **Navigate to the client directory from the project root:**
   ```bash
   cd ../client
   ```

2. **Install client dependencies:**
   ```bash
   npm install
   ```

3. **Configure the API endpoint for local development:**
   
   Open `client/src/appConfig.js` and ensure it points to your local backend:
   ```javascript
   const baseUrl = "http://localhost:5000"; 
   // const baseUrl = "https://expense-tracker-yiwf.onrender.com";
   export default baseUrl;
   ```
   
   Make sure the first line is uncommented and the production URL is commented out.

---

## Running the Application

You'll need to run both the backend and frontend servers simultaneously. Open **two separate terminal windows**.

### Terminal 1: Start the Backend Server

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   server is listening on port 5000
   MongoDB Connected: [object Promise]
   ```

   The backend server will run on **http://localhost:5000**

### Terminal 2: Start the Frontend Server

1. **Navigate to the client directory:**
   ```bash
   cd client
   ```

2. **Start the React development server:**
   ```bash
   npm start
   ```

   The React app will automatically open in your browser at **http://localhost:3000**

   If it doesn't open automatically, manually navigate to: http://localhost:3000

---

## Accessing the Application

1. Open your web browser and go to: **http://localhost:3000**
2. Register a new account using the registration page
3. Log in with your credentials
4. Start tracking your expenses!

---

## Project Structure

```
Expense-Tracker/
├── backend/                 # Backend Node.js/Express server
│   ├── controllers/        # Request handlers
│   ├── helper/            # Helper functions
│   ├── middlewares/       # Authentication middleware
│   ├── models/            # MongoDB models (User, Transaction)
│   ├── routes/            # API routes
│   ├── server.js          # Entry point
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables (create this)
│
├── client/                # Frontend React application
│   ├── public/           # Static files
│   ├── src/              # React source code
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── App.js        # Main App component
│   │   └── appConfig.js  # API configuration
│   └── package.json      # Frontend dependencies
│
└── README.md             # Project documentation
```

---

## Available Scripts

### Backend Scripts
- `npm run dev` - Starts the backend server with nodemon (auto-restart on changes)
- `npm run build` - Installs dependencies

### Frontend Scripts
- `npm start` - Starts the React development server
- `npm run build` - Creates a production build
- `npm test` - Runs tests

---

## Troubleshooting

### Backend won't start
- **Issue:** "Cannot connect to MongoDB"
  - **Solution:** Verify your MongoDB is running (if local) or check your connection string in `.env`
  - For local MongoDB, start it with: `mongod`

- **Issue:** "Port 5000 is already in use"
  - **Solution:** Change the PORT in your `.env` file to another port (e.g., 5001)
  - Update the `baseUrl` in `client/src/appConfig.js` accordingly

### Frontend won't start
- **Issue:** "Port 3000 is already in use"
  - **Solution:** Either close the other application or when prompted, press `Y` to run on a different port

### API calls failing
- **Issue:** 404 or connection errors
  - **Solution:** Ensure the backend is running and the `baseUrl` in `appConfig.js` matches your backend URL

### Database errors
- **Issue:** "Authentication failed"
  - **Solution:** Check your MongoDB credentials in the connection string
  - For MongoDB Atlas, ensure your IP address is whitelisted in the Network Access settings

---

## Building for Production

### Build Frontend
```bash
cd client
npm run build
```

This creates an optimized production build in the `client/build` folder.

### Deploy
- Backend can be deployed to platforms like Render, Heroku, or Railway
- Frontend can be deployed to Netlify, Vercel, or served by the backend
- Update environment variables in production accordingly

---

## Technologies Used

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Create React App** - Build tooling

---

## Additional Notes

- The application uses JWT (JSON Web Tokens) for authentication
- Passwords are hashed using bcrypt before storing in the database
- The backend API runs on port 5000 by default
- The React development server runs on port 3000 by default
- CORS is enabled to allow frontend-backend communication

---

## Support

If you encounter any issues not covered in this guide:
1. Check that all dependencies are installed correctly
2. Verify environment variables are set properly
3. Ensure both servers are running
4. Check browser console and terminal for error messages

---

## License

ISC

---

**Happy Expense Tracking! 💰📊**

