/**
 * Utility function to parse invoice line items using Puter's AI
 */

// Define the line item structure
export interface ParsedInvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

/**
 * Parse invoice text into structured line items using Puter AI
 * @param text The text containing invoice line items
 * @returns Promise<ParsedInvoiceItem[]> Array of parsed line items
 */
export async function parseLinesWithPuter(text: string): Promise<ParsedInvoiceItem[]> {
  // Check if Puter AI is available
  if (!window.puter || !window.puter.ai || typeof window.puter.ai.chat !== 'function') {
    throw new Error("Puter AI is not available");
  }
  
  // Prompt engineering to get structured data from Puter
  const prompt = `
Parse the following text into invoice line items. For each line, extract:
1. The description (product or service)
2. The quantity (default to 1 if not specified)
3. The price (in dollars, default to 1500 if not specified)

Format your response as a valid JSON array with objects that have description, quantity, and price properties.
Example format: [{"description": "Web design", "quantity": 1, "price": 2500}, {"description": "Logo design", "quantity": 1, "price": 500}]

Text to parse:
${text}
`;

  try {
    // Simple approach without streaming for compatibility
    const response = await window.puter.ai.chat(prompt);
    
    // Response should be a string
    const fullResponse = response;
    
    // Extract JSON from the full response (in case there's extra text)
    // Using a more compatible regex approach without the 's' flag
    const jsonMatch = fullResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from response");
    }
    
    // Parse the JSON
    const parsedItems = JSON.parse(jsonMatch[0]);
    
    // Validate and transform the data
    return parsedItems.map((item: any, index: number) => ({
      id: Math.random().toString(36).substring(2, 9), // Generate random ID
      description: item.description || `Item ${index + 1}`,
      quantity: typeof item.quantity === 'number' ? item.quantity : 1,
      price: typeof item.price === 'number' ? item.price : 1500
    }));
  } catch (error) {
    console.error("Error parsing invoice lines with Puter:", error);
    throw error;
  }
}

/**
 * Fallback function to parse invoice lines when Puter is not available
 * @param text The text containing invoice line items 
 * @returns ParsedInvoiceItem[] Array of parsed line items
 */
export function parseLinesFallback(text: string): ParsedInvoiceItem[] {
  // Split text into lines and remove empty ones
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  return lines.map(line => {
    let description = line.trim();
    let quantity = 1;
    let price = 1500; // Default price
    
    // Try to extract quantity if format is like "5x Widget" or "5 Widget"
    const quantityMatch = description.match(/^(\d+)(?:x|\s+)/);
    if (quantityMatch) {
      quantity = parseInt(quantityMatch[1], 10);
      description = description.replace(quantityMatch[0], '').trim();
    }
    
    // Try to extract price if format is like "Widget - $500" or "Widget $500"
    const priceMatch = description.match(/[\s-]*\$\s*(\d+(?:,\d+)*(?:\.\d+)?)/);
    if (priceMatch) {
      price = parseFloat(priceMatch[1].replace(/,/g, ''));
      description = description.replace(priceMatch[0], '').trim();
    }
    
    return {
      id: Math.random().toString(36).substring(2, 9),
      description,
      quantity,
      price
    };
  });
}

/**
 * Main function to parse invoice lines - tries Puter first, falls back to simple parsing
 * @param text The text containing invoice line items
 * @returns Promise<ParsedInvoiceItem[]> Array of parsed line items
 */
export async function parseInvoiceLines(text: string): Promise<ParsedInvoiceItem[]> {
  try {
    // First try to use Puter AI
    return await parseLinesWithPuter(text);
  } catch (error) {
    console.warn("Falling back to simple parsing due to error:", error);
    // Fall back to simple parsing if Puter fails
    return parseLinesFallback(text);
  }
}