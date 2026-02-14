# Quick Reference: Email Verification APIs

## 🎯 Quick Links
- **Full Setup Guide**: `docs/EMAIL_VERIFICATION_SETUP.md`
- **Implementation Guide**: `docs/IMPLEMENTATION_GUIDE.md`  
- **Email Component**: `src/components/auth/EmailVerification.tsx`

---

## 📝 API Reference (Cheat Sheet)

### 1️⃣ Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "phone": "03001234567",
    "userType": "user"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email using the code sent to you.",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "requiresVerification": true
}
```

---

### 2️⃣ Verify Email (6-Digit Code)
```bash
curl -X POST http://localhost:3001/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "verificationCode": "123456",
    "userType": "user"
  }'
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Email verified successfully. You can now login."
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid verification code"
}
```

**Possible Errors:**
- `"Invalid verification code"` - Wrong code entered
- `"Verification code has expired"` - Code older than 15 minutes
- `"Email already verified"` - Email already verified
- `"User not found"` - Email not in system

---

### 3️⃣ Resend Verification Code
```bash
curl -X POST http://localhost:3001/api/auth/resend-verification-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "userType": "user"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent to your email"
}
```

---

### 4️⃣ Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Response (Verified Email):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "03001234567",
    "type": "user"
  }
}
```

**Response (Not Verified Email):**
```json
{
  "success": false,
  "error": "Email not verified. Please check your email for the verification code.",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "requiresVerification": true,
  "userType": "user"
}
```

---

### 5️⃣ Agent Registration
Same as user registration but with additional fields:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@example.com",
    "password": "password123",
    "name": "Agent Name",
    "phone": "03001234567",
    "userType": "agent",
    "agency": "Agency Name",
    "experience": 5,
    "cnic": "12345-1234567-1",
    "address": "123 Street Name",
    "attachments": []
  }'
```

---

### 6️⃣ Forgot Password
```bash
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset link sent to your email."
}
```

---

## 🎨 Frontend Component Usage

```jsx
import { EmailVerification } from '@/components/auth/EmailVerification';

<EmailVerification
  email="user@example.com"
  userId="550e8400-e29b-41d4-a716-446655440000"
  userType="user"
  onVerificationSuccess={() => {
    // Handle success - usually redirect to login
    window.location.href = '/login';
  }}
/>
```

---

## ⚙️ Configuration

### Resend API Key (in server.js)
```javascript
const resend = new Resend('re_K4QYkqMF_aiFCHi51vnFoLEUwaDFV3RMv');
```

### Code Validity
- **Duration**: 15 minutes
- **Retries**: Unlimited (can resend)
- **Format**: 6 digits (000000 - 999999)

---

## 🔄 Common Flows

### Register → Verify → Login (New User)
```javascript
// 1. Register
POST /api/auth/register
← { requiresVerification: true, userId: "..." }

// 2. Verify Email
POST /api/auth/verify-email (user enters 6-digit code)
← { success: true }

// 3. Login
POST /api/auth/login
← { success: true, token: "..." }
```

### Login Without Verification
```javascript
// User tries to login with unverified email
POST /api/auth/login
← { requiresVerification: true, userId: "..." }

// Show verification screen
POST /api/auth/verify-email (user enters code)
← { success: true }

// User can now login
POST /api/auth/login
← { success: true, token: "..." }
```

### Resend Code (Expired)
```javascript
// Code expired, user clicks resend
POST /api/auth/resend-verification-code
← { success: true, message: "Code sent" }

// User enters new code
POST /api/auth/verify-email
← { success: true }
```

---

## 🧪 Test Data

| Field | Value | Notes |
|-------|-------|-------|
| Email | test@example.com | Any valid email |
| Password | password123 | Min 6 characters |
| Name | John Doe | User full name |
| Phone | 03001234567 | Pakistan format |
| User Type | user \| agent | For registration |
| Code | 000000-999999 | 6 digits |
| Admin Email | dummy@gmail.com | Hardcoded admin |
| Admin Pass | asd123 | Hardcoded admin |

---

## 📊 Database Fields

### Users Table
```sql
- id (UUID, Primary Key)
- name (TEXT)
- email (VARCHAR, UNIQUE)
- phone (VARCHAR)
- password_hash (VARCHAR)
- email_verified (BOOLEAN, DEFAULT: false) ✨
- verification_code (VARCHAR(6)) ✨
- verification_code_expires (DATETIME) ✨
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Agent Applications Table
```sql
- id (UUID, Primary Key)
- name (TEXT)
- email (TEXT)
- phone (TEXT)
- agency (TEXT)
- experience (INTEGER)
- cnic (TEXT)
- address (TEXT)
- password_hash (VARCHAR)
- attachments (JSON)
- email_verified (BOOLEAN, DEFAULT: false) ✨
- verification_code (VARCHAR(6)) ✨
- verification_code_expires (DATETIME) ✨
- status (VARCHAR, DEFAULT: pending)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

✨ = New fields added

---

## 🚀 Quick Start (Developer)

1. **Backend Ready** ✅
   ```bash
   npm install  # Already includes resend
   # DB migration run or use database_schema.sql
   npm start    # Server running
   ```

2. **Test Endpoints**
   ```bash
   # Register new user
   curl -X POST http://localhost:3001/api/auth/register ...
   
   # Check your email for code
   
   # Verify email
   curl -X POST http://localhost:3001/api/auth/verify-email ...
   
   # Login
   curl -X POST http://localhost:3001/api/auth/login ...
   ```

3. **Frontend Integration**
   - Copy `EmailVerification` component
   - Update register/login pages
   - Test end-to-end

---

## ❌ Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "User not found" | Email not in DB | Register first |
| "Invalid verification code" | Wrong code entered | Check email for correct code |
| "Verification code has expired" | Code older than 15 min | Click resend code |
| "Email already verified" | Trying to verify twice | Just login |
| "Invalid credentials" | Wrong password | Check password |
| "Email and password required" | Missing fields | Fill all fields |
| "Missing required fields" | Incomplete registration | Fill all fields |
| "Email already registered" | Email exists | Use different email |

---

## 📈 Success Metrics

After implementation, you should see:
- ✅ All new users get verification email
- ✅ All registrations require email verification
- ✅ Login fails without verified email
- ✅ Password reset emails work via Resend
- ✅ Code resend works within 15-min window
- ✅ Verified users can login successfully

---

## 📞 Support Resources

- **API Docs**: `docs/EMAIL_VERIFICATION_SETUP.md`
- **Implementation**: `docs/IMPLEMENTATION_GUIDE.md`
- **Component**: `src/components/auth/EmailVerification.tsx`
- **Server**: `server.js` (lines with "verification")

---

**Last Updated**: February 10, 2026  
**Version**: 1.0  
**Status**: ✅ Ready for Frontend Integration

