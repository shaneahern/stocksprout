# Sprout Requests - Contributor Management System

This document describes the Sprout Request system for inviting contributors to invest in children's accounts.

## Features Implemented

### 1. Adding Children (Minors)
- **Custodian Access**: Authenticated parents can add their children to the platform
- **Child Profile**: Each child has a name, age, birthday, and profile picture
- **Unique Gift Link**: Automatically generated gift link code for each child
- **User-Specific**: Children are associated with the authenticated parent's account

### 2. Sprout Requests (Contribution Invitations)
- **Request Creation**: Custodians can invite family/friends to contribute via SMS
- **Unique Request Codes**: Each request generates a unique code (format: SR-XXXXXXXX)
- **SMS Simulation**: Console logs simulate SMS delivery (ready for real SMS integration)
- **Personalized Messages**: Optional custom messages to contributors
- **Shareable Links**: Copy-paste links for contributors to sign up and contribute

### 3. Contributor Signup Through Sprout Requests
- **Seamless Onboarding**: Contributors can create accounts directly from invitation links
- **Guest Option**: Contributors can also proceed without creating an account
- **Auto-Association**: Account creation automatically links to the sprout request
- **Redirect to Gift**: After signup, users are redirected to make their contribution

## Database Schema

### Contributors Table
```sql
contributors {
  id: UUID (Primary Key)
  email: TEXT (Unique, Required)
  phone: TEXT
  name: TEXT (Required)
  password: TEXT (Optional until registered)
  is_registered: BOOLEAN (Default: false)
  created_at: TIMESTAMP
}
```

### Sprout Requests Table
```sql
sprout_requests {
  id: UUID (Primary Key)
  child_id: UUID (Foreign Key)
  parent_id: UUID (Foreign Key)
  contributor_email: TEXT
  contributor_phone: TEXT (Required)
  contributor_name: TEXT (Required)
  message: TEXT (Optional)
  request_code: TEXT (Unique, e.g., SR-ABCD1234)
  status: TEXT (pending|accepted|declined)
  created_at: TIMESTAMP
  responded_at: TIMESTAMP
}
```

## API Endpoints

### Sprout Request Management
- `POST /api/sprout-requests` - Create a new sprout request (authenticated)
- `GET /api/sprout-requests/parent/:parentId` - Get all requests by parent
- `GET /api/sprout-requests/code/:code` - Get request details by code (public)
- `PATCH /api/sprout-requests/:id/status` - Update request status

### Contributor Management
- `POST /api/contributors/signup` - Sign up as a contributor through sprout request

### Request/Response Examples

#### Create Sprout Request
```json
POST /api/sprout-requests
Authorization: Bearer <jwt-token>
{
  "childId": "uuid",
  "contributorPhone": "+1234567890",
  "contributorName": "John Doe",
  "contributorEmail": "john@example.com",
  "message": "Help us build Sarah's future!"
}

Response:
{
  "sproutRequest": { ... },
  "sproutLink": "https://app.com/sprout/SR-ABC12345",
  "message": "Sprout request created successfully"
}
```

#### Get Sprout Request (Public)
```json
GET /api/sprout-requests/code/SR-ABC12345

Response:
{
  "id": "uuid",
  "childId": "uuid",
  "contributorName": "John Doe",
  "contributorPhone": "+1234567890",
  "message": "Help us build Sarah's future!",
  "status": "pending",
  "child": {
    "id": "uuid",
    "name": "Sarah",
    "age": 8,
    "giftLinkCode": "FG-SAR-8TH"
  }
}
```

#### Contributor Signup
```json
POST /api/contributors/signup
{
  "email": "john@example.com",
  "name": "John Doe",
  "password": "securepass123",
  "phone": "+1234567890",
  "sproutRequestCode": "SR-ABC12345"
}

Response:
{
  "contributor": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "isRegistered": true
  },
  "token": "jwt-token"
}
```

## Client-Side Components

### Components Created
- `SproutRequestForm` - Dialog form for creating sprout requests
- `SproutRequestPage` - Landing page for contributors from SMS links

### User Flows

#### Custodian Flow (Sending Request)
1. Navigate to child's portfolio page
2. Click "Send Sprout Request" button
3. Fill in contributor details (name, phone, optional email/message)
4. Click "Send Request"
5. Receive shareable link and SMS simulation confirmation

#### Contributor Flow (Receiving Request)
1. Receive SMS with link (simulated in console)
2. Click link → Navigate to sprout request page
3. See child's profile and invitation details
4. Choose to:
   - Create account and contribute
   - Continue as guest
5. If creating account:
   - Enter email, password, and other details
   - Account automatically linked to request
   - Redirected to gift contribution page

## SMS Integration

The system is designed for easy SMS integration. Currently, SMS sending is simulated with console logs.

### To Integrate Real SMS:
1. Add Twilio or similar SMS service
2. Replace console.log in `/api/sprout-requests` endpoint:
```javascript
// Current (simulated):
console.log(`SMS would be sent to ${phone}: ${message}`);

// Replace with actual SMS service:
await twilioClient.messages.create({
  body: `Hi ${name}! You've been invited to contribute to a child's investment account. Click here: ${sproutLink}`,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: phone
});
```

## Security Features

- **Authentication Required**: Only authenticated parents can create sprout requests
- **Unique Codes**: Each request has a cryptographically random code
- **Status Tracking**: Tracks whether requests are pending, accepted, or declined
- **Password Hashing**: Contributor passwords are hashed with bcrypt
- **JWT Tokens**: Secure authentication for contributors

## Usage Examples

### For Custodians
1. **Add a Child**:
   - Go to Home → Click "Add Child"
   - Enter child's name, age, and birthday
   - Child is added to your account

2. **Send Sprout Request**:
   - Navigate to child's portfolio
   - Click "Send Sprout Request"
   - Enter contributor information
   - Share the generated link

### For Contributors
1. **Receive Invitation**:
   - Receive SMS with sprout request link
   - Click link to view invitation

2. **Sign Up**:
   - Click "Create Account & Contribute"
   - Fill in registration details
   - Account is created and linked to request

3. **Make Contribution**:
   - Automatically redirected to gift page
   - Select investment and amount
   - Complete contribution

## Future Enhancements

- **Real SMS Integration**: Connect to Twilio/SendGrid
- **Email Notifications**: Send email alongside SMS
- **Request History**: View past sprout requests and their status
- **Reminder System**: Automatic follow-up reminders
- **Contribution Tracking**: Track contributions per contributor
- **Thank You System**: Automated thank you messages after contributions
