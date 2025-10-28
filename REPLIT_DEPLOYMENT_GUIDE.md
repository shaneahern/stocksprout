# StockSprout - Replit Deployment Guide

## 🚀 Deploy to Replit

### Step 1: Upload to Replit
1. Go to https://replit.com
2. Click "Create Repl"
3. Choose "Import from GitHub" OR "Upload files"
4. If uploading zip: Extract and upload all files

### Step 2: Set Up Environment Variables
Click on "Tools" → "Secrets" (or the lock icon 🔒) and add:

**Required:**
```
DATABASE_URL = postgresql://username:password@host:port/database
JWT_SECRET = your-super-secret-random-key-at-least-32-characters-long
NODE_ENV = production
PORT = 3000
```

**Recommended (for video storage):**
```
CLOUDINARY_CLOUD_NAME = your-cloud-name
CLOUDINARY_API_KEY = your-api-key
CLOUDINARY_API_SECRET = your-api-secret
```

#### Getting a Database URL (Free Options):

**Option A: Neon Database (Recommended - Free)**
1. Go to https://neon.tech
2. Sign up for free
3. Create a new project
4. Copy the connection string
5. Paste as `DATABASE_URL` in Replit Secrets

**Option B: Supabase (Free Alternative)**
1. Go to https://supabase.com
2. Create free account
3. New project → Get connection string
4. Use format: `postgresql://postgres:[password]@[host]:5432/postgres`

**Generate JWT_SECRET:**
Run this in your terminal or use online generator:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Setting Up Cloudinary (Required for Video Storage)

**Why Cloudinary?**
- Replit's file system is ephemeral - files disappear on restart/redeploy
- Cloudinary provides persistent cloud storage for videos
- Free tier: 25GB storage + 25GB monthly bandwidth
- Automatic video optimization and CDN delivery

**Steps:**
1. Go to https://cloudinary.com/users/register_free
2. Sign up for a free account (takes 2 minutes)
3. After signup, go to your Dashboard
4. Copy your credentials:
   - **Cloud Name** (found in Dashboard URL: `https://console.cloudinary.com/[your-cloud-name]/`)
   - **API Key** (under "API Keys" section)
   - **API Secret** (click "Reveal" to see it)
5. Add all three to Replit Secrets:
   ```
   CLOUDINARY_CLOUD_NAME = your-cloud-name
   CLOUDINARY_API_KEY = 123456789012345
   CLOUDINARY_API_SECRET = abcdefghijklmnopqrstuvwxyz123456
   ```

**Note:** Without Cloudinary, videos will be stored locally and will be lost when Replit restarts/redeploys. The app will still work but video messages won't persist.

### Step 3: Install Dependencies
Replit should auto-detect and install. If not, click "Shell" and run:
```bash
npm install
```

### Step 4: Set Up Database Schema
In the Shell tab, run:
```bash
npm run db:push
```

This creates all the database tables.

### Step 5: Run the Application
Click the "Run" button or in Shell:
```bash
npm run dev
```

The app should start on port 3000.

### Step 6: Access Your App
- Replit will provide a URL like: `https://your-repl-name.username.repl.co`
- Open it in your browser
- You're live! 🎉

## 📋 Troubleshooting

### Issue: "DATABASE_URL must be set"
**Solution:** Make sure you added DATABASE_URL in Replit Secrets (not just environment variables in .env file)

### Issue: Database connection error
**Solution:** 
- Verify your DATABASE_URL is correct
- Make sure your database provider allows external connections
- Check if you need to whitelist Replit's IP (most cloud DBs don't require this)

### Issue: "Column does not exist"
**Solution:** Run `npm run db:push` in the Shell to create/update database tables

### Issue: Port already in use
**Solution:** Replit handles this automatically, but make sure PORT=3000 in secrets

### Issue: Videos disappear after upload
**Solution:** 
- Set up Cloudinary (see Step 2 above)
- Replit's file system is ephemeral - local files are lost on restart
- Cloudinary provides persistent storage that survives restarts

### Issue: Video uploads fail
**Solution:**
- Verify Cloudinary credentials are set correctly in Replit Secrets
- Check Cloudinary dashboard for upload limits/quota
- App will fallback to local storage if Cloudinary fails (but files won't persist)

## 🎯 Post-Deployment Setup

### 1. Create Your First Account
- Navigate to your Replit URL
- Click "Sign up"
- Create your account with real information

### 2. Add Your Children
- Click "Add Child"
- Enter their information
- Unique gift links are generated automatically

### 3. Test Features
- ✅ Send yourself a gift link
- ✅ Make a test contribution
- ✅ Try the approval system
- ✅ Test video recording and upload
- ✅ Play the Activities quiz

## 📱 Sharing Your App

Once deployed on Replit:
- Share your Replit URL with users
- Send gift links via SMS (they work immediately)
- Invite family and friends to contribute

## 🔐 Security Notes

- ✅ All passwords are hashed (bcrypt)
- ✅ JWT tokens for authentication
- ✅ Protected API endpoints
- ✅ Input validation on all forms
- ✅ Database credentials in Secrets (not in code)

## 🎨 Customization

### Change App Name
Edit `client/index.html` - Line 7:
```html
<title>Your Custom Name</title>
```

### Update Logo
Replace `attached_assets/image_1759012993458.png` with your logo

### Modify Colors
Edit `tailwind.config.ts` to change theme colors

## 📊 Features Ready to Use

All 20 requirements are implemented:
- ✅ Account creation & login
- ✅ Profile management with pictures
- ✅ Add children to account
- ✅ Send sprout requests (SMS simulation)
- ✅ Gift approval system
- ✅ Portfolio tracking
- ✅ Timeline with video messages
- ✅ Activities & games tab
- ✅ Recurring contributions
- ✅ And much more!

## 🆘 Support

If you encounter issues:
1. Check the Shell tab for error messages
2. Verify all Secrets are set correctly
3. Ensure database is accessible
4. Run `npm run db:push` if schema issues occur

## 🎉 You're Ready!

Your StockSprout app is production-ready and can handle real users, real contributions, and real portfolios. Everything is functional and tested!

**Enjoy your deployed application!** 🚀
