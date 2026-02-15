# 🚨 COMPLETE FIX FOR 401 UNAUTHORIZED ERROR

## THE PROBLEM
You are getting 401 errors because:
1. ✅ Server code was fixed (JWT_SECRET moved to correct location)
2. ❌ Server is not running properly  
3. ❌ You have an old invalid token in your browser

## ✅ COMPLETE SOLUTION (Follow in Order)

### STEP 1: Start the Server Correctly

**Option A - Double-click the batch file:**
1. Go to folder: `e:\IMPO\Real Estate pk\aura-home-main\`
2. Find `start-server.bat`
3. **Double-click it** - A new window will open with the server running
4. Wait until you see: "✓ MySQL database connected successfully"
5. **KEEP THIS WINDOW OPEN** - Don't close it!

**Option B - Manual terminal command:**
1. Open PowerShell/CMD in the project folder
2. Run: `node backend/server.js`
3. Wait for "✓ MySQL database connected successfully"
4. Keep terminal open

### STEP 2: Clear Your Browser Token

**METHOD 1 - Quick Console Command (RECOMMENDED):**
1. Open your browser (where admin panel is)
2. Press **F12** to open Developer Tools
3. Click on **Console** tab
4. Paste this command and press Enter:
   ```javascript
   localStorage.clear(); alert('Token cleared! Page will reload.'); location.reload();
   ```

**METHOD 2 - Manual:**
1. Press F12  
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Find **Local Storage** → `http://localhost:5173` or `http://localhost:8080`
4. Right-click on `token` → **Delete**
5. Refresh page (F5)

### STEP 3: Login Again as Admin
1. Go to: http://localhost:5173/admin-login
2. Login with:
   - **Email:** dummy@gmail.com
   - **Password:** asd123
3. You'll get a **NEW VALID TOKEN**

### STEP 4: Test Bulk Assign
1. Go to Admin Dashboard
2. Select some properties (click checkboxes)
3. Select an agent from dropdown
4. Click **"Assign Selected Properties"**
5. **✅ IT SHOULD WORK NOW!**

---

## Troubleshooting

### If you still get 401 errors:

**Check 1 - Is server running?**
- Open: http://localhost:3001/api/health
- Should see: `{"success":true,"message":"Server is running"}`
- If not, repeat STEP 1

**Check 2 - Is token cleared?**
- F12 → Application → Local Storage
- The `token` key should be present ONLY after login
- If old token exists, delete it manually

**Check 3 - Did you login AFTER clearing token?**
- You MUST login again after clearing token
- The new token will be valid with the fixed server

**Check 4 - Check browser console for errors:**
- F12 → Console tab
- Look for error messages
- If you see "No token provided" or "Invalid token", repeat STEP 2 & 3

---

## Quick Test Command

After starting server, test in browser console (F12 → Console):
```javascript
fetch('http://localhost:3001/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Server response:', d))
  .catch(e => console.error('❌ Server error:', e));
```

Should show: `✅ Server response: {success: true, message: "Server is running"}`

---

## Summary

1. ✅ Server fixed (code is correct)
2. 🔄 Start server using `start-server.bat`  
3. 🔄 Clear browser localStorage
4. 🔄 Login again as admin
5. ✅ 401 errors will be GONE!

**The issue is NOT in the code - it's just cached old tokens!**
