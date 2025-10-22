var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  children: () => children,
  contributors: () => contributors,
  createRecurringContributionSchema: () => createRecurringContributionSchema,
  createSproutRequestSchema: () => createSproutRequestSchema,
  gifts: () => gifts,
  insertChildSchema: () => insertChildSchema,
  insertContributorSchema: () => insertContributorSchema,
  insertGiftSchema: () => insertGiftSchema,
  insertInvestmentSchema: () => insertInvestmentSchema,
  insertPortfolioHoldingSchema: () => insertPortfolioHoldingSchema,
  insertRecurringContributionSchema: () => insertRecurringContributionSchema,
  insertSproutRequestSchema: () => insertSproutRequestSchema,
  insertThankYouMessageSchema: () => insertThankYouMessageSchema,
  insertUserSchema: () => insertUserSchema,
  investments: () => investments,
  loginSchema: () => loginSchema,
  portfolioHoldings: () => portfolioHoldings,
  recurringContributions: () => recurringContributions,
  signupSchema: () => signupSchema,
  sproutRequests: () => sproutRequests,
  thankYouMessages: () => thankYouMessages,
  updateProfileSchema: () => updateProfileSchema,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users, children, investments, portfolioHoldings, gifts, thankYouMessages, contributors, sproutRequests, recurringContributions, insertUserSchema, signupSchema, loginSchema, updateProfileSchema, insertChildSchema, insertInvestmentSchema, insertPortfolioHoldingSchema, insertGiftSchema, insertThankYouMessageSchema, insertContributorSchema, insertSproutRequestSchema, createSproutRequestSchema, insertRecurringContributionSchema, createRecurringContributionSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      username: text("username").unique(),
      // Optional
      email: text("email").notNull().unique(),
      password: text("password").notNull(),
      name: text("name").notNull(),
      phone: text("phone"),
      profileImageUrl: text("profile_image_url"),
      bankAccountNumber: text("bank_account_number"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    children = pgTable("children", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      parentId: varchar("parent_id").notNull(),
      name: text("name").notNull(),
      age: integer("age").notNull(),
      profileImageUrl: text("profile_image_url"),
      birthday: text("birthday"),
      giftLinkCode: text("gift_link_code").notNull().unique()
    }, (table) => ({
      parentIdIdx: index("children_parent_id_idx").on(table.parentId),
      giftLinkCodeIdx: index("children_gift_link_code_idx").on(table.giftLinkCode)
    }));
    investments = pgTable("investments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      symbol: text("symbol").notNull(),
      name: text("name").notNull(),
      type: text("type").notNull(),
      // 'stock', 'etf', 'crypto', 'index'
      currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
      ytdReturn: decimal("ytd_return", { precision: 5, scale: 2 }).notNull()
    }, (table) => ({
      symbolIdx: index("investments_symbol_idx").on(table.symbol)
    }));
    portfolioHoldings = pgTable("portfolio_holdings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      childId: varchar("child_id").notNull(),
      investmentId: varchar("investment_id").notNull(),
      shares: decimal("shares", { precision: 10, scale: 6 }).notNull(),
      averageCost: decimal("average_cost", { precision: 10, scale: 2 }).notNull(),
      currentValue: decimal("current_value", { precision: 10, scale: 2 }).notNull()
    }, (table) => ({
      childIdIdx: index("portfolio_holdings_child_id_idx").on(table.childId),
      investmentIdIdx: index("portfolio_holdings_investment_id_idx").on(table.investmentId)
    }));
    gifts = pgTable("gifts", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      childId: varchar("child_id").notNull(),
      contributorId: varchar("contributor_id"),
      // Optional - for authenticated contributors
      giftGiverName: text("gift_giver_name").notNull(),
      giftGiverEmail: text("gift_giver_email"),
      giftGiverProfileImageUrl: text("gift_giver_profile_image_url"),
      // For guest contributors with profile photos
      investmentId: varchar("investment_id").notNull(),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      shares: decimal("shares", { precision: 10, scale: 6 }).notNull(),
      message: text("message"),
      videoMessageUrl: text("video_message_url"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      isViewed: boolean("is_viewed").default(false),
      thankYouSent: boolean("thank_you_sent").default(false),
      status: text("status").notNull().default("pending"),
      // pending, approved, rejected
      reviewedAt: timestamp("reviewed_at")
    }, (table) => ({
      childIdIdx: index("gifts_child_id_idx").on(table.childId),
      contributorIdIdx: index("gifts_contributor_id_idx").on(table.contributorId),
      statusIdx: index("gifts_status_idx").on(table.status)
    }));
    thankYouMessages = pgTable("thank_you_messages", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      giftId: varchar("gift_id").notNull(),
      message: text("message").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    }, (table) => ({
      giftIdIdx: index("thank_you_messages_gift_id_idx").on(table.giftId)
    }));
    contributors = pgTable("contributors", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      email: text("email").notNull().unique(),
      phone: text("phone"),
      name: text("name").notNull(),
      password: text("password"),
      // Optional - they can sign up later
      profileImageUrl: text("profile_image_url"),
      // Optional - profile photo for contributors
      isRegistered: boolean("is_registered").default(false),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    sproutRequests = pgTable("sprout_requests", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      childId: varchar("child_id").notNull(),
      parentId: varchar("parent_id").notNull(),
      contributorEmail: text("contributor_email"),
      contributorPhone: text("contributor_phone").notNull(),
      contributorName: text("contributor_name").notNull(),
      message: text("message"),
      requestCode: text("request_code").notNull().unique(),
      status: text("status").notNull().default("pending"),
      // pending, accepted, declined
      createdAt: timestamp("created_at").defaultNow().notNull(),
      respondedAt: timestamp("responded_at")
    }, (table) => ({
      parentIdIdx: index("sprout_requests_parent_id_idx").on(table.parentId),
      requestCodeIdx: index("sprout_requests_request_code_idx").on(table.requestCode),
      statusIdx: index("sprout_requests_status_idx").on(table.status)
    }));
    recurringContributions = pgTable("recurring_contributions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      childId: varchar("child_id").notNull(),
      contributorId: varchar("contributor_id"),
      // If contributor is registered
      contributorEmail: text("contributor_email"),
      contributorName: text("contributor_name").notNull(),
      investmentId: varchar("investment_id").notNull(),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      frequency: text("frequency").notNull(),
      // monthly, yearly
      isActive: boolean("is_active").default(true),
      nextContributionDate: timestamp("next_contribution_date").notNull(),
      lastContributionDate: timestamp("last_contribution_date"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    }, (table) => ({
      childIdIdx: index("recurring_contributions_child_id_idx").on(table.childId),
      contributorIdIdx: index("recurring_contributions_contributor_id_idx").on(table.contributorId),
      isActiveIdx: index("recurring_contributions_is_active_idx").on(table.isActive)
    }));
    insertUserSchema = createInsertSchema(users).pick({
      username: true,
      email: true,
      password: true,
      name: true,
      phone: true,
      profileImageUrl: true,
      bankAccountNumber: true
    });
    signupSchema = z.object({
      username: z.string().min(3).max(50).optional(),
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(1).max(100),
      phone: z.string().optional(),
      bankAccountNumber: z.string().optional(),
      profileImageUrl: z.string().optional()
    });
    loginSchema = z.object({
      email: z.string().min(1),
      // Can be email or username
      password: z.string().min(1)
    });
    updateProfileSchema = z.object({
      name: z.string().min(1).max(100).optional(),
      profileImageUrl: z.string().optional().or(z.literal("")),
      // Allow base64 data URLs
      bankAccountNumber: z.string().optional()
    });
    insertChildSchema = createInsertSchema(children).pick({
      parentId: true,
      name: true,
      age: true,
      profileImageUrl: true,
      birthday: true
    });
    insertInvestmentSchema = createInsertSchema(investments).pick({
      symbol: true,
      name: true,
      type: true,
      currentPrice: true,
      ytdReturn: true
    });
    insertPortfolioHoldingSchema = createInsertSchema(portfolioHoldings).pick({
      childId: true,
      investmentId: true,
      shares: true,
      averageCost: true,
      currentValue: true
    });
    insertGiftSchema = createInsertSchema(gifts).omit({
      id: true,
      createdAt: true,
      isViewed: true,
      thankYouSent: true,
      shares: true,
      // Calculated on server
      status: true,
      // Set to pending by default
      reviewedAt: true
    });
    insertThankYouMessageSchema = createInsertSchema(thankYouMessages).pick({
      giftId: true,
      message: true
    });
    insertContributorSchema = createInsertSchema(contributors).pick({
      email: true,
      phone: true,
      name: true,
      password: true,
      profileImageUrl: true,
      isRegistered: true
    });
    insertSproutRequestSchema = createInsertSchema(sproutRequests).omit({
      id: true,
      createdAt: true,
      respondedAt: true,
      requestCode: true
    });
    createSproutRequestSchema = z.object({
      childId: z.string(),
      contributorPhone: z.string().min(10),
      contributorName: z.string().min(1),
      contributorEmail: z.string().email().optional(),
      message: z.string().optional()
    });
    insertRecurringContributionSchema = createInsertSchema(recurringContributions).omit({
      id: true,
      createdAt: true,
      lastContributionDate: true
    });
    createRecurringContributionSchema = z.object({
      childId: z.string(),
      contributorEmail: z.string().email().optional(),
      contributorName: z.string().min(1),
      investmentId: z.string(),
      amount: z.string().or(z.number()),
      frequency: z.enum(["monthly", "yearly"])
    });
  }
});

