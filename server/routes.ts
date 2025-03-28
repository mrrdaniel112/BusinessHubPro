import type { Express, Request as ExpressRequest, Response } from "express";
import { createServer, type Server } from "http";

// Extend Express Request to include user property
interface Request extends ExpressRequest {
  user?: { id: number };
}
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertTransactionSchema,
  insertInventoryItemSchema,
  insertContractSchema,
  insertReceiptSchema,
  insertInvoiceSchema,
  insertAiInsightSchema
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
  generateSupplyRecommendations
} from "./openai";
import { NotificationOptions, sendInvoiceNotifications } from "./services/notification";

// Mock authentication middleware (for demo purposes)
const requireAuth = (req: Request, res: Response, next: Function) => {
  // For demo, we'll use a fixed user ID (1 for demo user)
  req.user = { id: 1 };
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
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
      
      // For a real app, you'd set a session cookie here
      // For demo, we'll just return the user object
      return res.json({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email
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
      
      return res.status(201).json({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Server error" });
    }
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
      const notificationResults = { email: null };
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
      const inventoryItems = await storage.getInventoryItems(req.user.id);
      
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
      const inventoryItems = await storage.getInventoryItems(req.user.id);
      
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
        notes: text || "Test email from the Business Platform"
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
    } catch (error) {
      console.error("Error in test-email route:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to send email", 
        error: error.message
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
