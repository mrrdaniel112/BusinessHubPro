import { pgTable, text, serial, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
});

// Transaction schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'income' or 'expense'
  amount: numeric("amount").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  date: timestamp("date").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  type: true,
  amount: true,
  description: true,
  category: true,
  date: true,
});

// Inventory schema
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  quantity: integer("quantity").notNull(),
  price: numeric("price").notNull(),
  lowStockThreshold: integer("low_stock_threshold"),
  category: text("category"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).pick({
  userId: true,
  name: true,
  description: true,
  quantity: true,
  price: true,
  lowStockThreshold: true,
  category: true,
});

// Contract schema
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  clientName: text("client_name").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull(), // 'draft', 'sent', 'signed', 'expired'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiryDate: timestamp("expiry_date"),
});

export const insertContractSchema = createInsertSchema(contracts).pick({
  userId: true,
  clientName: true,
  title: true,
  content: true,
  status: true,
  expiryDate: true,
});

// Receipt schema
export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  vendor: text("vendor").notNull(),
  amount: numeric("amount").notNull(),
  date: timestamp("date").notNull(),
  category: text("category").notNull(),
  notes: text("notes"),
  imageData: text("image_data"), // Store base64 encoded image or reference
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReceiptSchema = createInsertSchema(receipts).pick({
  userId: true,
  vendor: true,
  amount: true,
  date: true,
  category: true,
  notes: true,
  imageData: true,
});

// Invoice schema
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  clientName: text("client_name").notNull(),
  amount: numeric("amount").notNull(),
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull(), // 'draft', 'sent', 'paid', 'overdue'
  items: text("items").notNull(), // JSON string of line items
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).pick({
  userId: true,
  invoiceNumber: true,
  clientName: true,
  amount: true,
  issueDate: true,
  dueDate: true,
  status: true,
  items: true,
  notes: true,
});

// AI Insight schema
export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'cash_flow', 'revenue', 'expense', etc.
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isRead: boolean("is_read").notNull().default(false),
});

export const insertAiInsightSchema = createInsertSchema(aiInsights).pick({
  userId: true,
  type: true,
  title: true,
  content: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;

export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = z.infer<typeof insertReceiptSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type AiInsight = typeof aiInsights.$inferSelect;
export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;
