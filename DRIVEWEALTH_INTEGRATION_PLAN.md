# DriveWealth Integration Plan for StockSprout

## Executive Summary

This document outlines a comprehensive plan to integrate DriveWealth's Sandbox API into StockSprout to enable real investment transactions. The integration will transform StockSprout from a simulated investment platform into a fully functional custodial brokerage application.

**Integration Approach**: Phased implementation starting with Sandbox API, focusing on custodial accounts (UTMA/UGMA) for children's investment portfolios.

**Timeline Estimate**: 8-12 weeks for full implementation across all phases.

---

## Table of Contents

1. [DriveWealth API Overview](#drivewealth-api-overview)
2. [Current StockSprout Architecture Analysis](#current-stocksprout-architecture-analysis)
3. [Integration Architecture](#integration-architecture)
4. [Implementation Phases](#implementation-phases)
5. [Technical Specifications](#technical-specifications)
6. [Database Schema Changes](#database-schema-changes)
7. [API Endpoints to Implement](#api-endpoints-to-implement)
8. [Security Considerations](#security-considerations)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Strategy](#deployment-strategy)
11. [Risk Assessment](#risk-assessment)
12. [Future Enhancements](#future-enhancements)

---

## 1. DriveWealth API Overview

### 1.1 Key Capabilities

DriveWealth provides a comprehensive REST API for brokerage operations:

**Account Management**
- User creation and KYC verification
- Custodial account support (UTMA/UGMA)
- Teen account support (parent-controlled)
- Account status tracking and compliance

**Trading Operations**
- Equity trading (stocks and ETFs)
- Fractional share support
- Market, limit, stop, and market-if-touched orders
- Real-time order status tracking
- Order cancellation

**Money Movement**
- ACH transfers (4-5 business days)
- Wire transfers (same-day processing)
- Plaid integration support
- Virtual account numbers for deposits

**Market Data**
- Real-time quotes
- Historical charts
- Instrument search
- Company information

**Reporting & Compliance**
- Account statements
- Tax documents (1099s)
- Transaction history
- Position tracking
- Performance metrics

### 1.2 Account Types Relevant to StockSprout

**Custodial Accounts (UTMA/UGMA)** - PRIMARY CHOICE
- Assets are irrevocable and owned by the minor
- Minor's SSN used for tax reporting
- Only custodian can take action in the account
- Minor cannot access account until age of majority
- Assets transfer to minor at age of majority (18-21 depending on state)
- **Supported Assets**: Stocks only (no options, mutual funds, or fixed income)
- **Perfect fit for StockSprout's use case**

**Teen Accounts** - ALTERNATIVE OPTION
- Owned by adult, trade authorization granted to minor
- Adult's SSN used for tax reporting
- Parental controls (e.g., trades >$25 require approval)
- Assets remain property of adult, not minor
- **Supported Assets**: Stocks only
- **Less suitable for gift-giving model**

### 1.3 API Environments

**Sandbox (UAT)**
- Base URL: `https://bo-api.drivewealth.io`
- Production-replica environment
- Simulated order execution
- Test credentials provided by DriveWealth
- Magic numbers for testing specific scenarios
- No real money or securities

**Production**
- Base URL: `https://api.drivewealth.com`
- Real money and securities
- Requires partnership agreement with DriveWealth
- Regulatory compliance required
- Production credentials after approval

### 1.4 Authentication

**Session Token Authentication**
- Endpoint: `POST /back-office/auth/tokens`
- Requires `clientID` and `clientSecret`
- Returns session token with 60-minute expiration
- Token passed in `Authorization: Bearer {token}` header
- Rate limit: 5-10 API calls per hour for token generation

### 1.5 Key Limitations & Constraints

**Custodial Account Restrictions**
- Only stocks supported (no ETFs, options, mutual funds, crypto)
- Requires full KYC information for both custodian and minor
- Physical document upload required for non-US/UK/AU residents
- Account cannot be closed until minor reaches age of majority

**Trading Restrictions**
- Fractional shares supported for market orders
- Limit orders require whole shares only
- Orders outside market hours queued for next session
- Pattern day trading rules apply

**Money Movement**
- USD only (no other currencies)
- ACH requires linked US bank account
- Minimum/maximum deposit limits apply
- Withdrawal restrictions for unsettled funds

**Compliance Requirements**
- FINRA regulations apply
- Travel Rule compliance for deposits
- Customer verification (KYC/AML)
- Trusted contact information for accounts (65+ years old)

---

## 2. Current StockSprout Architecture Analysis

### 2.1 Current System Overview

StockSprout currently operates as a **simulated investment platform** with the following characteristics:

**Data Storage**
- PostgreSQL database via Drizzle ORM
- Local storage of all investment data
- Mock portfolio tracking
- No real brokerage integration

**Investment Flow**
1. Parent creates child profile
2. Contributors make "gifts" (simulated purchases)
3. Gifts require parent approval
4. Approved gifts added to portfolio_holdings
5. Portfolio values calculated from Finnhub prices

**Key Tables**
- `users` - Parent/custodian accounts
- `children` - Child profiles with gift link codes
- `contributors` - Gift givers (registered or guest)
- `gifts` - Contribution records with approval workflow
- `portfolio_holdings` - Aggregated investment positions
- `investments` - Available securities catalog
- `sprout_requests` - Invitation system for contributions

### 2.2 Integration Points Identified

**Critical Integration Points**

1. **User/Account Creation**
   - Current: Local user table only
   - Needed: DriveWealth User + Account creation
   - Mapping: StockSprout user ↔ DriveWealth User + Account

2. **Child Profile Creation**
   - Current: Local children table
   - Needed: DriveWealth custodial account creation
   - Mapping: StockSprout child ↔ DriveWealth custodial account

3. **Gift Approval → Order Execution**
   - Current: Direct portfolio_holdings update
   - Needed: DriveWealth order creation and tracking
   - Mapping: Approved gift → DriveWealth order → Portfolio update

4. **Portfolio Holdings**
   - Current: Local calculation from gifts
   - Needed: Sync with DriveWealth positions
   - Mapping: DriveWealth positions → portfolio_holdings

5. **Investment Search**
   - Current: Finnhub API for search/quotes
   - Needed: DriveWealth instruments API
   - Mapping: DriveWealth instruments → investments table

6. **Money Movement**
   - Current: Simulated (no real money)
   - Needed: ACH/Wire integration
   - Mapping: Gift amount → Deposit → Order funding

### 2.3 Current Limitations

**No Real Brokerage Operations**
- All transactions are simulated
- No actual securities ownership
- No regulatory compliance
- No real money movement

**Simplified Data Model**
- No order tracking
- No settlement tracking
- No account status management
- No compliance/KYC data

**Missing Functionality**
- No bank account linking
- No deposit/withdrawal flows
- No order status tracking
- No regulatory reporting

---

## 3. Integration Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     StockSprout Frontend                     │
│  (React + TypeScript - No Changes to User Experience)       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTP/REST
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  StockSprout Backend API                     │
│                  (Express + TypeScript)                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         DriveWealth Integration Layer                │  │
│  │  - Authentication Manager                            │  │
│  │  - Account Manager                                   │  │
│  │  - Order Manager                                     │  │
│  │  - Position Sync Manager                             │  │
│  │  - Webhook Handler                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Existing StockSprout Logic                   │  │
│  │  - Gift Approval Workflow                            │  │
│  │  - Contributor Management                            │  │
│  │  - Sprout Requests                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌───────────────┐          ┌────────────────────┐
│   PostgreSQL  │          │  DriveWealth API   │
│   Database    │          │   (Sandbox/Prod)   │
│               │          │                    │
│ - Local Data  │          │ - User/Accounts    │
│ - Mappings    │          │ - Orders           │
│ - Audit Trail │          │ - Positions        │
└───────────────┘          │ - Transactions     │
                           └────────────────────┘
```

### 3.2 Data Flow: Gift Approval to Order Execution

```
1. Contributor makes gift
   ↓
2. Gift stored with status='pending'
   ↓
3. Parent reviews gift in UI
   ↓
4. Parent approves gift
   ↓
5. Backend checks DriveWealth account funding
   ↓
6. If insufficient funds:
   - Create deposit request
   - Wait for deposit settlement (4-5 days ACH)
   ↓
7. Create DriveWealth order
   - POST /back-office/orders
   - Market order for fractional shares
   ↓
8. Poll order status
   - GET /back-office/orders/{orderId}
   - Wait for status='FILLED'
   ↓
9. Update local database
   - Update gift status='executed'
   - Sync portfolio_holdings from DriveWealth positions
   ↓
10. Notify contributor of successful investment
```

### 3.3 Component Architecture

**New Backend Components**

1. **DriveWealth Service Layer** (`server/services/drivewealth/`)
   - `auth.service.ts` - Token management and refresh
   - `users.service.ts` - User/account creation and management
   - `orders.service.ts` - Order creation and tracking
   - `positions.service.ts` - Position retrieval and sync
   - `deposits.service.ts` - Funding and withdrawal management
   - `instruments.service.ts` - Security search and information
   - `webhooks.service.ts` - Event handling from DriveWealth

2. **Integration Manager** (`server/services/integration-manager.ts`)
   - Orchestrates DriveWealth operations
   - Manages state transitions
   - Handles error recovery
   - Maintains audit trail

3. **Sync Service** (`server/services/sync.service.ts`)
   - Periodic position synchronization
   - Order status polling
   - Account balance updates
   - Reconciliation checks

4. **Webhook Handler** (`server/routes/webhooks.routes.ts`)
   - Receives DriveWealth events
   - Processes order updates
   - Handles account events
   - Updates local database

### 3.4 Authentication Flow

**DriveWealth Session Management**

```typescript
// Token stored in memory with expiration tracking
interface DriveWealthSession {
  accessToken: string;
  expiresAt: Date;
  clientId: string;
}

// Automatic token refresh before expiration
class DriveWealthAuthService {
  private session: DriveWealthSession | null = null;
  
  async getToken(): Promise<string> {
    if (!this.session || this.isExpiringSoon()) {
      await this.refreshToken();
    }
    return this.session.accessToken;
  }
  
  private isExpiringSoon(): boolean {
    // Refresh 5 minutes before expiration
    const bufferMs = 5 * 60 * 1000;
    return Date.now() + bufferMs >= this.session.expiresAt.getTime();
  }
}
```

---

## 4. Implementation Phases

### Phase 1: Foundation & Sandbox Setup (Week 1-2)

**Objectives**
- Set up DriveWealth Sandbox access
- Implement authentication layer
- Create basic service architecture
- Test connectivity

**Tasks**
1. Obtain DriveWealth Sandbox credentials
   - Contact DriveWealth for partner access
   - Receive `clientID` and `clientSecret`
   - Document API rate limits

2. Environment Configuration
   - Add DriveWealth environment variables
   - Create configuration management
   - Set up separate sandbox/production configs

3. Authentication Service
   - Implement token generation
   - Build token refresh mechanism
   - Add error handling and retry logic
   - Create authentication middleware

4. Basic Service Layer
   - Create DriveWealth service base class
   - Implement HTTP client with retry logic
   - Add request/response logging
   - Build error mapping

5. Testing
   - Test authentication flow
   - Verify token refresh
   - Test error scenarios
   - Document API behavior

**Deliverables**
- Working authentication with DriveWealth Sandbox
- Service layer foundation
- Configuration management
- Test suite for authentication

**Success Criteria**
- Successfully generate and refresh tokens
- Handle authentication errors gracefully
- Log all API interactions
- Pass all authentication tests

---

### Phase 2: User & Account Management (Week 3-4)

**Objectives**
- Implement DriveWealth user creation
- Create custodial account setup
- Map StockSprout users to DriveWealth accounts
- Handle KYC requirements

**Tasks**

1. Database Schema Extensions
   ```sql
   -- Add DriveWealth mapping columns
   ALTER TABLE users ADD COLUMN drivewealth_user_id VARCHAR(255);
   ALTER TABLE users ADD COLUMN drivewealth_kyc_status VARCHAR(50);
   ALTER TABLE users ADD COLUMN ssn_encrypted TEXT; -- For custodian
   
   ALTER TABLE children ADD COLUMN drivewealth_account_id VARCHAR(255);
   ALTER TABLE children ADD COLUMN drivewealth_account_no VARCHAR(50);
   ALTER TABLE children ADD COLUMN ssn_encrypted TEXT; -- For minor
   ALTER TABLE children ADD COLUMN account_status VARCHAR(50);
   ```

2. User Service Implementation
   - Create DriveWealth user on StockSprout signup
   - Collect required KYC information
   - Handle document upload for non-US residents
   - Map StockSprout user to DriveWealth user

3. Custodial Account Service
   - Create custodial account for each child
   - Link to parent's DriveWealth user
   - Store account mapping in database
   - Handle account approval workflow

4. KYC Data Collection
   - Extend signup form for required fields
   - Add SSN collection (encrypted storage)
   - Collect employment information
   - Add investor profile questions
   - Implement document upload UI

5. Account Status Management
   - Track account approval status
   - Handle pending/approved/rejected states
   - Implement status polling
   - Add UI indicators for account status

**Deliverables**
- User creation integrated with DriveWealth
- Custodial account creation for children
- KYC data collection forms
- Account status tracking

**Success Criteria**
- Create DriveWealth user on signup
- Successfully create custodial accounts
- Store and retrieve account mappings
- Handle KYC approval workflow

---

### Phase 3: Funding & Money Movement (Week 5-6)

**Objectives**
- Implement bank account linking
- Enable ACH deposits
- Handle deposit status tracking
- Manage account funding for orders

**Tasks**

1. Bank Account Integration
   - Implement Plaid integration (optional)
   - Manual bank account linking
   - Store bank account information securely
   - Verify micro-deposits (if not using Plaid)

2. Deposit Service
   - Create ACH deposit requests
   - Track deposit status
   - Handle deposit events via webhooks
   - Update account balances

3. Funding Workflow
   - Check account balance before orders
   - Initiate deposits when needed
   - Wait for settlement before trading
   - Handle insufficient funds scenarios

4. Database Extensions
   ```sql
   CREATE TABLE drivewealth_deposits (
     id VARCHAR(255) PRIMARY KEY,
     child_id VARCHAR(255) NOT NULL,
     drivewealth_account_id VARCHAR(255) NOT NULL,
     amount DECIMAL(10, 2) NOT NULL,
     status VARCHAR(50) NOT NULL,
     initiated_at TIMESTAMP NOT NULL,
     settled_at TIMESTAMP,
     drivewealth_deposit_id VARCHAR(255),
     FOREIGN KEY (child_id) REFERENCES children(id)
   );
   ```

5. UI Updates
   - Add bank account linking page
   - Show account balance
   - Display pending deposits
   - Add funding instructions

**Deliverables**
- Bank account linking functionality
- ACH deposit creation
- Deposit status tracking
- Funding workflow integration

**Success Criteria**
- Successfully link bank accounts
- Create ACH deposits
- Track deposit settlement
- Fund accounts before trading

---

### Phase 4: Order Execution & Trading (Week 7-8)

**Objectives**
- Implement order creation from approved gifts
- Track order status
- Handle order fills and partial fills
- Sync positions after execution

**Tasks**

1. Order Service Implementation
   - Create market orders for approved gifts
   - Calculate fractional shares
   - Submit orders to DriveWealth
   - Store order mappings

2. Order Status Tracking
   - Poll order status periodically
   - Handle order state transitions
   - Process fill notifications
   - Update gift status based on order status

3. Database Extensions
   ```sql
   CREATE TABLE drivewealth_orders (
     id VARCHAR(255) PRIMARY KEY,
     gift_id VARCHAR(255) NOT NULL,
     child_id VARCHAR(255) NOT NULL,
     drivewealth_order_id VARCHAR(255) NOT NULL,
     drivewealth_order_no VARCHAR(50),
     symbol VARCHAR(10) NOT NULL,
     side VARCHAR(10) NOT NULL,
     quantity DECIMAL(10, 6) NOT NULL,
     amount DECIMAL(10, 2) NOT NULL,
     status VARCHAR(50) NOT NULL,
     average_price DECIMAL(10, 2),
     filled_quantity DECIMAL(10, 6),
     created_at TIMESTAMP NOT NULL,
     filled_at TIMESTAMP,
     FOREIGN KEY (gift_id) REFERENCES gifts(id),
     FOREIGN KEY (child_id) REFERENCES children(id)
   );
   ```

4. Gift Approval Integration
   - Modify gift approval endpoint
   - Check account funding
   - Create DriveWealth order
   - Update gift with order reference

5. Error Handling
   - Handle order rejections
   - Retry failed orders
   - Notify users of issues
   - Implement fallback mechanisms

**Deliverables**
- Order creation from approved gifts
- Order status tracking system
- Order-to-gift mapping
- Error handling and retry logic

**Success Criteria**
- Successfully create orders
- Track order execution
- Handle all order states
- Update portfolios after fills

---

### Phase 5: Position Sync & Portfolio Management (Week 9-10)

**Objectives**
- Sync positions from DriveWealth
- Update portfolio holdings
- Calculate performance metrics
- Reconcile local vs DriveWealth data

**Tasks**

1. Position Sync Service
   - Fetch positions from DriveWealth
   - Update portfolio_holdings table
   - Calculate current values
   - Track cost basis

2. Reconciliation Service
   - Compare local vs DriveWealth positions
   - Identify discrepancies
   - Generate reconciliation reports
   - Alert on mismatches

3. Scheduled Sync Jobs
   - Implement periodic position sync (hourly)
   - Sync account balances
   - Update order statuses
   - Refresh market data

4. Performance Calculations
   - Calculate gains/losses from DriveWealth data
   - Update portfolio metrics
   - Track historical performance
   - Generate performance reports

5. Database Updates
   ```sql
   ALTER TABLE portfolio_holdings 
     ADD COLUMN drivewealth_position_id VARCHAR(255),
     ADD COLUMN last_synced_at TIMESTAMP,
     ADD COLUMN cost_basis DECIMAL(10, 2),
     ADD COLUMN unrealized_gain_loss DECIMAL(10, 2);
   ```

**Deliverables**
- Position synchronization service
- Reconciliation system
- Scheduled sync jobs
- Performance tracking

**Success Criteria**
- Positions match DriveWealth
- Automatic reconciliation
- Real-time portfolio values
- Accurate performance metrics

---

### Phase 6: Webhooks & Real-Time Updates (Week 11)

**Objectives**
- Implement webhook endpoint
- Process DriveWealth events
- Enable real-time updates
- Reduce polling overhead

**Tasks**

1. Webhook Endpoint
   - Create webhook receiver endpoint
   - Implement signature verification
   - Parse event payloads
   - Route events to handlers

2. Event Handlers
   - Order events (filled, canceled, rejected)
   - Account events (approved, suspended)
   - Deposit events (settled, failed)
   - Position events (updated)

3. Event Processing
   - Update local database from events
   - Trigger notifications
   - Update UI via WebSocket/SSE
   - Log all events

4. Security
   - Verify webhook signatures
   - Implement replay protection
   - Rate limit webhook endpoint
   - Log suspicious activity

5. Testing
   - Test with DriveWealth webhook simulator
   - Verify all event types
   - Test error scenarios
   - Load test webhook endpoint

**Deliverables**
- Webhook endpoint implementation
- Event processing system
- Real-time update mechanism
- Security measures

**Success Criteria**
- Receive and process all event types
- Verify webhook authenticity
- Update system in real-time
- Handle high event volume

---

### Phase 7: Testing & Validation (Week 12)

**Objectives**
- Comprehensive end-to-end testing
- Validate all workflows
- Test error scenarios
- Performance testing

**Tasks**

1. End-to-End Testing
   - Test complete user journey
   - Verify all integrations
   - Test edge cases
   - Document test results

2. Sandbox Testing Scenarios
   - Use DriveWealth magic numbers
   - Test partial fills
   - Test order rejections
   - Test account suspensions

3. Error Scenario Testing
   - Network failures
   - API timeouts
   - Invalid data
   - Rate limiting

4. Performance Testing
   - Load test API endpoints
   - Test concurrent operations
   - Measure response times
   - Identify bottlenecks

5. Security Testing
   - Test authentication
   - Verify data encryption
   - Test authorization
   - Audit logging

**Deliverables**
- Test suite with >80% coverage
- Test documentation
- Performance benchmarks
- Security audit report

**Success Criteria**
- All tests passing
- No critical bugs
- Performance meets requirements
- Security validated

---

## 5. Technical Specifications

### 5.1 Environment Variables

```bash
# DriveWealth Configuration
DRIVEWEALTH_ENV=sandbox # or 'production'
DRIVEWEALTH_CLIENT_ID=your_client_id_here
DRIVEWEALTH_CLIENT_SECRET=your_client_secret_here
DRIVEWEALTH_BASE_URL=https://bo-api.drivewealth.io
DRIVEWEALTH_WEBHOOK_SECRET=your_webhook_secret_here

# Encryption Keys
ENCRYPTION_KEY=your_32_byte_encryption_key_here # For SSN encryption
ENCRYPTION_IV=your_16_byte_iv_here

# Existing Variables
DATABASE_URL=postgresql://user:password@localhost:5432/stocksprout
JWT_SECRET=your-super-secret-jwt-key-here
FINNHUB_API_KEY=your-finnhub-api-key-here
PORT=3000
NODE_ENV=development
```

### 5.2 API Rate Limits

**DriveWealth Rate Limits**
- Authentication: 5-10 calls/hour
- General APIs: Varies by endpoint
- Market Data: Higher limits
- Webhooks: No limit (inbound)

**Mitigation Strategies**
- Token caching and reuse
- Request queuing
- Exponential backoff
- Circuit breaker pattern

### 5.3 Error Handling

**Error Categories**
1. Authentication errors (401, 403)
2. Validation errors (400)
3. Not found errors (404)
4. Rate limit errors (429)
5. Server errors (500, 503)

**Handling Strategy**
```typescript
class DriveWealthError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public driveWealthCode?: string,
    public retryable: boolean = false
  ) {
    super(message);
  }
}

async function handleDriveWealthRequest<T>(
  request: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
      
      if (!isRetryable(error)) {
        throw error;
      }
      
      await delay(exponentialBackoff(attempt));
    }
  }
  
  throw lastError;
}
```

### 5.4 Data Encryption

**Sensitive Data Requiring Encryption**
- Social Security Numbers (SSN)
- Bank account numbers
- DriveWealth credentials

**Encryption Approach**
```typescript
import crypto from 'crypto';

class EncryptionService {
  private algorithm = 'aes-256-cbc';
  private key: Buffer;
  private iv: Buffer;
  
  constructor() {
    this.key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
    this.iv = Buffer.from(process.env.ENCRYPTION_IV!, 'hex');
  }
  
  encrypt(text: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }
  
  decrypt(encrypted: string): string {
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

---

## 6. Database Schema Changes

### 6.1 New Tables

```sql
-- DriveWealth user and account mappings
CREATE TABLE drivewealth_mappings (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) REFERENCES users(id),
  child_id VARCHAR(255) REFERENCES children(id),
  drivewealth_user_id VARCHAR(255) NOT NULL,
  drivewealth_account_id VARCHAR(255),
  drivewealth_account_no VARCHAR(50),
  account_type VARCHAR(50) NOT NULL, -- 'custodial', 'teen'
  account_status VARCHAR(50) NOT NULL, -- 'pending', 'approved', 'rejected', 'suspended'
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(drivewealth_user_id),
  UNIQUE(drivewealth_account_id)
);

-- Order tracking
CREATE TABLE drivewealth_orders (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id VARCHAR(255) NOT NULL REFERENCES gifts(id),
  child_id VARCHAR(255) NOT NULL REFERENCES children(id),
  drivewealth_order_id VARCHAR(255) NOT NULL UNIQUE,
  drivewealth_order_no VARCHAR(50),
  symbol VARCHAR(10) NOT NULL,
  side VARCHAR(10) NOT NULL, -- 'BUY', 'SELL'
  order_type VARCHAR(20) NOT NULL, -- 'MARKET', 'LIMIT'
  quantity DECIMAL(10, 6) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'NEW', 'PARTIAL_FILL', 'FILLED', 'CANCELED', 'REJECTED'
  average_price DECIMAL(10, 2),
  filled_quantity DECIMAL(10, 6),
  fees DECIMAL(10, 2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  filled_at TIMESTAMP
);

CREATE INDEX idx_drivewealth_orders_gift_id ON drivewealth_orders(gift_id);
CREATE INDEX idx_drivewealth_orders_status ON drivewealth_orders(status);

-- Deposit tracking
CREATE TABLE drivewealth_deposits (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id VARCHAR(255) NOT NULL REFERENCES children(id),
  drivewealth_account_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  method VARCHAR(20) NOT NULL, -- 'ACH', 'WIRE'
  status VARCHAR(50) NOT NULL, -- 'PENDING', 'PROCESSING', 'SETTLED', 'FAILED', 'CANCELED'
  drivewealth_deposit_id VARCHAR(255),
  initiated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  settled_at TIMESTAMP,
  failed_reason TEXT
);

CREATE INDEX idx_drivewealth_deposits_child_id ON drivewealth_deposits(child_id);
CREATE INDEX idx_drivewealth_deposits_status ON drivewealth_deposits(status);

-- Bank accounts
CREATE TABLE bank_accounts (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  drivewealth_bank_account_id VARCHAR(255),
  account_holder_name VARCHAR(255) NOT NULL,
  bank_name VARCHAR(255),
  account_number_encrypted TEXT NOT NULL,
  routing_number_encrypted TEXT NOT NULL,
  account_type VARCHAR(20) NOT NULL, -- 'CHECKING', 'SAVINGS'
  status VARCHAR(50) NOT NULL, -- 'PENDING', 'VERIFIED', 'FAILED'
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMP
);

CREATE INDEX idx_bank_accounts_user_id ON bank_accounts(user_id);

-- Webhook events log
CREATE TABLE drivewealth_webhook_events (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR(255) NOT NULL UNIQUE,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP,
  error_message TEXT,
  received_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_type ON drivewealth_webhook_events(event_type);
CREATE INDEX idx_webhook_events_processed ON drivewealth_webhook_events(processed);

-- Sync status tracking
CREATE TABLE sync_status (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- 'positions', 'orders', 'balances'
  entity_id VARCHAR(255) NOT NULL,
  last_synced_at TIMESTAMP NOT NULL,
  sync_status VARCHAR(50) NOT NULL, -- 'success', 'failed', 'in_progress'
  error_message TEXT,
  UNIQUE(entity_type, entity_id)
);

CREATE INDEX idx_sync_status_entity ON sync_status(entity_type, entity_id);
```

### 6.2 Modified Tables

```sql
-- Add DriveWealth fields to users table
ALTER TABLE users 
  ADD COLUMN drivewealth_user_id VARCHAR(255) UNIQUE,
  ADD COLUMN drivewealth_kyc_status VARCHAR(50),
  ADD COLUMN ssn_encrypted TEXT,
  ADD COLUMN date_of_birth DATE,
  ADD COLUMN address_line1 TEXT,
  ADD COLUMN address_line2 TEXT,
  ADD COLUMN city TEXT,
  ADD COLUMN state VARCHAR(2),
  ADD COLUMN postal_code VARCHAR(20),
  ADD COLUMN country VARCHAR(2) DEFAULT 'US',
  ADD COLUMN employment_status VARCHAR(50),
  ADD COLUMN employer_name TEXT,
  ADD COLUMN occupation TEXT,
  ADD COLUMN annual_income DECIMAL(12, 2),
  ADD COLUMN net_worth DECIMAL(12, 2),
  ADD COLUMN investment_experience VARCHAR(50),
  ADD COLUMN risk_tolerance VARCHAR(50);

-- Add DriveWealth fields to children table
ALTER TABLE children
  ADD COLUMN drivewealth_account_id VARCHAR(255) UNIQUE,
  ADD COLUMN drivewealth_account_no VARCHAR(50) UNIQUE,
  ADD COLUMN ssn_encrypted TEXT,
  ADD COLUMN account_status VARCHAR(50) DEFAULT 'not_created',
  ADD COLUMN account_created_at TIMESTAMP,
  ADD COLUMN account_approved_at TIMESTAMP;

-- Add DriveWealth fields to portfolio_holdings table
ALTER TABLE portfolio_holdings
  ADD COLUMN drivewealth_position_id VARCHAR(255),
  ADD COLUMN last_synced_at TIMESTAMP,
  ADD COLUMN cost_basis DECIMAL(10, 2),
  ADD COLUMN unrealized_gain_loss DECIMAL(10, 2),
  ADD COLUMN realized_gain_loss DECIMAL(10, 2);

-- Add order reference to gifts table
ALTER TABLE gifts
  ADD COLUMN drivewealth_order_id VARCHAR(255),
  ADD COLUMN execution_status VARCHAR(50), -- 'pending', 'funding', 'ordering', 'executed', 'failed'
  ADD COLUMN execution_error TEXT;

CREATE INDEX idx_gifts_execution_status ON gifts(execution_status);
```

---

## 7. API Endpoints to Implement

### 7.1 DriveWealth Service Endpoints (Backend Only)

These are internal service methods, not exposed as REST endpoints:

**Authentication Service**
```typescript
class DriveWealthAuthService {
  async getToken(): Promise<string>
  async refreshToken(): Promise<void>
}
```

**User Service**
```typescript
class DriveWealthUserService {
  async createUser(userData: CreateUserData): Promise<DriveWealthUser>
  async getUser(userId: string): Promise<DriveWealthUser>
  async updateUser(userId: string, updates: UpdateUserData): Promise<DriveWealthUser>
  async uploadDocument(userId: string, document: DocumentData): Promise<void>
}
```

**Account Service**
```typescript
class DriveWealthAccountService {
  async createCustodialAccount(
    userId: string,
    childData: ChildData
  ): Promise<DriveWealthAccount>
  async getAccount(accountId: string): Promise<DriveWealthAccount>
  async getAccountBalance(accountId: string): Promise<AccountBalance>
  async getAccountStatus(accountId: string): Promise<AccountStatus>
}
```

**Order Service**
```typescript
class DriveWealthOrderService {
  async createOrder(orderData: CreateOrderData): Promise<DriveWealthOrder>
  async getOrder(orderId: string): Promise<DriveWealthOrder>
  async cancelOrder(orderId: string): Promise<void>
  async getOrdersByAccount(accountId: string): Promise<DriveWealthOrder[]>
}
```

**Position Service**
```typescript
class DriveWealthPositionService {
  async getPositions(accountId: string): Promise<Position[]>
  async getPosition(accountId: string, instrumentId: string): Promise<Position>
}
```

**Deposit Service**
```typescript
class DriveWealthDepositService {
  async createDeposit(depositData: CreateDepositData): Promise<Deposit>
  async getDeposit(depositId: string): Promise<Deposit>
  async getDepositsByAccount(accountId: string): Promise<Deposit[]>
}
```

**Instrument Service**
```typescript
class DriveWealthInstrumentService {
  async searchInstruments(query: string): Promise<Instrument[]>
  async getInstrument(symbol: string): Promise<Instrument>
  async getQuote(symbol: string): Promise<Quote>
}
```

### 7.2 Modified StockSprout API Endpoints

**User Registration** (Modified)
```
POST /api/auth/signup
Request Body:
{
  "email": "parent@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "phone": "+15551234567",
  // NEW FIELDS FOR DRIVEWEALTH
  "dateOfBirth": "1985-06-15",
  "ssn": "123-45-6789",
  "address": {
    "line1": "123 Main St",
    "line2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US"
  },
  "employment": {
    "status": "EMPLOYED",
    "employerName": "Acme Corp",
    "occupation": "Software Engineer"
  },
  "financial": {
    "annualIncome": 100000,
    "netWorth": 250000,
    "investmentExperience": "MODERATE",
    "riskTolerance": "MODERATE"
  }
}

Response:
{
  "user": { ... },
  "token": "jwt_token",
  "driveWealthStatus": "pending" // or "approved"
}
```

**Add Child** (Modified)
```
POST /api/children
Request Body:
{
  "firstName": "Emma",
  "lastName": "Doe",
  "birthdate": "2015-03-20",
  "profileImageUrl": "...",
  // NEW FIELDS FOR DRIVEWEALTH
  "ssn": "987-65-4321"
}

Response:
{
  "child": {
    "id": "child_123",
    "firstName": "Emma",
    "lastName": "Doe",
    "giftLinkCode": "ABC123",
    "driveWealthAccountId": "dw_acc_456",
    "driveWealthAccountNo": "DWCU000123",
    "accountStatus": "pending" // or "approved"
  }
}
```

**Approve Gift** (Modified)
```
PATCH /api/gifts/:giftId/approve
Response:
{
  "gift": {
    "id": "gift_123",
    "status": "approved",
    "executionStatus": "funding" // or "ordering", "executed"
  },
  "order": {
    "id": "order_456",
    "driveWealthOrderId": "dw_order_789",
    "status": "NEW"
  }
}
```

**Get Portfolio** (Modified)
```
GET /api/portfolio/:childId
Response:
{
  "child": { ... },
  "holdings": [
    {
      "id": "holding_123",
      "investment": { ... },
      "shares": 10.5,
      "averageCost": 150.00,
      "currentValue": 1575.00,
      "costBasis": 1575.00,
      "unrealizedGainLoss": 0.00,
      "lastSyncedAt": "2025-10-28T10:30:00Z",
      "driveWealthPositionId": "dw_pos_456"
    }
  ],
  "totalValue": 1575.00,
  "totalCostBasis": 1575.00,
  "totalGainLoss": 0.00,
  "cashBalance": 100.00,
  "lastSyncedAt": "2025-10-28T10:30:00Z"
}
```

### 7.3 New API Endpoints

**Bank Account Management**
```
POST /api/bank-accounts
GET /api/bank-accounts
DELETE /api/bank-accounts/:id
```

**Deposit Management**
```
POST /api/deposits
GET /api/deposits/:childId
GET /api/deposits/:depositId/status
```

**Account Status**
```
GET /api/children/:childId/account-status
```

**Sync Operations**
```
POST /api/sync/positions/:childId
POST /api/sync/orders/:childId
GET /api/sync/status/:childId
```

**Webhooks**
```
POST /api/webhooks/drivewealth
```

---

## 8. Security Considerations

### 8.1 Data Protection

**Sensitive Data Encryption**
- SSN: AES-256-CBC encryption at rest
- Bank account numbers: AES-256-CBC encryption
- DriveWealth credentials: Environment variables only
- API tokens: In-memory storage, never persisted

**PII Handling**
- Minimize PII storage
- Encrypt all PII fields
- Implement data retention policies
- Support data deletion requests (GDPR/CCPA)

### 8.2 Authentication & Authorization

**Multi-Layer Security**
1. User authentication (JWT)
2. DriveWealth API authentication (session tokens)
3. Webhook signature verification
4. Rate limiting on all endpoints

**Authorization Checks**
- Verify user owns child account
- Verify user can approve gifts
- Verify user can access portfolio
- Verify user can manage bank accounts

### 8.3 Compliance

**Regulatory Requirements**
- FINRA compliance
- SEC regulations
- State securities laws
- Privacy laws (GDPR, CCPA)

**Audit Trail**
- Log all DriveWealth API calls
- Log all order executions
- Log all account changes
- Retain logs for 7 years

### 8.4 API Security

**DriveWealth API**
- HTTPS only
- Token rotation
- Rate limit handling
- Request signing (webhooks)

**StockSprout API**
- HTTPS only
- CORS configuration
- Input validation (Zod)
- SQL injection protection (Drizzle ORM)

---

## 9. Testing Strategy

### 9.1 Unit Testing

**Components to Test**
- DriveWealth service methods
- Data transformation functions
- Encryption/decryption
- Error handling

**Tools**
- Jest for test framework
- Mock DriveWealth API responses
- Test coverage >80%

### 9.2 Integration Testing

**Test Scenarios**
- User creation flow
- Account creation flow
- Order execution flow
- Position sync flow
- Webhook processing

**Sandbox Testing**
- Use DriveWealth magic numbers
- Test all order states
- Test error scenarios
- Test edge cases

### 9.3 End-to-End Testing

**User Journeys**
1. Parent signup → Child creation → Account approval
2. Gift received → Approval → Funding → Order → Execution
3. Position sync → Portfolio display
4. Deposit → Settlement → Trading

**Tools**
- Playwright for E2E tests
- Test against Sandbox environment
- Automated test suite

### 9.4 Performance Testing

**Load Testing**
- Concurrent user operations
- High-volume gift approvals
- Webhook event processing
- Position sync at scale

**Metrics**
- API response times <500ms
- Order execution <5 seconds
- Position sync <10 seconds
- Webhook processing <1 second

---

## 10. Deployment Strategy

### 10.1 Phased Rollout

**Phase 1: Internal Testing**
- Deploy to staging environment
- Test with internal accounts
- Validate all workflows
- Fix critical bugs

**Phase 2: Beta Testing**
- Limited user group (10-20 families)
- Monitor closely
- Gather feedback
- Iterate quickly

**Phase 3: Production Launch**
- Gradual rollout to all users
- Monitor system health
- 24/7 support during launch
- Rollback plan ready

### 10.2 Environment Strategy

**Environments**
1. **Development**: Local + DriveWealth Sandbox
2. **Staging**: Hosted + DriveWealth Sandbox
3. **Production**: Hosted + DriveWealth Production

**Configuration Management**
- Environment-specific configs
- Secrets management (Replit Secrets, AWS Secrets Manager)
- Feature flags for gradual rollout

### 10.3 Monitoring & Alerting

**Metrics to Monitor**
- API response times
- Error rates
- Order execution success rate
- Position sync accuracy
- Webhook processing latency

**Alerting**
- Failed order executions
- Position sync failures
- High error rates
- API downtime
- Webhook delivery failures

**Tools**
- Application logs (Winston, Pino)
- Error tracking (Sentry)
- Performance monitoring (New Relic, DataDog)
- Uptime monitoring (Pingdom, UptimeRobot)

### 10.4 Rollback Plan

**Rollback Triggers**
- Critical bugs affecting trading
- Data integrity issues
- High error rates (>5%)
- DriveWealth API issues

**Rollback Process**
1. Disable new account creation
2. Disable gift approvals
3. Switch to read-only mode
4. Investigate and fix issues
5. Gradual re-enable

---

## 11. Risk Assessment

### 11.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| DriveWealth API downtime | High | Low | Implement retry logic, queue operations, graceful degradation |
| Order execution failures | High | Medium | Retry mechanism, manual intervention process, user notifications |
| Position sync discrepancies | Medium | Medium | Reconciliation service, alerts, manual review process |
| Data loss during migration | High | Low | Comprehensive backups, rollback plan, staged migration |
| Performance degradation | Medium | Medium | Load testing, caching, optimization, scaling plan |

### 11.2 Regulatory Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Non-compliance with FINRA | High | Low | Legal review, compliance audit, DriveWealth guidance |
| KYC/AML violations | High | Low | Thorough KYC process, document verification, audit trail |
| Privacy law violations | High | Low | Data encryption, retention policies, user consent |
| Unauthorized trading | High | Low | Authorization checks, audit logs, approval workflows |

### 11.3 Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| User confusion with new flow | Medium | High | Clear UI/UX, onboarding, documentation, support |
| Increased support burden | Medium | High | Comprehensive FAQ, automated support, training |
| Partnership issues with DriveWealth | High | Low | Clear SLA, backup plan, regular communication |
| Cost overruns | Medium | Medium | Budget tracking, cost optimization, phased approach |

---

## 12. Future Enhancements

### 12.1 Phase 2 Features (Post-Launch)

**Enhanced Trading**
- ETF support (when DriveWealth enables for custodial)
- Recurring investment automation
- Dollar-cost averaging
- Rebalancing tools

**Advanced Portfolio Management**
- Tax-loss harvesting
- Performance analytics
- Benchmark comparisons
- Asset allocation recommendations

**Expanded Money Movement**
- Wire transfer support
- International transfers
- Multiple funding sources
- Automatic funding

### 12.2 Long-Term Vision

**Educational Integration**
- Investment education tied to real portfolio
- Gamification with real stakes
- Financial literacy curriculum
- Parent-child learning tools

**Social Features**
- Portfolio sharing (privacy-controlled)
- Milestone celebrations
- Community features
- Gift matching programs

**Platform Expansion**
- Mobile app (React Native)
- Advisor portal
- Institutional partnerships
- White-label solution

---

## Appendix A: DriveWealth API Endpoints Reference

### Authentication
- `POST /back-office/auth/tokens` - Create session token

### Users
- `POST /back-office/users` - Create user
- `GET /back-office/users/{userId}` - Get user
- `PATCH /back-office/users/{userId}` - Update user

### Accounts
- `POST /back-office/accounts` - Create account
- `GET /back-office/accounts/{accountId}` - Get account
- `PATCH /back-office/accounts/{accountId}` - Update account
- `GET /back-office/accounts/{accountId}/summary` - Get account summary

### Orders
- `POST /back-office/orders` - Create order
- `GET /back-office/orders/{orderId}` - Get order
- `PATCH /back-office/orders/{orderId}` - Cancel order
- `GET /back-office/accounts/{accountId}/orders` - Get orders by account

### Positions
- `GET /back-office/accounts/{accountId}/positions` - Get positions

### Deposits
- `POST /back-office/deposits` - Create deposit
- `GET /back-office/deposits/{depositId}` - Get deposit
- `GET /back-office/accounts/{accountId}/deposits` - Get deposits by account

### Instruments
- `GET /back-office/instruments` - Search instruments
- `GET /back-office/instruments/{instrumentId}` - Get instrument

### Market Data
- `GET /back-office/quotes` - Get quotes
- `GET /back-office/bars` - Get historical data

---

## Appendix B: Glossary

**Custodial Account (UTMA/UGMA)**: A brokerage account where an adult manages investments on behalf of a minor. Assets are irrevocably owned by the minor and transfer at age of majority.

**KYC (Know Your Customer)**: Regulatory requirement to verify customer identity and collect personal information.

**AML (Anti-Money Laundering)**: Regulations to prevent money laundering through financial institutions.

**Fractional Shares**: Ownership of less than one full share of stock (e.g., 0.5 shares of AAPL).

**Market Order**: Order to buy/sell immediately at current market price.

**Limit Order**: Order to buy/sell at a specific price or better.

**Settlement**: Process of finalizing a trade, typically T+2 (trade date plus 2 business days).

**Position**: Current holding of a security in an account.

**Cost Basis**: Original purchase price of an investment, used for tax calculations.

**Unrealized Gain/Loss**: Profit/loss on current holdings that haven't been sold.

**Realized Gain/Loss**: Profit/loss on investments that have been sold.

---

## Appendix C: Contact Information

**DriveWealth Support**
- Developer Portal: https://developer.drivewealth.com
- Support Email: apisupport@drivewealth.com
- Documentation: https://developer.drivewealth.com/apis/docs

**StockSprout Team**
- Technical Lead: [To be assigned]
- Project Manager: [To be assigned]
- Compliance Officer: [To be assigned]

---

## Document Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-28 | Devin AI | Initial comprehensive integration plan |

---

**END OF DOCUMENT**