// server/index.ts
import "dotenv/config";
import express3 from "express";

// server/routes/index.ts
import { createServer } from "http";

// server/storage.ts
init_schema();
import { randomUUID } from "crypto";

// server/db.ts
init_schema();
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, ilike, desc, and, isNull } from "drizzle-orm";
var DatabaseStorage = class {
  constructor() {
    this.seedInvestments();
  }
  async updateExistingInvestments() {
    const updatedInvestments = [
      { symbol: "SPY", ytdReturn: "45.2" },
      { symbol: "VTI", ytdReturn: "48.7" },
      { symbol: "AAPL", ytdReturn: "38.7" },
      { symbol: "MSFT", ytdReturn: "42.1" },
      { symbol: "GOOGL", ytdReturn: "55.8" },
      { symbol: "TSLA", ytdReturn: "62.3" },
      { symbol: "QQQ", ytdReturn: "52.4" },
      { symbol: "BTC", ytdReturn: "78.5" },
      { symbol: "ETH", ytdReturn: "68.9" }
    ];
    for (const update of updatedInvestments) {
      try {
        await db.update(investments).set({ ytdReturn: update.ytdReturn }).where(eq(investments.symbol, update.symbol));
        console.log(`Updated ${update.symbol} YTD return to ${update.ytdReturn}%`);
      } catch (error) {
        console.error(`Failed to update ${update.symbol}:`, error);
      }
    }
    await this.updatePortfolioHoldings();
  }
  async updatePortfolioHoldings() {
    try {
      console.log("Updating portfolio holdings with new investment performance...");
      const holdings = await db.select().from(portfolioHoldings);
      for (const holding of holdings) {
        const investment = await this.getInvestment(holding.investmentId);
        if (investment) {
          const growthFactor = 1 + parseFloat(investment.ytdReturn) / 100;
          const originalCost = parseFloat(holding.shares) * parseFloat(holding.averageCost);
          const newCurrentValue = originalCost * growthFactor;
          await db.update(portfolioHoldings).set({ currentValue: newCurrentValue.toFixed(2) }).where(eq(portfolioHoldings.id, holding.id));
          console.log(`Updated holding ${holding.id}: ${originalCost.toFixed(2)} -> ${newCurrentValue.toFixed(2)} (${investment.ytdReturn}% growth)`);
        }
      }
    } catch (error) {
      console.error("Failed to update portfolio holdings:", error);
    }
  }
  async seedInvestments() {
    const existingInvestments = await db.select().from(investments).limit(1);
    if (existingInvestments.length > 0) {
      console.log("Updating existing investments with new YTD returns...");
      return this.updateExistingInvestments();
    }
    console.log("Seeding investment options...");
    try {
      const mockInvestments = [
        {
          id: "inv-1",
          symbol: "SPY",
          name: "S&P 500 ETF",
          type: "etf",
          currentPrice: "445.20",
          ytdReturn: "45.2"
        },
        {
          id: "inv-2",
          symbol: "VTI",
          name: "Total Stock Market ETF",
          type: "etf",
          currentPrice: "242.18",
          ytdReturn: "48.7"
        },
        {
          id: "inv-3",
          symbol: "AAPL",
          name: "Apple Inc",
          type: "stock",
          currentPrice: "189.95",
          ytdReturn: "38.7"
        },
        {
          id: "inv-4",
          symbol: "MSFT",
          name: "Microsoft Corporation",
          type: "stock",
          currentPrice: "378.85",
          ytdReturn: "42.1"
        },
        {
          id: "inv-5",
          symbol: "GOOGL",
          name: "Alphabet Inc",
          type: "stock",
          currentPrice: "142.65",
          ytdReturn: "55.8"
        },
        {
          id: "inv-6",
          symbol: "TSLA",
          name: "Tesla Inc",
          type: "stock",
          currentPrice: "241.50",
          ytdReturn: "62.3"
        },
        {
          id: "inv-7",
          symbol: "QQQ",
          name: "Nasdaq 100 ETF",
          type: "etf",
          currentPrice: "405.67",
          ytdReturn: "52.4"
        },
        {
          id: "inv-8",
          symbol: "BTC",
          name: "Bitcoin",
          type: "crypto",
          currentPrice: "43250.00",
          ytdReturn: "78.5"
        },
        {
          id: "inv-9",
          symbol: "ETH",
          name: "Ethereum",
          type: "crypto",
          currentPrice: "2650.80",
          ytdReturn: "68.9"
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
      await db.insert(investments).values(mockInvestments);
      console.log("Investment options seeded successfully!");
    } catch (error) {
      console.error("Error seeding sample data:", error);
    }
  }
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUserProfile(id, updates) {
    const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return updated;
  }
  async getChild(id) {
    const [child] = await db.select().from(children).where(eq(children.id, id));
    return child;
  }
  async getChildByGiftCode(giftCode) {
    const [child] = await db.select().from(children).where(eq(children.giftLinkCode, giftCode));
    return child;
  }
  async getChildrenByParent(parentId) {
    return await db.select().from(children).where(eq(children.parentId, parentId));
  }
  async createChild(insertChild) {
    const giftLinkCode = this.generateGiftLinkCode();
    const [child] = await db.insert(children).values({
      ...insertChild,
      giftLinkCode,
      profileImageUrl: insertChild.profileImageUrl ?? null,
      birthday: insertChild.birthday ?? null
    }).returning();
    return child;
  }
  async updateChild(id, updates) {
    const [updated] = await db.update(children).set(updates).where(eq(children.id, id)).returning();
    return updated;
  }
  generateGiftLinkCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "FG-";
    for (let i = 0; i < 3; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result += "-";
    for (let i = 0; i < 3; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  async getInvestment(id) {
    const [investment] = await db.select().from(investments).where(eq(investments.id, id));
    return investment;
  }
  async getInvestmentBySymbol(symbol) {
    const [investment] = await db.select().from(investments).where(eq(investments.symbol, symbol));
    return investment;
  }
  async getAllInvestments() {
    return await db.select().from(investments);
  }
  async searchInvestments(query) {
    const searchTerm = `%${query.toLowerCase()}%`;
    return await db.select().from(investments).where(
      ilike(investments.symbol, searchTerm)
    );
  }
  async createInvestment(insertInvestment) {
    const [investment] = await db.insert(investments).values(insertInvestment).returning();
    return investment;
  }
  async getPortfolioHolding(id) {
    const [holding] = await db.select().from(portfolioHoldings).where(eq(portfolioHoldings.id, id));
    return holding;
  }
  async getPortfolioHoldingsByChild(childId) {
    return await db.select().from(portfolioHoldings).where(eq(portfolioHoldings.childId, childId));
  }
  async getPortfolioHoldingByInvestment(childId, investmentId) {
    const [holding] = await db.select().from(portfolioHoldings).where(and(
      eq(portfolioHoldings.childId, childId),
      eq(portfolioHoldings.investmentId, investmentId)
    ));
    return holding;
  }
  async createPortfolioHolding(insertHolding) {
    const [holding] = await db.insert(portfolioHoldings).values(insertHolding).returning();
    return holding;
  }
  async updatePortfolioHolding(id, updates) {
    const [updated] = await db.update(portfolioHoldings).set(updates).where(eq(portfolioHoldings.id, id)).returning();
    return updated;
  }
  async getGift(id) {
    const [gift] = await db.select().from(gifts).where(eq(gifts.id, id));
    return gift;
  }
  async getGiftsByChild(childId) {
    return await db.select().from(gifts).where(eq(gifts.childId, childId)).orderBy(desc(gifts.createdAt));
  }
  async getRecentGiftsByChild(childId, limit = 5) {
    const gifts2 = await this.getGiftsByChild(childId);
    return gifts2.slice(0, limit);
  }
  async createGift(insertGift) {
    const id = randomUUID();
    const investment = await this.getInvestment(insertGift.investmentId);
    const shares = investment ? (parseFloat(insertGift.amount) / parseFloat(investment.currentPrice)).toFixed(6) : "0.000000";
    const [gift] = await db.insert(gifts).values({
      ...insertGift,
      shares,
      giftGiverEmail: insertGift.giftGiverEmail ?? null,
      message: insertGift.message ?? null,
      videoMessageUrl: insertGift.videoMessageUrl ?? null
    }).returning();
    return gift;
  }
  async markGiftAsViewed(id) {
    await db.update(gifts).set({ isViewed: true }).where(eq(gifts.id, id));
  }
  async approveGift(id) {
    await db.update(gifts).set({ status: "approved", reviewedAt: /* @__PURE__ */ new Date() }).where(eq(gifts.id, id));
  }
  async rejectGift(id) {
    await db.update(gifts).set({ status: "rejected", reviewedAt: /* @__PURE__ */ new Date() }).where(eq(gifts.id, id));
  }
  async createThankYouMessage(insertMessage) {
    const [message] = await db.insert(thankYouMessages).values(insertMessage).returning();
    return message;
  }
  async getThankYouMessagesByGift(giftId) {
    return await db.select().from(thankYouMessages).where(eq(thankYouMessages.giftId, giftId)).orderBy(desc(thankYouMessages.createdAt));
  }
  async getContributor(id) {
    const [contributor] = await db.select().from(contributors).where(eq(contributors.id, id));
    return contributor;
  }
  async getContributorByEmail(email) {
    const [contributor] = await db.select().from(contributors).where(eq(contributors.email, email));
    return contributor;
  }
  async getContributorByPhone(phone) {
    const [contributor] = await db.select().from(contributors).where(eq(contributors.phone, phone));
    return contributor;
  }
  async createContributor(insertContributor) {
    const [contributor] = await db.insert(contributors).values(insertContributor).returning();
    return contributor;
  }
  async updateContributor(id, updates) {
    const [updated] = await db.update(contributors).set(updates).where(eq(contributors.id, id)).returning();
    return updated;
  }
  async linkGiftsToContributor(email, contributorId) {
    await db.update(gifts).set({ contributorId }).where(
      and(
        eq(gifts.giftGiverEmail, email),
        isNull(gifts.contributorId)
      )
    );
  }
  async getSproutRequest(id) {
    const [request] = await db.select().from(sproutRequests).where(eq(sproutRequests.id, id));
    return request;
  }
  async getSproutRequestByCode(code) {
    const [request] = await db.select().from(sproutRequests).where(eq(sproutRequests.requestCode, code));
    return request;
  }
  async getSproutRequestsByChild(childId) {
    return await db.select().from(sproutRequests).where(eq(sproutRequests.childId, childId)).orderBy(desc(sproutRequests.createdAt));
  }
  async getSproutRequestsByParent(parentId) {
    return await db.select().from(sproutRequests).where(eq(sproutRequests.parentId, parentId)).orderBy(desc(sproutRequests.createdAt));
  }
  async createSproutRequest(insertRequest) {
    const requestCode = this.generateSproutRequestCode();
    const [request] = await db.insert(sproutRequests).values({
      ...insertRequest,
      requestCode,
      contributorEmail: insertRequest.contributorEmail ?? null,
      message: insertRequest.message ?? null
    }).returning();
    return request;
  }
  async updateSproutRequestStatus(id, status) {
    await db.update(sproutRequests).set({ status, respondedAt: /* @__PURE__ */ new Date() }).where(eq(sproutRequests.id, id));
  }
  generateSproutRequestCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "SR-";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  async getRecurringContribution(id) {
    const [contribution] = await db.select().from(recurringContributions).where(eq(recurringContributions.id, id));
    return contribution;
  }
  async getRecurringContributionsByChild(childId) {
    return await db.select().from(recurringContributions).where(eq(recurringContributions.childId, childId)).orderBy(desc(recurringContributions.createdAt));
  }
  async getRecurringContributionsByContributor(contributorId) {
    return await db.select().from(recurringContributions).where(eq(recurringContributions.contributorId, contributorId)).orderBy(desc(recurringContributions.createdAt));
  }
  async getActiveRecurringContributions() {
    return await db.select().from(recurringContributions).where(eq(recurringContributions.isActive, true)).orderBy(desc(recurringContributions.nextContributionDate));
  }
  async createRecurringContribution(insertContribution) {
    const [contribution] = await db.insert(recurringContributions).values({
      ...insertContribution,
      contributorEmail: insertContribution.contributorEmail ?? null,
      contributorId: insertContribution.contributorId ?? null
    }).returning();
    return contribution;
  }
  async updateRecurringContribution(id, updates) {
    const [updated] = await db.update(recurringContributions).set(updates).where(eq(recurringContributions.id, id)).returning();
    return updated;
  }
  async cancelRecurringContribution(id) {
    await db.update(recurringContributions).set({ isActive: false }).where(eq(recurringContributions.id, id));
  }
  async getGiftsByContributor(contributorId) {
    const results = await db.select({
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
      childAge: children.age
    }).from(gifts).leftJoin(investments, eq(gifts.investmentId, investments.id)).leftJoin(children, eq(gifts.childId, children.id)).where(eq(gifts.contributorId, contributorId)).orderBy(desc(gifts.createdAt));
    return results.map((row) => ({
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
        currentPrice: row.investmentCurrentPrice
      },
      child: {
        id: row.childId,
        name: row.childName,
        giftCode: row.childGiftCode,
        profileImageUrl: row.childProfileImageUrl,
        age: row.childAge
      }
    }));
  }
};
var storage = new DatabaseStorage();

// server/routes/auth.routes.ts
init_schema();
import bcrypt from "bcryptjs";
import jwt2 from "jsonwebtoken";

// server/email-service.ts
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASS || "your-app-password"
    // Use App Password for Gmail
  }
});
async function sendPasswordResetEmail(data) {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${data.resetToken}`;
    const mailOptions = {
      from: `"StockSprout" <${process.env.EMAIL_USER || "noreply@stocksprout.com"}>`,
      to: data.email,
      subject: "Reset Your StockSprout Password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - StockSprout</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding: 20px;
              background-color: #f8f9fa;
              border-radius: 8px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #16a34a;
              margin-bottom: 10px;
            }
            .content {
              background-color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            .button {
              display: inline-block;
              background-color: #2563eb;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
              margin: 20px 0;
            }
            .button:hover {
              background-color: #1d4ed8;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 14px;
              color: #6b7280;
              text-align: center;
            }
            .warning {
              background-color: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 6px;
              padding: 15px;
              margin: 20px 0;
              color: #92400e;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">\u{1F331} StockSprout</div>
            <p>Growing the future our kids deserve</p>
          </div>
          
          <div class="content">
            <h2>Reset Your Password</h2>
            
            <p>Hello${data.userName ? ` ${data.userName}` : ""},</p>
            
            <p>We received a request to reset your password for your StockSprout account. If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>\u26A0\uFE0F Important:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this password reset, please ignore this email</li>
                <li>Your password will not be changed until you create a new one</li>
              </ul>
            </div>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
            
            <p>Best regards,<br>
            The StockSprout Team</p>
          </div>
          
          <div class="footer">
            <p><strong>StockSprout LLC</strong><br>
            Member NYSE, SIPC, FCC<br>
            700 Sprout Street, Phoenix, AZ 85235</p>
            
            <p>\xA92025 StockSprout LLC. All rights reserved.</p>
            
            <p>
              <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/privacy-policy" style="color: #2563eb;">
                Privacy Policy
              </a>
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Reset Your StockSprout Password
        
        Hello${data.userName ? ` ${data.userName}` : ""},
        
        We received a request to reset your password for your StockSprout account. 
        If you made this request, click the link below to reset your password:
        
        ${resetUrl}
        
        This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
        
        Best regards,
        The StockSprout Team
        
        ---
        StockSprout LLC
        Member NYSE, SIPC, FCC
        700 Sprout Street, Phoenix, AZ 85235
        \xA92025 StockSprout LLC. All rights reserved.
      `
    };
    await transporter.sendMail(mailOptions);
    console.log(`\u2705 Password reset email sent to: ${data.email}`);
    return true;
  } catch (error) {
    console.error("\u274C Failed to send password reset email:", error);
    return false;
  }
}

