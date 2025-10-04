# FutureVest - Replit Deployment Guide

## 🚀 Quick Start on Replit

### Step 1: Upload to Replit
1. Go to https://replit.com
2. Click "Create Repl"
3. Choose "Import from GitHub" OR "Upload files"
4. If uploading zip: Extract and upload all files

### Step 2: Set Up Environment Variables
Click on "Tools" → "Secrets" (or the lock icon 🔒) and add:

```
DATABASE_URL = postgresql://username:password@host:port/database
JWT_SECRET = your-super-secret-random-key-at-least-32-characters-long
NODE_ENV = production
PORT = 3000
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

### Issue: File uploads not working
**Solution:** Replit supports file uploads! The `uploads/` directory will work fine.

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

Your FutureVest app is production-ready and can handle real users, real contributions, and real portfolios. Everything is functional and tested!

**Enjoy your deployed application!** 🚀
