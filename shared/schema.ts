import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  profileImageUrl: text("profile_image_url"),
  bankAccountNumber: text("bank_account_number"),
});

export const children = pgTable("children", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentId: varchar("parent_id").notNull(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  profileImageUrl: text("profile_image_url"),
  birthday: text("birthday"),
  giftLinkCode: text("gift_link_code").notNull().unique(),
});

export const investments = pgTable("investments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'stock', 'etf', 'crypto', 'index'
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  ytdReturn: decimal("ytd_return", { precision: 5, scale: 2 }).notNull(),
});

export const portfolioHoldings = pgTable("portfolio_holdings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").notNull(),
  investmentId: varchar("investment_id").notNull(),
  shares: decimal("shares", { precision: 10, scale: 6 }).notNull(),
  averageCost: decimal("average_cost", { precision: 10, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 10, scale: 2 }).notNull(),
});

export const gifts = pgTable("gifts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").notNull(),
  contributorId: varchar("contributor_id"), // Optional - for authenticated contributors
  giftGiverName: text("gift_giver_name").notNull(),
  giftGiverEmail: text("gift_giver_email"),
  giftGiverProfileImageUrl: text("gift_giver_profile_image_url"), // For guest contributors with profile photos
  investmentId: varchar("investment_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  shares: decimal("shares", { precision: 10, scale: 6 }).notNull(),
  message: text("message"),
  videoMessageUrl: text("video_message_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isViewed: boolean("is_viewed").default(false),
  thankYouSent: boolean("thank_you_sent").default(false),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  reviewedAt: timestamp("reviewed_at"),
});

export const thankYouMessages = pgTable("thank_you_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  giftId: varchar("gift_id").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contributors = pgTable("contributors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  name: text("name").notNull(),
  password: text("password"), // Optional - they can sign up later
  profileImageUrl: text("profile_image_url"), // Optional - profile photo for contributors
  isRegistered: boolean("is_registered").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sproutRequests = pgTable("sprout_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").notNull(),
  parentId: varchar("parent_id").notNull(),
  contributorEmail: text("contributor_email"),
  contributorPhone: text("contributor_phone").notNull(),
  contributorName: text("contributor_name").notNull(),
  message: text("message"),
  requestCode: text("request_code").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending, accepted, declined
  createdAt: timestamp("created_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
});

export const recurringContributions = pgTable("recurring_contributions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").notNull(),
  contributorId: varchar("contributor_id"), // If contributor is registered
  contributorEmail: text("contributor_email"),
  contributorName: text("contributor_name").notNull(),
  investmentId: varchar("investment_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  frequency: text("frequency").notNull(), // monthly, yearly
  isActive: boolean("is_active").default(true),
  nextContributionDate: timestamp("next_contribution_date").notNull(),
  lastContributionDate: timestamp("last_contribution_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  name: true,
  profileImageUrl: true,
  bankAccountNumber: true,
});

// Authentication schemas
export const signupSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(100),
  bankAccountNumber: z.string().optional(),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  profileImageUrl: z.string().url().optional().or(z.literal("")),
  bankAccountNumber: z.string().optional(),
});

export const insertChildSchema = createInsertSchema(children).pick({
  parentId: true,
  name: true,
  age: true,
  profileImageUrl: true,
  birthday: true,
});

export const insertInvestmentSchema = createInsertSchema(investments).pick({
  symbol: true,
  name: true,
  type: true,
  currentPrice: true,
  ytdReturn: true,
});

export const insertPortfolioHoldingSchema = createInsertSchema(portfolioHoldings).pick({
  childId: true,
  investmentId: true,
  shares: true,
  averageCost: true,
  currentValue: true,
});

export const insertGiftSchema = createInsertSchema(gifts).omit({
  id: true,
  createdAt: true,
  isViewed: true,
  thankYouSent: true,
  shares: true, // Calculated on server
  status: true, // Set to pending by default
  reviewedAt: true,
});

export const insertThankYouMessageSchema = createInsertSchema(thankYouMessages).pick({
  giftId: true,
  message: true,
});

export const insertContributorSchema = createInsertSchema(contributors).pick({
  email: true,
  phone: true,
  name: true,
  password: true,
  profileImageUrl: true,
  isRegistered: true,
});

export const insertSproutRequestSchema = createInsertSchema(sproutRequests).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
  requestCode: true,
});

// Sprout request creation schema
export const createSproutRequestSchema = z.object({
  childId: z.string(),
  contributorPhone: z.string().min(10),
  contributorName: z.string().min(1),
  contributorEmail: z.string().email().optional(),
  message: z.string().optional(),
});

export const insertRecurringContributionSchema = createInsertSchema(recurringContributions).omit({
  id: true,
  createdAt: true,
  lastContributionDate: true,
});

// Recurring contribution creation schema
export const createRecurringContributionSchema = z.object({
  childId: z.string(),
  contributorEmail: z.string().email().optional(),
  contributorName: z.string().min(1),
  investmentId: z.string(),
  amount: z.string().or(z.number()),
  frequency: z.enum(['monthly', 'yearly']),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SignupData = z.infer<typeof signupSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;

export type InsertChild = z.infer<typeof insertChildSchema>;
export type Child = typeof children.$inferSelect;

export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type Investment = typeof investments.$inferSelect;

export type InsertPortfolioHolding = z.infer<typeof insertPortfolioHoldingSchema>;
export type PortfolioHolding = typeof portfolioHoldings.$inferSelect;

export type InsertGift = z.infer<typeof insertGiftSchema>;
export type Gift = typeof gifts.$inferSelect;

export type InsertThankYouMessage = z.infer<typeof insertThankYouMessageSchema>;
export type ThankYouMessage = typeof thankYouMessages.$inferSelect;

export type InsertContributor = z.infer<typeof insertContributorSchema>;
export type Contributor = typeof contributors.$inferSelect;

export type InsertSproutRequest = z.infer<typeof insertSproutRequestSchema>;
export type SproutRequest = typeof sproutRequests.$inferSelect;
export type CreateSproutRequestData = z.infer<typeof createSproutRequestSchema>;

export type InsertRecurringContribution = z.infer<typeof insertRecurringContributionSchema>;
export type RecurringContribution = typeof recurringContributions.$inferSelect;
export type CreateRecurringContributionData = z.infer<typeof createRecurringContributionSchema>;