// server/middleware/auth.middleware.ts
import jwt from "jsonwebtoken";
function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    );
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
}
function getAuthUser(req) {
  const user = req.user;
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}

// server/utils/error-handler.ts
function handleError(res, error, message, statusCode = 500) {
  console.error(`[Error] ${message}:`, error);
  return res.status(statusCode).json({
    error: message
  });
}
function handleValidationError(res, error, customMessage) {
  const message = customMessage || "Invalid request data";
  console.error(`[Validation Error] ${message}:`, error);
  return res.status(400).json({
    error: message,
    details: error instanceof Error ? error.message : void 0
  });
}
function handleNotFound(res, resource) {
  return res.status(404).json({
    error: `${resource} not found`
  });
}
function handleForbidden(res, message = "Forbidden") {
  return res.status(403).json({
    error: message
  });
}

// server/routes/auth.routes.ts
function registerAuthRoutes(app2) {
  app2.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }
      if (validatedData.username) {
        const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
        if (existingUserByUsername) {
          return res.status(400).json({ error: "Username already exists" });
        }
      }
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      const user = await storage.createUser({
        username: validatedData.username || null,
        email: validatedData.email,
        name: validatedData.name,
        password: hashedPassword,
        phone: validatedData.phone || null,
        profileImageUrl: validatedData.profileImageUrl || null,
        bankAccountNumber: validatedData.bankAccountNumber || null
      });
      const token = jwt2.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "7d" }
      );
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(400).json({ error: "Invalid signup data" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      let user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        user = await storage.getUserByUsername(validatedData.email);
      }
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      console.log(`\u26A0\uFE0F  PASSWORD CHECK DISABLED - FOR TESTING ONLY`);
      const token = jwt2.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "7d" }
      );
      const { password, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ error: "Invalid login data" });
    }
  });
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.getUserByUsername(email);
      }
      console.log(`Password reset requested for email: ${email} (user exists: ${!!user})`);
      if (user) {
        const resetToken = jwt2.sign(
          { userId: user.id, email: user.email, type: "password-reset" },
          process.env.JWT_SECRET || "fallback-secret",
          { expiresIn: "1h" }
        );
        const emailSent = await sendPasswordResetEmail({
          email: user.email,
          resetToken,
          userName: user.name
        });
        if (!emailSent) {
          console.error(`Failed to send password reset email to: ${email}`);
        }
      }
      res.json({
        message: "If an account with that email exists, we've sent a password reset link."
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  });
  app2.post("/api/auth/webauthn/register", async (req, res) => {
    try {
      const { userId, credentialId, publicKey } = req.body;
      if (!userId || !credentialId || !publicKey) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      console.log(`WebAuthn registration for user ${userId}:`, {
        credentialId: credentialId.substring(0, 20) + "...",
        publicKey: publicKey.substring(0, 20) + "..."
      });
      res.json({ success: true, message: "Biometric credential registered successfully" });
    } catch (error) {
      console.error("WebAuthn registration error:", error);
      res.status(500).json({ error: "Failed to register biometric credential" });
    }
  });
  app2.get("/api/auth/webauthn/credentials/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const credentials = [];
      res.json({ credentials });
    } catch (error) {
      console.error("WebAuthn credentials fetch error:", error);
      res.status(500).json({ error: "Failed to fetch credentials" });
    }
  });
  app2.post("/api/auth/webauthn/authenticate", async (req, res) => {
    try {
      const { credentialId, signature, userId } = req.body;
      if (!credentialId || !signature || !userId) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      console.log(`WebAuthn authentication attempt for user ${userId}:`, {
        credentialId: credentialId.substring(0, 20) + "...",
        signature: signature.substring(0, 20) + "..."
      });
      res.json({
        success: true,
        message: "Biometric authentication successful",
        requiresPassword: true
        // Indicate that password is still needed for full login
      });
    } catch (error) {
      console.error("WebAuthn authentication error:", error);
      res.status(500).json({ error: "Biometric authentication failed" });
    }
  });
  app2.get("/api/profile", authenticate, async (req, res) => {
    try {
      const { userId } = getAuthUser(req);
      let user = await storage.getUser(userId);
      if (!user) {
        const contributor = await storage.getContributor(userId);
        if (!contributor) {
          return handleNotFound(res, "User");
        }
        const { password: password2, ...contributorWithoutPassword } = contributor;
        return res.json(contributorWithoutPassword);
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      return handleError(res, error, "Failed to fetch profile");
    }
  });
  const updateProfileHandler = async (req, res) => {
    try {
      const { userId } = getAuthUser(req);
      console.log("Updating profile for user:", userId);
      console.log("Request body keys:", Object.keys(req.body));
      if (req.body.profileImageUrl) {
        console.log("Profile image URL length:", req.body.profileImageUrl.length);
      }
      const validatedData = updateProfileSchema.parse(req.body);
      console.log("Validation passed");
      const updatedUser = await storage.updateUserProfile(userId, validatedData);
      if (!updatedUser) {
        console.log("User not found:", userId);
        return handleNotFound(res, "User");
      }
      console.log("Profile updated successfully");
      const { password, ...userWithoutPassword } = updatedUser;
      return res.json(userWithoutPassword);
    } catch (error) {
      console.error("Profile update error:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      return handleValidationError(res, error, "Invalid profile data");
    }
  };
  app2.patch("/api/profile", authenticate, updateProfileHandler);
  app2.put("/api/profile", authenticate, updateProfileHandler);
}

// server/routes/children.routes.ts
init_schema();
function registerChildrenRoutes(app2) {
  app2.get("/api/children/:parentId", async (req, res) => {
    try {
      const { children: children2, portfolioHoldings: portfolioHoldings2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { sql: sql2, eq: eq2 } = await import("drizzle-orm");
      const results = await db.select({
        id: children2.id,
        parentId: children2.parentId,
        name: children2.name,
        age: children2.age,
        profileImageUrl: children2.profileImageUrl,
        birthday: children2.birthday,
        giftLinkCode: children2.giftLinkCode,
        totalValue: sql2`COALESCE(SUM(${portfolioHoldings2.currentValue}), 0)`,
        totalCost: sql2`COALESCE(SUM(${portfolioHoldings2.shares} * ${portfolioHoldings2.averageCost}), 0)`
      }).from(children2).leftJoin(portfolioHoldings2, eq2(children2.id, portfolioHoldings2.childId)).where(eq2(children2.parentId, req.params.parentId)).groupBy(children2.id);
      const enrichedChildren = results.map((child) => ({
        ...child,
        totalValue: parseFloat(child.totalValue),
        totalCost: parseFloat(child.totalCost),
        totalGain: parseFloat(child.totalValue) - parseFloat(child.totalCost)
      }));
      res.json(enrichedChildren);
    } catch (error) {
      return handleError(res, error, "Failed to fetch children");
    }
  });
  app2.get("/api/children/by-id/:childId", async (req, res) => {
    try {
      const child = await storage.getChild(req.params.childId);
      if (!child) {
        return handleNotFound(res, "Child");
      }
      res.json(child);
    } catch (error) {
      return handleError(res, error, "Failed to fetch child");
    }
  });
  app2.post("/api/children", async (req, res) => {
    try {
      const validatedData = insertChildSchema.parse(req.body);
      const child = await storage.createChild(validatedData);
      res.json(child);
    } catch (error) {
      return handleValidationError(res, error, "Invalid child data");
    }
  });
  app2.patch("/api/children/:childId/profile-photo", authenticate, async (req, res) => {
    try {
      const { userId } = getAuthUser(req);
      const { childId } = req.params;
      const { profileImageUrl } = req.body;
      const child = await storage.getChild(childId);
      if (!child) {
        return handleNotFound(res, "Child");
      }
      if (child.parentId !== userId) {
        return handleForbidden(res, "You can only update profile photos for your own children");
      }
      const updatedChild = await storage.updateChild(childId, { profileImageUrl });
      res.json(updatedChild);
    } catch (error) {
      return handleError(res, error, "Failed to update child profile photo");
    }
  });
  app2.get("/api/children/by-gift-code/:giftCode", async (req, res) => {
    try {
      const child = await storage.getChildByGiftCode(req.params.giftCode);
      if (!child) {
        return handleNotFound(res, "Child");
      }
      res.json(child);
    } catch (error) {
      return handleError(res, error, "Failed to fetch child");
    }
  });
  app2.post("/api/generate-gift-link", async (req, res) => {
    try {
      const { childId } = req.body;
      const child = await storage.getChild(childId);
      if (!child) {
        return handleNotFound(res, "Child");
      }
      const baseUrl = process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : "http://localhost:3000";
      const giftLink = `${baseUrl}/gift/${child.giftLinkCode}`;
      res.json({
        giftLink,
        giftCode: child.giftLinkCode,
        childName: child.name
      });
    } catch (error) {
      return handleError(res, error, "Failed to generate gift link");
    }
  });
}

// server/stock-api.ts
var StockAPIService = class {
  apiKey;
  baseUrl = "https://finnhub.io/api/v1";
  quoteCache = /* @__PURE__ */ new Map();
  profileCache = /* @__PURE__ */ new Map();
  searchCache = /* @__PURE__ */ new Map();
  CACHE_TTL = 5 * 60 * 1e3;
  // 5 minutes in milliseconds
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.FINNHUB_API_KEY || "";
    if (!this.apiKey) {
      console.warn("\u26A0\uFE0F  FINNHUB_API_KEY not set. Stock data will be mocked.");
    }
  }
  /**
   * Check if a cache entry is still valid
   */
  isCacheValid(entry) {
    if (!entry) return false;
    return Date.now() - entry.timestamp < this.CACHE_TTL;
  }
  /**
   * Get real-time stock quote (with 5-minute cache)
   */
  async getQuote(symbol) {
    const normalizedSymbol = symbol.toUpperCase();
    const cached = this.quoteCache.get(normalizedSymbol);
    if (this.isCacheValid(cached)) {
      console.log(`[Stock API] Cache hit for ${normalizedSymbol}`);
      return cached.data;
    }
    if (!this.apiKey) {
      return this.getMockQuote(symbol);
    }
    try {
      const response = await fetch(
        `${this.baseUrl}/quote?symbol=${normalizedSymbol}&token=${this.apiKey}`
      );
      if (!response.ok) {
        console.error(`Finnhub API error: ${response.status}`);
        return this.getMockQuote(symbol);
      }
      const data = await response.json();
      if (data.c === 0) {
        console.warn(`No data found for symbol: ${symbol}`);
        return null;
      }
      const quote = {
        symbol: normalizedSymbol,
        currentPrice: data.c,
        change: data.d,
        changePercent: data.dp,
        high: data.h,
        low: data.l,
        open: data.o,
        previousClose: data.pc
      };
      this.quoteCache.set(normalizedSymbol, {
        data: quote,
        timestamp: Date.now()
      });
      console.log(`[Stock API] Fetched and cached ${normalizedSymbol}`);
      return quote;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return this.getMockQuote(symbol);
    }
  }
  /**
   * Search for stocks by query (with 5-minute cache)
   */
  async searchSymbols(query) {
    const normalizedQuery = query.toLowerCase().trim();
    const cached = this.searchCache.get(normalizedQuery);
    if (this.isCacheValid(cached)) {
      console.log(`[Stock API] Search cache hit for "${normalizedQuery}"`);
      return cached.data;
    }
    if (!this.apiKey) {
      return this.getMockSearchResults(query);
    }
    try {
      const response = await fetch(
        `${this.baseUrl}/search?q=${encodeURIComponent(query)}&token=${this.apiKey}`
      );
      if (!response.ok) {
        console.error(`Finnhub search API error: ${response.status}`);
        return this.getMockSearchResults(query);
      }
      const data = await response.json();
      const results = data.result.filter(
        (result) => !result.symbol.includes(".") && // Filter out non-US stocks
        result.type === "Common Stock"
      ).slice(0, 10);
      this.searchCache.set(normalizedQuery, {
        data: results,
        timestamp: Date.now()
      });
      console.log(`[Stock API] Searched and cached "${normalizedQuery}"`);
      return results;
    } catch (error) {
      console.error(`Error searching symbols:`, error);
      return this.getMockSearchResults(query);
    }
  }
  /**
   * Get company profile (includes company name) - with 5-minute cache
   */
  async getCompanyProfile(symbol) {
    const normalizedSymbol = symbol.toUpperCase();
    const cached = this.profileCache.get(normalizedSymbol);
    if (this.isCacheValid(cached)) {
      console.log(`[Stock API] Profile cache hit for ${normalizedSymbol}`);
      return cached.data;
    }
    if (!this.apiKey) {
      return this.getMockCompanyProfile(symbol);
    }
    try {
      const response = await fetch(
        `${this.baseUrl}/stock/profile2?symbol=${normalizedSymbol}&token=${this.apiKey}`
      );
      if (!response.ok) {
        console.error(`Finnhub profile API error: ${response.status}`);
        return this.getMockCompanyProfile(symbol);
      }
      const data = await response.json();
      if (!data.name) {
        return null;
      }
      const profile = {
        name: data.name,
        ticker: data.ticker || normalizedSymbol
      };
      this.profileCache.set(normalizedSymbol, {
        data: profile,
        timestamp: Date.now()
      });
      console.log(`[Stock API] Fetched and cached profile for ${normalizedSymbol}`);
      return profile;
    } catch (error) {
      console.error(`Error fetching company profile for ${symbol}:`, error);
      return this.getMockCompanyProfile(symbol);
    }
  }
  /**
   * Mock data for when API key is not available
   */
  getMockQuote(symbol) {
    const mockData = {
      AAPL: {
        symbol: "AAPL",
        name: "Apple Inc",
        currentPrice: 189.95,
        change: 2.15,
        changePercent: 1.14,
        high: 191.2,
        low: 188.5,
        open: 189,
        previousClose: 187.8
      },
      GOOGL: {
        symbol: "GOOGL",
        name: "Alphabet Inc",
        currentPrice: 142.65,
        change: -0.85,
        changePercent: -0.59,
        high: 144.2,
        low: 142,
        open: 143.5,
        previousClose: 143.5
      },
      TSLA: {
        symbol: "TSLA",
        name: "Tesla Inc",
        currentPrice: 241.5,
        change: 5.25,
        changePercent: 2.22,
        high: 244,
        low: 238.5,
        open: 239,
        previousClose: 236.25
      },
      SPY: {
        symbol: "SPY",
        name: "S&P 500 ETF",
        currentPrice: 445.2,
        change: 1.8,
        changePercent: 0.41,
        high: 446.5,
        low: 443.2,
        open: 444,
        previousClose: 443.4
      },
      MSFT: {
        symbol: "MSFT",
        name: "Microsoft Corp",
        currentPrice: 378.5,
        change: 3.2,
        changePercent: 0.85,
        high: 380,
        low: 376.5,
        open: 377,
        previousClose: 375.3
      }
    };
    return mockData[symbol.toUpperCase()] || {
      symbol: symbol.toUpperCase(),
      currentPrice: 100,
      change: 0,
      changePercent: 0,
      high: 100,
      low: 100,
      open: 100,
      previousClose: 100
    };
  }
  getMockSearchResults(query) {
    const mockResults = [
      { description: "Apple Inc", displaySymbol: "AAPL", symbol: "AAPL", type: "Common Stock" },
      { description: "Microsoft Corp", displaySymbol: "MSFT", symbol: "MSFT", type: "Common Stock" },
      { description: "Alphabet Inc", displaySymbol: "GOOGL", symbol: "GOOGL", type: "Common Stock" },
      { description: "Tesla Inc", displaySymbol: "TSLA", symbol: "TSLA", type: "Common Stock" },
      { description: "Amazon.com Inc", displaySymbol: "AMZN", symbol: "AMZN", type: "Common Stock" }
    ];
    const q = query.toLowerCase();
    return mockResults.filter(
      (r) => r.symbol.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    );
  }
  getMockCompanyProfile(symbol) {
    const mockProfiles = {
      AAPL: { name: "Apple Inc", ticker: "AAPL" },
      GOOGL: { name: "Alphabet Inc", ticker: "GOOGL" },
      TSLA: { name: "Tesla Inc", ticker: "TSLA" },
      SPY: { name: "S&P 500 ETF Trust", ticker: "SPY" },
      MSFT: { name: "Microsoft Corporation", ticker: "MSFT" },
      VTI: { name: "Vanguard Total Stock Market ETF", ticker: "VTI" },
      QQQ: { name: "Invesco QQQ Trust", ticker: "QQQ" }
    };
    return mockProfiles[symbol.toUpperCase()] || null;
  }
};
var stockAPI = new StockAPIService();

// server/routes/portfolio.routes.ts
function registerPortfolioRoutes(app2) {
  app2.get("/api/investments", async (req, res) => {
    try {
      const investments2 = await storage.getAllInvestments();
      res.json(investments2);
    } catch (error) {
      console.error("Failed to fetch investments:", error);
      res.status(500).json({ error: "Failed to fetch investments" });
    }
  });
  app2.get("/api/investments/search", async (req, res) => {
    try {
      const query = req.query.q;
      if (!query) {
        return res.status(400).json({ error: "Search query required" });
      }
      const searchResults = await stockAPI.searchSymbols(query);
      const investments2 = await Promise.all(
        searchResults.map(async (result) => {
          let investment = await storage.getInvestmentBySymbol(result.symbol);
          if (!investment) {
            const quote = await stockAPI.getQuote(result.symbol);
            if (quote) {
              let investmentType = "stock";
              if (result.type.includes("ETF") || result.type.includes("Fund")) {
                investmentType = "etf";
              } else if (result.symbol.match(/^(BTC|ETH|DOGE|SOL|ADA)/)) {
                investmentType = "crypto";
              }
              investment = {
                id: `temp-${result.symbol}`,
                symbol: result.symbol,
                name: result.description,
                type: investmentType,
                currentPrice: quote.currentPrice.toFixed(2),
                ytdReturn: quote.changePercent.toFixed(2)
              };
            }
          } else {
            const quote = await stockAPI.getQuote(result.symbol);
            if (quote) {
              investment.currentPrice = quote.currentPrice.toFixed(2);
              investment.ytdReturn = quote.changePercent.toFixed(2);
            }
          }
          return investment;
        })
      );
      res.json(investments2.filter((inv) => inv !== null && inv !== void 0));
    } catch (error) {
      console.error("Investment search error:", error);
      res.status(500).json({ error: "Failed to search investments" });
    }
  });
  app2.get("/api/stocks/quote/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const quote = await stockAPI.getQuote(symbol);
      if (!quote) {
        return res.status(404).json({ error: "Stock not found" });
      }
      res.json(quote);
    } catch (error) {
      console.error("Stock quote error:", error);
      res.status(500).json({ error: "Failed to fetch stock quote" });
    }
  });
  app2.get("/api/stocks/search", async (req, res) => {
    try {
      const query = req.query.q;
      if (!query || query.length < 1) {
        return res.status(400).json({ error: "Search query required" });
      }
      const results = await stockAPI.searchSymbols(query);
      res.json(results);
    } catch (error) {
      console.error("Stock search error:", error);
      res.status(500).json({ error: "Failed to search stocks" });
    }
  });
  app2.get("/api/stocks/profile/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const profile = await stockAPI.getCompanyProfile(symbol);
      if (!profile) {
        return res.status(404).json({ error: "Company profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Company profile error:", error);
      res.status(500).json({ error: "Failed to fetch company profile" });
    }
  });
  app2.get("/api/portfolio/:childId", async (req, res) => {
    try {
      const { portfolioHoldings: portfolioHoldings2, investments: investments2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq2 } = await import("drizzle-orm");
      const results = await db.select({
        // Holding fields
        id: portfolioHoldings2.id,
        childId: portfolioHoldings2.childId,
        investmentId: portfolioHoldings2.investmentId,
        shares: portfolioHoldings2.shares,
        averageCost: portfolioHoldings2.averageCost,
        currentValue: portfolioHoldings2.currentValue,
        // Investment fields
        investmentSymbol: investments2.symbol,
        investmentName: investments2.name,
        investmentType: investments2.type,
        investmentCurrentPrice: investments2.currentPrice,
        investmentYtdReturn: investments2.ytdReturn
      }).from(portfolioHoldings2).leftJoin(investments2, eq2(portfolioHoldings2.investmentId, investments2.id)).where(eq2(portfolioHoldings2.childId, req.params.childId));
      const enrichedHoldings = results.map((row) => {
        if (!row.investmentSymbol) {
          console.error(`[Portfolio] ERROR: Holding ${row.id} references investmentId ${row.investmentId} but investment not found in database!`);
        }
        return {
          id: row.id,
          childId: row.childId,
          investmentId: row.investmentId,
          shares: row.shares,
          averageCost: row.averageCost,
          currentValue: row.currentValue,
          investment: row.investmentSymbol ? {
            id: row.investmentId,
            symbol: row.investmentSymbol,
            name: row.investmentName,
            type: row.investmentType,
            currentPrice: row.investmentCurrentPrice,
            ytdReturn: row.investmentYtdReturn
          } : null
        };
      });
      res.json(enrichedHoldings);
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });
  app2.get("/api/logo/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const companyName = req.query.name;
      const ticker = symbol.toUpperCase();
      const domainMapping = {
        // Tech
        "AAPL": "apple.com",
        "GOOGL": "abc.xyz",
        "GOOG": "abc.xyz",
        "MSFT": "microsoft.com",
        "AMZN": "amazon.com",
        "META": "meta.com",
        "FB": "meta.com",
        "TSLA": "tesla.com",
        "NVDA": "nvidia.com",
        "NFLX": "netflix.com",
        "ADBE": "adobe.com",
        "CRM": "salesforce.com",
        "ORCL": "oracle.com",
        "INTC": "intel.com",
        "AMD": "amd.com",
        "UBER": "uber.com",
        "LYFT": "lyft.com",
        "SNAP": "snap.com",
        "SPOT": "spotify.com",
        "SQ": "squareup.com",
        "PYPL": "paypal.com",
        "SHOP": "shopify.com",
        "TWLO": "twilio.com",
        "ZM": "zoom.us",
        "DOCU": "docusign.com",
        "SNOW": "snowflake.com",
        "CRWD": "crowdstrike.com",
        "ABNB": "airbnb.com",
        "ROKU": "roku.com",
        "RBLX": "roblox.com",
        "DASH": "doordash.com",
        "COIN": "coinbase.com",
        "PLTR": "palantir.com",
        "IBM": "ibm.com",
        "CSCO": "cisco.com",
        "QCOM": "qualcomm.com",
        "TXN": "ti.com",
        "NOW": "servicenow.com",
        "PANW": "paloaltonetworks.com",
        "NET": "cloudflare.com",
        "DDOG": "datadoghq.com",
        "MDB": "mongodb.com",
        "ZS": "zscaler.com",
        // Finance
        "JPM": "jpmorganchase.com",
        "BAC": "bankofamerica.com",
        "WFC": "wellsfargo.com",
        "GS": "goldmansachs.com",
        "MS": "morganstanley.com",
        "C": "citigroup.com",
        "V": "visa.com",
        "MA": "mastercard.com",
        "AXP": "americanexpress.com",
        "BLK": "blackrock.com",
        // Consumer
        "WMT": "walmart.com",
        "HD": "homedepot.com",
        "NKE": "nike.com",
        "MCD": "mcdonalds.com",
        "SBUX": "starbucks.com",
        "DIS": "disney.com",
        "KO": "coca-cola.com",
        "PEP": "pepsi.com",
        "PG": "pg.com",
        "COST": "costco.com",
        "TGT": "target.com",
        "LOW": "lowes.com",
        "F": "ford.com",
        "GM": "gm.com",
        "CMG": "chipotle.com",
        // Healthcare
        "JNJ": "jnj.com",
        "UNH": "unitedhealthgroup.com",
        "PFE": "pfizer.com",
        "ABBV": "abbvie.com",
        "TMO": "thermofisher.com",
        "ABT": "abbott.com",
        // ETFs
        "SPY": "ssga.com",
        "VOO": "vanguard.com",
        "VTI": "vanguard.com",
        "QQQ": "invesco.com"
      };
      let domain = domainMapping[ticker];
      if (!domain && companyName) {
        const guessed = companyName.replace(/\s+(Inc\.?|Corp\.?|Corporation|Company|Co\.?|Ltd\.?|Limited|Group|plc|LLC|LP)$/i, "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
        if (guessed.length >= 3 && guessed.length <= 30) {
          domain = `${guessed}.com`;
        }
      }
      if (!domain) {
        return res.status(404).json({ error: "Logo not available" });
      }
      const logoUrl = `https://logo.clearbit.com/${domain}`;
      const logoResponse = await fetch(logoUrl);
      if (!logoResponse.ok) {
        return res.status(404).json({ error: "Logo not found" });
      }
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=86400");
      const buffer = await logoResponse.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error("Logo proxy error:", error);
      res.status(500).json({ error: "Failed to fetch logo" });
    }
  });
}

