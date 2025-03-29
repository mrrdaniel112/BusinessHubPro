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
    
    // Enhanced prompt for better accuracy and more detailed instruction
    const prompt = `
    You are an expert financial analyst who specializes in invoice parsing and cost estimation.
    
    I need you to carefully analyze the following text and extract detailed invoice line items:
    "${text}"
    
    For each line item you identify:
    
    1. Extract a DETAILED and SPECIFIC description that captures the exact service or product
    2. Determine the quantity (default to 1 for services if not explicitly stated)
    3. Determine a REALISTIC MARKET RATE price in USD (no $ symbol)
    
    IMPORTANT INSTRUCTIONS:
    - Be extremely thorough in your analysis
    - Look for line items even if they're not clearly formatted
    - Make reasonable professional estimates for prices if exact values aren't specified
    - If multiple items are mentioned, break them down into separate line items
    - For projects or services, consider what detailed components would be included
    
    YOU MUST RETURN YOUR RESULTS USING EXACTLY THIS FORMAT (one item per line):
    Description | Quantity | Price
    
    For example:
    Custom website design with responsive interfaces and brand integration | 1 | 2500
    High-resolution custom icon development for website navigation | 10 | 50
    Professional content creation with SEO optimization | 1 | 1500
    
    DO NOT include any other text, explanations, or headers in your response. ONLY return the line items in the exact format specified.
    `;
    
    // Call Puter AI to extract the information with enhanced parsing
    let response = await window.puter.ai.chat(prompt);
    
    // Parse the AI response into structured line items with improved validation
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
        
        // More robust price parsing
        let price = 0;
        const priceText = parts[2].replace(/\$|,/g, '').trim();
        if (priceText) {
          const parsedPrice = parseFloat(priceText);
          price = !isNaN(parsedPrice) ? parsedPrice : 1500; // Default to 1500 if parsing fails
        } else {
          price = 1500; // Default price
        }
        
        // Validate item before adding (must have description and reasonable values)
        if (description && description.length > 2 && quantity > 0 && price > 0) {
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
    
    // If the AI parsing yielded items, return them; otherwise fall back to our text parser
    if (items.length > 0) {
      return items;
    } else {
      console.log("Puter AI didn't return proper item format, using fallback parser");
      return parseLinesFallback(text);
    }
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