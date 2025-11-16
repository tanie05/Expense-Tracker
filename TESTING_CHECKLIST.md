# Authentication & Security Testing Checklist

This document provides a comprehensive checklist for testing all the security fixes and improvements implemented in the Expense Tracker application.

## Prerequisites

1. **Environment Setup**
   - [ ] Create `.env` file in backend directory with required variables:
     - `MONGO_URL` - MongoDB connection string
     - `JWT_SECRET` - Secret key for JWT tokens
     - `PORT` - Server port (optional, defaults to 5000)
     - `CLIENT_URL` - Frontend URL (e.g., http://localhost:3000)
   
2. **Install Dependencies**
   ```bash
   cd backend && npm install
   cd ../client && npm install
   ```

3. **Start Services**
   - [ ] Start MongoDB service
   - [ ] Start backend: `cd backend && npm run dev`
   - [ ] Start frontend: `cd client && npm start`

## Phase 1: Backend Authentication Tests

### Test 1.1: Registration Validation
- [ ] Try to register without username → Should show "Username is required"
- [ ] Try to register without email → Should show "Email is required"
- [ ] Try to register with invalid email format → Should show "Invalid email format"
- [ ] Try to register without password → Should show "Password is required"
- [ ] Try to register with password < 6 characters → Should show password length error
- [ ] Try to register with valid data → Should succeed and return token
- [ ] Try to register with same username → Should show "Already registered"
- [ ] Try to register with same email → Should show "Email already registered"

### Test 1.2: Login Validation
- [ ] Try to login without credentials → Should show 400 error
- [ ] Try to login with non-existent username → Should show 401 error
- [ ] Try to login with wrong password → Should show 401 error
- [ ] Login with correct credentials → Should succeed and return token
- [ ] Verify token is stored in localStorage

### Test 1.3: Rate Limiting
- [ ] Make 6+ login attempts in 15 minutes → Should get 429 error after 5 attempts
- [ ] Make 6+ registration attempts in 15 minutes → Should get 429 error after 5 attempts
- [ ] Wait 15 minutes and try again → Should work

### Test 1.4: JWT Token Authentication
- [ ] Try to access transactions without token → Should get 401 error
- [ ] Try to access transactions with invalid token → Should get 401 error
- [ ] Try to access transactions with valid token → Should succeed
- [ ] Try to create transaction without token → Should get 401 error
- [ ] Try to delete transaction without token → Should get 401 error
- [ ] Try to update transaction without token → Should get 401 error

## Phase 2: Frontend Token Management Tests

### Test 2.1: Login Flow
- [ ] Login successfully → Token should be stored in localStorage
- [ ] Check localStorage for 'token' key → Should exist
- [ ] Check localStorage for 'user' key → Should exist
- [ ] Verify redirect to home page after login

### Test 2.2: Registration Flow
- [ ] Register successfully → Token should be stored in localStorage
- [ ] Check localStorage for 'token' key → Should exist
- [ ] Check localStorage for 'user' key → Should exist
- [ ] Verify redirect to home page after registration

### Test 2.3: Protected Routes
- [ ] Try to access home page without login → Should work
- [ ] Try to create transaction without login → Should show "Login to create a transaction"
- [ ] Try to view transactions without login → Should work but show no data
- [ ] Login and create transaction → Should work
- [ ] Login and view transactions → Should show user's transactions only
- [ ] Login and delete transaction → Should work
- [ ] Login and edit transaction → Should work

### Test 2.4: Token Expiration Handling
- [ ] Manually delete token from localStorage → Next API call should redirect to login
- [ ] Use expired token (modify JWT_SECRET temporarily) → Should redirect to login
- [ ] Login again after token expiration → Should work

## Phase 3: Transaction Validation Tests

### Test 3.1: Create Transaction Validation
- [ ] Try to create transaction with amount = 0 → Should show error
- [ ] Try to create transaction with negative amount → Should show error
- [ ] Try to create transaction without category → Should show error
- [ ] Try to create transaction with invalid type → Should show error
- [ ] Try to create transaction with valid data → Should succeed

### Test 3.2: Update Transaction Validation
- [ ] Try to update transaction with amount = 0 → Should show error
- [ ] Try to update transaction with negative amount → Should show error
- [ ] Try to update transaction with empty category → Should show error
- [ ] Try to update transaction with invalid type → Should show error
- [ ] Try to update transaction with valid data → Should succeed

### Test 3.3: XSS Prevention
- [ ] Try to create category with `<script>alert('xss')</script>` → Should be sanitized
- [ ] Try to create category with `<img src=x onerror=alert('xss')>` → Should be sanitized
- [ ] Verify no script tags are executed in the UI

## Phase 4: UI/UX Tests

### Test 4.1: Loading States
- [ ] Login → Button should show "Logging in..." and be disabled
- [ ] Register → Button should show "Registering..." and be disabled
- [ ] Create transaction → Button should show "Processing..." and be disabled
- [ ] Edit transaction → Button should show "Processing..." and be disabled

### Test 4.2: Form Validation
- [ ] Registration form email input → Should have type="email"
- [ ] Registration form email input → Should require valid email format
- [ ] Registration form username → Should require minimum 3 characters
- [ ] Registration form password → Should require minimum 6 characters
- [ ] All required fields → Should have required attribute

### Test 4.3: Navigation
- [ ] Login success → Should use React Router navigation (no page reload)
- [ ] Registration success → Should use React Router navigation (no page reload)
- [ ] Transaction edit → Should navigate to /view after save
- [ ] Transaction delete → Should refresh list without page reload

## Phase 5: Security Tests

### Test 5.1: CORS Configuration
- [ ] Try to access API from unauthorized origin → Should fail
- [ ] Access API from CLIENT_URL → Should succeed
- [ ] Verify credentials are included in requests

### Test 5.2: Database Connection
- [ ] Server should not start if MongoDB connection fails
- [ ] Server should log connection success message
- [ ] Server should validate environment variables on startup

### Test 5.3: Password Security
- [ ] Passwords should be hashed in database (not plain text)
- [ ] Password should not be returned in API responses
- [ ] User object should only contain id, username, and email

### Test 5.4: Authorization
- [ ] User A should not see User B's transactions
- [ ] User A should not be able to delete User B's transactions
- [ ] User A should not be able to edit User B's transactions
- [ ] GET /transactions/:username should only return requesting user's data

## Phase 6: Error Handling Tests

### Test 6.1: Backend Error Responses
- [ ] All errors should return consistent JSON format: `{success: false, message: "..."}`
- [ ] Validation errors should return 400 status code
- [ ] Authentication errors should return 401 status code
- [ ] Not found errors should return 404 status code
- [ ] Server errors should return 500 status code
- [ ] Rate limit errors should return 429 status code

### Test 6.2: Frontend Error Handling
- [ ] Network errors should show user-friendly messages
- [ ] API errors should display server error messages
- [ ] Invalid token should clear localStorage and redirect to login
- [ ] Failed operations should not crash the application

## Phase 7: Performance Tests

### Test 7.1: Database Queries
- [ ] Transaction queries should filter by username at database level
- [ ] No client-side filtering of all transactions
- [ ] Queries should use indexes (username field)

### Test 7.2: Memory Leaks
- [ ] Navigate between pages → No memory leaks
- [ ] Mount/unmount components → useEffect cleanup should work
- [ ] Rapid navigation → No duplicate API calls

## Summary Checklist

### Critical Security Items
- [ ] All transaction routes are protected with JWT authentication
- [ ] Passwords are hashed and never exposed in responses
- [ ] Rate limiting is active on auth endpoints
- [ ] Input validation prevents injection attacks
- [ ] XSS prevention through input sanitization
- [ ] CORS configured with specific allowed origins
- [ ] Environment variables are validated on startup

### User Experience Items
- [ ] Loading states on all forms
- [ ] Proper error messages displayed
- [ ] No page reloads for navigation
- [ ] Form validation with HTML5 attributes
- [ ] Responsive error handling

### Code Quality Items
- [ ] Consistent import statements across all files
- [ ] No commented-out code
- [ ] Proper error handling in all async functions
- [ ] useEffect cleanup functions implemented
- [ ] Consistent HTTP status codes

## Notes for Testing

1. **Testing Rate Limiting**: Use different browsers or incognito mode to test from different IPs
2. **Testing JWT**: Use browser dev tools → Application → Local Storage
3. **Testing CORS**: Use a tool like Postman with different Origin headers
4. **Testing Database Queries**: Check MongoDB logs or use MongoDB Compass
5. **Testing XSS**: Open browser console to check for executed scripts

## Manual API Testing with curl

### Register User
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

### Login User
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

### Get Transactions (with token)
```bash
curl http://localhost:5000/transactions/testuser \
  -H "Authorization: YOUR_JWT_TOKEN_HERE"
```

### Create Transaction (with token)
```bash
curl -X POST http://localhost:5000/transactions/add \
  -H "Content-Type: application/json" \
  -H "Authorization: YOUR_JWT_TOKEN_HERE" \
  -d '{"username":"testuser","amount":100,"category":"food","type":"expense","date":"2024-01-01"}'
```

## Completion

Once all tests pass, the application is ready for deployment. Make sure to:
- [ ] Update documentation with any findings
- [ ] Document any known issues or limitations
- [ ] Review and update security practices regularly
- [ ] Set up monitoring for production environment

