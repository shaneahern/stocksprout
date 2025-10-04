# Authentication System

This document describes the authentication system implemented for FutureVest.

## Features Implemented

### 1. Account Creation & Login
- **Sign Up**: Users can create accounts with username, email, password, name, and optional bank account number
- **Sign In**: Users can log in with username and password
- **JWT Authentication**: Secure token-based authentication with 7-day expiration
- **Password Hashing**: Passwords are securely hashed using bcryptjs

### 2. Profile Management
- **Name Field**: Users have a required name field for their profile
- **Profile Picture**: Users can upload/set profile pictures via URL
- **Bank Account Number**: Prepopulated field for bank account information (optional)
- **Profile Editing**: Users can edit their profile information

### 3. Security Features
- **Protected Routes**: All main app routes require authentication
- **Token Validation**: JWT tokens are validated on protected endpoints
- **Password Requirements**: Minimum 6 character passwords
- **Input Validation**: All inputs are validated using Zod schemas

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login
- `GET /api/profile` - Get current user profile (requires auth)
- `PATCH /api/profile` - Update user profile (requires auth)

### Request/Response Examples

#### Signup
```json
POST /api/auth/signup
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "bankAccountNumber": "****1234"
}
```

#### Login
```json
POST /api/auth/login
{
  "username": "john_doe",
  "password": "securepassword123"
}
```

#### Profile Update
```json
PATCH /api/profile
Authorization: Bearer <jwt-token>
{
  "name": "John Smith",
  "profileImageUrl": "https://example.com/avatar.jpg",
  "bankAccountNumber": "****5678"
}
```

## Database Schema Updates

The `users` table has been updated with new fields:
- `name` (text, required) - User's full name
- `profile_image_url` (text, optional) - URL to profile picture
- `bank_account_number` (text, optional) - Bank account information

## Client-Side Implementation

### Components Created
- `AuthContext` - React context for authentication state management
- `LoginForm` - Login form component with validation
- `SignupForm` - Signup form component with validation
- `AuthPage` - Combined authentication page
- Updated `Profile` page with editing capabilities

### Protected Routes
All main application routes are now protected and require authentication:
- `/` - Home page
- `/profile` - User profile
- `/portfolio/:childId` - Portfolio view
- `/timeline/:childId` - Timeline view
- `/add-child` - Add child form

### Public Routes
- `/auth` - Authentication page (login/signup)
- `/gift/:giftCode` - Gift giving page (public)

## Environment Setup

Add the following environment variables:

```env
JWT_SECRET=your-super-secret-jwt-key-here
DATABASE_URL=postgresql://username:password@localhost:5432/futurevest
```

## Usage

1. **New Users**: Navigate to any protected route to be redirected to the auth page
2. **Sign Up**: Create account with required information
3. **Sign In**: Use username and password to log in
4. **Profile Management**: Edit profile information from the profile page
5. **Logout**: Use the logout button in the profile page

## Security Considerations

- Passwords are hashed with bcryptjs (10 rounds)
- JWT tokens expire after 7 days
- All user inputs are validated
- Sensitive data (passwords) are never returned in API responses
- Bank account numbers are stored but can be masked in display