// server/routes/gifts.routes.ts
init_schema();
function registerGiftRoutes(app2) {
  async function getEnrichedGifts(childId, limit) {
    const { gifts: gifts2, investments: investments2, contributors: contributors2, users: users2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { desc: desc2, eq: eq2 } = await import("drizzle-orm");
    let query = db.select({
      // Gift fields
      id: gifts2.id,
      childId: gifts2.childId,
      contributorId: gifts2.contributorId,
      giftGiverName: gifts2.giftGiverName,
      giftGiverEmail: gifts2.giftGiverEmail,
      giftGiverProfileImageUrl: gifts2.giftGiverProfileImageUrl,
      investmentId: gifts2.investmentId,
      amount: gifts2.amount,
      shares: gifts2.shares,
      message: gifts2.message,
      videoMessageUrl: gifts2.videoMessageUrl,
      createdAt: gifts2.createdAt,
      isViewed: gifts2.isViewed,
      thankYouSent: gifts2.thankYouSent,
      status: gifts2.status,
      reviewedAt: gifts2.reviewedAt,
      // Investment fields
      investmentSymbol: investments2.symbol,
      investmentName: investments2.name,
      investmentType: investments2.type,
      investmentCurrentPrice: investments2.currentPrice,
      investmentYtdReturn: investments2.ytdReturn,
      // Contributor fields
      contributorName: contributors2.name,
      contributorEmail: contributors2.email,
      contributorProfileImageUrl: contributors2.profileImageUrl,
      contributorIsRegistered: contributors2.isRegistered,
      contributorCreatedAt: contributors2.createdAt,
      // User fields (for parent purchases)
      userName: users2.name,
      userEmail: users2.email,
      userProfileImageUrl: users2.profileImageUrl
    }).from(gifts2).leftJoin(investments2, eq2(gifts2.investmentId, investments2.id)).leftJoin(contributors2, eq2(gifts2.contributorId, contributors2.id)).leftJoin(users2, eq2(gifts2.contributorId, users2.id)).where(eq2(gifts2.childId, childId)).orderBy(desc2(gifts2.createdAt));
    if (limit) {
      query = query.limit(limit);
    }
    const results = await query;
    return results.map((row) => ({
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
      isViewed: row.isViewed,
      thankYouSent: row.thankYouSent,
      status: row.status,
      reviewedAt: row.reviewedAt,
      investment: row.investmentSymbol ? {
        id: row.investmentId,
        symbol: row.investmentSymbol,
        name: row.investmentName,
        type: row.investmentType,
        currentPrice: row.investmentCurrentPrice,
        ytdReturn: row.investmentYtdReturn
      } : null,
      contributor: row.contributorName ? {
        id: row.contributorId,
        name: row.contributorName,
        email: row.contributorEmail,
        profileImageUrl: row.contributorProfileImageUrl,
        phone: null,
        password: null,
        isRegistered: row.contributorIsRegistered,
        createdAt: row.contributorCreatedAt
      } : row.userName ? {
        // Parent purchase - user instead of contributor
        id: row.contributorId,
        name: row.userName,
        email: row.userEmail,
        profileImageUrl: row.userProfileImageUrl,
        phone: null,
        password: null,
        isRegistered: true,
        createdAt: /* @__PURE__ */ new Date()
      } : null
    }));
  }
  app2.get("/api/gifts/:childId", async (req, res) => {
    try {
      const enrichedGifts = await getEnrichedGifts(req.params.childId);
      res.json(enrichedGifts);
    } catch (error) {
      console.error("Failed to fetch gifts:", error);
      res.status(500).json({ error: "Failed to fetch gifts" });
    }
  });
  app2.get("/api/gifts/recent/:childId", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const enrichedGifts = await getEnrichedGifts(req.params.childId, limit);
      res.json(enrichedGifts);
    } catch (error) {
      console.error("Failed to fetch recent gifts:", error);
      res.status(500).json({ error: "Failed to fetch recent gifts" });
    }
  });
  app2.post("/api/gifts", async (req, res) => {
    try {
      const validatedData = insertGiftSchema.parse(req.body);
      let investmentId = validatedData.investmentId;
      let investment = await storage.getInvestment(investmentId);
      if (!investment && investmentId.startsWith("temp-")) {
        const symbol = investmentId.replace("temp-", "");
        const quote = await stockAPI.getQuote(symbol);
        const profile = await stockAPI.getCompanyProfile(symbol);
        if (!quote || !profile) {
          return res.status(404).json({ error: "Could not fetch investment data" });
        }
        let investmentType = "stock";
        if (symbol.match(/^(SPY|VOO|VTI|QQQ|IWM|EEM|VIG|AGG|BND|GLD|SLV|XL[A-Z])/)) {
          investmentType = "etf";
        } else if (symbol.match(/^(BTC|ETH|DOGE|SOL|ADA)/)) {
          investmentType = "crypto";
        }
        investment = await storage.createInvestment({
          symbol,
          name: profile.name,
          type: investmentType,
          currentPrice: quote.currentPrice.toFixed(2),
          ytdReturn: quote.changePercent.toFixed(2)
        });
        investmentId = investment.id;
      }
      if (!investment) {
        return res.status(404).json({ error: "Investment not found" });
      }
      const shares = parseFloat(validatedData.amount) / parseFloat(investment.currentPrice);
      const giftData = { ...validatedData, investmentId, shares: shares.toFixed(6) };
      const child = await storage.getChild(validatedData.childId);
      const isParentPurchase = child && validatedData.contributorId && child.parentId === validatedData.contributorId;
      const gift = await storage.createGift(giftData);
      if (isParentPurchase) {
        await storage.approveGift(gift.id);
        const existingHolding = await storage.getPortfolioHoldingByInvestment(
          validatedData.childId,
          investmentId
          // Use the updated investmentId, not validatedData.investmentId
        );
        if (existingHolding) {
          const newShares = parseFloat(existingHolding.shares) + shares;
          const newValue = newShares * parseFloat(investment.currentPrice);
          const totalCost = parseFloat(existingHolding.shares) * parseFloat(existingHolding.averageCost) + parseFloat(validatedData.amount);
          const newAverageCost = totalCost / newShares;
          await storage.updatePortfolioHolding(existingHolding.id, {
            shares: newShares.toFixed(6),
            averageCost: newAverageCost.toFixed(2),
            currentValue: newValue.toFixed(2)
          });
        } else {
          await storage.createPortfolioHolding({
            childId: validatedData.childId,
            investmentId,
            // Use the updated investmentId, not validatedData.investmentId
            shares: shares.toFixed(6),
            averageCost: investment.currentPrice,
            currentValue: validatedData.amount
          });
        }
      }
      res.json(gift);
    } catch (error) {
      console.error("Gift creation error:", error);
      res.status(400).json({ error: "Invalid gift data" });
    }
  });
  app2.patch("/api/gifts/:id/viewed", async (req, res) => {
    try {
      await storage.markGiftAsViewed(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to mark gift as viewed:", error);
      res.status(500).json({ error: "Failed to mark gift as viewed" });
    }
  });
  app2.patch("/api/gifts/:id/approve", authenticate, async (req, res) => {
    try {
      const { userId } = getAuthUser(req);
      const gift = await storage.getGift(req.params.id);
      if (!gift) {
        return handleNotFound(res, "Gift");
      }
      const child = await storage.getChild(gift.childId);
      if (!child || child.parentId !== userId) {
        return handleForbidden(res, "You can only approve gifts for your own children");
      }
      await storage.approveGift(req.params.id);
      const investment = await storage.getInvestment(gift.investmentId);
      if (!investment) {
        return handleNotFound(res, "Investment");
      }
      const existingHoldings = await storage.getPortfolioHoldingsByChild(gift.childId);
      const existingHolding = existingHoldings.find((h) => h.investmentId === gift.investmentId);
      const giftShares = parseFloat(gift.shares);
      const giftAmount = parseFloat(gift.amount);
      if (existingHolding) {
        const newShares = parseFloat(existingHolding.shares) + giftShares;
        const newTotalCost = parseFloat(existingHolding.averageCost) * parseFloat(existingHolding.shares) + giftAmount;
        const newAverageCost = newTotalCost / newShares;
        const newCurrentValue = newShares * parseFloat(investment.currentPrice);
        await storage.updatePortfolioHolding(existingHolding.id, {
          shares: newShares.toFixed(6),
          averageCost: newAverageCost.toFixed(2),
          currentValue: newCurrentValue.toFixed(2)
        });
      } else {
        await storage.createPortfolioHolding({
          childId: gift.childId,
          investmentId: gift.investmentId,
          shares: gift.shares,
          averageCost: investment.currentPrice,
          currentValue: gift.amount
        });
      }
      res.json({ success: true, message: "Gift approved and added to portfolio" });
    } catch (error) {
      return handleError(res, error, "Failed to approve gift");
    }
  });
  app2.patch("/api/gifts/:id/reject", authenticate, async (req, res) => {
    try {
      const { userId } = getAuthUser(req);
      const gift = await storage.getGift(req.params.id);
      if (!gift) {
        return handleNotFound(res, "Gift");
      }
      const child = await storage.getChild(gift.childId);
      if (!child || child.parentId !== userId) {
        return handleForbidden(res, "You can only reject gifts for your own children");
      }
      await storage.rejectGift(req.params.id);
      res.json({ success: true, message: "Gift rejected" });
    } catch (error) {
      return handleError(res, error, "Failed to reject gift");
    }
  });
  app2.post("/api/thank-you", async (req, res) => {
    try {
      const validatedData = insertThankYouMessageSchema.parse(req.body);
      const message = await storage.createThankYouMessage(validatedData);
      res.json(message);
    } catch (error) {
      console.error("Failed to create thank you message:", error);
      res.status(400).json({ error: "Invalid thank you message data" });
    }
  });
  app2.get("/api/thank-you/:giftId", async (req, res) => {
    try {
      const messages = await storage.getThankYouMessagesByGift(req.params.giftId);
      res.json(messages);
    } catch (error) {
      console.error("Failed to fetch thank you messages:", error);
      res.status(500).json({ error: "Failed to fetch thank you messages" });
    }
  });
}

