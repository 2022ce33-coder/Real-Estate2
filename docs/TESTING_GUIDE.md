# Email Verification - Testing Guide

## 🧪 Complete Testing Workflow

This guide shows how to test the email verification system step-by-step using curl, Postman, or any HTTP client.

---

## 📋 Prerequisites

- Backend server running on `http://localhost:3001`
- Database with migration applied
- Email access to verify codes
- Resend API working (check Resend dashboard)

---

## 🔍 Test Scenario 1: Happy Path (User Registration → Verification → Login)

### Step 1: Register New User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@gmail.com",
    "password": "TestPassword123",
    "name": "Test User",
    "phone": "03001234567",
    "userType": "user"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email using the code sent to you.",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "requiresVerification": true
}
```

**What Happens:**
- ✅ User record created in database
- ✅ 6-digit code generated (e.g., 123456)
- ✅ Code stored with 15-minute expiry
- ✅ Email sent to testuser@gmail.com with code
- ✅ Browser console: "✓ Verification email sent"

---

### Step 2: Check Email
Go to `testuser@gmail.com` email inbox and look for email from Resend with subject:
```
Aura Home - Email Verification Code
```

The email contains:
- Greeting with user's name
- Large 6-digit code (e.g., 123456)
- Expiry info (15 minutes)

⏱️ **Remember**: The code is valid for only 15 minutes!

---

### Step 3: Verify Email with Code
```bash
curl -X POST http://localhost:3001/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@gmail.com",
    "verificationCode": "123456",
    "userType": "user"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Email verified successfully. You can now login."
}
```

**What Happens:**
- ✅ Code validated against code in database
- ✅ Expiry time checked (must be within 15 min)
- ✅ `email_verified` set to `true` in database
- ✅ Code cleared from database

---

### Step 4: Login with Verified Email
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@gmail.com",
    "password": "TestPassword123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImVtYWlsIjoidGVzdHVzZXJAZ21haWwuY29tIiwibmFtZSI6IlRlc3QgVXNlciIsInR5cGUiOiJ1c2VyIiwiaWF0IjoxNTk0MzUyMDAwLCJleHAiOjE1OTQ5NTY4MDB9.KmWp4LUkNp_qKXXrYkGs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Test User",
    "email": "testuser@gmail.com",
    "phone": "03001234567",
    "type": "user"
  }
}
```

**What Happens:**
- ✅ Email and password validated
- ✅ Email verification status checked
- ✅ JWT token generated
- ✅ User data returned

---

## 🔍 Test Scenario 2: Wrong Code

### Register User (Same as Step 1)
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrongcode@gmail.com",
    "password": "TestPassword123",
    "name": "Wrong Code Test",
    "phone": "03001234567",
    "userType": "user"
  }'
```

### Try Wrong Code
```bash
curl -X POST http://localhost:3001/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrongcode@gmail.com",
    "verificationCode": "000000",
    "userType": "user"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid verification code"
}
```

---

## 🔍 Test Scenario 3: Expired Code

### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "expiredcode@gmail.com",
    "password": "TestPassword123",
    "name": "Expired Code Test",
    "phone": "03001234567",
    "userType": "user"
  }'
```

### Wait 15+ Minutes
⏱️ Wait 15 minutes for code to expire (or manually test by updating DB)

### Try to Verify with Old Code
```bash
curl -X POST http://localhost:3001/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "expiredcode@gmail.com",
    "verificationCode": "123456",
    "userType": "user"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Verification code has expired"
}
```

---

## 🔍 Test Scenario 4: Resend Code

### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "resendcode@gmail.com",
    "password": "TestPassword123",
    "name": "Resend Code Test",
    "phone": "03001234567",
    "userType": "user"
  }'
```

### Resend Code
```bash
curl -X POST http://localhost:3001/api/auth/resend-verification-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "resendcode@gmail.com",
    "userType": "user"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Verification code sent to your email"
}
```

**What Happens:**
- ✅ New 6-digit code generated
- ✅ New 15-minute timer started
- ✅ Old code replaced in database
- ✅ New email sent with new code

### Verify with New Code
Check email for new code and verify:
```bash
curl -X POST http://localhost:3001/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "resendcode@gmail.com",
    "verificationCode": "654321",
    "userType": "user"
  }'
```

---

## 🔍 Test Scenario 5: Login Without Email Verification

### Register User (Code NOT verified)
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "noverify@gmail.com",
    "password": "TestPassword123",
    "name": "No Verify Test",
    "phone": "03001234567",
    "userType": "user"
  }'
```

