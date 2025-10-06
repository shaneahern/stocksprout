import { 
  type User, 
  type InsertUser, 
  type Child, 
  type InsertChild,
  type Investment,
  type InsertInvestment,
  type PortfolioHolding,
  type InsertPortfolioHolding,
  type Gift,
  type InsertGift,
  type ThankYouMessage,
  type InsertThankYouMessage,
  type UpdateProfileData,
  type Contributor,
  type InsertContributor,
  type SproutRequest,
  type InsertSproutRequest,
  type RecurringContribution,
  type InsertRecurringContribution,
  users,
  children,
  investments,
  portfolioHoldings,
  gifts,
  thankYouMessages,
  contributors,
  sproutRequests,
  recurringContributions
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, ilike, desc, and, isNull } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: string, updates: UpdateProfileData): Promise<User | undefined>;

  // Children
  getChild(id: string): Promise<Child | undefined>;
  getChildByGiftCode(giftCode: string): Promise<Child | undefined>;
  getChildrenByParent(parentId: string): Promise<Child[]>;
  createChild(child: InsertChild): Promise<Child>;
  updateChild(id: string, updates: Partial<Child>): Promise<Child | undefined>;
  generateGiftLinkCode(): string;

  // Investments
  getInvestment(id: string): Promise<Investment | undefined>;
  getInvestmentBySymbol(symbol: string): Promise<Investment | undefined>;
  getAllInvestments(): Promise<Investment[]>;
  searchInvestments(query: string): Promise<Investment[]>;
  createInvestment(investment: InsertInvestment): Promise<Investment>;

  // Portfolio Holdings
  getPortfolioHolding(id: string): Promise<PortfolioHolding | undefined>;
  getPortfolioHoldingsByChild(childId: string): Promise<PortfolioHolding[]>;
  getPortfolioHoldingByInvestment(childId: string, investmentId: string): Promise<PortfolioHolding | undefined>;
  createPortfolioHolding(holding: InsertPortfolioHolding): Promise<PortfolioHolding>;
  updatePortfolioHolding(id: string, updates: Partial<PortfolioHolding>): Promise<PortfolioHolding | undefined>;

  // Gifts
  getGift(id: string): Promise<Gift | undefined>;
  getGiftsByChild(childId: string): Promise<Gift[]>;
  getRecentGiftsByChild(childId: string, limit?: number): Promise<Gift[]>;
  createGift(gift: InsertGift): Promise<Gift>;
  markGiftAsViewed(id: string): Promise<void>;
  approveGift(id: string): Promise<void>;
  rejectGift(id: string): Promise<void>;

  // Thank You Messages
  createThankYouMessage(message: InsertThankYouMessage): Promise<ThankYouMessage>;
  getThankYouMessagesByGift(giftId: string): Promise<ThankYouMessage[]>;

  // Contributors
  getContributor(id: string): Promise<Contributor | undefined>;
  getContributorByEmail(email: string): Promise<Contributor | undefined>;
  getContributorByPhone(phone: string): Promise<Contributor | undefined>;
  createContributor(contributor: InsertContributor): Promise<Contributor>;
  updateContributor(id: string, updates: Partial<Contributor>): Promise<Contributor | undefined>;
  linkGiftsToContributor(email: string, contributorId: string): Promise<void>;
  getGiftsByContributor(contributorId: string): Promise<any[]>;

  // Sprout Requests
  getSproutRequest(id: string): Promise<SproutRequest | undefined>;
  getSproutRequestByCode(code: string): Promise<SproutRequest | undefined>;
  getSproutRequestsByChild(childId: string): Promise<SproutRequest[]>;
  getSproutRequestsByParent(parentId: string): Promise<SproutRequest[]>;
  createSproutRequest(request: InsertSproutRequest): Promise<SproutRequest>;
  updateSproutRequestStatus(id: string, status: string): Promise<void>;
  generateSproutRequestCode(): string;

  // Recurring Contributions
  getRecurringContribution(id: string): Promise<RecurringContribution | undefined>;
  getRecurringContributionsByChild(childId: string): Promise<RecurringContribution[]>;
  getRecurringContributionsByContributor(contributorId: string): Promise<RecurringContribution[]>;
  getActiveRecurringContributions(): Promise<RecurringContribution[]>;
  createRecurringContribution(contribution: InsertRecurringContribution): Promise<RecurringContribution>;
  updateRecurringContribution(id: string, updates: Partial<RecurringContribution>): Promise<RecurringContribution | undefined>;
  cancelRecurringContribution(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Removed mock data seeding - use only real data entered through UI
    this.seedInvestments();
  }

  private async seedInvestments() {
    // Check if investments already exist
    const existingInvestments = await db.select().from(investments).limit(1);
    if (existingInvestments.length > 0) return;
    
    console.log("Seeding investment options...");
    
    try {
    // Investment options (real market data for selection)
    const mockInvestments: Investment[] = [
      {
        id: "inv-1",
        symbol: "SPY",
        name: "S&P 500 ETF",
        type: "etf",
        currentPrice: "445.20",
        ytdReturn: "11.2"
      },
      {
        id: "inv-2",
        symbol: "VTI",
        name: "Total Stock Market ETF",
        type: "etf",
        currentPrice: "242.18",
        ytdReturn: "12.8"
      },
      {
        id: "inv-3",
        symbol: "AAPL",
        name: "Apple Inc",
        type: "stock",
        currentPrice: "189.95",
        ytdReturn: "14.8"
      },
      {
        id: "inv-4",
        symbol: "MSFT",
        name: "Microsoft Corporation",
        type: "stock",
        currentPrice: "378.85",
        ytdReturn: "16.2"
      },
      {
        id: "inv-5",
        symbol: "GOOGL",
        name: "Alphabet Inc",
        type: "stock",
        currentPrice: "142.65",
        ytdReturn: "22.1"
      },
      {
        id: "inv-6",
        symbol: "TSLA",
        name: "Tesla Inc",
        type: "stock",
        currentPrice: "241.50",
        ytdReturn: "18.3"
      },
      {
        id: "inv-7",
        symbol: "QQQ",
        name: "Nasdaq 100 ETF",
        type: "etf",
        currentPrice: "405.67",
        ytdReturn: "19.4"
      },
      {
        id: "inv-8",
        symbol: "BTC",
        name: "Bitcoin",
        type: "crypto",
        currentPrice: "43250.00",
        ytdReturn: "24.7"
      },
      {
        id: "inv-9",
        symbol: "ETH",
        name: "Ethereum",
        type: "crypto",
        currentPrice: "2650.80",
        ytdReturn: "31.2"
      },
      {
        id: "inv-10",
        symbol: "VIG",
        name: "Dividend Appreciation ETF",
        type: "etf", 
        currentPrice: "158.45",
        ytdReturn: "8.9"
      }
    ];

      // Seed only investment options
      await db.insert(investments).values(mockInvestments);
      
      console.log("Investment options seeded successfully!");
    } catch (error) {
      console.error("Error seeding sample data:", error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserProfile(id: string, updates: UpdateProfileData): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async getChild(id: string): Promise<Child | undefined> {
    const [child] = await db.select().from(children).where(eq(children.id, id));
    return child;
  }

  async getChildByGiftCode(giftCode: string): Promise<Child | undefined> {
    const [child] = await db.select().from(children).where(eq(children.giftLinkCode, giftCode));
    return child;
  }

  async getChildrenByParent(parentId: string): Promise<Child[]> {
    return await db.select().from(children).where(eq(children.parentId, parentId));
  }

  async createChild(insertChild: InsertChild): Promise<Child> {
    const giftLinkCode = this.generateGiftLinkCode();
    const [child] = await db.insert(children).values({
      ...insertChild,
      giftLinkCode,
      profileImageUrl: insertChild.profileImageUrl ?? null,
      birthday: insertChild.birthday ?? null
    }).returning();
    return child;
  }

  async updateChild(id: string, updates: Partial<Child>): Promise<Child | undefined> {
    const [updated] = await db.update(children)
      .set(updates)
      .where(eq(children.id, id))
      .returning();
    return updated;
  }

  generateGiftLinkCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'FG-';
    for (let i = 0; i < 3; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result += '-';
    for (let i = 0; i < 3; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async getInvestment(id: string): Promise<Investment | undefined> {
    const [investment] = await db.select().from(investments).where(eq(investments.id, id));
    return investment;
  }

  async getInvestmentBySymbol(symbol: string): Promise<Investment | undefined> {
    const [investment] = await db.select().from(investments).where(eq(investments.symbol, symbol));
    return investment;
  }

  async getAllInvestments(): Promise<Investment[]> {
    return await db.select().from(investments);
  }

  async searchInvestments(query: string): Promise<Investment[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    return await db.select().from(investments).where(
      ilike(investments.symbol, searchTerm)
    );
  }

  async createInvestment(insertInvestment: InsertInvestment): Promise<Investment> {
    const [investment] = await db.insert(investments).values(insertInvestment).returning();
    return investment;
  }

  async getPortfolioHolding(id: string): Promise<PortfolioHolding | undefined> {
    const [holding] = await db.select().from(portfolioHoldings).where(eq(portfolioHoldings.id, id));
    return holding;
  }

  async getPortfolioHoldingsByChild(childId: string): Promise<PortfolioHolding[]> {
    return await db.select().from(portfolioHoldings).where(eq(portfolioHoldings.childId, childId));
  }

  async getPortfolioHoldingByInvestment(childId: string, investmentId: string): Promise<PortfolioHolding | undefined> {
    const [holding] = await db.select().from(portfolioHoldings)
      .where(and(
        eq(portfolioHoldings.childId, childId),
        eq(portfolioHoldings.investmentId, investmentId)
      ));
    return holding;
  }

  async createPortfolioHolding(insertHolding: InsertPortfolioHolding): Promise<PortfolioHolding> {
    const [holding] = await db.insert(portfolioHoldings).values(insertHolding).returning();
    return holding;
  }

  async updatePortfolioHolding(id: string, updates: Partial<PortfolioHolding>): Promise<PortfolioHolding | undefined> {
    const [updated] = await db.update(portfolioHoldings)
      .set(updates)
      .where(eq(portfolioHoldings.id, id))
      .returning();
    return updated;
  }

  async getGift(id: string): Promise<Gift | undefined> {
    const [gift] = await db.select().from(gifts).where(eq(gifts.id, id));
    return gift;
  }

  async getGiftsByChild(childId: string): Promise<Gift[]> {
    return await db.select().from(gifts)
      .where(eq(gifts.childId, childId))
      .orderBy(desc(gifts.createdAt));
  }

  async getRecentGiftsByChild(childId: string, limit: number = 5): Promise<Gift[]> {
    const gifts = await this.getGiftsByChild(childId);
    return gifts.slice(0, limit);
  }

  async createGift(insertGift: InsertGift): Promise<Gift> {
    const id = randomUUID();
    
    // Calculate shares based on investment price
    const investment = await this.getInvestment(insertGift.investmentId);
    const shares = investment ? 
      (parseFloat(insertGift.amount) / parseFloat(investment.currentPrice)).toFixed(6) : 
      "0.000000";
    
    const [gift] = await db.insert(gifts).values({
      ...insertGift,
      shares,
      giftGiverEmail: insertGift.giftGiverEmail ?? null,
      message: insertGift.message ?? null,
      videoMessageUrl: insertGift.videoMessageUrl ?? null
    }).returning();
    return gift;
  }

  async markGiftAsViewed(id: string): Promise<void> {
    await db.update(gifts)
      .set({ isViewed: true })
      .where(eq(gifts.id, id));
  }

  async approveGift(id: string): Promise<void> {
    await db.update(gifts)
      .set({ status: 'approved', reviewedAt: new Date() })
      .where(eq(gifts.id, id));
  }

  async rejectGift(id: string): Promise<void> {
    await db.update(gifts)
      .set({ status: 'rejected', reviewedAt: new Date() })
      .where(eq(gifts.id, id));
  }

  async createThankYouMessage(insertMessage: InsertThankYouMessage): Promise<ThankYouMessage> {
    const [message] = await db.insert(thankYouMessages).values(insertMessage).returning();
    return message;
  }

  async getThankYouMessagesByGift(giftId: string): Promise<ThankYouMessage[]> {
    return await db.select().from(thankYouMessages)
      .where(eq(thankYouMessages.giftId, giftId))
      .orderBy(desc(thankYouMessages.createdAt));
  }

  async getContributor(id: string): Promise<Contributor | undefined> {
    const [contributor] = await db.select().from(contributors).where(eq(contributors.id, id));
    return contributor;
  }

  async getContributorByEmail(email: string): Promise<Contributor | undefined> {
    const [contributor] = await db.select().from(contributors).where(eq(contributors.email, email));
    return contributor;
  }

  async getContributorByPhone(phone: string): Promise<Contributor | undefined> {
    const [contributor] = await db.select().from(contributors).where(eq(contributors.phone, phone));
    return contributor;
  }

  async createContributor(insertContributor: InsertContributor): Promise<Contributor> {
    const [contributor] = await db.insert(contributors).values(insertContributor).returning();
    return contributor;
  }

  async updateContributor(id: string, updates: Partial<Contributor>): Promise<Contributor | undefined> {
    const [updated] = await db.update(contributors)
      .set(updates)
      .where(eq(contributors.id, id))
      .returning();
    return updated;
  }

  async linkGiftsToContributor(email: string, contributorId: string): Promise<void> {
    // Find all gifts with this email that don't have a contributorId set
    await db.update(gifts)
      .set({ contributorId })
      .where(
        and(
          eq(gifts.giftGiverEmail, email),
          isNull(gifts.contributorId)
        )
      );
  }

  async getSproutRequest(id: string): Promise<SproutRequest | undefined> {
    const [request] = await db.select().from(sproutRequests).where(eq(sproutRequests.id, id));
    return request;
  }

  async getSproutRequestByCode(code: string): Promise<SproutRequest | undefined> {
    const [request] = await db.select().from(sproutRequests).where(eq(sproutRequests.requestCode, code));
    return request;
  }

  async getSproutRequestsByChild(childId: string): Promise<SproutRequest[]> {
    return await db.select().from(sproutRequests)
      .where(eq(sproutRequests.childId, childId))
      .orderBy(desc(sproutRequests.createdAt));
  }

  async getSproutRequestsByParent(parentId: string): Promise<SproutRequest[]> {
    return await db.select().from(sproutRequests)
      .where(eq(sproutRequests.parentId, parentId))
      .orderBy(desc(sproutRequests.createdAt));
  }

  async createSproutRequest(insertRequest: InsertSproutRequest): Promise<SproutRequest> {
    const requestCode = this.generateSproutRequestCode();
    const [request] = await db.insert(sproutRequests).values({
      ...insertRequest,
      requestCode,
      contributorEmail: insertRequest.contributorEmail ?? null,
      message: insertRequest.message ?? null,
    }).returning();
    return request;
  }

  async updateSproutRequestStatus(id: string, status: string): Promise<void> {
    await db.update(sproutRequests)
      .set({ status, respondedAt: new Date() })
      .where(eq(sproutRequests.id, id));
  }

  generateSproutRequestCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'SR-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async getRecurringContribution(id: string): Promise<RecurringContribution | undefined> {
    const [contribution] = await db.select().from(recurringContributions).where(eq(recurringContributions.id, id));
    return contribution;
  }

  async getRecurringContributionsByChild(childId: string): Promise<RecurringContribution[]> {
    return await db.select().from(recurringContributions)
      .where(eq(recurringContributions.childId, childId))
      .orderBy(desc(recurringContributions.createdAt));
  }

  async getRecurringContributionsByContributor(contributorId: string): Promise<RecurringContribution[]> {
    return await db.select().from(recurringContributions)
      .where(eq(recurringContributions.contributorId, contributorId))
      .orderBy(desc(recurringContributions.createdAt));
  }

  async getActiveRecurringContributions(): Promise<RecurringContribution[]> {
    return await db.select().from(recurringContributions)
      .where(eq(recurringContributions.isActive, true))
      .orderBy(desc(recurringContributions.nextContributionDate));
  }

  async createRecurringContribution(insertContribution: InsertRecurringContribution): Promise<RecurringContribution> {
    const [contribution] = await db.insert(recurringContributions).values({
      ...insertContribution,
      contributorEmail: insertContribution.contributorEmail ?? null,
      contributorId: insertContribution.contributorId ?? null,
    }).returning();
    return contribution;
  }

  async updateRecurringContribution(id: string, updates: Partial<RecurringContribution>): Promise<RecurringContribution | undefined> {
    const [updated] = await db.update(recurringContributions)
      .set(updates)
      .where(eq(recurringContributions.id, id))
      .returning();
    return updated;
  }

  async cancelRecurringContribution(id: string): Promise<void> {
    await db.update(recurringContributions)
      .set({ isActive: false })
      .where(eq(recurringContributions.id, id));
  }

  async getGiftsByContributor(contributorId: string): Promise<any[]> {
    const results = await db
      .select({
        // Gift fields
        id: gifts.id,
        childId: gifts.childId,
        contributorId: gifts.contributorId,
        giftGiverName: gifts.giftGiverName,
        giftGiverEmail: gifts.giftGiverEmail,
        giftGiverProfileImageUrl: gifts.giftGiverProfileImageUrl,
        investmentId: gifts.investmentId,
        amount: gifts.amount,
        shares: gifts.shares,
        message: gifts.message,
        videoMessageUrl: gifts.videoMessageUrl,
        createdAt: gifts.createdAt,
        status: gifts.status,
        // Investment fields
        investmentSymbol: investments.symbol,
        investmentName: investments.name,
        investmentCurrentPrice: investments.currentPrice,
        // Child fields
        childName: children.name,
        childGiftCode: children.giftLinkCode,
        childProfileImageUrl: children.profileImageUrl,
        childAge: children.age,
      })
      .from(gifts)
      .leftJoin(investments, eq(gifts.investmentId, investments.id))
      .leftJoin(children, eq(gifts.childId, children.id))
      .where(eq(gifts.contributorId, contributorId))
      .orderBy(desc(gifts.createdAt));

    // Transform the results to match the expected format
    return results.map(row => ({
      id: row.id,
      childId: row.childId,
      contributorId: row.contributorId,
      giftGiverName: row.giftGiverName,
      giftGiverEmail: row.giftGiverEmail,
      giftGiverProfileImageUrl: row.giftGiverProfileImageUrl,
      investmentId: row.investmentId,
      amount: row.amount,
      shares: row.shares,
      message: row.message,
      videoMessageUrl: row.videoMessageUrl,
      createdAt: row.createdAt,
      status: row.status,
      investment: {
        id: row.investmentId,
        symbol: row.investmentSymbol,
        name: row.investmentName,
        currentPrice: row.investmentCurrentPrice,
      },
      child: {
        id: row.childId,
        name: row.childName,
        giftCode: row.childGiftCode,
        profileImageUrl: row.childProfileImageUrl,
        age: row.childAge,
      }
    }));
  }
}

export const storage = new DatabaseStorage();