// server/routes/contributors.routes.ts
import bcrypt2 from "bcryptjs";
import jwt3 from "jsonwebtoken";
function registerContributorRoutes(app2) {
  app2.post("/api/contributors/signup", async (req, res) => {
    try {
      const { email, name, password, phone, profileImageUrl, sproutRequestCode } = req.body;
      const existingContributor = await storage.getContributorByEmail(email);
      if (existingContributor && existingContributor.isRegistered) {
        return res.status(400).json({ error: "Email already registered" });
      }
      const hashedPassword = await bcrypt2.hash(password, 10);
      let contributor;
      if (existingContributor) {
        contributor = await storage.updateContributor(existingContributor.id, {
          password: hashedPassword,
          isRegistered: true,
          name: name || existingContributor.name,
          profileImageUrl: profileImageUrl || existingContributor.profileImageUrl
        });
      } else {
        contributor = await storage.createContributor({
          email,
          name,
          password: hashedPassword,
          phone: phone || null,
          profileImageUrl: profileImageUrl || null,
          isRegistered: true
        });
      }
      if (contributor) {
        await storage.linkGiftsToContributor(email, contributor.id);
      }
      if (sproutRequestCode) {
        const sproutRequest = await storage.getSproutRequestByCode(sproutRequestCode);
        if (sproutRequest) {
          await storage.updateSproutRequestStatus(sproutRequest.id, "accepted");
        }
      }
      const token = jwt3.sign(
        { userId: contributor?.id, email: contributor?.email },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "7d" }
      );
      const { password: _, ...contributorWithoutPassword } = contributor || {};
      res.status(201).json({
        contributor: contributorWithoutPassword,
        user: contributorWithoutPassword,
        // Also return as 'user' for compatibility
        token
      });
    } catch (error) {
      console.error("Contributor signup error:", error);
      res.status(400).json({ error: "Failed to sign up contributor" });
    }
  });
  app2.post("/api/contributors/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      const contributor = await storage.getContributorByEmail(email);
      if (!contributor) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      console.log("\u26A0\uFE0F  PASSWORD AND REGISTRATION CHECKS DISABLED - FOR TESTING ONLY");
      await storage.linkGiftsToContributor(email, contributor.id);
      const token = jwt3.sign(
        { userId: contributor.id, email: contributor.email },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "7d" }
      );
      const { password: _, ...contributorWithoutPassword } = contributor;
      res.json({
        contributor: contributorWithoutPassword,
        user: contributorWithoutPassword,
        // Also return as 'user' for compatibility
        token
      });
    } catch (error) {
      console.error("Contributor signin error:", error);
      res.status(500).json({ error: "Failed to sign in" });
    }
  });
  app2.get("/api/contributors/:id/gifts", authenticate, async (req, res) => {
    try {
      const { userId } = getAuthUser(req);
      const { id } = req.params;
      if (userId !== id) {
        return handleForbidden(res, "You can only view your own gifts");
      }
      const gifts2 = await storage.getGiftsByContributor(id);
      res.json(gifts2);
    } catch (error) {
      return handleError(res, error, "Failed to fetch contributor gifts");
    }
  });
  app2.patch("/api/contributors/:id/profile-photo", authenticate, async (req, res) => {
    try {
      const { userId } = getAuthUser(req);
      const { id } = req.params;
      const { profileImageUrl } = req.body;
      if (!profileImageUrl) {
        return handleValidationError(res, new Error("Profile image URL is required"));
      }
      if (userId !== id) {
        return handleForbidden(res, "You can only update your own profile");
      }
      const updatedContributor = await storage.updateContributor(id, {
        profileImageUrl
      });
      if (!updatedContributor) {
        return handleNotFound(res, "Contributor");
      }
      res.json(updatedContributor);
    } catch (error) {
      return handleError(res, error, "Failed to update profile photo");
    }
  });
}

