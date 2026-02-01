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
 * Children table - stores information about each child
 * Each child belongs to a user (parent)
 */
export const children = mysqlTable("children", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Foreign key to users table
  name: text("name").notNull(),
  initialBalance: int("initialBalance").default(0).notNull(),
  startDate: timestamp("startDate"),
  totalPoints: int("totalPoints").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Child = typeof children.$inferSelect;
export type InsertChild = typeof children.$inferInsert;

/**
 * Activities table - stores history of all activities performed by children
 * Points are calculated as: points × multiplier
 */
export const activities = mysqlTable("activities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // For data isolation
  childId: int("childId").notNull(),
  name: text("name").notNull(),
  points: int("points").notNull(), // Base points
  category: varchar("category", { length: 50 }).notNull(), // positivos, especiais, negativos, graves
  date: timestamp("date").notNull(),
  multiplier: int("multiplier").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

/**
 * Custom activities table - user-defined activities per child
 * Users can create, edit, delete and reorder these activities
 */
export const customActivities = mysqlTable("customActivities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  childId: int("childId").notNull(),
  activityId: varchar("activityId", { length: 100 }).notNull(),
  name: text("name").notNull(),
  points: int("points").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  orderIndex: int("orderIndex").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomActivity = typeof customActivities.$inferSelect;
export type InsertCustomActivity = typeof customActivities.$inferInsert;

/**
 * Settings table - stores user preferences and multipliers
 * Key-value store for flexible configuration
 */
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value").notNull(), // JSON stringified
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;

/**
 * Expenses table - tracks points spent by children
 * Reduces the total available points
 */
export const expenses = mysqlTable("expenses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  childId: int("childId").notNull(),
  description: text("description").notNull(),
  amount: int("amount").notNull(), // Points spent
  date: timestamp("date").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

/**
 * Parent data table - stores information about the parent/guardian
 * One record per user
 */
export const parentData = mysqlTable("parentData", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  name: text("name").notNull(),
  gender: varchar("gender", { length: 20 }), // masculino, feminino, outro
  appStartDate: timestamp("appStartDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ParentData = typeof parentData.$inferSelect;
export type InsertParentData = typeof parentData.$inferInsert;