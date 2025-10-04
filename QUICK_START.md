# FutureVest - Quick Start Guide

## ✅ Database Reset Complete!

All mock/fake data has been removed. The database is now clean and ready for your real data.

**What's Been Kept:**
- ✅ Investment options (stocks, ETFs, crypto) - These are market data you can select from
- ✅ All database tables and schema
- ✅ All functionality

**What's Been Removed:**
- ❌ Mock users (Sarah Johnson, Mike Chen)
- ❌ Mock children (Blaise, Emma, Alex)
- ❌ Mock gifts and contributions
- ❌ Mock portfolio holdings
- ❌ Mock thank you messages

## 🚀 Getting Started

### 1. Start the Server (if not already running)
```bash
npm run dev
```
The server should be running on http://localhost:3000

### 2. Create Your Account
1. Open http://localhost:3000 in your browser
2. You'll see the authentication page
3. Click "Sign up" to create a new account
4. Fill in:
   - **Full Name**: Your real name
   - **Username**: Choose a username
   - **Email**: Your email address
   - **Password**: At least 6 characters
   - **Bank Account Number** (optional): Your bank account info
5. Click "Create Account"

### 3. Add Your First Child
1. After signing up, you'll see the home page
2. Click "Add Child" or "Add Your First Child"
3. Enter:
   - Child's Name
   - Age
   - Birthday (optional)
4. Click "Add Child"
5. A unique gift link code will be generated automatically

### 4. Purchase Your First Investment
1. Navigate to the child's Portfolio tab
2. Click "Purchase Investment"
3. Select an investment (stock, ETF, or crypto)
4. Enter dollar amount
5. See estimated shares calculation
6. Complete mock payment
7. Investment added to portfolio after purchase

### 5. Send a Sprout Request
1. From the child's Portfolio page
2. Click "Send Sprout Request"
3. Enter contributor information:
   - Name
   - Phone number
   - Email (optional)
   - Personal message (optional)
4. Click "Send Request"
5. Share the generated link with family/friends

### 6. Test Receiving a Gift (as a contributor)
1. Copy the child's gift link code
2. Open http://localhost:3000/gift/[GIFT-CODE] in a new incognito window
3. Fill in contributor information
4. Select investment and amount
5. Add message (optional)
6. Complete payment
7. Gift will appear as "pending" for parent to approve

### 7. Approve/Reject Gifts
1. When new gifts arrive, notification bell turns orange
2. Click the notification bell
3. See "Gifts Awaiting Review" alert
4. Click to open approval modal
5. Review each gift with details
6. Click "Approve" to add to portfolio OR "Reject" to decline

## 🎯 Key Features to Try

### For Custodians (Parents)
- ✅ Create account and add profile picture
- ✅ Add multiple children
- ✅ Purchase investments directly for children
- ✅ Send sprout requests via SMS (simulated)
- ✅ Review and approve/reject incoming gifts
- ✅ View portfolio performance
- ✅ Track contribution timeline
- ✅ Edit profile information

### For Contributors (Family/Friends)
- ✅ Sign up through sprout request link
- ✅ Or contribute as guest without account
- ✅ Search for investments
- ✅ Send video messages (mock)
- ✅ Add written messages
- ✅ Make contributions easily

## 📱 Navigation

**Bottom Tab Bar:**
- **Home**: See all children and quick actions
- **Portfolio**: View child portfolios and holdings
- **Timeline**: See contribution history
- **Profile**: Manage your account

**Notification Bell:**
- Shows pending gifts count (orange alert icon)
- Shows unread notifications count
- Click to view and approve/reject gifts

## 💡 Tips

1. **Start Fresh**: Create your real account with your actual information
2. **Add Real Children**: Use your actual children's information
3. **Invite Real Contributors**: Send sprout requests to family and friends
4. **Track Real Investments**: Watch the portfolio grow with actual contributions
5. **All Data is Yours**: Everything in the database is data you entered

## 🔧 Troubleshooting

**If you want to reset again:**
```bash
# Stop the server (Ctrl+C)
# Run database migration
npm run db:push
# Restart server
npm run dev
```

**If you see old data:**
- Clear your browser's localStorage (F12 → Application → Local Storage → Clear)
- Refresh the page

## 🎉 You're All Set!

The application is now running with a clean database. Start by creating your account and adding your first child to begin your FutureVest journey!

**Server**: http://localhost:3000
**Status**: Ready for real data ✅
