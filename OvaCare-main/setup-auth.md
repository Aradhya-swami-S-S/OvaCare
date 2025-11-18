# Authentication Setup Guide

## Backend Setup

1. **Install new dependencies:**
   ```bash
   cd backend
   npm install bcryptjs jsonwebtoken
   ```

2. **Start the backend server:**
   ```bash
   npm start
   # or if you have nodemon configured
   npx nodemon app.js
   ```

3. **Make sure MongoDB is running:**
   - Install MongoDB locally or use MongoDB Atlas
   - The app connects to `mongodb://127.0.0.1:27017/crowd-delivery`

## Frontend Setup

1. **Install dependencies (if not already installed):**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

## Features Implemented

### Backend Features:
- ✅ Secure password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Input validation and error handling
- ✅ Protected routes with middleware
- ✅ User registration and login endpoints
- ✅ Profile endpoint for authenticated users

### Frontend Features:
- ✅ Modern React authentication context
- ✅ TypeScript support with proper types
- ✅ Beautiful Tailwind CSS styling
- ✅ Form validation and error handling
- ✅ Protected routes with loading states
- ✅ User menu with logout functionality
- ✅ Responsive design for mobile and desktop
- ✅ Automatic token management

## API Endpoints

### Authentication
- `POST /register` - Register a new user
- `POST /login` - Login user
- `GET /profile` - Get user profile (protected)

### Request/Response Examples

**Register:**
```json
POST /register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Login:**
```json
POST /login
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## Security Features

1. **Password Security:**
   - Passwords are hashed using bcrypt with salt rounds
   - Plain text passwords are never stored

2. **JWT Tokens:**
   - Tokens expire in 24 hours
   - Include user ID and email in payload
   - Stored in localStorage and sent as Bearer tokens

3. **Input Validation:**
   - Email format validation
   - Password length requirements (minimum 6 characters)
   - Required field validation

4. **Error Handling:**
   - Proper HTTP status codes
   - User-friendly error messages
   - Server error logging

## Usage

1. Start both backend and frontend servers
2. Navigate to `http://localhost:5173` (or your Vite dev server port)
3. You'll be redirected to login page if not authenticated
4. Register a new account or login with existing credentials
5. Access protected routes after authentication
6. Use the user menu to logout

## Next Steps

Consider adding:
- Password reset functionality
- Email verification
- Remember me option
- Social login (Google, Facebook)
- Rate limiting for login attempts
- Refresh token mechanism