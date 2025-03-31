import { pgTable, text, serial, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Importing the UserRole enum for type safety
import { UserRole } from '../server/services/rbac';

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default(UserRole.USER),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  role: true,
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
  clientEmail: text("client_email"),
  clientPhone: text("client_phone"),
  clientAddress: text("client_address"),
  vendorName: text("vendor_name"),
  vendorAddress: text("vendor_address"),
  vendorEmail: text("vendor_email"),
  vendorPhone: text("vendor_phone"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull(), // 'draft', 'sent', 'signed', 'expired'
  category: text("category"), // 'service', 'sales', 'employment', 'consulting', etc.
  value: numeric("value"), // Contract monetary value
  startDate: timestamp("start_date"),
  signatureDate: timestamp("signature_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiryDate: timestamp("expiry_date"),
  terms: text("terms"), // JSON string of key terms
  legalClauses: text("legal_clauses"), // JSON string of legal clauses
  reminderSent: boolean("reminder_sent").default(false),
  lastEmailSent: timestamp("last_email_sent"),
  notes: text("notes"),
});

// Create a custom contract schema with flexible date handling
export const insertContractSchema = z.object({
  userId: z.number(),
  clientName: z.string(),
  clientEmail: z.string().email().optional().nullable(),
  clientPhone: z.string().optional().nullable(),
  clientAddress: z.string().optional().nullable(),
  vendorName: z.string().optional().nullable(),
  vendorAddress: z.string().optional().nullable(),
  vendorEmail: z.string().email().optional().nullable(),
  vendorPhone: z.string().optional().nullable(),
  title: z.string(),
  content: z.string(),
  status: z.string(),
  category: z.string().optional().nullable(),
  value: z.string().or(z.number()).optional().nullable().transform(val => val ? val.toString() : null),
  startDate: z.date().optional().nullable(),
  signatureDate: z.date().optional().nullable(),
  expiryDate: z.date().optional().nullable(),
  terms: z.string().optional().nullable(),
  legalClauses: z.string().optional().nullable(),
  reminderSent: z.boolean().optional().default(false),
  lastEmailSent: z.date().optional().nullable(),
  notes: z.string().optional().nullable(),
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
  lastEmailSent: timestamp("last_email_sent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Create a custom invoice schema with flexible date handling
export const insertInvoiceSchema = z.object({
  userId: z.number(),
  invoiceNumber: z.string(),
  clientName: z.string(),
  amount: z.string().or(z.number()).transform(val => val.toString()),
  issueDate: z.date(),
  dueDate: z.date(),
  status: z.string(),
  items: z.string(),
  notes: z.string().nullable().optional().transform(val => val || null),
  lastEmailSent: z.date().nullable().optional()
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

// Tax Item schema
export const taxItems = pgTable("tax_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'income', 'expense', 'deduction', 'credit'
  amount: numeric("amount").notNull(),
  taxYear: integer("tax_year").notNull(),
  quarter: integer("quarter"), // For quarterly taxes
  description: text("description"),
  dateFiled: timestamp("date_filed"),
  status: text("status").notNull(), // 'pending', 'filed', 'paid', 'overdue'
  receiptId: integer("receipt_id"), // Optional link to a receipt
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTaxItemSchema = createInsertSchema(taxItems).pick({
  userId: true,
  name: true,
  category: true,
  amount: true,
  taxYear: true,
  quarter: true,
  description: true,
  dateFiled: true,
  status: true,
  receiptId: true,
});

// Tax Document schema
export const taxDocuments = pgTable("tax_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  fileSize: text("file_size").notNull(),
  fileType: text("file_type").notNull(),
  category: text("category").notNull(), // 'receipt', 'tax_form', 'invoice', etc.
  taxYear: integer("tax_year").notNull(),
  uploadDate: timestamp("upload_date").notNull().defaultNow(),
  path: text("path"), // File path or URL
});

export const insertTaxDocumentSchema = createInsertSchema(taxDocuments).pick({
  userId: true,
  name: true,
  fileSize: true,
  fileType: true,
  category: true,
  taxYear: true,
  path: true,
});

// Tax Reminder schema
export const taxReminders = pgTable("tax_reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  taxYear: integer("tax_year").notNull(),
  dueDate: timestamp("due_date").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("medium"), // 'low', 'medium', 'high'
  status: text("status").notNull().default("upcoming"), // 'upcoming', 'due', 'overdue', 'completed'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTaxReminderSchema = createInsertSchema(taxReminders).pick({
  userId: true,
  title: true,
  taxYear: true,
  dueDate: true,
  description: true,
  priority: true,
  status: true,
});

// Tax Scenario schema
export const taxScenarios = pgTable("tax_scenarios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  baseAmount: numeric("base_amount").notNull(),
  scenarioAmount: numeric("scenario_amount").notNull(),
  savings: numeric("savings").notNull(),
  parameters: text("parameters"), // JSON string containing scenario parameters
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTaxScenarioSchema = createInsertSchema(taxScenarios).pick({
  userId: true,
  name: true,
  description: true,
  baseAmount: true,
  scenarioAmount: true,
  savings: true,
  parameters: true,
});

// Payroll schema
export const payrollItems = pgTable("payroll_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  employeeName: text("employee_name").notNull(),
  employeeId: text("employee_id").notNull(),
  payPeriodStart: timestamp("pay_period_start").notNull(),
  payPeriodEnd: timestamp("pay_period_end").notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  grossAmount: numeric("gross_amount").notNull(),
  taxWithholdings: numeric("tax_withholdings").notNull(),
  otherDeductions: numeric("other_deductions").notNull(),
  netAmount: numeric("net_amount").notNull(),
  paymentMethod: text("payment_method").notNull(), // 'check', 'direct_deposit'
  status: text("status").notNull(), // 'pending', 'processed', 'cancelled'
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPayrollItemSchema = createInsertSchema(payrollItems).pick({
  userId: true,
  employeeName: true,
  employeeId: true,
  payPeriodStart: true,
  payPeriodEnd: true,
  paymentDate: true,
  grossAmount: true,
  taxWithholdings: true,
  otherDeductions: true,
  netAmount: true,
  paymentMethod: true,
  status: true,
  notes: true,
});

// Time Tracking schema
export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  projectId: text("project_id"),
  projectName: text("project_name").notNull(),
  taskDescription: text("task_description").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: numeric("duration"), // In minutes
  billable: boolean("billable").notNull().default(true),
  billingRate: numeric("billing_rate"),
  invoiceId: integer("invoice_id"), // If this time has been invoiced
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).pick({
  userId: true,
  projectId: true,
  projectName: true,
  taskDescription: true,
  startTime: true,
  endTime: true,
  duration: true,
  billable: true,
  billingRate: true,
  invoiceId: true,
  notes: true,
});

// Bank Account schema for reconciliation
export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number").notNull(),
  bankName: text("bank_name").notNull(),
  accountType: text("account_type").notNull(), // 'checking', 'savings', 'credit'
  balance: numeric("balance").notNull(),
  lastReconciled: timestamp("last_reconciled"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBankAccountSchema = createInsertSchema(bankAccounts).pick({
  userId: true,
  accountName: true,
  accountNumber: true,
  bankName: true,
  accountType: true,
  balance: true,
  lastReconciled: true,
  notes: true,
});

// Bank Transaction schema for reconciliation
export const bankTransactions = pgTable("bank_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  bankAccountId: integer("bank_account_id").notNull(),
  transactionDate: timestamp("transaction_date").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount").notNull(),
  category: text("category"),
  reconciled: boolean("reconciled").notNull().default(false),
  matchedTransactionId: integer("matched_transaction_id"), // Link to internal transaction
  checkNumber: text("check_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBankTransactionSchema = createInsertSchema(bankTransactions).pick({
  userId: true,
  bankAccountId: true,
  transactionDate: true,
  description: true,
  amount: true,
  category: true,
  reconciled: true,
  matchedTransactionId: true,
  checkNumber: true,
  notes: true,
});

// Budget schema
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  purpose: text("purpose"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalBudget: numeric("total_budget").notNull(),
  status: text("status").notNull().default('planning'), // 'planning', 'active', 'completed'
  department: text("department"),
  type: text("type").default('operational'), // 'operational', 'capital', 'project', 'periodic'
  categoryBreakdown: text("category_breakdown"), // JSON string of category allocations
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBudgetSchema = createInsertSchema(budgets).pick({
  userId: true,
  name: true,
  description: true,
  purpose: true,
  startDate: true,
  endDate: true,
  totalBudget: true,
  status: true,
  department: true,
  type: true,
  categoryBreakdown: true,
  notes: true,
});

// Budget Category schema
export const budgetCategories = pgTable("budget_categories", {
  id: serial("id").primaryKey(),
  budgetId: integer("budget_id").notNull(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  allocatedAmount: numeric("allocated_amount").notNull(),
  spentAmount: numeric("spent_amount").notNull().default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBudgetCategorySchema = createInsertSchema(budgetCategories).pick({
  budgetId: true,
  userId: true,
  name: true,
  allocatedAmount: true,
  spentAmount: true,
  notes: true,
});

// Inventory Cost Analysis schema
export const inventoryCosts = pgTable("inventory_costs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  inventoryItemId: integer("inventory_item_id").notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
  purchasePrice: numeric("purchase_price").notNull(),
  quantity: integer("quantity").notNull(),
  vendorName: text("vendor_name"),
  shippingCost: numeric("shipping_cost").default("0"),
  taxAmount: numeric("tax_amount").default("0"),
  totalCost: numeric("total_cost").notNull(),
  costPerUnit: numeric("cost_per_unit").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInventoryCostSchema = createInsertSchema(inventoryCosts).pick({
  userId: true,
  inventoryItemId: true,
  purchaseDate: true,
  purchasePrice: true,
  quantity: true,
  vendorName: true,
  shippingCost: true,
  taxAmount: true,
  totalCost: true,
  costPerUnit: true,
  notes: true,
});

export type AiInsight = typeof aiInsights.$inferSelect;
export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;

// New type exports for the added features
export type TaxItem = typeof taxItems.$inferSelect;
export type InsertTaxItem = z.infer<typeof insertTaxItemSchema>;

export type TaxDocument = typeof taxDocuments.$inferSelect;
export type InsertTaxDocument = z.infer<typeof insertTaxDocumentSchema>;

export type TaxReminder = typeof taxReminders.$inferSelect;
export type InsertTaxReminder = z.infer<typeof insertTaxReminderSchema>;

export type TaxScenario = typeof taxScenarios.$inferSelect;
export type InsertTaxScenario = z.infer<typeof insertTaxScenarioSchema>;

export type PayrollItem = typeof payrollItems.$inferSelect;
export type InsertPayrollItem = z.infer<typeof insertPayrollItemSchema>;

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;

export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;

export type BankTransaction = typeof bankTransactions.$inferSelect;
export type InsertBankTransaction = z.infer<typeof insertBankTransactionSchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

export type BudgetCategory = typeof budgetCategories.$inferSelect;
export type InsertBudgetCategory = z.infer<typeof insertBudgetCategorySchema>;

export type InventoryCost = typeof inventoryCosts.$inferSelect;
export type InsertInventoryCost = z.infer<typeof insertInventoryCostSchema>;

// CRM Client schema
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  position: text("position"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country"),
  source: text("source"), // How the client was acquired (referral, website, etc.)
  status: text("status").notNull(), // 'lead', 'prospect', 'active', 'inactive', 'lost'
  leadScore: integer("lead_score"), // For lead qualification
  notes: text("notes"),
  tags: text("tags"), // Comma-separated tags
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastContact: timestamp("last_contact"),
});

export const insertClientSchema = createInsertSchema(clients).pick({
  userId: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  company: true,
  position: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  country: true,
  source: true,
  status: true,
  leadScore: true,
  notes: true,
  tags: true,
  lastContact: true,
});

// Client Interaction schema (for tracking communications with clients)
export const clientInteractions = pgTable("client_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  clientId: integer("client_id").notNull(),
  type: text("type").notNull(), // 'email', 'call', 'meeting', 'note'
  date: timestamp("date").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  followUpDate: timestamp("follow_up_date"),
  followUpComplete: boolean("follow_up_complete").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertClientInteractionSchema = createInsertSchema(clientInteractions).pick({
  userId: true,
  clientId: true,
  type: true,
  date: true,
  subject: true,
  content: true,
  followUpDate: true,
  followUpComplete: true,
});

// Client Deal schema (for opportunity/sales tracking)
export const clientDeals = pgTable("client_deals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  clientId: integer("client_id").notNull(),
  name: text("name").notNull(),
  value: numeric("value").notNull(),
  currency: text("currency").notNull().default("USD"),
  stage: text("stage").notNull(), // 'lead', 'prospect', 'proposal', 'negotiation', 'won', 'lost'
  probability: integer("probability"), // 0-100%
  expectedCloseDate: timestamp("expected_close_date"),
  actualCloseDate: timestamp("actual_close_date"),
  notes: text("notes"),
  assignedTo: text("assigned_to"), // Person responsible for the deal
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertClientDealSchema = createInsertSchema(clientDeals).pick({
  userId: true,
  clientId: true,
  name: true,
  value: true,
  currency: true,
  stage: true,
  probability: true,
  expectedCloseDate: true,
  actualCloseDate: true,
  notes: true,
  assignedTo: true,
});

// Type exports for CRM
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type ClientInteraction = typeof clientInteractions.$inferSelect;
export type InsertClientInteraction = z.infer<typeof insertClientInteractionSchema>;

export type ClientDeal = typeof clientDeals.$inferSelect;
export type InsertClientDeal = z.infer<typeof insertClientDealSchema>;

// Employee schema
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country"),
  position: text("position").notNull(),
  department: text("department"),
  salary: text("salary").notNull(),
  salaryType: text("salary_type").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  status: text("status").notNull(),
  taxInfo: text("tax_info"),
  bankAccountInfo: text("bank_account_info"),
  emergencyContact: text("emergency_contact"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;