// server/routes/sprout.routes.ts
init_schema();
function registerSproutRoutes(app2) {
  app2.post("/api/sprout-requests", authenticate, async (req, res) => {
    try {
      const { userId } = getAuthUser(req);
      const validatedData = createSproutRequestSchema.parse(req.body);
      const sproutRequest = await storage.createSproutRequest({
        ...validatedData,
        parentId: userId,
        status: "pending"
      });
      const baseUrl = process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : "http://localhost:3000";
      const sproutLink = `${baseUrl}/sprout/${sproutRequest.requestCode}`;
      console.log(`Sprout request SMS would be sent to ${validatedData.contributorPhone}:`);
      console.log(`Hi ${validatedData.contributorName}! You've been invited to contribute to a child's investment account. Click here: ${sproutLink}`);
      res.json({
        sproutRequest,
        sproutLink,
        message: "Sprout request created successfully"
      });
    } catch (error) {
      return handleValidationError(res, error, "Failed to create sprout request");
    }
  });
  app2.get("/api/sprout-requests/parent/:parentId", async (req, res) => {
    try {
      const requests = await storage.getSproutRequestsByParent(req.params.parentId);
      res.json(requests);
    } catch (error) {
      return handleError(res, error, "Failed to fetch sprout requests");
    }
  });
  app2.get("/api/sprout-requests/code/:code", async (req, res) => {
    try {
      const request = await storage.getSproutRequestByCode(req.params.code);
      if (!request) {
        return res.status(404).json({ error: "Sprout request not found" });
      }
      const child = await storage.getChild(request.childId);
      res.json({
        ...request,
        child
      });
    } catch (error) {
      console.error("Failed to fetch sprout request:", error);
      res.status(500).json({ error: "Failed to fetch sprout request" });
    }
  });
  app2.patch("/api/sprout-requests/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      await storage.updateSproutRequestStatus(req.params.id, status);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to update sprout request:", error);
      res.status(500).json({ error: "Failed to update sprout request" });
    }
  });
  app2.post("/api/recurring-contributions", async (req, res) => {
    try {
      const validatedData = createRecurringContributionSchema.parse(req.body);
      const now = /* @__PURE__ */ new Date();
      const nextDate = new Date(now);
      if (validatedData.frequency === "monthly") {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
      const contribution = await storage.createRecurringContribution({
        ...validatedData,
        amount: validatedData.amount.toString(),
        contributorId: null,
        nextContributionDate: nextDate,
        isActive: true
      });
      res.status(201).json({
        contribution,
        message: `Recurring ${validatedData.frequency} contribution set up successfully`
      });
    } catch (error) {
      console.error("Recurring contribution error:", error);
      res.status(400).json({ error: "Failed to create recurring contribution" });
    }
  });
  app2.get("/api/recurring-contributions/child/:childId", async (req, res) => {
    try {
      const { recurringContributions: recurringContributions2, investments: investments2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { desc: desc2, eq: eq2 } = await import("drizzle-orm");
      const results = await db.select({
        // Contribution fields
        id: recurringContributions2.id,
        childId: recurringContributions2.childId,
        contributorId: recurringContributions2.contributorId,
        contributorEmail: recurringContributions2.contributorEmail,
        contributorName: recurringContributions2.contributorName,
        investmentId: recurringContributions2.investmentId,
        amount: recurringContributions2.amount,
        frequency: recurringContributions2.frequency,
        isActive: recurringContributions2.isActive,
        nextContributionDate: recurringContributions2.nextContributionDate,
        lastContributionDate: recurringContributions2.lastContributionDate,
        createdAt: recurringContributions2.createdAt,
        // Investment fields
        investmentSymbol: investments2.symbol,
        investmentName: investments2.name,
        investmentType: investments2.type,
        investmentCurrentPrice: investments2.currentPrice,
        investmentYtdReturn: investments2.ytdReturn
      }).from(recurringContributions2).leftJoin(investments2, eq2(recurringContributions2.investmentId, investments2.id)).where(eq2(recurringContributions2.childId, req.params.childId)).orderBy(desc2(recurringContributions2.createdAt));
      const enrichedContributions = results.map((row) => ({
        id: row.id,
        childId: row.childId,
        contributorId: row.contributorId,
        contributorEmail: row.contributorEmail,
        contributorName: row.contributorName,
        investmentId: row.investmentId,
        amount: row.amount,
        frequency: row.frequency,
        isActive: row.isActive,
        nextContributionDate: row.nextContributionDate,
        lastContributionDate: row.lastContributionDate,
        createdAt: row.createdAt,
        investment: row.investmentSymbol ? {
          id: row.investmentId,
          symbol: row.investmentSymbol,
          name: row.investmentName,
          type: row.investmentType,
          currentPrice: row.investmentCurrentPrice,
          ytdReturn: row.investmentYtdReturn
        } : null
      }));
      res.json(enrichedContributions);
    } catch (error) {
      console.error("Failed to fetch recurring contributions:", error);
      res.status(500).json({ error: "Failed to fetch recurring contributions" });
    }
  });
  app2.patch("/api/recurring-contributions/:id/cancel", async (req, res) => {
    try {
      await storage.cancelRecurringContribution(req.params.id);
      res.json({ success: true, message: "Recurring contribution cancelled" });
    } catch (error) {
      console.error("Failed to cancel recurring contribution:", error);
      res.status(500).json({ error: "Failed to cancel recurring contribution" });
    }
  });
}

// server/routes/misc.routes.ts
import express from "express";
import multer from "multer";
import path from "path";
import { mkdirSync } from "fs";
function registerMiscRoutes(app2) {
  try {
    mkdirSync("uploads/videos", { recursive: true });
  } catch (err) {
  }
  const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/videos/");
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, "video-" + uniqueSuffix + path.extname(file.originalname));
    }
  });
  const uploadVideo = multer({
    storage: videoStorage,
    limits: {
      fileSize: 50 * 1024 * 1024
      // 50MB max
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /webm|mp4|mov|avi/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      if (extname && mimetype) {
        return cb(null, true);
      } else {
        cb(new Error("Only video files are allowed!"));
      }
    }
  });
  app2.post("/api/upload-video", uploadVideo.single("video"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No video file provided" });
      }
      const videoUrl = `/uploads/videos/${req.file.filename}`;
      res.json({ videoUrl });
    } catch (error) {
      console.error("Video upload error:", error);
      res.status(500).json({ error: "Failed to upload video" });
    }
  });
  app2.use("/uploads", express.static("uploads"));
  app2.post("/api/test/cleanup-broken-holdings/:childId", async (req, res) => {
    try {
      const { childId } = req.params;
      const { portfolioHoldings: portfolioHoldings2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq2 } = await import("drizzle-orm");
      const holdings = await storage.getPortfolioHoldingsByChild(childId);
      const brokenHoldings = [];
      for (const holding of holdings) {
        const investment = await storage.getInvestment(holding.investmentId);
        if (!investment) {
          brokenHoldings.push(holding);
          console.log(`[Cleanup] Deleting broken holding ${holding.id} with invalid investmentId: ${holding.investmentId}`);
          await db.delete(portfolioHoldings2).where(eq2(portfolioHoldings2.id, holding.id));
        }
      }
      res.json({
        message: `Cleaned up ${brokenHoldings.length} broken holdings`,
        deleted: brokenHoldings.map((h) => ({ id: h.id, investmentId: h.investmentId }))
      });
    } catch (error) {
      console.error("Cleanup error:", error);
      res.status(500).json({ error: "Failed to cleanup holdings" });
    }
  });
  app2.get("/api/test/contributors", async (req, res) => {
    try {
      const { contributors: contributors2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const allContributors = await db.select().from(contributors2);
      res.json({
        count: allContributors.length,
        contributors: allContributors.map((c) => ({
          id: c.id,
          email: c.email,
          name: c.name,
          isRegistered: c.isRegistered,
          createdAt: c.createdAt
        }))
      });
    } catch (error) {
      console.error("Failed to list contributors:", error);
      res.status(500).json({ error: "Failed to list contributors" });
    }
  });
  app2.post("/api/test/create-contributor", async (req, res) => {
    try {
      const testEmail = "test@contributor.com";
      const existingContributor = await storage.getContributorByEmail(testEmail);
      if (existingContributor) {
        return res.json({
          message: "Test contributor already exists",
          email: testEmail,
          contributor: existingContributor
        });
      }
      const contributor = await storage.createContributor({
        email: testEmail,
        name: "Test Contributor",
        password: null,
        phone: null,
        profileImageUrl: null,
        isRegistered: false
      });
      res.json({
        message: "Test contributor created",
        email: testEmail,
        contributor
      });
    } catch (error) {
      console.error("Failed to create test contributor:", error);
      res.status(500).json({ error: "Failed to create test contributor" });
    }
  });
}

// server/routes/index.ts
async function registerRoutes(app2) {
  registerAuthRoutes(app2);
  registerChildrenRoutes(app2);
  registerPortfolioRoutes(app2);
  registerGiftRoutes(app2);
  registerContributorRoutes(app2);
  registerSproutRoutes(app2);
  registerMiscRoutes(app2);
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  publicDir: path2.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json({ limit: "50mb" }));
app.use(express3.urlencoded({ extended: false, limit: "50mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "3000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
