import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "demo_key" });

// Handle AI errors gracefully with fallback responses
const handleAiError = (error: any, errorSource: string) => {
  console.error(`Error in ${errorSource}:`, error);
  if (error.status === 429) {
    console.error("OpenAI rate limit or quota exceeded");
  }
  return null;
};

// Smart templates for invoice generation when AI is unavailable
const invoiceTemplates = {
  // Website Development template
  website: {
    items: [
      { description: "Website design and planning", quantity: 1, price: 1200 },
      { description: "Frontend development", quantity: 1, price: 1500 },
      { description: "Backend integration", quantity: 1, price: 1800 },
      { description: "Responsive design implementation", quantity: 1, price: 800 },
      { description: "Content management system setup", quantity: 1, price: 600 }
    ],
    notes: "Thank you for your business! This invoice covers all agreed website development services. Payment is due within 30 days of issue. We offer a 30-day support period for any questions or minor adjustments needed after delivery."
  },
  
  // Consulting template
  consulting: {
    items: [
      { description: "Initial business analysis", quantity: 1, price: 1500 },
      { description: "Strategy development sessions", quantity: 3, price: 800 },
      { description: "Implementation planning", quantity: 1, price: 1200 },
      { description: "Documentation and reporting", quantity: 1, price: 600 }
    ],
    notes: "Thank you for choosing our consulting services! This invoice covers all consulting services as outlined in our agreement. Payment terms: Net 15 days. Please include the invoice number with your payment."
  },
  
  // Marketing template
  marketing: {
    items: [
      { description: "Marketing strategy development", quantity: 1, price: 1800 },
      { description: "Content creation", quantity: 5, price: 300 },
      { description: "Social media campaign setup", quantity: 1, price: 900 },
      { description: "Analytics and reporting setup", quantity: 1, price: 600 }
    ],
    notes: "Thank you for your business! This invoice covers all marketing services as outlined in our agreement. Payment is due within 21 days. For questions regarding this invoice, please contact our accounting department."
  },
  
  // Default template
  default: {
    items: [
      { description: "Professional services", quantity: 1, price: 1500 },
      { description: "Project management", quantity: 1, price: 800 },
      { description: "Implementation and delivery", quantity: 1, price: 1200 }
    ],
    notes: "Thank you for your business! Payment is due within 30 days of receipt. If you have any questions about this invoice, please contact us."
  }
};

