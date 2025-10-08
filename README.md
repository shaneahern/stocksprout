# StockSprout 🌱

**Growing their future, one gift at a time**

StockSprout is a custodial investment platform that allows parents to manage investment portfolios for their children, while family and friends can contribute through gift links and recurring contributions.

## ✨ Features

### Account Management
- User signup and login with JWT authentication
- Profile management with pictures and bank account info
- Secure password hashing

### Child Portfolio Management
- Add multiple children to your account
- Unique gift link codes for each child
- Track individual portfolios with real-time performance metrics
- Portfolio allocation charts and analytics

### Contribution System
- **Sprout Requests**: Invite family/friends via SMS to contribute
- **Gift Links**: Share links for one-time contributions
- **Recurring Contributions**: Set up monthly/yearly automatic investments
- **Guest Checkout**: Contribute without creating an account

### Gift Approval System
- Review and approve/reject incoming contributions
- Notifications with orange alert for pending gifts
- Only approved gifts are added to portfolios
- Complete authorization and security

### Timeline & History
- Chronological view of all approved contributions
- Growth visualization with sprout metaphor
- Video message playback
- Thank you message system

### Educational Activities
- Financial literacy quiz
- Leaderboard to compete with friends
- Progress tracking and achievements
- Multiple game modes (quiz active, others coming soon)

### Investment Options
- Stocks, ETFs, and cryptocurrency options
- **Real-time stock prices** via Finnhub API
- **Professional company logos** via Clearbit API
- Real-time search functionality
- Fractional share calculations
- Performance metrics (YTD returns)

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Wouter (routing)
- TanStack Query (data fetching)
- Shadcn/UI + Tailwind CSS
- Recharts (portfolio charts)

**Backend:**
- Node.js + Express
- PostgreSQL (via Drizzle ORM)
- JWT authentication
- bcryptjs for password hashing
- Multer for file uploads
- Finnhub API for real-time stock data

**External APIs:**
- Finnhub (stock prices & quotes)
- Clearbit (company logos)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Local Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd StockSprout
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/stocksprout
JWT_SECRET=your-super-secret-jwt-key-here
FINNHUB_API_KEY=your-finnhub-api-key-here
PORT=3000
NODE_ENV=development
```

> **Get a free Finnhub API key** at [finnhub.io/register](https://finnhub.io/register)
> - Free tier: 60 API calls/minute
> - If not set, the app will use mock stock data

4. **Push database schema**
```bash
npm run db:push
```

5. **Start development server**
```bash
npm run dev
```

6. **Open in browser**
```
http://localhost:3000
```

## 🌐 Deployment

See **[REPLIT_DEPLOYMENT_GUIDE.md](./REPLIT_DEPLOYMENT_GUIDE.md)** for detailed Replit deployment instructions.

### Quick Deploy to Replit:
1. Upload project files
2. Set environment variables in Secrets
3. Run `npm run db:push`
4. Click "Run"

### Other Platforms:
- **Vercel** (frontend) + **Neon** (database)
- **Railway** (full-stack with database)
- **Render** (full-stack with database)
- **DigitalOcean App Platform**

## 📖 Documentation

- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Authentication system details
- **[SPROUT_REQUESTS.md](./SPROUT_REQUESTS.md)** - Contribution invitation system
- **[STOCK_API_SETUP.md](./STOCK_API_SETUP.md)** - Stock API integration guide
- **[REQUIREMENTS_VERIFICATION.md](./REQUIREMENTS_VERIFICATION.md)** - All requirements status
- **[FEATURES_COMPLETE.md](./FEATURES_COMPLETE.md)** - Complete feature list
- **[REPLIT_DEPLOYMENT_GUIDE.md](./REPLIT_DEPLOYMENT_GUIDE.md)** - Replit deployment

## 🎯 Key User Flows

### For Parents (Custodians)
1. Sign up and create account
2. Add children with profiles
3. Purchase investments directly
4. Send sprout requests to family/friends
5. Review and approve incoming gifts
6. Track portfolio performance

### For Contributors (Family/Friends)
1. Receive gift link or sprout request
2. Choose to sign up or continue as guest
3. Select investment and amount
4. Add video/written message
5. Set up recurring contributions (optional)
6. Complete contribution

## 🔒 Security

- Password hashing with bcryptjs (10 rounds)
- JWT token-based authentication (7-day expiration)
- Protected API endpoints
- Input validation with Zod schemas
- SQL injection protection via Drizzle ORM
- CORS and security headers

## 📊 Database Schema

**Tables:**
- `users` - Account and profile data
- `children` - Child profiles and gift codes
- `contributors` - Contributor accounts
- `sprout_requests` - Contribution invitations
- `recurring_contributions` - Scheduled contributions
- `investments` - Available investment options
- `portfolio_holdings` - Child investment portfolios
- `gifts` - Contribution records
- `thank_you_messages` - Gratitude system

## 🧪 Testing

The app includes:
- Data test IDs on key elements
- Comprehensive error handling
- Mock payment system (ready for Stripe)
- SMS simulation (ready for Twilio)
- Video upload system

## 🚧 Future Enhancements

Potential additions:
- Real SMS integration (Twilio/SendGrid)
- Real payment processing (Stripe)
- Email notifications
- More educational games
- Mobile app (React Native)
- Social sharing features
- Portfolio analytics dashboard
- Tax reporting documents

## 📄 License

MIT License - See LICENSE file for details

## 👥 Contributing

This is a portfolio/demonstration project. Feel free to fork and customize for your needs!

## 🆘 Support

For issues or questions:
1. Check documentation files
2. Review error logs in console
3. Verify environment variables
4. Ensure database is accessible

## 🎉 Acknowledgments

Built with modern web technologies and best practices for custodial investment management.

---

**Made with ❤️ for building children's financial futures**
