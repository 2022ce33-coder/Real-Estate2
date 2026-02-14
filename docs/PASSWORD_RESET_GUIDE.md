# Password Reset & Email Delivery Guide

## 🔧 Current Status

**Development**: ✅ Fully functional with testing mode  
**Production**: ⏳ Requires Resend configuration

---

## 🧪 Testing Password Reset (Development)

### Step 1: Request Password Reset
```bash
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "adeelgwa@gmail.com"}'
```

### Step 2: Check Response
The server will return:
```json
{
  "success": true,
  "message": "Password reset link sent to your email.",
  "resetToken": "550e8400-e29b-41d4-a716-446655440000",
  "resetUrl": "http://localhost:5173/reset-password?email=adeelgwa@gmail.com&token=550e8400-e29b-41d4-a716-446655440000",
  "note": "In production, the reset link is sent via email only and not returned here"
}
```

### Step 3: Use the Reset Link for Testing
- Copy the `resetUrl` from the response
- Open it in your browser
- Or use it to test the reset-password endpoint

### Step 4: Server Logs Show
```
📧 Sending password reset email...
   Email: adeelgwa@gmail.com
   Token: 550e8400-e29b-41d4-a716-446655440000
   Reset URL: http://localhost:5173/reset-password?email=adeelgwa@gmail.com&token=550e8400-e29b-41d4-a716-446655440000
✓ Password reset email sent successfully
   Resend Response: { id: '...', from: 'onboarding@resend.dev', ... }
```

---

## 🚀 Configuring Resend for Production

### Issue: Why Emails Aren't Arriving

The current setup uses `onboarding@resend.dev` which is a Resend demo/sandbox email. Real emails need proper configuration.

### Solution: Configure Resend Custom Domain

#### Option 1: Use Resend Custom Domain (Recommended)

1. **Sign up at Resend**
   - Go to https://resend.com
   - Create account and verify email

2. **Add Your Domain**
   - Dashboard → Domains
   - Add your domain (e.g., `notifications.yourdomain.com`)
   - Follow DNS verification steps

3. **Update API Key in server.js**
   ```javascript
   const resend = new Resend(process.env.RESEND_API_KEY);
   ```

4. **Use Custom Email**
   ```javascript
   await resend.emails.send({
     from: 'noreply@yourdomain.com', // Or notifications@yourdomain.com
     to: email,
     ...
   });
   ```

5. **Set Environment Variable**
   ```bash
   # .env file
   RESEND_API_KEY=re_your_actual_key_here
   ```

#### Option 2: Use Gmail SMTP (Alternative)

If you prefer to keep using Gmail, I can revert to Nodemailer with proper Gmail App Password setup.

---

## 📧 Email Verification Checklist

### For Development (Current Setup)
- ✅ Password reset endpoint works
- ✅ Reset token generated
- ✅ Token stored in database with expiry
- ✅ Reset link formatted correctly
- ✅ Server logs all details
- ✅ Frontend shows reset link for testing
- ⚠️ Actual email delivery through Resend (sandbox mode)

### For Production
- [ ] Resend custom domain configured
- [ ] API key in environment variables
- [ ] "From" email matches verified domain
- [ ] Emails tested with real addresses
- [ ] Email templates match brand
- [ ] Resend dashboard monitoring enabled
- [ ] Reset token in response removed
- [ ] Error handling for failed sends

---

## 🔍 Debugging Email Issues

### Check Server Logs
```
// When password reset is requested:
📧 Sending password reset email...
   Email: user@example.com
   Token: xxx-xxx-xxx
   Reset URL: http://localhost:5173/...
✓ Password reset email sent successfully
   Resend Response: { id: '...', ... }
```

### Check Resend Dashboard
1. Go to https://resend.com/dashboard
2. Click "Emails" tab
3. Look for your test email
4. Check delivery status:
   - ✅ Delivered
   - ⏳ Pending
   - ❌ Bounced
   - ⚠️ Complained

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Email not received | Sandbox mode | Configure custom domain in Resend |
| 401 Unauthorized | Invalid API key | Check RESEND_API_KEY environment variable |
| 400 Bad Request | Invalid email address | Verify email format in request |
| Bounced email | Unverified recipient | Use real, existing email addresses |
| Spam folder | Domain reputation | Use verified custom domain, not onboarding@resend.dev |

---

## 📋 Testing Endpoints

### 1. Request Password Reset
```bash
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password reset link sent to your email.",
  "resetToken": "...",
  "resetUrl": "..."
}
```

