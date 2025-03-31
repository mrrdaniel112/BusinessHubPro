import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: { id: number };
    }
  }
}
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertTransactionSchema,
  insertInventoryItemSchema,
  insertContractSchema,
  insertReceiptSchema,
  insertInvoiceSchema,
  insertAiInsightSchema,
  // New feature schemas
  insertTaxItemSchema,
  insertPayrollItemSchema,
  insertTimeEntrySchema,
  insertBankAccountSchema,
  insertBankTransactionSchema,
  insertBudgetSchema,
  insertBudgetCategorySchema,
  insertInventoryCostSchema,
  // CRM schemas
  insertClientSchema,
  insertClientInteractionSchema,
  insertClientDealSchema,
  // Employee management schema
  insertEmployeeSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { 
  categorizeTransaction, 
  generateBusinessInsights, 
  generateCashFlowForecast, 
  extractReceiptData, 
  generateInvoiceDetails,
  generateInventoryRecommendations,
  generateSupplyRecommendations,
  generateContractTemplate
} from "./openai";
import { NotificationOptions, sendInvoiceNotifications } from "./services/notification";
import { UserRole, requireAdmin, hasPermission, Resource, PermissionScope } from "./services/rbac";
import { initializeEmailService, isEmailServiceAvailable, sendContractEmail, sendInvoiceEmail } from "./services/email";

import session from "express-session";

// Setup types for session
declare module "express-session" {
  interface SessionData {
    userId?: number;
    authenticated?: boolean;
  }
}

// Authentication middleware
const requireAuth = (req: Request, res: Response, next: Function) => {
  if (req.session.authenticated && req.session.userId) {
    req.user = { id: req.session.userId };
    next();
  } else {
    // For demonstration purposes, we'll automatically authenticate as user 1
    // In a production app, this would redirect to login
    req.session.authenticated = true;
    req.session.userId = 1;
    req.user = { id: 1 };
    next();
  }
};

