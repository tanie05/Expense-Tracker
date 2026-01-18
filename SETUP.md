# Expense Tracker - Local Setup Guide

This guide will help you set up and run the Expense Tracker application locally on your machine.

## Project Overview

This is a full-stack MERN (MongoDB, Express, React, Node.js) application for tracking personal expenses with user authentication and AI-powered features.

**Features:**
- User registration and authentication (JWT-based)
- Create, read, update, and delete expenses
- Categorize expenses
- Filter expenses by type and category
- Real-time expense tracking
- AI chatbot assistant (feature flag controlled)
- Feature flag service for gradual feature rollouts

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

3. **Python 3.9+** (for Feature Flag Service)
   - Download from: https://www.python.org/downloads/
   - Verify installation:
     ```bash
     python3 --version
     pip3 --version
     ```

4. **Git** (if cloning the repository)
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
   GEMINI_API_KEY=your_gemini_api_key
   FEATURE_FLAG_SERVICE_URL=http://127.0.0.1:5001
   FEATURE_FLAG_SECRET=your_feature_flag_secret
   ```

   **Example:**
   - For local MongoDB:
     ```
     MONGO_URL=mongodb://localhost:27017/expense-tracker
     PORT=5000
     JWT_SECRET=mySecretKey123!@#
     GEMINI_API_KEY=your-gemini-api-key-here
     FEATURE_FLAG_SERVICE_URL=http://127.0.0.1:5001
     FEATURE_FLAG_SECRET=yoursecretforfeatureflagservice
     ```
   
   - For MongoDB Atlas:
     ```
     MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker?retryWrites=true&w=majority
     PORT=5000
     JWT_SECRET=mySecretKey123!@#
     GEMINI_API_KEY=your-gemini-api-key-here
     FEATURE_FLAG_SERVICE_URL=http://127.0.0.1:5001
     FEATURE_FLAG_SECRET=yoursecretforfeatureflagservice
     ```

   **Important Notes:**
   - Replace `your_mongodb_connection_string` with your actual MongoDB connection string
   - Replace `your_secret_key_here` with a strong, random secret key for JWT
   - Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - `FEATURE_FLAG_SECRET` should match the secret in the feature flag service `.env`
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

### Step 4: Set Up Feature Flag Service

1. **Navigate to the feature-flag directory from the project root:**
   ```bash
   cd feature-flag
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create a `.env` file in the `feature-flag` directory:**
   ```bash
   touch .env
   ```

5. **Add the following environment variables to the `.env` file:**
   ```env
   SQLALCHEMY_DATABASE_URI=sqlite:///feature_flags.db
   FEATURE_FLAG_SECRET=364533b81474bb172a34fc91685ae3656c5fc18d9b60997c16612348cd9f3fd8
   ```

   **Important Notes:**
   - The `FEATURE_FLAG_SECRET` must match the `FEATURE_FLAG_SECRET` in your backend `.env` file
   - For production, use PostgreSQL or MySQL instead of SQLite
   - Keep your `.env` file secure and never commit it to version control

---

## Running the Application

You'll need to run three services simultaneously: the feature flag service, backend server, and frontend server. Open **three separate terminal windows**.

### Terminal 1: Start the Feature Flag Service

1. **Navigate to the feature-flag directory:**
   ```bash
   cd feature-flag
   ```

2. **Activate virtual environment (if using one):**
   ```bash
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Start the feature flag service:**
   ```bash
   python3 app.py
   ```

   You should see:
   ```
   * Running on http://127.0.0.1:5001
   ```

   The feature flag service will run on **http://localhost:5001**

### Terminal 2: Start the Backend Server

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
   MongoDB Connected Successfully
   Server is listening on port 5000
   ```

   The backend server will run on **http://localhost:5000**

### Terminal 3: Start the Frontend Server

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
│   ├── helper/            # Helper functions (including feature flag helper)
│   ├── middlewares/       # Authentication and feature flag middleware
│   ├── models/            # MongoDB models (User, Transaction)
│   ├── routes/            # API routes
│   ├── server.js          # Entry point
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables (create this)
│
├── client/                # Frontend React application
│   ├── public/           # Static files
│   ├── src/              # React source code
│   │   ├── components/   # React components (including ChatWidget)
│   │   ├── pages/        # Page components
│   │   ├── App.js        # Main App component
│   │   └── appConfig.js  # API configuration
│   └── package.json      # Frontend dependencies
│
├── feature-flag/          # Feature Flag Service (Flask/Python)
│   ├── middlewares/     # Service authentication middleware
│   ├── models/          # Database models (FeatureFlag, UserFeatureOverride)
│   ├── routes/          # API routes
│   ├── app.py           # Entry point
│   ├── config.py        # Configuration
│   ├── extensions.py    # Flask extensions
│   ├── requirements.txt # Python dependencies
│   ├── README.md        # Feature flag service documentation
│   └── .env            # Environment variables (create this)
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

### Feature Flag Service Scripts
- `python3 app.py` - Starts the Flask feature flag service

---

## Troubleshooting

### Backend won't start
- **Issue:** "Cannot connect to MongoDB"
  - **Solution:** Verify your MongoDB is running (if local) or check your connection string in `.env`
  - For local MongoDB, start it with: `mongod`

- **Issue:** "Port 5000 is already in use"
  - **Solution:** Change the PORT in your `.env` file to another port (e.g., 5001)
  - Update the `baseUrl` in `client/src/appConfig.js` accordingly

- **Issue:** "Error checking feature flag: connect ECONNREFUSED"
  - **Solution:** Ensure the feature flag service is running on port 5001
  - Verify `FEATURE_FLAG_SERVICE_URL` and `FEATURE_FLAG_SECRET` are set correctly in backend `.env`
  - Check that the feature flag service `.env` has matching `FEATURE_FLAG_SECRET`

### Feature Flag Service won't start
- **Issue:** "RuntimeError: Either 'SQLALCHEMY_DATABASE_URI' or 'SQLALCHEMY_BINDS' must be set"
  - **Solution:** Create a `.env` file in the `feature-flag` directory with `SQLALCHEMY_DATABASE_URI`
  - Example: `SQLALCHEMY_DATABASE_URI=sqlite:///feature_flags.db`

- **Issue:** "Port 5001 is already in use"
  - **Solution:** Change the port in `feature-flag/app.py` to another port (e.g., 5002)
  - Update `FEATURE_FLAG_SERVICE_URL` in backend `.env` accordingly

- **Issue:** "ModuleNotFoundError: No module named 'flask'"
  - **Solution:** Install dependencies: `pip install -r requirements.txt`
  - Ensure you're using the correct Python virtual environment

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


## Technologies Used

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **axios** - HTTP client for feature flag service communication
- **@google/generative-ai** - Google Gemini AI integration

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Create React App** - Build tooling

### Feature Flag Service
- **Flask** - Python web framework
- **Flask-SQLAlchemy** - Database ORM
- **SQLite/PostgreSQL/MySQL** - Database (SQLite for development)
- **python-dotenv** - Environment variable management

---

## Additional Notes

- The application uses JWT (JSON Web Tokens) for authentication
- Passwords are hashed using bcrypt before storing in the database
- The backend API runs on port 5000 by default
- The React development server runs on port 3000 by default
- The feature flag service runs on port 5001 by default
- CORS is enabled to allow frontend-backend communication
- Feature flags are checked during login/registration and stored in localStorage
- The AI chatbot feature is controlled by the `ai_chatbot` feature flag
- Feature flags support both global flags and user-specific overrides

---

**Happy Expense Tracking! 💰📊**