---

### 2. Reset Password with Token
```bash
curl -X POST http://localhost:3001/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "token": "token-from-step-1",
    "newPassword": "NewPassword123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## 🎯 Frontend Integration

### Using the ForgotPassword Component
```jsx
import ForgotPassword from '@/components/auth/ForgotPassword';

<ForgotPassword 
  onBackToLogin={() => {
    window.location.href = '/login';
  }}
/>
```

### Component Features
- ✅ Email validation
- ✅ Loading states
- ✅ Error handling
- ✅ Success confirmation
- ✅ Reset link display (development)
- ✅ Copy link button
- ✅ Open in new tab
- ✅ Console logging

---

## 📝 Database Schema

### password_resets Table
```sql
CREATE TABLE password_resets (
  email VARCHAR(255),
  token VARCHAR(255),
  expires DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Key Points
- Tokens expire after 15 minutes
- One token per email (REPLACE on insert)
- Tokens cleared after successful reset

---

## 🔐 Security Best Practices

✅ **Currently Implemented:**
- Tokens are UUIDs (random, hard to guess)
- 15-minute expiry
- Tokens cleared after password reset
- Email validation
- Rate limiting possible

⚠️ **For Production:**
- Add rate limiting on forgot-password endpoint
- Log all password reset attempts
- Email user when password was changed
- Require email verification before reset
- Two-factor authentication option

---

## 📞 Support & Troubleshooting

### Email Not Arriving?

**Check these in order:**

1. **Check Console/Server Logs**
   ```
   npm start
   // Look for "✓ Password reset email sent successfully"
   ```

2. **Check Resend Dashboard**
   - https://resend.com/dashboard
   - Emails tab
   - Search for recipient email
   - Check delivery status

3. **Verify Email Address**
   - Make sure no typos in email
   - Email must exist in system
   - Check users table

4. **Check Spam Folder**
   - Most common issue
   - Use verified domain to improve delivery

5. **Check API Key**
   ```javascript
   // server.js - verify this is correct
   const resend = new Resend('re_K4QYkqMF_aiFCHi51vnFoLEUwaDFV3RMv');
   ```

### Reset Link Not Working?

1. **Token expired?**
   - Resend request (15-minute limit)

2. **Token invalid?**
   - Copy directly from response
   - No typos in token

3. **Database issue?**
   ```sql
   SELECT * FROM password_resets WHERE email = 'test@example.com';
   ```

4. **Check reset-password endpoint**
   ```javascript
   // POST /api/auth/reset-password
   // Should validate token and update password
   ```

---

## 🛠️ Quick Setup for Testing

### Development (Right Now)
```bash
# 1. Server already running with Resend
npm start

# 2. Request password reset
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# 3. Copy resetUrl from response
# 4. Open in browser or test reset endpoint
# 5. Check server logs for details
```

### Production Setup
```bash
# 1. Get Resend API key from https://resend.com
# 2. Add to environment:
export RESEND_API_KEY=re_your_actual_key

# 3. Configure domain in Resend dashboard
# 4. Update server.js to use custom domain
# 5. Test with real email addresses
# 6. Deploy
```

---

## ✅ Implementation Checklist

### Backend ✅
- [x] Nodemailer replaced with Resend
- [x] sendPasswordResetEmail function
- [x] /api/auth/forgot-password endpoint
- [x] /api/auth/reset-password endpoint
- [x] Token generation and storage
- [x] Token expiry validation
- [x] Server logging
- [x] Error handling

### Frontend ✅
- [x] ForgotPassword component
- [x] Email input validation
- [x] Loading states
- [x] Error handling
- [x] Success feedback
- [x] Reset link display (dev)
- [x] Console logging
- [x] Responsive design

### Database ✅
- [x] password_resets table created
- [x] Token management

### Documentation ✅
- [x] Testing guide
- [x] API documentation
- [x] Debugging steps
- [x] Production setup

---

## 🚀 Next Steps

1. **For Development**: Use current setup with reset links shown in response
2. **For Testing**: Use the ForgotPassword component - it shows the link
3. **For Production**: 
   - Configure Resend custom domain
   - Set RESEND_API_KEY environment variable
   - Remove resetToken from response
   - Test with real email addresses
   - Monitor Resend delivery

---

**Version**: 1.0  
**Last Updated**: February 10, 2026  
**Status**: ✅ Development Ready | ⏳ Production Setup Required

