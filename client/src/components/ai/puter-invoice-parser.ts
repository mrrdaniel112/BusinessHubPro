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
  // Check if Puter API is available
  if (typeof window === 'undefined' || !window.puter?.ai?.chat) {
    console.log("Puter AI not available, using fallback parser");
    return parseLinesFallback(text);
  }
  
  try {
    console.log("Attempting to parse with Puter AI...");
    
    const prompt = `
    You are an expert at parsing invoice line items from text. 
    
    Parse the following text into detailed invoice line items:
    "${text}"
    
    For each line item, extract:
    1. Description
    2. Quantity (default to 1 if not specified)
    3. Price in USD (no $ symbol needed)
    
    Return the results as line items in this exact format, one per line:
    Description | Quantity | Price
    
    For example:
    Website design | 1 | 2500
    Custom icons | 10 | 50
    Content creation | 1 | 1500
    `;
    
    // Call Puter AI to extract the information
    let response = await window.puter.ai.chat(prompt);
    
    // Parse the AI response into structured line items
    const lines = response.split('\n').filter(line => line.trim() !== '');
    const items: ParsedInvoiceItem[] = [];
    
    for (const line of lines) {
      // Skip header or instruction lines
      if (line.includes("Description | Quantity | Price") || 
          line.includes("---") || 
          line.includes("example:")) {
        continue;
      }
      
      // Try to parse AI-formatted responses first (pipe-delimited)
      const parts = line.split('|').map(s => s.trim());
      if (parts.length >= 3) {
        const description = parts[0];
        const quantity = parseInt(parts[1], 10) || 1;
        const price = parseFloat(parts[2].replace(/\$|,/g, '')) || 0;
        
        if (description && !isNaN(quantity) && !isNaN(price)) {
          items.push({
            id: Math.random().toString(36).substring(2, 9),
            description,
            quantity,
            price
          });
        }
      }
    }
    
    console.log(`Puter AI parsed ${items.length} items`);
    
    if (items.length === 0) {
      // If we couldn't parse anything from Puter's response, try our fallback
      return parseLinesFallback(text);
    }
    
    return items;
  } catch (error) {
    console.error("Error parsing with Puter AI:", error);
    return parseLinesFallback(text);
  }
}

/**
 * Fallback function to parse invoice lines when Puter is not available
 * @param text The text containing invoice line items 
 * @returns ParsedInvoiceItem[] Array of parsed line items
 */
export function parseLinesFallback(text: string): ParsedInvoiceItem[] {
  console.log("Using fallback parser");
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const items: ParsedInvoiceItem[] = [];
  
  for (const line of lines) {
    let description = line.trim();
    let quantity = 1;
    let price = 1500; // Default price
    
    // Try different parsing patterns
    
    // Pattern 1: "Quantity x Description $Price"
    // Example: "10x Custom icons $50"
    const pattern1 = /^(\d+)(?:x|\s+)(.+?)(?:\s-\s|\s–\s|\s:\s)?\s*\$?(\d+(?:,\d+)*(?:\.\d+)?)/i;
    const match1 = description.match(pattern1);
    
    if (match1) {
      quantity = parseInt(match1[1], 10);
      description = match1[2].trim();
      price = parseFloat(match1[3].replace(/,/g, ''));
    } else {
      // Pattern 2: "Description $Price"
      // Example: "Website design $2500"
      const pattern2 = /^(.+?)(?:\s-\s|\s–\s|\s:\s)?\s*\$?(\d+(?:,\d+)*(?:\.\d+)?)/i;
      const match2 = description.match(pattern2);
      
      if (match2) {
        description = match2[1].trim();
        price = parseFloat(match2[2].replace(/,/g, ''));
      } else {
        // Pattern 3: "Description - $Price"
        // Example: "Content creation - $1500"
        const pattern3 = /^(.+?)\s*[-–:]\s*\$?(\d+(?:,\d+)*(?:\.\d+)?)/i;
        const match3 = description.match(pattern3);
        
        if (match3) {
          description = match3[1].trim();
          price = parseFloat(match3[2].replace(/,/g, ''));
        }
      }
    }
    
    // Create the item regardless of whether we parsed everything
    // This ensures we at least capture a line as a description even if we
    // couldn't parse quantity/price
    items.push({
      id: Math.random().toString(36).substring(2, 9),
      description,
      quantity,
      price
    });
  }
  
  return items;
}

/**
 * Main function to parse invoice lines - tries Puter first, falls back to simple parsing
 * @param text The text containing invoice line items
 * @returns Promise<ParsedInvoiceItem[]> Array of parsed line items
 */
export async function parseInvoiceLines(text: string): Promise<ParsedInvoiceItem[]> {
  try {
    // Try Puter AI first
    return await parseLinesWithPuter(text);
  } catch (error) {
    console.error("Error parsing with Puter, using fallback:", error);
    return parseLinesFallback(text);
  }
}