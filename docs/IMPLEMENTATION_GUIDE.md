# Email Verification Implementation Guide

## Backend Changes Summary ✅

All backend changes have been completed:

- ✅ **Replaced** Nodemailer with Resend email service
- ✅ **Added** 6-digit verification code system
- ✅ **Created** Email verification endpoints
- ✅ **Updated** Registration endpoints to send verification codes
- ✅ **Updated** Login endpoints to check email verification status
- ✅ **Database schema** updated with verification fields
- ✅ **Installed** Resend package (`npm install resend`)

---

## Frontend Implementation Required

### 1. Update Registration Component

**Current Flow:**
```
Register → User logged in (❌ INCORRECT - needs verification first)
```

**New Flow:**
```
Register → Verify Email (6-digit code) → Login → Dashboard
```

### 2. Steps to Implement

#### Step 1: Add EmailVerification Component
The component has been created at:
```
src/components/auth/EmailVerification.tsx
```

Use it in your registration flow:
```jsx
import { EmailVerification } from '@/components/auth/EmailVerification';

function RegisterFlow() {
  const [needsVerification, setNeedsVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [userType, setUserType] = useState('user');

  const handleRegisterSuccess = (data) => {
    if (data.requiresVerification) {
      setUserEmail(data.email);
      setUserId(data.userId);
      setUserType(data.userType);
      setNeedsVerification(true);
    }
  };

  const handleVerificationSuccess = () => {
    // Redirect to login screen
    window.location.href = '/login';
  };

  return (
    <>
      {needsVerification ? (
        <EmailVerification 
          email={userEmail}
          userId={userId}
          userType={userType}
          onVerificationSuccess={handleVerificationSuccess}
        />
      ) : (
        <RegistrationForm onSuccess={handleRegisterSuccess} />
      )}
    </>
  );
}
```

#### Step 2: Update Registration Form
```jsx
async function handleRegister(formData) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });

  const data = await response.json();

  if (data.success && data.requiresVerification) {
    // Show verification screen
    props.onSuccess({
      ...data,
      email: formData.email,
      userType: formData.userType
    });
  } else if (!data.success) {
    // Show error
    setError(data.error);
  }
}
```

#### Step 3: Update Login Component
Handle the new error response when email is not verified:

```jsx
async function handleLogin(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (data.success) {
    // Login successful
    localStorage.setItem('token', data.token);
    window.location.href = '/dashboard';
  } else if (data.requiresVerification) {
    // Show verification screen
    showVerificationModal({
      email,
      userId: data.userId,
      userType: data.userType
    });
  } else {
    // Show login error
    setError(data.error);
  }
}
```

#### Step 4: Create Verification Modal/Page
```jsx
export function VerificationModal({ email, userId, userType, onClose }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <EmailVerification
          email={email}
          userId={userId}
          userType={userType}
          onVerificationSuccess={() => {
            onClose();
            window.location.href = '/login';
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
```

### 3. Update React Routes

Ensure these routes exist in your routing configuration:
```jsx
import Register from '@/pages/Register';
import Login from '@/pages/Login';
import EmailVerification from '@/pages/EmailVerification';

const routes = [
  { path: '/register', component: Register },
  { path: '/login', component: Login },
  { path: '/verify-email', component: EmailVerification }
];
```

### 4. Database Setup

Run migration on your database:
```bash
# For new deployments
# The schema is already in database_schema.sql

# For existing installations, run:
# migrations_email_verification.sql in your MySQL admin panel
```

To mark existing users as verified (optional - for testing):
```sql
UPDATE users SET email_verified = true;
UPDATE agent_applications SET email_verified = true;
UPDATE agents SET email_verified = true;
```

### 5. Environment Variables

Ensure your Resend API key is set in server.js:
```javascript
// In server.js - Already configured with:
const resend = new Resend('re_K4QYkqMF_aiFCHi51vnFoLEUwaDFV3RMv');
```

For production, use environment variables:
```bash
# .env file
RESEND_API_KEY=re_your_key_here

# In server.js
const resend = new Resend(process.env.RESEND_API_KEY);
```

---

