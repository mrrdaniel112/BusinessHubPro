import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const CLAUDE_MODEL = "claude-3-7-sonnet-20250219";

/**
 * Check if Anthropic API is configured properly
 */
function isAnthropicConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

/**
 * Initialize Anthropic client
 */
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate business insights using Claude AI
 */
export async function generateBusinessInsightsClaude(
  financialData: any,
  salesData: any,
  timeframe: string = 'month'
): Promise<{ insights: string; recommendations: string }> {
  if (!isAnthropicConfigured()) {
    throw new Error('Anthropic API not configured. Please set ANTHROPIC_API_KEY environment variable.');
  }

  const prompt = `
    I need business insights based on the following financial and sales data.
    
    Financial data:
    ${JSON.stringify(financialData, null, 2)}
    
    Sales data:
    ${JSON.stringify(salesData, null, 2)}
    
    Timeframe: ${timeframe}
    
    Please provide:
    1. A comprehensive analysis of the business performance
    2. Actionable recommendations based on the data
    
    Format your response as JSON with two fields:
    - insights: A detailed analysis with key trends and observations
    - recommendations: A list of actionable steps the business should consider
  `;

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1500,
      messages: [
        { role: 'user', content: prompt }
      ],
      system: "You are an expert business analyst with deep expertise in financial analysis, market trends, and business operations. Your goal is to provide insightful, practical and actionable business intelligence."
    });

    // Extract text from response
    const contentBlock = response.content[0];
    if (contentBlock.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }
    
    const content = contentBlock.text;
    try {
      return JSON.parse(content);
    } catch (e) {
      // If JSON parsing fails, try to extract structure manually
      const insightsMatch = content.match(/insights["'\s:]+(.*?)(?=recommendations["'\s:]+|$)/i);
      const recommendationsMatch = content.match(/recommendations["'\s:]+(.*?)(?=$)/i);
      
      return {
        insights: insightsMatch?.[1]?.trim() || content,
        recommendations: recommendationsMatch?.[1]?.trim() || ""
      };
    }
  } catch (error: any) {
    console.error('Error generating business insights with Claude:', error);
    throw new Error(`Failed to generate business insights: ${error.message}`);
  }
}

/**
 * Generate business assistant response using Claude AI
 */
export async function generateBusinessAssistantResponse(
  query: string,
  context?: any
): Promise<string> {
  if (!isAnthropicConfigured()) {
    throw new Error('Anthropic API not configured. Please set ANTHROPIC_API_KEY environment variable.');
  }

  const contextStr = context ? `\nContext: ${JSON.stringify(context, null, 2)}` : '';
  
  const prompt = `
    Business Assistant Query: ${query}
    ${contextStr}
    
    Please provide a helpful, clear, and concise response.
  `;

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      messages: [
        { role: 'user', content: prompt }
      ],
      system: "You are a professional business assistant with expertise in accounting, finance, inventory management, and business operations. Provide clear, concise, and practical responses to business-related questions. Always maintain a professional tone and focus on actionable insights."
    });

    const contentBlock = response.content[0];
    if (contentBlock.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }
    
    return contentBlock.text;
  } catch (error: any) {
    console.error('Error generating assistant response with Claude:', error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}

/**
 * Generate budget plan using Claude AI
 */
export async function generateBudgetPlanClaude(
  description: string,
  timeframe: string = 'monthly',
  amount?: number
): Promise<any> {
  if (!isAnthropicConfigured()) {
    throw new Error('Anthropic API not configured. Please set ANTHROPIC_API_KEY environment variable.');
  }

  const amountInfo = amount ? `with a total budget of $${amount}` : '';
  
  const prompt = `
    Generate a detailed ${timeframe} budget plan ${amountInfo} based on the following description:
    
    "${description}"
    
    Please format your response as JSON with the following structure:
    {
      "name": "Budget name",
      "type": "Operating/Project/Capital/etc.",
      "description": "Budget description",
      "purpose": "Purpose of this budget",
      "categories": [
        {
          "name": "Category name",
          "amount": 1000,
          "percentage": 25,
          "items": [
            { "name": "Item name", "amount": 500 },
            { "name": "Item name", "amount": 500 }
          ]
        }
      ],
      "notes": "Additional notes or tips for managing this budget"
    }
  `;

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1500,
      messages: [
        { role: 'user', content: prompt }
      ],
      system: "You are a financial planning expert. Create detailed, realistic budget plans based on the user's description. Be thorough in your categorization and allocation of funds, ensuring the budget is practical and well-structured. If a total budget amount is specified, ensure all category and item amounts sum up to that total."
    });

    // Extract text from response
    const contentBlock = response.content[0];
    if (contentBlock.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }
    
    const content = contentBlock.text;
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error('Error parsing JSON from Claude response:', content);
      throw new Error('Failed to parse budget plan from Claude response');
    }
  } catch (error: any) {
    console.error('Error generating budget plan with Claude:', error);
    throw new Error(`Failed to generate budget plan: ${error.message}`);
  }
}

