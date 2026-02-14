# Email Verification & Resend Integration Guide

## Overview
This document outlines the new email verification system using Resend email service for the Aura Home platform.

## Changes Made

### 1. Email Service Migration
- **Replaced**: Nodemailer (Gmail) → Resend (Transactional Email Service)
- **Benefits**: 
  - More reliable delivery
  - Better email templates
  - Built-in analytics
  - No need to expose email credentials

### 2. Database Schema Updates

#### New Fields Added:

**users table:**
- `email_verified` (BOOLEAN, DEFAULT: false) - Email verification status
- `verification_code` (VARCHAR(6)) - 6-digit verification code
- `verification_code_expires` (DATETIME) - Code expiry timestamp

**agent_applications table:**
- `email_verified` (BOOLEAN, DEFAULT: false) - Email verification status
- `verification_code` (VARCHAR(6)) - 6-digit verification code
- `verification_code_expires` (DATETIME) - Code expiry timestamp

**agents table:**
- `password_hash` (VARCHAR(255)) - Password hash for approved agents
- `email_verified` (BOOLEAN, DEFAULT: true) - Always verified for approved agents

### 3. Registration Flow (User & Agent)

```
User Signs Up
    ↓
Server generates 6-digit code
    ↓
Server sends code via Resend email
    ↓
Code stored in DB with 15-min expiry
    ↓
User receives email with code
    ↓
User enters code in verification screen
    ↓
Server verifies code
    ↓
Email marked as verified
    ↓
User can now login
```

### 4. New API Endpoints

#### POST `/api/auth/register`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "03001234567",
  "userType": "user",
  // For agents only:
  "agency": "Agency Name",
  "experience": 5,
  "cnic": "12345-1234567-1",
  "address": "123 Street Name",
  "attachments": []
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email using the code sent to you.",
  "userId": "uuid-here",
  "requiresVerification": true
}
```

---

#### POST `/api/auth/verify-email`
Verify email with 6-digit code

**Request:**
```json
{
  "email": "user@example.com",
  "verificationCode": "123456",
  "userType": "user"  // or "agent"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Email verified successfully. You can now login."
}
```

**Response (Error - Not Verified):**
```json
{
  "success": false,
  "error": "Email not verified. Please check your email for the verification code.",
  "requiresVerification": true
}
```

---

#### POST `/api/auth/resend-verification-code`
Resend verification code if the original expired

**Request:**
```json
{
  "email": "user@example.com",
  "userType": "user"  // or "agent"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent to your email"
}
```

---

#### POST `/api/auth/login`
Login with email and password

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success - Verified):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "03001234567",
    "type": "user"
  }
}
```

**Response (Error - Not Verified):**
```json
{
  "success": false,
  "error": "Email not verified. Please check your email for the verification code.",
  "userId": "user-uuid",
  "requiresVerification": true,
  "userType": "user"
}
```

---

#### POST `/api/auth/forgot-password`
Request password reset (now uses Resend)

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset link sent to your email."
}
```

---

## Frontend Implementation Example

### Registration with Verification
```javascript
// Step 1: Register
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe',
    phone: '03001234567',
    userType: 'user'
  })
});

const registerData = await registerResponse.json();

if (registerData.success && registerData.requiresVerification) {
  // Show verification screen
  showVerificationScreen(registerData.userId);
}

// Step 2: Verify Email (user enters 6-digit code)
const verifyResponse = await fetch('/api/auth/verify-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    verificationCode: userEnteredCode, // e.g., "123456"
    userType: 'user'
  })
});

const verifyData = await verifyResponse.json();

if (verifyData.success) {
  // Show success message and redirect to login
  showMessage('Email verified! You can now login.');
  redirectToLogin();
}

// Step 3: Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const loginData = await loginResponse.json();

if (loginData.success) {
  // Save token and redirect to dashboard
  localStorage.setItem('token', loginData.token);
  redirectToDashboard();
} else if (loginData.requiresVerification) {
  // Show verification screen again
  showVerificationScreen(loginData.userId);
}
```

### Resend Verification Code
```javascript
const resendResponse = await fetch('/api/auth/resend-verification-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    userType: 'user'
  })
});

const resendData = await resendResponse.json();
if (resendData.success) {
  showMessage('New verification code sent to your email');
}
```

## Database Migration

Run the migration file to add Email verification columns:

```sql
-- For new installations, the columns are already in database_schema.sql

-- For existing installations, run:
-- migrations_email_verification.sql

-- To mark existing users as verified:
UPDATE users SET email_verified = true WHERE id = 'user_id_here';
UPDATE agent_applications SET email_verified = true WHERE id = 'agent_id_here';
UPDATE agents SET email_verified = true;
```

## Environment Setup

### Resend Configuration
1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Update the Resend initialization in server.js:
   ```javascript
   const resend = new Resend('re_YOUR_API_KEY_HERE');
   ```

### Email Configuration
- **From Email**: `onboarding@resend.dev` (default Resend sandbox)
- **Custom Domain**: You can use your own domain with Resend for production

## Important Notes

1. **Code Expiry**: Verification codes expire after **15 minutes**
2. **Code Format**: 6-digit numeric code (e.g., 123456)
3. **Email Verification Required**: Users cannot login until email is verified
4. **Existing Users**: Manually mark existing users as verified via database if needed
5. **Admin Account**: Demo admin account (dummy@gmail.com) is not affected by verification

## Troubleshooting

### Issue: "Verification code has expired"
- **Solution**: Click "Resend Code" to get a new code

### Issue: "Email not verified. Please check your email for the verification code"
- **Solution**: Check spam folder and click verification link or enter code manually

### Issue: Email not receiving verification code
- **Solution**: 
  - Check Resend API key is correct
  - Verify email address is spelled correctly
  - Check spam/junk folder
  - Request code to be resent

### Issue: Wrong verification code message
- **Solution**: Ensure you're entering exactly 6 digits with no spaces or dashes

## Security Considerations

1. **Verification codes** are stored with expiry timestamps
2. **Codes are cleared** after successful verification
3. **Password reset tokens** also use time-based expiry (15 minutes)
4. **Resend** provides additional security and spam protection
5. **Email verification** prevents account takeover and fake registrations

## Future Enhancements

- [ ] Implement rate limiting on code verification attempts
- [ ] Add email verification reminder after 7 days
- [ ] Implement SMS backup verification option
- [ ] Add two-factor authentication (2FA)
- [ ] Custom email templates with brand colors
- [ ] Email delivery analytics dashboard