### Try to Login WITHOUT Verifying
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "noverify@gmail.com",
    "password": "TestPassword123"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Email not verified. Please check your email for the verification code.",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "requiresVerification": true,
  "userType": "user"
}
```

**What Happens:**
- ❌ Login blocked because email not verified
- ✅ Returns userId so frontend can show verification screen
- ✅ Returns userType for proper endpoint routing

---

## 🔍 Test Scenario 6: Agent Registration

### Register Agent
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent123@gmail.com",
    "password": "AgentPass123",
    "name": "Agent Name",
    "phone": "03001234567",
    "userType": "agent",
    "agency": "Real Estate Agency",
    "experience": 5,
    "cnic": "12345-1234567-1",
    "address": "123 Agent Street, Lahore"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Agent application submitted successfully. Please verify your email using the code sent to you.",
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "requiresVerification": true
}
```

### Verify Agent Email
```bash
curl -X POST http://localhost:3001/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent123@gmail.com",
    "verificationCode": "789456",
    "userType": "agent"
  }'
```

---

## 🔍 Test Scenario 7: Password Reset (Resend Email)

### Request Password Reset
```bash
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "testuser@gmail.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password reset link sent to your email."
}
```

**What Happens:**
- ✅ Reset token generated
- ✅ Token stored with 15-minute expiry
- ✅ Email sent via Resend with reset link
- ✅ Email has professional formatting

---

## 🔍 Test Scenario 8: Database Verification

### Check User Verification Status in Database

```sql
-- Check user email_verified status
SELECT id, email, email_verified, verification_code, verification_code_expires 
FROM users 
WHERE email = 'testuser@gmail.com';

-- Should show:
-- id: 550e8400-e29b-41d4-a716-446655440000
-- email: testuser@gmail.com
-- email_verified: 1 (after verification) or 0 (before)
-- verification_code: NULL (after verification) or "123456" (before)
-- verification_code_expires: NULL (after verification) or datetime (before)
```

---

## 📊 Testing Checklist

Use this checklist to verify all functionality:

### Registration
- [ ] New user register endpoint works
- [ ] New agent register endpoint works
- [ ] Email sent with verification code
- [ ] Code is 6 digits
- [ ] User marked as `email_verified = false`
- [ ] Code stored in database with expiry

### Email Verification
- [ ] Correct code marked email as verified
- [ ] Incorrect code returns error
- [ ] Expired code returns error
- [ ] Already verified returns error
- [ ] Code cleared from database after verification

### Resend Code
- [ ] New code generated
- [ ] New email sent
- [ ] Old code invalidated
- [ ] 15-minute timer reset
- [ ] New code works for verification

### Login
- [ ] Verified user can login
- [ ] Unverified user blocked with error
- [ ] Error response includes userId
- [ ] JWT token generated for verified users
- [ ] Wrong password still returns error

### Password Reset
- [ ] Reset email sent
- [ ] Email uses Resend (not Nodemailer)
- [ ] Reset link is valid
- [ ] Reset link expires after 15 minutes

### Database
- [ ] New columns exist in users table
- [ ] New columns exist in agent_applications table
- [ ] Agents table has email_verified = true by default
- [ ] Verification codes stored correctly
- [ ] Expired codes cleared

---

## 🔧 Debugging Tips

### Enable Detailed Logging
User the browser console to watch requests:
```javascript
// In browser console
fetch('/api/auth/register', {...}).then(r => r.json()).then(console.log)
```

### Check Server Logs
Watch for messages like:
```
✓ Verification email sent to testuser@gmail.com
```

### Check Resend Dashboard
1. Go to https://resend.com/dashboard
2. Check "Emails" section
3. Look for emails sent to your test address
4. Check delivery status

### Manual Database Inspection
```sql
-- View all unverified users
SELECT email, email_verified, verification_code_expires 
FROM users 
WHERE email_verified = 0;

-- View expired codes
SELECT email, verification_code_expires 
FROM users 
WHERE verification_code_expires < NOW();
```

---

## 📱 Postman Collection Template

```json
{
  "info": {
    "name": "Email Verification APIs",
    "description": "Complete test suite for email verification"
  },
  "item": [
    {
      "name": "Register User",
      "request": {
        "method": "POST",
        "url": "http://localhost:3001/api/auth/register",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"test@gmail.com\",\"password\":\"Test123\",\"name\":\"Test User\",\"phone\":\"03001234567\",\"userType\":\"user\"}"
        }
      }
    },
    {
      "name": "Verify Email",
      "request": {
        "method": "POST",
        "url": "http://localhost:3001/api/auth/verify-email",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"test@gmail.com\",\"verificationCode\":\"123456\",\"userType\":\"user\"}"
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:3001/api/auth/login",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"test@gmail.com\",\"password\":\"Test123\"}"
        }
      }
    }
  ]
}
```

---

## 📞 Common Issues & Solutions

| Issue | Check | Fix |
|-------|-------|-----|
| Email not received | Spam folder, Resend dashboard | Check Resend logs, resend code |
| Code expired | 15+ minutes passed | Request new code |
| Wrong code error | Typed correctly? | Get code from email, try again |
| DB error | Migration run? | Execute migrations_email_verification.sql |
| Cannot login verified | Email really verified? | Check DB: `SELECT email_verified FROM users` |

---

**Last Updated**: February 10, 2026  
**Version**: 1.0

