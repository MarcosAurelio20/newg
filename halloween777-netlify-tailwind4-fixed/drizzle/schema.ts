import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Custom users table for phone-based authentication
 * Stores phone numbers and hashed passwords for the Halloween777 platform
 */
export const customUsers = mysqlTable("custom_users", {
  id: int("id").autoincrement().primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  inviteCode: varchar("inviteCode", { length: 50 }),
  lastVerified: timestamp("lastVerified"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomUser = typeof customUsers.$inferSelect;
export type InsertCustomUser = typeof customUsers.$inferInsert;

/**
 * SMS verification codes table
 * Stores temporary verification codes sent via SMS
 */
export const smsVerifications = mysqlTable("sms_verifications", {
  id: int("id").autoincrement().primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  verified: int("verified").default(0).notNull(), // 0 = not verified, 1 = verified
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SmsVerification = typeof smsVerifications.$inferSelect;
export type InsertSmsVerification = typeof smsVerifications.$inferInsert;

/**
 * Admin users table
 * Stores phone numbers that have admin access
 */
export const adminUsers = mysqlTable("admin_users", {
  id: int("id").autoincrement().primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;

/**
 * User credits table
 * Stores credit balance for each user (1 real = 1 credit)
 */
export const userCredits = mysqlTable("user_credits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  balance: int("balance").notNull().default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserCredit = typeof userCredits.$inferSelect;
export type InsertUserCredit = typeof userCredits.$inferInsert;

/**
 * Transactions table
 * Stores all financial transactions (deposits, withdrawals, bets, wins)
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'deposit', 'withdrawal', 'bet', 'win'
  status: varchar("status", { length: 20 }).notNull().default('pending'), // 'pending', 'completed', 'failed'
  paymentId: varchar("paymentId", { length: 255 }),
  paymentMethod: varchar("paymentMethod", { length: 50 }), // 'pix', 'credit_card', etc
  pixQrCode: text("pixQrCode"),
  pixQrCodeBase64: text("pixQrCodeBase64"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
/**
 * Game configuration table
 * Stores global game settings that can be modified by admin
 */
export const gameConfig = mysqlTable("game_config", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GameConfig = typeof gameConfig.$inferSelect;
export type InsertGameConfig = typeof gameConfig.$inferInsert;

/**
 * Player lives table
 * Tracks current lives for each player (max 3, can buy more with credits)
 */
export const playerLives = mysqlTable("player_lives", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  lives: int("lives").notNull().default(3),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlayerLives = typeof playerLives.$inferSelect;
export type InsertPlayerLives = typeof playerLives.$inferInsert;

/**
 * Player progress table
 * Tracks player's current phase in the cycle
 */
export const playerProgress = mysqlTable("player_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  currentPhase: int("currentPhase").notNull().default(1), // 1-10 in the cycle
  cyclesCompleted: int("cyclesCompleted").notNull().default(0),
  totalScore: int("totalScore").notNull().default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlayerProgress = typeof playerProgress.$inferSelect;
export type InsertPlayerProgress = typeof playerProgress.$inferInsert;

/**
 * Game matches table
 * Stores individual game session data
 */
export const gameMatches = mysqlTable("game_matches", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  phase: int("phase").notNull(), // Which phase in the cycle (1-10)
  difficulty: varchar("difficulty", { length: 20 }).notNull(), // 'easy', 'medium', 'hard'
  score: int("score").notNull().default(0),
  objective: varchar("objective", { length: 50 }).notNull(), // 'points', 'color', 'quantity'
  objectiveValue: int("objectiveValue").notNull(),
  completed: int("completed").default(0).notNull(), // 0 = failed, 1 = completed
  timeSpent: int("timeSpent").notNull(), // seconds
  consecutiveErrors: int("consecutiveErrors").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GameMatch = typeof gameMatches.$inferSelect;
export type InsertGameMatch = typeof gameMatches.$inferInsert;

/**
 * Daily ranking table
 * Stores daily ranking data (resets at 23:59 Brasília time)
 */
export const dailyRanking = mysqlTable("daily_ranking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD format
  totalScore: int("totalScore").notNull().default(0),
  matchesPlayed: int("matchesPlayed").notNull().default(0),
  highestDifficulty: varchar("highestDifficulty", { length: 20 }).notNull().default('easy'),
  position: int("position"),
  prizeAmount: int("prizeAmount").default(0).notNull(), // Prize in credits
  prizePaid: int("prizePaid").default(0).notNull(), // 0 = not paid, 1 = paid
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailyRanking = typeof dailyRanking.$inferSelect;
export type InsertDailyRanking = typeof dailyRanking.$inferInsert;

/**
 * Prize pool table
 * Tracks daily prize pool accumulation
 */
export const prizePool = mysqlTable("prize_pool", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull().unique(), // YYYY-MM-DD format
  baseAmount: int("baseAmount").notNull().default(54), // Sum of base prizes (2+5+10+15+20)
  depositedAmount: int("depositedAmount").notNull().default(0), // Total deposited by players
  prizePercentage: int("prizePercentage").notNull().default(10), // % of deposits for prize
  totalPrize: int("totalPrize").notNull().default(54), // baseAmount + (depositedAmount * prizePercentage / 100)
  distributed: int("distributed").default(0).notNull(), // 0 = not distributed, 1 = distributed
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PrizePool = typeof prizePool.$inferSelect;
export type InsertPrizePool = typeof prizePool.$inferInsert;

/**
 * Surprise box history table
 * Tracks when players open surprise boxes and what they win
 */
export const surpriseBoxHistory = mysqlTable("surprise_box_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  cycleNumber: int("cycleNumber").notNull(),
  won: int("won").notNull(), // 0 = lost, 1 = won
  prizeType: varchar("prizeType", { length: 20 }), // 'lives' or 'credits'
  prizeAmount: int("prizeAmount"), // Amount won
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SurpriseBoxHistory = typeof surpriseBoxHistory.$inferSelect;
export type InsertSurpriseBoxHistory = typeof surpriseBoxHistory.$inferInsert;

/**
 * Admin logs table
 * Tracks all admin actions for auditing
 */
export const adminLogs = mysqlTable("admin_logs", {
  id: int("id").autoincrement().primaryKey(),
  adminPhone: varchar("adminPhone", { length: 20 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = typeof adminLogs.$inferInsert;
