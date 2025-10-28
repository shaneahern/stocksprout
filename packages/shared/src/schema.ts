import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, json, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").unique(), // Optional
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  profileImageUrl: text("profile_image_url"),
  bankAccountNumber: text("bank_account_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const children = pgTable("children", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentId: varchar("parent_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  birthdate: timestamp("birthdate").notNull(),
  profileImageUrl: text("profile_image_url"),
  giftLinkCode: text("gift_link_code").notNull().unique(),
}, (table) => ({
  parentIdIdx: index("children_parent_id_idx").on(table.parentId),
  giftLinkCodeIdx: index("children_gift_link_code_idx").on(table.giftLinkCode),
}));

export const investments = pgTable("investments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'stock', 'etf', 'crypto', 'index'
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  ytdReturn: decimal("ytd_return", { precision: 5, scale: 2 }).notNull(),
}, (table) => ({
  symbolIdx: index("investments_symbol_idx").on(table.symbol),
}));

export const portfolioHoldings = pgTable("portfolio_holdings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").notNull(),
  investmentId: varchar("investment_id").notNull(),
  shares: decimal("shares", { precision: 10, scale: 6 }).notNull(),
  averageCost: decimal("average_cost", { precision: 10, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 10, scale: 2 }).notNull(),
}, (table) => ({
  childIdIdx: index("portfolio_holdings_child_id_idx").on(table.childId),
  investmentIdIdx: index("portfolio_holdings_investment_id_idx").on(table.investmentId),
}));

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
}, (table) => ({
  childIdIdx: index("gifts_child_id_idx").on(table.childId),
  contributorIdIdx: index("gifts_contributor_id_idx").on(table.contributorId),
  statusIdx: index("gifts_status_idx").on(table.status),
}));

export const thankYouMessages = pgTable("thank_you_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  giftId: varchar("gift_id").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  giftIdIdx: index("thank_you_messages_gift_id_idx").on(table.giftId),
}));

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
}, (table) => ({
  parentIdIdx: index("sprout_requests_parent_id_idx").on(table.parentId),
  requestCodeIdx: index("sprout_requests_request_code_idx").on(table.requestCode),
  statusIdx: index("sprout_requests_status_idx").on(table.status),
}));

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
}, (table) => ({
  childIdIdx: index("recurring_contributions_child_id_idx").on(table.childId),
  contributorIdIdx: index("recurring_contributions_contributor_id_idx").on(table.contributorId),
  isActiveIdx: index("recurring_contributions_is_active_idx").on(table.isActive),
}));

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recipientUserId: varchar("recipient_user_id"), // For parent users
  recipientContributorId: varchar("recipient_contributor_id"), // For contributor users
  recipientEmail: text("recipient_email"), // Fallback for guest users without accounts
  type: text("type").notNull(), // 'thank_you', 'pending_gift', etc.
  title: text("title").notNull(),
  message: text("message").notNull(),
  relatedGiftId: varchar("related_gift_id"),
  relatedChildId: varchar("related_child_id"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  recipientUserIdIdx: index("notifications_recipient_user_id_idx").on(table.recipientUserId),
  recipientContributorIdIdx: index("notifications_recipient_contributor_id_idx").on(table.recipientContributorId),
  recipientEmailIdx: index("notifications_recipient_email_idx").on(table.recipientEmail),
  isReadIdx: index("notifications_is_read_idx").on(table.isRead),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  name: true,
  phone: true,
  profileImageUrl: true,
  bankAccountNumber: true,
});

// Authentication schemas
export const signupSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(100),
  phone: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  profileImageUrl: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().min(1), // Can be email or username
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  profileImageUrl: z.string().optional().or(z.literal("")), // Allow base64 data URLs
  bankAccountNumber: z.string().optional(),
});

export const insertChildSchema = createInsertSchema(children).pick({
  parentId: true,
  firstName: true,
  lastName: true,
  birthdate: true,
  profileImageUrl: true,
}).extend({
  birthdate: z.coerce.date(),
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

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
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

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
