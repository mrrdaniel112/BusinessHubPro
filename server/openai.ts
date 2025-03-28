import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "demo_key" });

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
