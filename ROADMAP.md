# StockSprout Production Roadmap

## Executive Summary

This roadmap outlines the transformation of StockSprout from a demo application into a production-grade, multi-platform custodial investment platform<cite></cite>. The plan encompasses three major initiatives: **cross-platform architecture**, **real financial integrations**, and **production infrastructure**<cite></cite>.

**Current State**: StockSprout is a web-based React/TypeScript application with Express backend, PostgreSQL database, mock payments, and simulated investment tracking [3-cite-0](#3-cite-0) .

**Target State**: Multi-platform application (web, mobile, desktop) with real Stripe payments, brokerage API integration for actual securities transactions, and production-grade infrastructure<cite></cite>.

---

## Phase 1: Cross-Platform Foundation (Weeks 1-6)

### Objective
Establish monorepo architecture supporting web, mobile (iOS/Android), and desktop from a single codebase using React Native Web<cite></cite>.

### 1.1 Monorepo Setup (Weeks 1-2)

**Deliverables:**
- Convert current structure to npm/Yarn workspaces monorepo
- Create package structure:
  - `packages/shared` - API client, types, business logic
  - `packages/components` - Cross-platform UI components
  - `packages/hooks` - Shared React hooks
  - `apps/web` - React Native Web + Vite
  - `apps/mobile` - React Native (iOS/Android)
  - `apps/desktop` - Electron wrapper
  - `server/` - Existing Express backend (unchanged)

**Technical Requirements:**
- Extract `@tanstack/react-query` hooks from current codebase [3-cite-1](#3-cite-1) 
- Move `zod` validation schemas to shared package [3-cite-2](#3-cite-2) 
- Abstract storage layer (localStorage/AsyncStorage/electron-store)
- Set up Turborepo or Nx for build orchestration

### 1.2 Component Library Migration (Weeks 3-4)

**Deliverables:**
- Replace `shadcn/ui` + Tailwind with React Native primitives [3-cite-3](#3-cite-3) 
- Migrate core components:
  - Layout components (`View`, `ScrollView`, `SafeAreaView`)
  - Form components (`Pressable`, `TextInput`)
  - Charts (replace `recharts` with `victory-native`)

**Key Components to Migrate:**
- Portfolio page components
- Timeline visualization
- Gift flow UI
- Authentication screens

### 1.3 Platform Deployments (Weeks 5-6)

**Deliverables:**
- **Web**: React Native Web + Vite build, deploy to Vercel/Replit
- **Mobile**: React Native setup with React Navigation, TestFlight/Play Store beta
- **Desktop**: Electron build pipeline, code signing setup

**Backend**: No changes required - existing Express API works across all platforms [3-cite-4](#3-cite-4) 

---

## Phase 2: Financial Infrastructure (Weeks 7-14)

### Objective
Replace mock systems with production-grade payment processing and brokerage integrations<cite></cite>.

### 2.1 Stripe Payment Integration (Weeks 7-8)

**Current State**: Mock payment system in `client/src/components/mock-payment-form.tsx` [3-cite-5](#3-cite-5) 

**Deliverables:**
- Implement `PaymentService` class with Stripe SDK
- Create PaymentIntent flow for gift purchases
- Add webhook handler at `/api/webhooks/stripe`
- Update gift creation endpoint to store `paymentIntentId`
- Frontend: Replace mock form with Stripe Elements

**Database Changes:**
```typescript
// Add to gifts table
paymentIntentId: text("payment_intent_id")
paymentStatus: text("payment_status") // pending, succeeded, failed
```

**Environment Variables:**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### 2.2 Brokerage Partner Selection (Week 9)

**Evaluation Criteria:**
| Provider | Custodial Accounts | Fractional Shares | API Quality | Compliance |
|----------|-------------------|-------------------|-------------|------------|
| Alpaca | ✓ | ✓ | Excellent | SEC registered |
| DriveWealth | ✓ (UGMA/UTMA) | ✓ | Good | Full clearing |
| Apex Clearing | ✓ | ✓ | Enterprise | Full service |

**Decision Point**: Select provider based on:
- Custodial account support for minors
- Fractional share capabilities
- API sandbox environment
- Pricing structure
- Regulatory compliance

### 2.3 Brokerage API Integration (Weeks 10-12)

**Deliverables:**
- Implement `BrokerageService` class with 5 core functions:
  1. `createCustodialAccount()` - UGMA/UTMA account creation
  2. `fundAccount()` - ACH transfers via Plaid
  3. `executePurchase()` - Market orders for fractional shares
  4. `transferShares()` - ACAT transfers between accounts
  5. `getAccountHoldings()` - Real-time positions and balances

**Database Schema Updates:**
```typescript
// Add to children table
brokerageAccountId: text("brokerage_account_id")
brokerageAccountStatus: text("brokerage_account_status")
kycStatus: text("kyc_status")

// Add to gifts table
brokerageOrderId: text("brokerage_order_id")
brokerageStatus: text("brokerage_status")
brokerageFilledAt: timestamp("brokerage_filled_at")
brokerageFillPrice: decimal("brokerage_fill_price")

// New tables
bank_accounts (Plaid integration)
transactions (reconciliation audit trail)
```

**Integration Flow:**
1. User creates gift → Stripe PaymentIntent created
2. Payment succeeds → Webhook triggers brokerage purchase
3. Brokerage order fills → Update gift status and portfolio holdings
4. Reconciliation service runs nightly to verify accuracy

### 2.4 Plaid Bank Verification (Week 13)

**Deliverables:**
- Implement `PlaidService` class
- Add Plaid Link UI component for bank account connection
- Store encrypted access tokens in `bank_accounts` table
- ACH verification flow for funding accounts

**Environment Variables:**
- `PLAID_CLIENT_ID`
- `PLAID_SECRET`
- `PLAID_ENV` (sandbox/production)

### 2.5 Reconciliation System (Week 14)

**Deliverables:**
- Background job (cron) to reconcile database vs. brokerage
- Alert system for discrepancies
- Audit logging for all financial transactions
- Admin dashboard for monitoring

**Reconciliation Checks:**
- Portfolio holdings match brokerage positions
- Gift statuses match order statuses
- Cash balances reconcile
- Transaction history completeness

---

## Phase 3: Production Hardening (Weeks 15-18)

### 3.1 Security & Compliance (Weeks 15-16)

**Deliverables:**
- PCI DSS compliance audit (Stripe handles card data)
- Encrypt sensitive data at rest (SSNs, bank tokens)
- Implement rate limiting and DDoS protection
- Add audit logging for all financial operations
- KYC/AML compliance workflows
- Terms of service and privacy policy

**Security Enhancements:**
- Rotate JWT secrets regularly
- Add 2FA for custodian accounts
- Implement session management improvements
- Add fraud detection rules

### 3.2 Testing & QA (Week 17)

**Deliverables:**
- End-to-end tests for gift flow (Stripe → Brokerage)
- Integration tests for all external APIs
- Load testing for concurrent transactions
- Security penetration testing
- Cross-platform UI/UX testing

**Test Environments:**
- Stripe test mode
- Brokerage sandbox environment
- Plaid sandbox

### 3.3 Monitoring & Operations (Week 18)

**Deliverables:**
- Application monitoring (Datadog/New Relic)
- Error tracking (Sentry)
- Financial transaction monitoring dashboard
- Alerting for failed payments/orders
- Database backup and disaster recovery
- Incident response playbook

---

## Phase 4: Launch Preparation (Weeks 19-20)

### 4.1 Regulatory & Legal

**Requirements:**
- SEC registration (if required)
- State money transmitter licenses
- Broker-dealer partnership agreements
- User agreements and disclosures
- FINRA compliance review

### 4.2 Deployment Strategy

**Infrastructure:**
- Production database (Neon PostgreSQL with replication)
- Backend: Railway/Render with auto-scaling
- Web: Vercel with CDN
- Mobile: App Store and Google Play submission
- Desktop: Code-signed installers for macOS/Windows

**Rollout Plan:**
1. Beta launch with limited users (100 families)
2. Monitor financial transactions for 2 weeks
3. Gradual rollout to 1,000 users
4. Full public launch

---

## Technical Dependencies

### New Dependencies to Add
```json
{
  "dependencies": {
    "stripe": "^18.5.0",
    "plaid": "^latest",
    "react-native": "^0.73.0",
    "react-native-web": "^0.19.0",
    "@react-navigation/native": "^6.1.0",
    "victory-native": "^36.9.0",
    "electron": "^latest"
  }
}
```

### Environment Variables (Production)
```env
# Existing
DATABASE_URL=
JWT_SECRET=
FINNHUB_API_KEY=

# New - Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# New - Brokerage
BROKERAGE_API_KEY=
BROKERAGE_API_SECRET=
BROKERAGE_BASE_URL=

# New - Banking
PLAID_CLIENT_ID=
PLAID_SECRET=
PLAID_ENV=production
```

---

## Success Metrics

### Phase 1 (Cross-Platform)
- All platforms deployed and functional
- 95%+ code sharing between platforms
- Performance: <2s page load on all platforms

### Phase 2 (Financial)
- 100% payment success rate (excluding user errors)
- <5 minute order execution time
- Zero reconciliation discrepancies

### Phase 3 (Production)
- 99.9% uptime SLA
- <1% transaction failure rate
- Pass security audit with no critical findings

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Brokerage API downtime | High | Implement retry logic, queue system, status page |
| Payment processing failures | High | Stripe has 99.99% uptime, implement fallback |
| Regulatory compliance issues | Critical | Engage legal counsel early, phased rollout |
| Data breach | Critical | Encryption, security audits, insurance |
| Cross-platform bugs | Medium | Comprehensive testing, staged rollout |

---

## Team Requirements

**Recommended Team:**
- 2 Full-stack engineers (React Native + Node.js)
- 1 Backend engineer (Financial integrations)
- 1 DevOps engineer (Infrastructure, monitoring)
- 1 QA engineer (Testing, compliance)
- 1 Product manager
- Legal/compliance consultant (part-time)

**Estimated Timeline**: 20 weeks (5 months)

**Budget Considerations:**
- Brokerage API fees (per transaction)
- Stripe fees (2.9% + $0.30 per transaction)
- Plaid fees (per user/month)
- Infrastructure costs (database, hosting)
- Legal/compliance costs
- App Store fees ($99/year + 30% revenue share)

---

## Notes

The current StockSprout codebase provides a solid foundation with its existing authentication system, database schema, and API structure [3-cite-6](#3-cite-6) . The backend architecture is already designed to support multiple platforms via REST APIs<cite></cite>, which significantly reduces the complexity of the cross-platform migration<cite></cite>.

The most critical path is Phase 2 (Financial Infrastructure), as it requires careful integration with external financial services and regulatory compliance<cite></cite>. We recommend starting brokerage partner discussions immediately while Phase 1 is in progress<cite></cite>.

Wiki pages you might want to explore:
- [StockSprout Overview (shaneahern/stocksprout)](/wiki/shaneahern/stocksprout#1)

### Citations

**File:** README.md (L51-71)
```markdown

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
```

**File:** README.md (L166-186)
```markdown
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
```

**File:** client/src/components/mock-payment-form.tsx (L1-99)
```typescript
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { processMockPayment } from "@/lib/mock-stripe";

interface MockPaymentFormProps {
  amount: number;
  giftGiverName: string;
  investmentName: string;
  shares: string;
  childName: string;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
  disabled?: boolean;
}

export default function MockPaymentForm({
  amount,
  giftGiverName,
  investmentName,
  shares,
  childName,
  onPaymentSuccess,
  onPaymentError,
  disabled = false
}: MockPaymentFormProps) {
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("123");
  const [name, setName] = useState("Test User");
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    if (formatted.length <= 5) {
      setExpiry(formatted);
    }
  };

  const handlePayment = async () => {
    if (!cardNumber || !expiry || !cvc || !name) {
      onPaymentError("Please fill in all payment details");
      return;
    }

    setIsProcessing(true);

    try {
      const result = await processMockPayment(amount, giftGiverName);

      if (result.success && result.paymentId) {
        onPaymentSuccess(result.paymentId);
      } else {
        onPaymentError(result.error || "Payment failed");
      }
    } catch (error) {
      onPaymentError("Network error - please try again");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
```