// Sample notifications for development
const sampleNotifications = [
  {
    id: 1,
    title: "New Invoice Created",
    message: "Invoice #INV-2025-001 for $2,500.00 has been created.",
    timestamp: new Date(),
    isRead: false,
    type: "success",
    priority: "medium",
    module: "Invoices",
    entityType: "invoice",
    entityId: "1",
    actionUrl: "/invoices/1"
  },
  {
    id: 2,
    title: "Expense Approved",
    message: "The Office Supplies expense for $350.00 has been approved.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true,
    type: "success",
    priority: "medium",
    module: "Expenses",
    entityType: "expense",
    entityId: "5",
    actionUrl: "/expenses/5"
  },
  {
    id: 3,
    title: "Invoice Overdue",
    message: "Invoice #INV-2025-042 for Client XYZ is overdue by 5 days.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    isRead: false,
    type: "warning",
    priority: "high",
    module: "Invoices",
    entityType: "invoice",
    entityId: "42",
    actionUrl: "/invoices/42"
  },
  {
    id: 4,
    title: "Low Inventory Alert",
    message: "Product X is running low with only 5 units remaining.",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    isRead: false,
    type: "warning",
    priority: "high",
    module: "Inventory",
    entityType: "inventory",
    entityId: "15",
    actionUrl: "/inventory/15"
  },
  {
    id: 5,
    title: "New Client Added",
    message: "John Smith has been added as a new client.",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    isRead: true,
    type: "info",
    priority: "medium",
    module: "Clients",
    entityType: "client",
    entityId: "8",
    actionUrl: "/client-management/8"
  }
];

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize email service
  initializeEmailService();
  // User routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session data
      req.session.authenticated = true;
      req.session.userId = user.id;
      
      // Save session before returning response
      req.session.save(err => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ message: "Error creating session" });
        }
        
        // Return the user object
        return res.json({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email
        });
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Set session data after successful registration
      req.session.authenticated = true;
      req.session.userId = user.id;
      
      // Save session before returning response
      req.session.save(err => {
        if (err) {
          console.error("Error saving session during registration:", err);
          return res.status(500).json({ message: "Error creating session" });
        }
        
        return res.status(201).json({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email
        });
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Logout route
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Error logging out" });
      }
      
      // Clear the cookie on the client
      res.clearCookie('connect.sid');
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  // Get current user route
  app.get("/api/auth/user", (req, res) => {
    if (!req.session.authenticated || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = req.session.userId;
    
    storage.getUser(userId)
      .then(user => {
        if (!user) {
          req.session.destroy(err => {
            if (err) console.error("Error destroying invalid session:", err);
            res.clearCookie('connect.sid');
            return res.status(401).json({ message: "User not found" });
          });
        } else {
          return res.json({
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            email: user.email
          });
        }
      })
      .catch(error => {
        console.error("Error fetching user:", error);
        return res.status(500).json({ message: "Server error" });
      });
  });

  // Transaction routes
  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const transactions = await storage.getTransactions(userId);
      return res.json(transactions);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/transactions", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      let transactionData = req.body;
      
      // If category is not provided, use AI to categorize
      if (!transactionData.category && transactionData.description) {
        try {
          transactionData.category = await categorizeTransaction(transactionData.description);
        } catch (error) {
          console.error("Error categorizing transaction:", error);
          transactionData.category = "Uncategorized";
        }
      }
      
      // Ensure we have a proper date
      let dateObj: Date;
      if (transactionData.date) {
        if (typeof transactionData.date === 'string') {
          dateObj = new Date(transactionData.date);
        } else {
          dateObj = transactionData.date;
        }
      } else {
        dateObj = new Date();
      }

      const formattedData = {
        ...transactionData,
        date: dateObj,
        userId
      };
      
      console.log("Validated transaction data:", formattedData);
      
      const validatedData = insertTransactionSchema.parse(formattedData);
      
      const transaction = await storage.createTransaction(validatedData);
      return res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const items = await storage.getInventoryItems(userId);
      return res.json(items);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // AI-powered inventory recommendations
  app.post("/api/inventory/recommendations", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { name, description, category, price } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Item name is required" });
      }
      
      // Get existing inventory for context
      const existingInventory = await storage.getInventoryItems(userId);
      
      // Generate AI recommendations
      const recommendations = await generateInventoryRecommendations(
        name,
        description,
        existingInventory
      );
      
      return res.json(recommendations);
    } catch (error) {
      console.error("Error generating inventory recommendations:", error);
      return res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });
  
  // AI-powered supply/reorder recommendations
  app.get("/api/inventory/supply-recommendations", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Get inventory items for this user
      const inventoryItems = await storage.getInventoryItems(userId);
      
      if (inventoryItems.length === 0) {
        return res.json({
          itemsToReorder: [],
          suggestedNewItems: [],
          optimizationTips: "Add some inventory items to get supply recommendations."
        });
      }
      
      // Generate AI recommendations for inventory supply
      const recommendations = await generateSupplyRecommendations(inventoryItems);
      
      return res.json(recommendations);
    } catch (error) {
      console.error("Error generating supply recommendations:", error);
      return res.status(500).json({ message: "Failed to generate supply recommendations" });
    }
  });

  app.post("/api/inventory", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const itemData = insertInventoryItemSchema.parse({
        ...req.body,
        userId
      });
      
      const item = await storage.createInventoryItem(itemData);
      return res.status(201).json(item);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/inventory/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const itemId = parseInt(req.params.id);
      
      const existingItem = await storage.getInventoryItemById(itemId);
      if (!existingItem || existingItem.userId !== userId) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      const updatedItem = await storage.updateInventoryItem(itemId, req.body);
      return res.json(updatedItem);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Contract routes
  app.get("/api/contracts", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const contracts = await storage.getContracts(userId);
      return res.json(contracts);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/contracts", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const contractData = insertContractSchema.parse({
        ...req.body,
        userId
      });
      
      const contract = await storage.createContract(contractData);
      return res.status(201).json(contract);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/contracts/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const contractId = parseInt(req.params.id);
      
      const existingContract = await storage.getContractById(contractId);
      if (!existingContract || existingContract.userId !== userId) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      const updatedContract = await storage.updateContract(contractId, req.body);
      return res.json(updatedContract);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Send contract via email
  app.post("/api/contracts/:id/send-email", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const contractId = parseInt(req.params.id);
      const { recipientEmail } = req.body;
      
      if (!recipientEmail) {
        return res.status(400).json({ message: "Recipient email is required" });
      }
      
      // Check if email service is available
      if (!isEmailServiceAvailable()) {
        return res.status(503).json({ 
          message: "Email service is not available. Please set up email credentials in environment variables.",
          missingCredentials: true
        });
      }
      
      const existingContract = await storage.getContractById(contractId);
      if (!existingContract || existingContract.userId !== userId) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Send the email
      const emailSent = await sendContractEmail(existingContract, recipientEmail);
      
      if (emailSent) {
        // Update contract status and last email sent date
        const updatedContract = await storage.updateContract(contractId, {
          status: 'sent',
          lastEmailSent: new Date()
        });
        
        return res.json({ 
          success: true,
          message: "Contract has been sent via email",
          contract: updatedContract
        });
      } else {
        return res.status(500).json({ message: "Failed to send email. Please try again." });
      }
    } catch (error) {
      console.error("Error sending contract email:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // New route for sending invoices via email
  app.post("/api/invoices/:id/send-email", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const invoiceId = parseInt(req.params.id);
      const { recipientEmail } = req.body;
      
      if (!recipientEmail) {
        return res.status(400).json({ message: "Recipient email is required" });
      }
      
      // Check if email service is available
      if (!isEmailServiceAvailable()) {
        return res.status(503).json({ 
          message: "Email service is not available. Please set up email credentials in environment variables.",
          missingCredentials: true
        });
      }
      
      const existingInvoice = await storage.getInvoiceById(invoiceId);
      if (!existingInvoice || existingInvoice.userId !== userId) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      // Parse the invoice items JSON
      let items = [];
      try {
        items = JSON.parse(existingInvoice.items);
      } catch (error) {
        console.error("Error parsing invoice items:", error);
      }
      
      // Send the email
      const result = await sendInvoiceEmail(
        recipientEmail,
        existingInvoice.invoiceNumber,
        existingInvoice.clientName,
        existingInvoice.amount,
        existingInvoice.issueDate,
        existingInvoice.dueDate,
        items
      );
      
      if (result.success) {
        // Update invoice status and last email sent date
        const updatedInvoice = await storage.updateInvoice(invoiceId, {
          status: 'sent',
          lastEmailSent: new Date()
        });
        
        return res.json({ 
          success: true,
          message: "Invoice has been sent via email",
          invoice: updatedInvoice
        });
      } else {
        return res.status(500).json({ 
          message: "Failed to send email. Please try again.",
          error: result.error
        });
      }
    } catch (error) {
      console.error("Error sending invoice email:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // AI-powered contract template generation
  app.post("/api/generate-contract-template", requireAuth, async (req, res) => {
    try {
      const { 
        clientName, 
        projectType, 
        description, 
        scope, 
        clientAddress,
        vendorName,
        vendorAddress,
        paymentTerms,
        startDate,
        endDate
      } = req.body;
      
      if (!clientName || !projectType || !description) {
        return res.status(400).json({ 
          message: "Client name, project type, and description are required" 
        });
      }
      
      try {
        // Call OpenAI to generate contract template with enhanced details
        const contractTemplate = await generateContractTemplate(
          clientName,
          projectType,
          description,
          scope,
          clientAddress,
          vendorName,
          vendorAddress,
          paymentTerms,
          startDate,
          endDate
        );
        
        return res.json(contractTemplate);
      } catch (aiError: any) {
        console.error("Error generating contract template with AI:", aiError);
        return res.status(500).json({ 
          message: "Failed to generate contract template", 
          error: aiError?.message || "Unknown error" 
        });
      }
    } catch (error) {
      console.error("Server error in contract template generation:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Receipt routes
  app.get("/api/receipts", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const receipts = await storage.getReceipts(userId);
      return res.json(receipts);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/receipts", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const receiptData = insertReceiptSchema.parse({
        ...req.body,
        userId
      });
      
      const receipt = await storage.createReceipt(receiptData);
      return res.status(201).json(receipt);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/receipts/extract", requireAuth, async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Receipt text is required" });
      }
      
      const extractedData = await extractReceiptData(text);
      return res.json(extractedData);
    } catch (error) {
      return res.status(500).json({ message: "Failed to extract receipt data" });
    }
  });

  // Invoice routes
  app.get("/api/invoices", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const invoices = await storage.getInvoices(userId);
      return res.json(invoices);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // New endpoint to generate invoice items with OpenAI
  app.post("/api/generate-invoice-items", requireAuth, async (req, res) => {
    try {
      const { jobDescription } = req.body;
      
      if (!jobDescription) {
        return res.status(400).json({ message: "Job description is required" });
      }
      
      try {
        // Call OpenAI to generate invoice details
        const invoiceDetails = await generateInvoiceDetails(
          jobDescription,
          req.body.clientName || "Client"
        );
        
        return res.json(invoiceDetails);
      } catch (aiError: any) {
        console.error("Error generating invoice items with AI:", aiError);
        return res.status(500).json({ 
          message: "Failed to generate invoice items", 
          error: aiError?.message || "Unknown error" 
        });
      }
    } catch (error) {
      console.error("Server error in generate-invoice-items:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/invoices", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Log the incoming request body for debugging
      console.log("Invoice creation request body:", req.body);
      
      // Extract notification options if present
      const notificationOptions: NotificationOptions = {
        sendEmail: req.body.sendEmail || false,
        emailAddress: req.body.emailAddress || ''
        // SMS functionality has been removed
      };
      
      // Remove notification fields from the data to be saved
      const { sendEmail, emailAddress, ...invoiceFields } = req.body;
      
      // Ensure dates are properly parsed
      const bodyWithParsedDates = {
        ...invoiceFields,
        userId,
        // Ensure dates are Date objects
        issueDate: new Date(invoiceFields.issueDate),
        dueDate: new Date(invoiceFields.dueDate)
      };
      
      console.log("Processed invoice data:", bodyWithParsedDates);
      
      const invoiceData = insertInvoiceSchema.parse(bodyWithParsedDates);
      
      const invoice = await storage.createInvoice(invoiceData);
      
      // Send email notifications if requested
      const notificationResults: { email: any } = { email: null };
      if (notificationOptions.sendEmail) {
        try {
          console.log("Sending invoice email notification:", notificationOptions);
          const results = await sendInvoiceNotifications(invoice, notificationOptions);
          notificationResults.email = results.email;
          console.log("Notification results:", results);
        } catch (notificationError) {
          console.error("Error sending email notification:", notificationError);
        }
      }
      
      return res.status(201).json({ 
        invoice, 
        notifications: notificationResults 
      });
    } catch (error) {
      console.error("Invoice creation error:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const invoiceId = parseInt(req.params.id);
      
      const existingInvoice = await storage.getInvoiceById(invoiceId);
      if (!existingInvoice || existingInvoice.userId !== userId) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      const updatedInvoice = await storage.updateInvoice(invoiceId, req.body);
      return res.json(updatedInvoice);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // AI Insights routes
  app.get("/api/ai-insights", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const insights = await storage.getAiInsights(userId);
      return res.json(insights);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/ai-insights/generate", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Get data needed for AI insights
      const transactions = await storage.getTransactions(userId);
      const invoices = await storage.getInvoices(userId);
      const inventoryItems = await storage.getInventoryItems(userId);
      
      // Generate insights using OpenAI
      const insights = await generateBusinessInsights(
        transactions, 
        invoices,
        inventoryItems
      );
      
      // Save insights to database
      const savedInsights = [];
      for (const insight of insights) {
        const insightData = {
          userId,
          type: insight.type,
          title: insight.title,
          content: insight.content
        };
        
        const savedInsight = await storage.createAiInsight(insightData);
        savedInsights.push(savedInsight);
      }
      
      return res.json(savedInsights);
    } catch (error) {
      return res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  app.patch("/api/ai-insights/:id/read", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const insightId = parseInt(req.params.id);
      
      const existingInsight = await storage.markAiInsightAsRead(insightId);
      if (!existingInsight) {
        return res.status(404).json({ message: "Insight not found" });
      }
      
      return res.json(existingInsight);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Dashboard data route
  app.get("/api/dashboard", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Get all necessary data for dashboard
      const transactions = await storage.getTransactions(userId);
      const invoices = await storage.getInvoices(userId);
      const inventoryItems = await storage.getInventoryItems(userId);
      const insights = await storage.getAiInsights(userId);
      
      // Calculate metrics
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      
      // Filter transactions for current and previous periods
      const currentPeriodTransactions = transactions.filter(t => new Date(t.date) >= thirtyDaysAgo);
      const previousPeriodTransactions = transactions.filter(t => 
        new Date(t.date) >= sixtyDaysAgo && new Date(t.date) < thirtyDaysAgo
      );
      
      // Calculate revenue, expenses, profit
      const calculateMetrics = (txns: any[]) => {
        const revenue = txns
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
          
        const expenses = txns
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
          
        return {
          revenue,
          expenses,
          profit: revenue - expenses
        };
      };
      
      const currentMetrics = calculateMetrics(currentPeriodTransactions);
      const previousMetrics = calculateMetrics(previousPeriodTransactions);
      
      // Calculate percentage changes
      const calculatePercentChange = (current: number, previous: number) => {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
      };
      
      const metrics = {
        revenue: {
          value: currentMetrics.revenue,
          change: calculatePercentChange(currentMetrics.revenue, previousMetrics.revenue)
        },
        expenses: {
          value: currentMetrics.expenses,
          change: calculatePercentChange(currentMetrics.expenses, previousMetrics.expenses)
        },
        profit: {
          value: currentMetrics.profit,
          change: calculatePercentChange(currentMetrics.profit, previousMetrics.profit)
        },
        inventory: {
          total: inventoryItems.length,
          lowStock: inventoryItems.filter(i => i.quantity <= (i.lowStockThreshold || 0)).length
        }
      };
      
      // Get invoice stats
      const invoiceStats = {
        pending: invoices.filter(i => i.status === 'pending').length,
        pendingAmount: invoices
          .filter(i => i.status === 'pending')
          .reduce((sum, i) => sum + parseFloat(i.amount.toString()), 0),
        overdue: invoices.filter(i => i.status === 'overdue').length,
        overdueAmount: invoices
          .filter(i => i.status === 'overdue')
          .reduce((sum, i) => sum + parseFloat(i.amount.toString()), 0),
        paid: invoices.filter(i => i.status === 'paid').length,
        paidAmount: invoices
          .filter(i => i.status === 'paid')
          .reduce((sum, i) => sum + parseFloat(i.amount.toString()), 0)
      };
      
      // Generate financial chart data (simplified for demo)
      const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        revenue: [12000, 15000, 18000, 20000, 22000, 24000],
        expenses: [8000, 9000, 10000, 11000, 12000, 12500]
      };
      
      // Generate cash flow forecast
      const cashFlowForecast = await generateCashFlowForecast(transactions, invoices);
      
      return res.json({
        metrics,
        recentTransactions: transactions.slice(0, 5),
        invoiceStats,
        recentInvoices: invoices.slice(0, 3),
        chartData,
        cashFlowForecast,
        insights: insights.slice(0, 3)
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });
  
  // AI Invoice Generation
  app.post("/api/ai/generate-invoice", requireAuth, async (req, res) => {
    try {
      const { projectDescription, clientName } = req.body;
      
      if (!projectDescription) {
        return res.status(400).json({ message: "Project description is required" });
      }
      
      const invoiceDetails = await generateInvoiceDetails(projectDescription, clientName || "Client");
      return res.json(invoiceDetails);
    } catch (error) {
      console.error("Error generating AI invoice:", error);
      return res.status(500).json({ message: "Failed to generate invoice details" });
    }
  });

  // AI Inventory Item Recommendations
  app.post("/api/ai/inventory-recommendations", requireAuth, async (req, res) => {
    try {
      const { itemName, description } = req.body;
      
      if (!itemName) {
        return res.status(400).json({ message: "Item name is required" });
      }
      
      // Get current inventory for context
      const inventoryItems = await storage.getInventoryItems(req.user!.id);
      
      const recommendations = await generateInventoryRecommendations(
        itemName, 
        description,
        inventoryItems
      );
      
      return res.json(recommendations);
    } catch (error) {
      console.error("Error generating inventory recommendations:", error);
      return res.status(500).json({ 
        message: "Failed to generate inventory recommendations",
        suggestedPrice: 0,
        suggestedCategory: "",
        suggestedLowStockThreshold: 5,
        relatedItems: [],
        insights: "Unable to generate recommendations at this time."
      });
    }
  });

  // AI Supply/Reorder Recommendations
  app.get("/api/ai/supply-recommendations", requireAuth, async (req, res) => {
    try {
      // Get current inventory
      const inventoryItems = await storage.getInventoryItems(req.user!.id);
      
      if (inventoryItems.length === 0) {
        return res.status(400).json({ 
          message: "No inventory items found. Add some items first.",
          itemsToReorder: [],
          suggestedNewItems: [],
          optimizationTips: "Add inventory items to get supply recommendations." 
        });
      }
      
      const recommendations = await generateSupplyRecommendations(inventoryItems);
      return res.json(recommendations);
    } catch (error) {
      console.error("Error generating supply recommendations:", error);
      return res.status(500).json({ 
        message: "Failed to generate supply recommendations",
        itemsToReorder: [],
        suggestedNewItems: [],
        optimizationTips: "Try again later or contact support."
      });
    }
  });

  // Test email route
  app.post("/api/test-email", async (req, res) => {
    try {
      const { to, subject, text } = req.body;
      
      if (!to || !subject || !text) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing required fields: to, subject, text" 
        });
      }
      
      // Generate test invoice data
      const testInvoice = {
        invoiceNumber: "TEST-001",
        clientName: "Test Client",
        amount: 123.45,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
      
      const items = [
        { description: "Test Item 1", quantity: 1, price: 100 },
        { description: "Test Item 2", quantity: 2, price: 10 }
      ];
      
      // Using our existing email function from notification service
      const notificationOptions: NotificationOptions = {
        sendEmail: true,
        emailAddress: to
      };
      
      // Create test invoice object with required fields
      const mockInvoice = {
        id: 999,
        userId: 1,
        invoiceNumber: testInvoice.invoiceNumber,
        clientName: testInvoice.clientName,
        amount: testInvoice.amount.toString(),
        issueDate: testInvoice.issueDate,
        dueDate: testInvoice.dueDate,
        status: 'pending',
        items: JSON.stringify(items),
        createdAt: new Date(),
        notes: text || "Test email from the Business Platform",
        lastEmailSent: null,
        value: null
      };
      
      // Send test email
      const results = await sendInvoiceNotifications(mockInvoice, notificationOptions);
      
      console.log("Email test result:", results);
      
      const emailResult = results.email || { sent: false };
      
      return res.json({ 
        success: emailResult.sent,
        message: emailResult.sent ? "Email sent successfully" : "Failed to send email",
        info: emailResult,
        error: emailResult.error
      });
    } catch (error: any) {
      console.error("Error in test-email route:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to send email", 
        error: error?.message || "Unknown error"
      });
    }
  });

  // ===== TAX MANAGEMENT ROUTES =====
  app.get("/api/tax-items", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const taxItems = await storage.getTaxItems(userId);
      return res.json(taxItems);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/tax-items/year/:year", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const year = parseInt(req.params.year);
      
      if (isNaN(year)) {
        return res.status(400).json({ message: "Invalid year parameter" });
      }
      
      const taxItems = await storage.getTaxItemsByYear(userId, year);
      return res.json(taxItems);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/tax-items", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const taxItemData = insertTaxItemSchema.parse({
        ...req.body,
        userId
      });
      
      const taxItem = await storage.createTaxItem(taxItemData);
      return res.status(201).json(taxItem);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/tax-items/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const taxItemId = parseInt(req.params.id);
      
      const existingTaxItem = await storage.getTaxItemById(taxItemId);
      if (!existingTaxItem || existingTaxItem.userId !== userId) {
        return res.status(404).json({ message: "Tax item not found" });
      }
      
      const updatedTaxItem = await storage.updateTaxItem(taxItemId, req.body);
      return res.json(updatedTaxItem);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // ===== PAYROLL PROCESSING ROUTES =====
  app.get("/api/payroll", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const payrollItems = await storage.getPayrollItems(userId);
      return res.json(payrollItems);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/payroll/employee/:employeeId", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const employeeId = req.params.employeeId;
      
      const payrollItems = await storage.getPayrollItemsByEmployee(userId, employeeId);
      return res.json(payrollItems);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/payroll/date-range", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start and end dates are required" });
      }
      
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const payrollItems = await storage.getPayrollItemsByDateRange(userId, start, end);
      return res.json(payrollItems);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/payroll", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Process dates
      const payPeriodStart = new Date(req.body.payPeriodStart);
      const payPeriodEnd = new Date(req.body.payPeriodEnd);
      const paymentDate = new Date(req.body.paymentDate);
      
      const payrollItemData = insertPayrollItemSchema.parse({
        ...req.body,
        userId,
        payPeriodStart,
        payPeriodEnd,
        paymentDate
      });
      
      const payrollItem = await storage.createPayrollItem(payrollItemData);
      return res.status(201).json(payrollItem);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/payroll/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const payrollItemId = parseInt(req.params.id);
      
      const existingPayrollItem = await storage.getPayrollItemById(payrollItemId);
      if (!existingPayrollItem || existingPayrollItem.userId !== userId) {
        return res.status(404).json({ message: "Payroll item not found" });
      }
      
      // Process dates if present
      const updateData = { ...req.body };
      if (updateData.payPeriodStart) {
        updateData.payPeriodStart = new Date(updateData.payPeriodStart);
      }
      if (updateData.payPeriodEnd) {
        updateData.payPeriodEnd = new Date(updateData.payPeriodEnd);
      }
      if (updateData.paymentDate) {
        updateData.paymentDate = new Date(updateData.paymentDate);
      }
      
      const updatedPayrollItem = await storage.updatePayrollItem(payrollItemId, updateData);
      return res.json(updatedPayrollItem);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // ===== TIME TRACKING ROUTES =====
  app.get("/api/time-entries", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const timeEntries = await storage.getTimeEntries(userId);
      return res.json(timeEntries);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/time-entries/project/:projectId", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const projectId = req.params.projectId;
      
      const timeEntries = await storage.getTimeEntriesByProject(userId, projectId);
      return res.json(timeEntries);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/time-entries/date-range", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start and end dates are required" });
      }
      
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const timeEntries = await storage.getTimeEntriesByDateRange(userId, start, end);
      return res.json(timeEntries);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/time-entries", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Process dates
      const startTime = new Date(req.body.startTime);
      let endTime = null;
      if (req.body.endTime) {
        endTime = new Date(req.body.endTime);
      }
      
      const timeEntryData = insertTimeEntrySchema.parse({
        ...req.body,
        userId,
        startTime,
        endTime
      });
      
      const timeEntry = await storage.createTimeEntry(timeEntryData);
      return res.status(201).json(timeEntry);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/time-entries/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const timeEntryId = parseInt(req.params.id);
      
      const existingTimeEntry = await storage.getTimeEntryById(timeEntryId);
      if (!existingTimeEntry || existingTimeEntry.userId !== userId) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      
      // Process dates if present
      const updateData = { ...req.body };
      if (updateData.startTime) {
        updateData.startTime = new Date(updateData.startTime);
      }
      if (updateData.endTime) {
        updateData.endTime = new Date(updateData.endTime);
      }
      
      const updatedTimeEntry = await storage.updateTimeEntry(timeEntryId, updateData);
      return res.json(updatedTimeEntry);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // ===== BANK RECONCILIATION ROUTES =====
  app.get("/api/bank-accounts", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const bankAccounts = await storage.getBankAccounts(userId);
      return res.json(bankAccounts);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/bank-accounts", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Process dates if present
      let lastReconciled = null;
      if (req.body.lastReconciled) {
        lastReconciled = new Date(req.body.lastReconciled);
      }
      
      const bankAccountData = insertBankAccountSchema.parse({
        ...req.body,
        userId,
        lastReconciled
      });
      
      const bankAccount = await storage.createBankAccount(bankAccountData);
      return res.status(201).json(bankAccount);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/bank-accounts/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const bankAccountId = parseInt(req.params.id);
      
      const existingBankAccount = await storage.getBankAccountById(bankAccountId);
      if (!existingBankAccount || existingBankAccount.userId !== userId) {
        return res.status(404).json({ message: "Bank account not found" });
      }
      
      // Process dates if present
      const updateData = { ...req.body };
      if (updateData.lastReconciled) {
        updateData.lastReconciled = new Date(updateData.lastReconciled);
      }
      
      const updatedBankAccount = await storage.updateBankAccount(bankAccountId, updateData);
      return res.json(updatedBankAccount);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/bank-accounts/:accountId/transactions", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const bankAccountId = parseInt(req.params.accountId);
      
      const existingBankAccount = await storage.getBankAccountById(bankAccountId);
      if (!existingBankAccount || existingBankAccount.userId !== userId) {
        return res.status(404).json({ message: "Bank account not found" });
      }
      
      const bankTransactions = await storage.getBankTransactions(userId, bankAccountId);
      return res.json(bankTransactions);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/bank-accounts/:accountId/transactions", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const bankAccountId = parseInt(req.params.accountId);
      
      const existingBankAccount = await storage.getBankAccountById(bankAccountId);
      if (!existingBankAccount || existingBankAccount.userId !== userId) {
        return res.status(404).json({ message: "Bank account not found" });
      }
      
      // Process date
      const transactionDate = new Date(req.body.transactionDate);
      
      const bankTransactionData = insertBankTransactionSchema.parse({
        ...req.body,
        userId,
        bankAccountId,
        transactionDate
      });
      
      const bankTransaction = await storage.createBankTransaction(bankTransactionData);
      return res.status(201).json(bankTransaction);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/bank-transactions/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const bankTransactionId = parseInt(req.params.id);
      
      const existingBankTransaction = await storage.getBankTransactionById(bankTransactionId);
      if (!existingBankTransaction || existingBankTransaction.userId !== userId) {
        return res.status(404).json({ message: "Bank transaction not found" });
      }
      
      // Process dates if present
      const updateData = { ...req.body };
      if (updateData.transactionDate) {
        updateData.transactionDate = new Date(updateData.transactionDate);
      }
      
      const updatedBankTransaction = await storage.updateBankTransaction(bankTransactionId, updateData);
      return res.json(updatedBankTransaction);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/bank-transactions/:id/reconcile", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const bankTransactionId = parseInt(req.params.id);
      const { matchedTransactionId } = req.body;
      
      const existingBankTransaction = await storage.getBankTransactionById(bankTransactionId);
      if (!existingBankTransaction || existingBankTransaction.userId !== userId) {
        return res.status(404).json({ message: "Bank transaction not found" });
      }
      
      const reconciledTransaction = await storage.markTransactionReconciled(
        bankTransactionId, 
        matchedTransactionId ? parseInt(matchedTransactionId) : undefined
      );
      
      return res.json(reconciledTransaction);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // ===== BUDGET PLANNING ROUTES =====
  app.get("/api/budgets", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const budgets = await storage.getBudgets(userId);
      return res.json(budgets);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/budgets", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Process dates
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      
      const budgetData = insertBudgetSchema.parse({
        ...req.body,
        userId,
        startDate,
        endDate
      });
      
      const budget = await storage.createBudget(budgetData);
      return res.status(201).json(budget);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/budgets/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const budgetId = parseInt(req.params.id);
      
      const existingBudget = await storage.getBudgetById(budgetId);
      if (!existingBudget || existingBudget.userId !== userId) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      // Process dates if present
      const updateData = { ...req.body };
      if (updateData.startDate) {
        updateData.startDate = new Date(updateData.startDate);
      }
      if (updateData.endDate) {
        updateData.endDate = new Date(updateData.endDate);
      }
      
      const updatedBudget = await storage.updateBudget(budgetId, updateData);
      return res.json(updatedBudget);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/budgets/:budgetId/categories", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const budgetId = parseInt(req.params.budgetId);
      
      const existingBudget = await storage.getBudgetById(budgetId);
      if (!existingBudget || existingBudget.userId !== userId) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      const budgetCategories = await storage.getBudgetCategories(budgetId);
      return res.json(budgetCategories);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/budgets/:budgetId/categories", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const budgetId = parseInt(req.params.budgetId);
      
      const existingBudget = await storage.getBudgetById(budgetId);
      if (!existingBudget || existingBudget.userId !== userId) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      const budgetCategoryData = insertBudgetCategorySchema.parse({
        ...req.body,
        userId,
        budgetId
      });
      
      const budgetCategory = await storage.createBudgetCategory(budgetCategoryData);
      return res.status(201).json(budgetCategory);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/budget-categories/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const categoryId = parseInt(req.params.id);
      
      const existingCategory = await storage.getBudgetCategoryById(categoryId);
      if (!existingCategory || existingCategory.userId !== userId) {
        return res.status(404).json({ message: "Budget category not found" });
      }
      
      const updatedCategory = await storage.updateBudgetCategory(categoryId, req.body);
      return res.json(updatedCategory);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // ===== INVENTORY COST ANALYSIS ROUTES =====
  app.get("/api/inventory-costs", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const inventoryCosts = await storage.getInventoryCosts(userId);
      return res.json(inventoryCosts);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/inventory/:itemId/costs", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const itemId = parseInt(req.params.itemId);
      
      const existingItem = await storage.getInventoryItemById(itemId);
      if (!existingItem || existingItem.userId !== userId) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      const inventoryCosts = await storage.getInventoryCostsByItem(userId, itemId);
      return res.json(inventoryCosts);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/inventory-costs", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Process date
      const purchaseDate = new Date(req.body.purchaseDate);
      
      // Verify inventory item exists
      const inventoryItemId = parseInt(req.body.inventoryItemId);
      const existingItem = await storage.getInventoryItemById(inventoryItemId);
      if (!existingItem || existingItem.userId !== userId) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      const inventoryCostData = insertInventoryCostSchema.parse({
        ...req.body,
        userId,
        purchaseDate
      });
      
      const inventoryCost = await storage.createInventoryCost(inventoryCostData);
      return res.status(201).json(inventoryCost);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/inventory-costs/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const inventoryCostId = parseInt(req.params.id);
      
      const existingCost = await storage.getInventoryCostById(inventoryCostId);
      if (!existingCost || existingCost.userId !== userId) {
        return res.status(404).json({ message: "Inventory cost record not found" });
      }
      
      // Process dates if present
      const updateData = { ...req.body };
      if (updateData.purchaseDate) {
        updateData.purchaseDate = new Date(updateData.purchaseDate);
      }
      
      const updatedCost = await storage.updateInventoryCost(inventoryCostId, updateData);
      return res.json(updatedCost);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // ===== CRM ROUTES =====
  // Client Routes
  app.get("/api/clients", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const clients = await storage.getClients(userId);
      return res.json(clients);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const clientId = parseInt(req.params.id);
      
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const client = await storage.getClientById(clientId);
      
      if (!client || client.userId !== userId) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      return res.json(client);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/clients/status/:status", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const status = req.params.status;
      
      const clients = await storage.getClientsByStatus(userId, status);
      return res.json(clients);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/clients", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      const newClient = {
        ...req.body,
        userId
      };
      
      const client = await storage.createClient(newClient);
      return res.status(201).json(client);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const clientId = parseInt(req.params.id);
      
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const existingClient = await storage.getClientById(clientId);
      
      if (!existingClient || existingClient.userId !== userId) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      const updatedClient = await storage.updateClient(clientId, req.body);
      return res.json(updatedClient);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Client Interactions Routes
  app.get("/api/clients/:clientId/interactions", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const clientId = parseInt(req.params.clientId);
      
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const client = await storage.getClientById(clientId);
      
      if (!client || client.userId !== userId) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      const interactions = await storage.getClientInteractions(userId, clientId);
      return res.json(interactions);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/interactions/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const interactionId = parseInt(req.params.id);
      
      if (isNaN(interactionId)) {
        return res.status(400).json({ message: "Invalid interaction ID" });
      }
      
      const interaction = await storage.getClientInteractionById(interactionId);
      
      if (!interaction || interaction.userId !== userId) {
        return res.status(404).json({ message: "Interaction not found" });
      }
      
      return res.json(interaction);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/interactions", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Process date fields
      const date = new Date(req.body.date);
      const followUpDate = req.body.followUpDate ? new Date(req.body.followUpDate) : null;
      
      // Check if client exists and belongs to user
      const clientId = parseInt(req.body.clientId);
      const client = await storage.getClientById(clientId);
      
      if (!client || client.userId !== userId) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      const newInteraction = {
        ...req.body,
        userId,
        date,
        followUpDate
      };
      
      const interaction = await storage.createClientInteraction(newInteraction);
      return res.status(201).json(interaction);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/interactions/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const interactionId = parseInt(req.params.id);
      
      if (isNaN(interactionId)) {
        return res.status(400).json({ message: "Invalid interaction ID" });
      }
      
      const existingInteraction = await storage.getClientInteractionById(interactionId);
      
      if (!existingInteraction || existingInteraction.userId !== userId) {
        return res.status(404).json({ message: "Interaction not found" });
      }
      
      // Process date fields if they exist
      const updateData: any = { ...req.body };
      
      if (req.body.date) {
        updateData.date = new Date(req.body.date);
      }
      
      if (req.body.followUpDate) {
        updateData.followUpDate = new Date(req.body.followUpDate);
      }
      
      const updatedInteraction = await storage.updateClientInteraction(interactionId, updateData);
      return res.json(updatedInteraction);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Client Deals Routes
  app.get("/api/deals", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      
      const deals = await storage.getClientDeals(userId, clientId);
      return res.json(deals);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/deals/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const dealId = parseInt(req.params.id);
      
      if (isNaN(dealId)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }
      
      const deal = await storage.getClientDealById(dealId);
      
      if (!deal || deal.userId !== userId) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      return res.json(deal);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/deals/stage/:stage", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const stage = req.params.stage;
      
      const deals = await storage.getClientDealsByStage(userId, stage);
      return res.json(deals);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/deals", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Process date fields
      const expectedCloseDate = req.body.expectedCloseDate ? new Date(req.body.expectedCloseDate) : null;
      const actualCloseDate = req.body.actualCloseDate ? new Date(req.body.actualCloseDate) : null;
      
      // Check if client exists and belongs to user
      const clientId = parseInt(req.body.clientId);
      const client = await storage.getClientById(clientId);
      
      if (!client || client.userId !== userId) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      const newDeal = {
        ...req.body,
        userId,
        expectedCloseDate,
        actualCloseDate
      };
      
      const deal = await storage.createClientDeal(newDeal);
      return res.status(201).json(deal);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/deals/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const dealId = parseInt(req.params.id);
      
      if (isNaN(dealId)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }
      
      const existingDeal = await storage.getClientDealById(dealId);
      
      if (!existingDeal || existingDeal.userId !== userId) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      // Process date fields if they exist
      const updateData: any = { ...req.body };
      
      if (req.body.expectedCloseDate) {
        updateData.expectedCloseDate = new Date(req.body.expectedCloseDate);
      }
      
      if (req.body.actualCloseDate) {
        updateData.actualCloseDate = new Date(req.body.actualCloseDate);
      }
      
      const updatedDeal = await storage.updateClientDeal(dealId, updateData);
      return res.json(updatedDeal);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Employee Management Routes
  app.get("/api/employees", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const employees = await storage.getEmployees(userId);
      return res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/employees/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const employeeId = parseInt(req.params.id);
      
      if (isNaN(employeeId)) {
        return res.status(400).json({ message: "Invalid employee ID" });
      }
      
      const employee = await storage.getEmployeeById(employeeId);
      
      if (!employee || employee.userId !== userId) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      return res.json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/employees/status/:status", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const status = req.params.status;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const employees = await storage.getEmployeesByStatus(userId, status);
      return res.json(employees);
    } catch (error) {
      console.error("Error fetching employees by status:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/employees", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      const employeeData = insertEmployeeSchema.parse({
        ...req.body,
        userId
      });
      
      const employee = await storage.createEmployee(employeeData);
      return res.status(201).json(employee);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating employee:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/employees/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const employeeId = parseInt(req.params.id);
      
      if (isNaN(employeeId)) {
        return res.status(400).json({ message: "Invalid employee ID" });
      }
      
      const existingEmployee = await storage.getEmployeeById(employeeId);
      
      if (!existingEmployee || existingEmployee.userId !== userId) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      const updatedEmployee = await storage.updateEmployee(employeeId, req.body);
      return res.json(updatedEmployee);
    } catch (error) {
      console.error("Error updating employee:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/employees/:employeeId/time-entries", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const employeeId = parseInt(req.params.employeeId);
      
      if (isNaN(employeeId)) {
        return res.status(400).json({ message: "Invalid employee ID" });
      }
      
      const timeEntries = await storage.getTimeEntriesByEmployee(userId, employeeId);
      return res.json(timeEntries);
    } catch (error) {
      console.error("Error fetching time entries for employee:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  /* ------------------ User Role Management Routes ------------------ */
  
  // Get all available roles (admin only)
  app.get("/api/roles", requireAuth, requireAdmin, (req, res) => {
    try {
      return res.json({
        roles: Object.values(UserRole)
      });
    } catch (error) {
      console.error("Error getting roles:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Update a user's role (admin only)
  app.patch("/api/users/:userId/role", requireAuth, requireAdmin, async (req, res) => {
    try {
      const targetUserId = parseInt(req.params.userId);
      const { role } = req.body;
      
      if (!role || !Object.values(UserRole).includes(role as UserRole)) {
        return res.status(400).json({ message: "Invalid role provided" });
      }
      
      const user = await storage.getUser(targetUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUserRole(targetUserId, role);
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user role" });
      }
      
      return res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role,
        email: updatedUser.email
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Notification routes
  app.get("/api/notifications", requireAuth, (req, res) => {
    try {
      // Return the sample notifications in a real app this would fetch from a database
      return res.json(sampleNotifications);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Mark notification as read
  app.post("/api/notifications/:id/read", requireAuth, (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      
      // Find the notification in our sample data
      const notificationIndex = sampleNotifications.findIndex(n => n.id === notificationId);
      
      if (notificationIndex === -1) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      // Update the notification as read
      sampleNotifications[notificationIndex].isRead = true;
      
      return res.json(sampleNotifications[notificationIndex]);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Mark all notifications as read
  app.post("/api/notifications/read-all", requireAuth, (req, res) => {
    try {
      // Mark all notifications as read
      sampleNotifications.forEach(notification => {
        notification.isRead = true;
      });
      
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
