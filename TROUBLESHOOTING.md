# 🔧 Vercel Network Error - Step-by-Step Fix

## Current Status: Network Error on Admin Login

### What You'll See Now

After deploying these changes, you'll see a **black diagnostic bar at the bottom** of your page showing:

- Current API_BASE_URL value
- All environment variables
- A "Test Backend Connection" button

## Step-by-Step Fix

### 1️⃣ Deploy These Changes First

```bash
# Commit and push the changes
git add .
git commit -m "Add diagnostic tools for Vercel deployment"
git push
```

Vercel will automatically redeploy your frontend.

### 2️⃣ Check the Diagnostic Bar

Once deployed, visit your Vercel frontend URL and look at the black bar at the bottom:

**If API_BASE_URL shows "undefined" or "http://localhost:3001":**

- ❌ The environment variable is NOT set in Vercel
- Continue to step 3

**If API_BASE_URL shows your actual backend URL:**

- ✅ Environment variable is set
- Click "Test Backend Connection" button
- If test fails, continue to step 4

### 3️⃣ Set Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **frontend** project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Key**: `VITE_BASE_URL`
   - **Value**: Your backend URL (see step 3a below)
   - **Environments**: Check all (Production, Preview, Development)
6. Click **Save**

#### 3a. Finding Your Backend URL

**Option A: Backend is on Vercel**

1. Go to Vercel Dashboard
2. Open your backend project
3. Copy the domain (e.g., `https://smarthisab-backend.vercel.app`)
4. Use this as the value for VITE_BASE_URL

**Option B: Backend is elsewhere**

- Use your backend's actual URL (e.g., `https://api.yourdomain.com`)

**Option C: Both on same Vercel project**

- This won't work with Next.js backend
- Deploy backend as separate Vercel project first

### 4️⃣ Redeploy Frontend

**Important:** Adding environment variables does NOT automatically redeploy!

1. Go to **Deployments** tab in your frontend project
2. Find the latest deployment
3. Click the **three dots (•••)** menu
4. Click **Redeploy**
5. Wait for deployment to complete (usually 1-2 minutes)

### 5️⃣ Test Again

1. Visit your frontend URL
2. Check the diagnostic bar - API_BASE_URL should now show correct URL
3. Click "Test Backend Connection" button
4. Check browser console (F12 → Console tab) for any errors

### 6️⃣ Common Issues & Solutions

#### Issue: Diagnostic bar shows correct URL but connection fails

**Check Backend:**

```bash
# Visit this in your browser:
https://your-backend-url.vercel.app/api/admin/verify
```

**Expected Response:**

- Status: 401 Unauthorized
- Body: `{"message": "No token provided"}` or similar

**If you see this:** ✅ Backend is working!
**If you see error:** ❌ Backend issue - continue below

#### Issue: Backend returns 404 or doesn't load

**Possible causes:**

1. Backend not deployed
2. Backend deployment failed
3. Wrong URL

**Solution:**

1. Check backend deployment logs in Vercel
2. Verify backend environment variables are set:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`

#### Issue: CORS error in browser console

**Error looks like:**

```
Access to fetch at 'https://backend.vercel.app/api/admin/login'
from origin 'https://frontend.vercel.app' has been blocked by CORS policy
```

**Solution:**
Backend middleware is already configured for CORS with `Access-Control-Allow-Origin: *`

- This should work
- If not, check backend deployment logs
- Ensure middleware.js is being used

#### Issue: MongoDB connection error

**Check backend logs for:**

```
MongooseError: connect ECONNREFUSED
```

**Solution:**

1. Go to MongoDB Atlas
2. Network Access → Add IP Address
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Redeploy backend

### 7️⃣ After It Works - Remove Diagnostic Component

Once everything works, remove the diagnostic bar:

**Edit `frontend/src/App.jsx`:**

```jsx
// Remove this import:
import DiagnosticInfo from "./DiagnosticInfo";

// Remove this line (around line 53):
<DiagnosticInfo />;
```

Commit and push:

```bash
git add .
git commit -m "Remove diagnostic component"
git push
```

## Quick Reference: What Should Be Where

### Frontend Vercel Environment Variables

```
VITE_BASE_URL=https://your-backend.vercel.app
```

### Backend Vercel Environment Variables

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-secret-key-here
ADMIN_EMAIL=smarthisab@admin.com
ADMIN_PASSWORD=your-admin-password
FRONTEND_URL=https://your-frontend.vercel.app
```

## Still Not Working?

1. **Check browser console** (F12) - Look for specific error messages
2. **Check Vercel deployment logs** - Both frontend and backend
3. **Verify environment variables** - Make sure no typos
4. **Test backend directly** - Visit API endpoints in browser
5. **Clear browser cache** - Hard refresh (Ctrl+Shift+R)

## Get Help

If still stuck, check the diagnostic info showing:

- What is API_BASE_URL? (should not be undefined or localhost)
- What does "Test Backend Connection" show?
- What errors in browser console?
- What errors in Vercel logs?