/**
 * Generate contract template using Claude AI
 */
export async function generateContractTemplateClaude(
  clientInfo: any,
  projectInfo: any
): Promise<string> {
  if (!isAnthropicConfigured()) {
    throw new Error('Anthropic API not configured. Please set ANTHROPIC_API_KEY environment variable.');
  }

  const prompt = `
    Generate a detailed contract template based on the following client and project information:
    
    Client Information:
    ${JSON.stringify(clientInfo, null, 2)}
    
    Project Information:
    ${JSON.stringify(projectInfo, null, 2)}
    
    Please create a professional contract that includes all the necessary sections such as:
    - Parties involved
    - Scope of work
    - Timeline
    - Payment terms
    - Deliverables
    - Terms and conditions
    - Signatures
  `;

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      messages: [
        { role: 'user', content: prompt }
      ],
      system: "You are a legal expert specializing in business contracts. Create comprehensive, professional, and legally sound contract templates based on provided information. Include all standard contract sections and customize the content to the specific client and project. Focus on clarity and protecting both parties' interests."
    });

    const contentBlock = response.content[0];
    if (contentBlock.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }
    
    return contentBlock.text;
  } catch (error: any) {
    console.error('Error generating contract template with Claude:', error);
    throw new Error(`Failed to generate contract template: ${error.message}`);
  }
}

/**
 * Analyze image data (such as receipts) using Claude AI
 */
export async function analyzeImageWithClaude(
  base64Image: string,
  analysisType: 'receipt' | 'invoice' | 'document' = 'receipt'
): Promise<any> {
  if (!isAnthropicConfigured()) {
    throw new Error('Anthropic API not configured. Please set ANTHROPIC_API_KEY environment variable.');
  }

  let systemPrompt = "";
  let userPrompt = "";
  
  switch (analysisType) {
    case 'receipt':
      systemPrompt = "You are a receipt analysis expert. Extract key information from receipts including vendor name, date, items purchased, prices, subtotal, tax, and total amount. Format your response as JSON.";
      userPrompt = "Please analyze this receipt image and extract all relevant information. Include vendor name, date, all line items with descriptions and prices, as well as subtotal, tax, and total amount. Format your response as JSON.";
      break;
    case 'invoice':
      systemPrompt = "You are an invoice analysis expert. Extract key information from invoices including invoice number, date, due date, vendor details, client details, line items, and payment terms. Format your response as JSON.";
      userPrompt = "Please analyze this invoice image and extract all relevant information. Include invoice number, dates, vendor and client information, line items, and payment details. Format your response as JSON.";
      break;
    case 'document':
      systemPrompt = "You are a document analysis expert. Extract key information and summarize the main points of business documents. Format your response as JSON with sections for document type, key information, and summary.";
      userPrompt = "Please analyze this business document and extract all relevant information. Identify the document type and summarize its main points and any actionable items. Format your response as JSON.";
      break;
  }

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1500,
      messages: [
        {
          role: "user", 
          content: [
            {
              type: "text",
              text: userPrompt
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ],
      system: systemPrompt
    });

    // Extract text from response
    const contentBlock = response.content[0];
    if (contentBlock.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }
    
    const content = contentBlock.text;
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error('Error parsing JSON from Claude response:', content);
      return { raw_text: content };
    }
  } catch (error: any) {
    console.error('Error analyzing image with Claude:', error);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
}