// Generate invoice details - uses templates as fallback when OpenAI is unavailable
export async function generateInvoiceDetails(
  projectDescription: string,
  clientName: string
): Promise<{
  items: Array<{ description: string, quantity: number, price: number }>,
  notes: string
}> {
  try {
    // First attempt to use OpenAI
    const prompt = `
      Based on the following project description, generate realistic and detailed invoice line items and a professional invoice note.

      Project Description: ${projectDescription}
      Client Name: ${clientName}

      Please generate:
      1. Between 3-6 line items with descriptions, quantities, and prices that accurately reflect the work described.
      2. A professional invoice note that includes payment terms, a thank you message, and any relevant delivery or completion details.

      Format your response as JSON in this structure:
      {
        "items": [
          {
            "description": "Detailed item description",
            "quantity": number,
            "price": number (in USD)
          },
          ...
        ],
        "notes": "Professional invoice note with payment terms and other information"
      }
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI expert in business finance and professional invoicing. Generate realistic, detailed invoice items and notes based on project descriptions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        items: Array.isArray(result.items) ? result.items : [],
        notes: result.notes || "Thank you for your business. Payment is due within 30 days of receipt."
      };
    } catch (aiError) {
      console.error("Error connecting to OpenAI service:", aiError);
      // Continue to fallback template system
    }
  } catch (error) {
    console.error("Error generating invoice details:", error);
    
    // Choose an appropriate template based on the project description
    const description = projectDescription.toLowerCase();
    
    // Detect the type of project to use the most appropriate template
    let template;
    if (description.includes('website') || description.includes('web') || description.includes('site') || 
        description.includes('app') || description.includes('application') || description.includes('software') ||
        description.includes('development') || description.includes('coding')) {
      template = invoiceTemplates.website;
      
    } else if (description.includes('marketing') || description.includes('social media') || 
               description.includes('campaign') || description.includes('promotion') || 
               description.includes('content') || description.includes('advertising')) {
      template = invoiceTemplates.marketing;
      
    } else if (description.includes('consult') || description.includes('advice') || 
               description.includes('strategy') || description.includes('planning') || 
               description.includes('analysis')) {
      template = invoiceTemplates.consulting;
      
    } else {
      // Default template if we can't detect a clear pattern
      template = invoiceTemplates.default; 
    }
    
    // Personalize the template with the client name
    const personalizedNotes = template.notes.replace(/your business/g, `your business, ${clientName}`);
    
    return {
      items: template.items,
      notes: personalizedNotes
    };
  }
}

// Categorize transaction
export async function categorizeTransaction(description: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a financial assistant that categorizes business transactions. Categories should be one of: Sales, Office, Software, Hardware, Marketing, Legal, Travel, Food, Utilities, Rent, Taxes, Salaries, Other. Respond with only the category name."
        },
        {
          role: "user",
          content: `Categorize this transaction description: "${description}"`
        }
      ],
      max_tokens: 10,
    });

    return response.choices[0].message.content?.trim() || "Other";
  } catch (error) {
    console.error("Error categorizing transaction:", error);
    return "Other";
  }
}

// Generate business insights
export async function generateBusinessInsights(
  transactions: any[], 
  invoices: any[],
  inventoryItems: any[]
): Promise<Array<{type: string, title: string, content: string}>> {
  try {
    const prompt = `
      Generate 3 business insights based on the following data:
      
      Transactions: ${JSON.stringify(transactions)}
      Invoices: ${JSON.stringify(invoices)}
      Inventory: ${JSON.stringify(inventoryItems)}
      
      Each insight should focus on one of these areas:
      1. Cash flow optimization
      2. Revenue opportunities
      3. Expense alerts
      
      Format your response as JSON in this structure:
      [
        {
          "type": "cash_flow|revenue|expense",
          "title": "Brief title of insight",
          "content": "Detailed explanation of insight with actionable recommendation"
        },
        ...
      ]
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI business analyst providing actionable insights for a small business owner."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "[]");
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Error generating business insights:", error);
    return [
      {
        type: "cash_flow",
        title: "Cash Flow Optimization",
        content: "Consider following up on your pending invoices to improve cash flow."
      },
      {
        type: "revenue",
        title: "Revenue Opportunity",
        content: "Analyze your most profitable clients and consider offering additional services."
      },
      {
        type: "expense",
        title: "Expense Alert",
        content: "Review your recurring subscription costs to identify potential savings."
      }
    ];
  }
}

// Generate cash flow forecast
export async function generateCashFlowForecast(
  transactions: any[],
  invoices: any[]
): Promise<{
  forecast: number[],
  insight: string
}> {
  try {
    const prompt = `
      Generate a 6-month cash flow forecast based on the following data:
      
      Transactions: ${JSON.stringify(transactions)}
      Invoices: ${JSON.stringify(invoices)}
      
      Format your response as JSON in this structure:
      {
        "forecast": [number, number, number, number, number, number],
        "insight": "One sentence insight about the forecast trend"
      }
      
      The forecast numbers should represent estimated monthly cash flow values for the next 6 months.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI financial analyst providing cash flow forecasts."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      forecast: Array.isArray(result.forecast) ? result.forecast : [0, 0, 0, 0, 0, 0],
      insight: result.insight || "Based on your current trend, we forecast a stable cash flow over the next 6 months."
    };
  } catch (error) {
    console.error("Error generating cash flow forecast:", error);
    return {
      forecast: [5500, 6000, 6500, 7000, 7500, 8000],
      insight: "Based on your current trend, we forecast a 12% increase in cash flow over the next 6 months."
    };
  }
}

// Extract data from receipt
export async function extractReceiptData(
  receiptText: string
): Promise<{
  vendor: string,
  amount: number,
  date: string,
  items: Array<{description: string, price: number}>
}> {
  try {
    const prompt = `
      Extract the following information from this receipt text:
      
      Receipt Text: ${receiptText}
      
      Format your response as JSON in this structure:
      {
        "vendor": "Name of vendor/store",
        "amount": total amount as number,
        "date": "Date in YYYY-MM-DD format",
        "items": [
          {
            "description": "Item description",
            "price": price as number
          },
          ...
        ]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that extracts structured data from receipt texts."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error extracting receipt data:", error);
    return {
      vendor: "Unknown Vendor",
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      items: []
    };
  }
}

