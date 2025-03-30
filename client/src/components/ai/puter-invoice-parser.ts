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
    
    // Significantly enhanced prompt with industry-specific terminology and 2025 pricing
    const prompt = `
    You are a master invoice specialist with 25+ years experience in technical cost analysis and project estimation. You have deep expertise in current 2025 market rates across multiple industries.
    
    Analyze this text and extract highly detailed and professionally described invoice line items:
    "${text}"
    
    For each line item you identify:
    
    1. Create an EXCEPTIONALLY DETAILED description using precise industry terminology and technical specifications
       - Include specific measurements (dimensions, volumes, weights, etc.)
       - Specify exact materials, equipment types, or professional methodologies
       - Use industry-standard units of measurement
       - Include technical parameters that differentiate premium from standard services
    
    2. Determine accurate quantities
       - For professional services: specify in hours, days, or appropriate service units
       - For physical items: use exact counts with appropriate unit descriptors
       - For recurring services: include frequency (monthly, quarterly, etc.)
       - For area-based services: use square footage or appropriate spatial measurements
    
    3. Calculate PRECISE 2025 MARKET RATES in USD
       - Research-based pricing reflecting current market conditions
       - Include regional cost factors (use high-tier metropolitan pricing)
       - Consider materials/labor distinctions within overall price
       - Factor in complexity premiums for specialized work
    
    CRITICAL INSTRUCTIONS:
    - Break complex services into 5-8 highly granular components that would appear on a professional invoice
    - Use EXACTLY the specialized terminology a true industry expert would use
    - Apply precise technical specifications in each description
    - Include regulatory compliance elements where relevant
    - Distinguish between basic vs. premium service tiers
    - Factor in specialty equipment or material costs
    - Consider both direct and indirect costs in your pricing
    
    YOUR RESPONSE MUST USE THIS EXACT FORMAT (one item per line):
    Description | Quantity | Price
    
    Example of expected detail level:
    Commercial-grade WordPress website development with responsive Elementor Pro framework implementation and ADA compliance integration (WCAG 2.1 AA) | 1 | 4200
    Custom PHP module development for proprietary ERP system integration including secure API endpoints with 256-bit encryption | 1 | 3800
    High-resolution digital asset creation (vector format) including favicon package, social media templates, and print-ready source files (Adobe CC) | 1 | 1850
    Technical SEO implementation including schema markup, Core Web Vitals optimization, and canonical URL structure for multi-language support | 1 | 2200
    
    ONLY return the parsed line items with no additional text, explanations, or commentary.
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
  console.log("Using enhanced fallback parser");
  
  // Enhanced text preprocessing
  // Remove common headers and non-item text
  const cleanedText = text
    .replace(/invoice|estimate|quote|proposal|bill|receipt/gi, '')
    .replace(/total|subtotal|tax|discount|sum|amount|due|paid/gi, '')
    .replace(/date|payment terms|invoice number|client|customer/gi, '')
    .trim();
  
  // Smart line splitting - handles various delimiters and line breaks
  const rawLines = cleanedText
    .split(/\n|;|•|\*|\\|\/|→|⇒|--+|==+|#{3,}|={3,}|-{3,}/)
    .flatMap(line => line.split(/(?<=[.?!])\s+(?=[A-Z])/))  // Split by sentence boundaries
    .map(line => line.trim())
    .filter(line => {
      // Filter out lines that are too short or don't look like invoice items
      return line.length > 5 && 
             !line.match(/^(page|invoice|date|total|bill|to|from)\s*[:;-]?\s*$/i) &&
             !line.match(/^(thank|sincerely|regards|truly)/i);
    });
  
  // Process the lines into potential items
  const potentialItems: ParsedInvoiceItem[] = [];
  
  for (const line of rawLines) {
    // Skip truly empty lines
    if (!line.trim()) continue;
    
    let description = line.trim();
    let quantity = 1;
    let price = 0;
    
    // Enhanced pattern matching for professional invoice variations
    
    // Pattern 1: Detect quantity with x/hrs format and price
    // Examples: "10x Custom icons $500", "40 hrs Premium consulting $6000"
    const qtyPricePattern = /(?:^|\s)(\d+\.?\d*)(?:\s*x|\s*hrs?|\s*hours?|\s*units?|\s*pieces?)?\s+(.+?)(?:\s*-\s*|\s*:\s*|\s*at\s*|\s*for\s*)?\s*\$?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:\/(?:each|hr|hour|unit|piece))?(?:\s|$)/i;
    const qtyPriceMatch = description.match(qtyPricePattern);
    
    if (qtyPriceMatch) {
      quantity = parseFloat(qtyPriceMatch[1]);
      description = qtyPriceMatch[2].trim();
      price = parseFloat(qtyPriceMatch[3].replace(/,/g, ''));
    } else {
      // Pattern 2: Price at end of line
      // Example: "Website development and design $3500"
      const priceEndPattern = /^(.+?)(?:\s*-\s*|\s*:\s*|\s*\|\s*|\s+)(?:\$\s*)?(\d+(?:,\d+)*(?:\.\d+)?)(?:\s*(?:USD|dollars|total|each))?$/i;
      const priceEndMatch = description.match(priceEndPattern);
      
      if (priceEndMatch) {
        description = priceEndMatch[1].trim();
        price = parseFloat(priceEndMatch[2].replace(/,/g, ''));
      } else {
        // Pattern 3: Detect numbered list items with price
        // Example: "1. Initial consultation and project planning - $1,200"
        const numberedItemPattern = /^\s*(?:\d+[\.\):]|\*|\-|\+)\s*(.+?)(?:\s*-\s*|\s*:\s*|\s*\|\s*|\s+)(?:\$\s*)?(\d+(?:,\d+)*(?:\.\d+)?)(?:\s*(?:USD|dollars|total|each))?$/i;
        const numberedMatch = description.match(numberedItemPattern);
        
        if (numberedMatch) {
          description = numberedMatch[1].trim();
          price = parseFloat(numberedMatch[2].replace(/,/g, ''));
        } else {
          // Pattern 4: Description with price in parentheses
          // Example: "Logo design (premium package) ($750)"
          const parenthesesPricePattern = /^(.+?)\s*\(\s*\$?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*\)$/i;
          const parenthesesMatch = description.match(parenthesesPricePattern);
          
          if (parenthesesMatch) {
            description = parenthesesMatch[1].trim();
            price = parseFloat(parenthesesMatch[2].replace(/,/g, ''));
          }
        }
      }
    }
    
    // Intelligent price estimation for descriptions without a detected price
    if (price === 0 || isNaN(price)) {
      // Analyze the description to estimate a reasonable price
      const lowerDesc = description.toLowerCase();
      
      // Web development and digital services
      if (lowerDesc.includes('website') || lowerDesc.includes('web') || lowerDesc.includes('site')) {
        price = 3500;
      } else if (lowerDesc.includes('app') || lowerDesc.includes('application') || lowerDesc.includes('software')) {
        price = 5000;
      } else if (lowerDesc.includes('logo') || lowerDesc.includes('brand')) {
        price = 1200;
      } else if (lowerDesc.includes('design') || lowerDesc.includes('graphic')) {
        price = 1500;
      } else if (lowerDesc.includes('consult') || lowerDesc.includes('advisory')) {
        price = 2000;
      } else if (lowerDesc.includes('seo') || lowerDesc.includes('marketing')) {
        price = 1800;
      } else if (lowerDesc.includes('content') || lowerDesc.includes('writing')) {
        price = 1200;
      // Construction/Physical Work
      } else if (lowerDesc.includes('install') || lowerDesc.includes('setup')) {
        price = 850;
      } else if (lowerDesc.includes('repair') || lowerDesc.includes('fix')) {
        price = 450;
      // Maintenance services
      } else if (lowerDesc.includes('maintain') || lowerDesc.includes('support')) {
        price = 750;
      // Default for unrecognized services
      } else {
        price = 1500;
      }
    }
    
    // Validate quantity to ensure it's reasonable
    if (quantity <= 0 || isNaN(quantity)) {
      quantity = 1;
    }
    
    // Cap extremely large quantities which are likely errors
    if (quantity > 1000) {
      quantity = 1;
    }
    
    // Add the item if description is meaningful
    // Filter out items that are likely not real line items
    const nonItemPatterns = [
      /^(?:page|total|subtotal|tax|invoice|please|thank)/i,
      /^(?:due|payment)\s+(?:date|terms)/i,
      /^for\s+more\s+information/i
    ];
    
    const isLikelyNonItem = nonItemPatterns.some(pattern => pattern.test(description));
    
    if (description.length > 5 && !isLikelyNonItem) {
      // Make description more professional if it's very short
      if (description.length < 15) {
        // Enhance short descriptions based on context
        const enhancedDescriptions: Record<string, string> = {
          'logo': 'Professional logo design with brand identity guidelines',
          'website': 'Custom responsive website development with SEO optimization',
          'design': 'Professional graphic design services with unlimited revisions',
          'consultation': 'Expert business strategy consultation and implementation planning',
          'content': 'High-quality content creation with SEO optimization',
          'marketing': 'Comprehensive digital marketing strategy and implementation',
          'development': 'Custom software development with technical documentation',
          'maintenance': 'Ongoing technical maintenance and support services'
        };
        
        // Find the closest key match
        for (const [key, enhancedDesc] of Object.entries(enhancedDescriptions)) {
          if (description.toLowerCase().includes(key)) {
            description = enhancedDesc;
            break;
          }
        }
      }
      
      potentialItems.push({
        id: Math.random().toString(36).substring(2, 9),
        description,
        quantity,
        price
      });
    }
  }
  
  // If we didn't find any items but have text, create a generic line item
  if (potentialItems.length === 0 && text.trim().length > 0) {
    // Create a single item with the entire text as description
    const genericDescription = text.length > 100 
      ? text.substring(0, 100) + '...' 
      : text;
      
    potentialItems.push({
      id: Math.random().toString(36).substring(2, 9),
      description: 'Professional services: ' + genericDescription,
      quantity: 1,
      price: 2500
    });
  }
  
  return potentialItems;
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