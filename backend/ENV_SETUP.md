# Environment Variables Setup

Create a `.env` file in the `backend` directory with the following variables:

## Required Variables

### MONGO_URL
MongoDB connection string for your database.

Example:
```
MONGO_URL=mongodb://localhost:27017/expense-tracker
```

### JWT_SECRET
Secret key for JWT token generation and verification.

Example:
```
JWT_SECRET=your-secure-jwt-secret-key-here
```

### GEMINI_API_KEY
Google Gemini API key for the AI chat assistant.

To obtain your API key:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your .env file

Example:
```
GEMINI_API_KEY=your-gemini-api-key-here
```

## Optional Variables

### PORT
Server port number (defaults to 5000 if not specified).

Example:
```
PORT=5000
```

### CLIENT_URL
Client URL(s) for CORS configuration (defaults to http://localhost:3000).
For multiple origins, use comma-separated values.

Example:
```
CLIENT_URL=http://localhost:3000,http://localhost:3001
```

## Complete .env File Template

```env
MONGO_URL=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your-secure-jwt-secret-key-here
GEMINI_API_KEY=your-gemini-api-key-here
PORT=5000
CLIENT_URL=http://localhost:3000
```

## Security Note

Never commit your `.env` file to version control. Make sure `.env` is listed in your `.gitignore` file.