## Testing the Implementation

### Test Case 1: New User Registration
1. Go to Register page
2. Fill form with email: `test@example.com`
3. Submit registration
4. Should see "Check your email for verification code"
5. User receives email with code
6. Enter code on verification screen
7. After verification, redirect to login
8. Login with email/password should work

### Test Case 2: Resend Code
1. Register new user
2. On verification screen, wait for code to expire (15 min)
3. Click "Resend Code"
4. New code should be sent
5. Should be able to verify with new code

### Test Case 3: Wrong Code
1. Register new user
2. Enter wrong 6-digit code
3. Should show error: "Invalid verification code"
4. Request resend and try correct code

### Test Case 4: Login Without Email Verification
1. Register new user
2. Try to login in new browser/incognito
3. Should see error about email not verified
4. Option to resend verification code should be available

### Test Case 5: Password Reset (Still Works)
1. Click "Forgot Password"
2. Enter email
3. Should receive password reset email via Resend
4. Reset password link should work
5. Login with new password

---

## API Endpoints Ready for Frontend

All endpoints are ready. Frontend just needs to call them:

```javascript
// 1. Register
POST /api/auth/register
body: { email, password, name, phone, userType, ... }
returns: { success, userId, requiresVerification }

// 2. Verify Email
POST /api/auth/verify-email
body: { email, verificationCode, userType }
returns: { success, message }

// 3. Resend Code
POST /api/auth/resend-verification-code
body: { email, userType }
returns: { success, message }

// 4. Login (checks email_verified)
POST /api/auth/login
body: { email, password }
returns: { success, token, requiresVerification? }

// 5. Password Reset (via Resend)
POST /api/auth/forgot-password
body: { email }
returns: { success, message }
```

---

## Files Modified/Created

### Backend Files
- ✅ `server.js` - Updated with Resend and verification logic
- ✅ `database_schema.sql` - Updated with verification fields
- ✅ `migrations_email_verification.sql` - Migration for existing DBs

### Documentation Files
- ✅ `docs/EMAIL_VERIFICATION_SETUP.md` - Complete setup guide
- ✅ `docs/IMPLEMENTATION_GUIDE.md` - This file

### Frontend Components
- ✅ `src/components/auth/EmailVerification.tsx` - Email verification component

---

## Next Steps

1. **Run Database Migration**: Execute `migrations_email_verification.sql` on your database
2. **Test Backend**: Verify all endpoints work using Postman or similar
3. **Implement Frontend**: Use provided component and update registration/login flows
4. **Update Routes**: Ensure verification page is accessible
5. **Test End-to-End**: Complete registration → verification → login flow
6. **Deploy**: Push changes to production

---

## Troubleshooting

### Issue: "Module not found: Resend"
**Solution**: 
```bash
npm install resend
```

### Issue: Verification emails not sending
**Checklist**:
- [ ] Resend API key is correct
- [ ] Resend email quota not exceeded
- [ ] Check Resend dashboard for delivery logs
- [ ] Ensure email address is correct
- [ ] Check if email is in spam folder

### Issue: "Email already verified" error when trying to verify
**Solution**: Email is already verified, user can login now

### Issue: Code expired
**Solution**: Click "Resend Code" to get a new code (valid for 15 minutes)

---

## Frontend Component API

The `EmailVerification` component accepts:

```typescript
interface EmailVerificationProps {
  email: string;              // Email address to verify
  userId: string;              // User ID (for reference)
  userType?: 'user' | 'agent'; // Type of user
  onVerificationSuccess?: () => void; // Callback on success
}
```

---

## Security Notes

- ✅ 6-digit codes are random and secure
- ✅ Codes expire after 15 minutes
- ✅ Codes are destroyed after verification
- ✅ Resend provides DDoS protection
- ✅ Email verification prevents account takeover
- ✅ No plain text passwords in emails (only codes)

---

## Support

For any issues:
1. Check the documentation in `docs/EMAIL_VERIFICATION_SETUP.md`
2. Review API responses for error messages
3. Check backend logs for debugging
4. Verify Resend API key and quota
5. Test with a fresh account registration