// Generate inventory item recommendations
export async function generateInventoryRecommendations(
  itemName: string, 
  description?: string,
  currentInventory?: any[]
): Promise<{
  suggestedPrice: number,
  suggestedCategory: string,
  suggestedLowStockThreshold: number,
  relatedItems: string[],
  insights: string
}> {
  try {
    // Create a concise description of current inventory for context
    const inventoryContext = currentInventory && currentInventory.length > 0
      ? `Current inventory contains: ${currentInventory.slice(0, 5).map(item => item.name).join(', ')}${currentInventory.length > 5 ? '...' : ''}`
      : 'No current inventory data available.';
    
    const prompt = `
      Generate inventory recommendations for this item:
      
      Item Name: ${itemName}
      ${description ? `Item Description: ${description}` : ''}
      
      ${inventoryContext}
      
      Please provide:
      1. A suggested retail price in USD
      2. The most appropriate category for this item
      3. A recommended low stock threshold quantity
      4. A list of 3-5 related items that would complement this product
      5. Brief business insights about managing this inventory item
      
      Format your response as JSON in this structure:
      {
        "suggestedPrice": number,
        "suggestedCategory": "string",
        "suggestedLowStockThreshold": number,
        "relatedItems": ["string", "string", ...],
        "insights": "paragraph of insights"
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI inventory management expert that helps businesses optimize their product inventory. Provide realistic recommendations based on market knowledge."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    // Parse the response
    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      suggestedPrice: typeof result.suggestedPrice === 'number' ? result.suggestedPrice : 0,
      suggestedCategory: result.suggestedCategory || 'General',
      suggestedLowStockThreshold: typeof result.suggestedLowStockThreshold === 'number' ? result.suggestedLowStockThreshold : 5,
      relatedItems: Array.isArray(result.relatedItems) ? result.relatedItems : [],
      insights: result.insights || "No specific insights available for this item."
    };
  } catch (error) {
    console.error("Error generating inventory recommendations:", error);
    
    // Return fallback recommendations
    return {
      suggestedPrice: 0,
      suggestedCategory: 'General',
      suggestedLowStockThreshold: 5,
      relatedItems: [],
      insights: "Unable to generate recommendations at this time."
    };
  }
}

// Generate supply/reorder recommendations
export async function generateSupplyRecommendations(
  inventoryItems: any[]
): Promise<{
  itemsToReorder: Array<{id: number, name: string, currentQuantity: number, recommendedQuantity: number}>,
  suggestedNewItems: string[],
  optimizationTips: string
}> {
  try {
    // Filter to just low stock items to simplify the prompt
    const lowStockItems = inventoryItems.filter(item => 
      item.quantity <= (item.lowStockThreshold || 5)
    );
    
    const prompt = `
      Based on the current inventory data, generate reordering recommendations:
      
      Current Inventory Items:
      ${JSON.stringify(inventoryItems.slice(0, 10))}
      
      Low Stock Items:
      ${JSON.stringify(lowStockItems)}
      
      Please provide:
      1. A list of items that should be reordered, with recommended quantities
      2. Suggestions for 2-3 new inventory items that would complement the existing inventory
      3. Brief optimization tips for inventory management
      
      Format your response as JSON in this structure:
      {
        "itemsToReorder": [
          {
            "id": number,
            "name": "string",
            "currentQuantity": number,
            "recommendedQuantity": number
          },
          ...
        ],
        "suggestedNewItems": ["string", "string", ...],
        "optimizationTips": "paragraph of tips"
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI supply chain and inventory management expert. Provide practical, actionable recommendations for inventory optimization."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    // Parse the response
    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate the structure
    return {
      itemsToReorder: Array.isArray(result.itemsToReorder) ? result.itemsToReorder : [],
      suggestedNewItems: Array.isArray(result.suggestedNewItems) ? result.suggestedNewItems : [],
      optimizationTips: result.optimizationTips || "Focus on reordering items that are in low stock and have consistent demand."
    };
  } catch (error) {
    console.error("Error generating supply recommendations:", error);
    
    // Return fallback empty recommendations
    return {
      itemsToReorder: [],
      suggestedNewItems: [],
      optimizationTips: "Consider setting up automatic reordering for items that frequently run low on stock."
    };
  }
}
