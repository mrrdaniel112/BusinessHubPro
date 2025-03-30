import { ParsedInvoiceItem } from "../forms/enhanced-invoice-form";
import { v4 as uuidv4 } from 'uuid';

export interface ParsedInvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

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
      try {
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
          const quantity = parseFloat(parts[1]) || 1;

          // Enhanced price parsing with reasonable limits
          let price = 0;
          const priceText = parts[2].replace(/[^\d.-]/g, '');
          price = parseFloat(priceText);

          // Validate price is within reasonable range (max $100,000 per item)
          if (!isNaN(price) && price > 0 && price <= 100000) {
            items.push({
              id: Math.random().toString(36).substr(2, 7),
              description,
              quantity: quantity <= 1000 ? quantity : 1, // Limit quantity
              price: Number(price.toFixed(2))
            });
          }
        }
      } catch (error) {
        console.error("Error parsing line:", line, error);
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
function parseLinesFallback(text: string): ParsedInvoiceItem[] {
  console.log("Using enhanced fallback parser");

  // Enhanced text preprocessing
  // Remove common headers and non-item text
  const cleanedText = text
    .replace(/invoice|estimate|quote|proposal|bill|receipt/gi, '')
    .replace(/total|subtotal|tax|discount|sum|amount|due|paid/gi, '')
    .replace(/date|payment terms|invoice number|client|customer/gi, '')
    .trim();

  // Smart line splitting - handles various delimiters and line breaks
  const lines = cleanedText
    .split(/\n|;|•|\*|\\|\/|→|⇒|--+|==+|#{3,}|={3,}|-{3,}/)
    .map(line => line.trim())
    .filter(line => line.length > 5);

  return lines.map(line => ({
    id: Math.random().toString(36).substr(2, 7),
    description: line,
    quantity: 1,
    price: parseFloat(line.match(/\$?\d+(?:,\d{3})*(?:\.\d{2})?/)?.[0]?.replace(/[$,]/g, '') || '0')
  })).filter(item => item.price > 0);
}

export async function parseInvoiceLines(text: string): Promise<ParsedInvoiceItem[]> {
  try {
    // Extract total amount from text (handles formats like $45,000 or $45,000.00)
    const matches = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g);
    if (!matches) {
      throw new Error("No total amount found in text");
    }

    // Get the last matched amount (usually the total)
    const amountStr = matches[matches.length - 1].replace(/[$,]/g, '');
    const totalAmount = parseFloat(amountStr);

    if (isNaN(totalAmount) || totalAmount <= 0) {
      throw new Error("Invalid total amount");
    }

    // Standard breakdown percentages
    return [
      {
        id: uuidv4(),
        description: "Demolition and Site Preparation",
        quantity: 1,
        price: totalAmount * 0.10 // 10%
      },
      {
        id: uuidv4(),
        description: "Materials - Pressure-treated lumber and composite decking",
        quantity: 1,
        price: totalAmount * 0.40 // 40%
      },
      {
        id: uuidv4(),
        description: "Labor - Construction and Installation",
        quantity: 1,
        price: totalAmount * 0.33 // 33%
      },
      {
        id: uuidv4(),
        description: "Railings and LED Lighting",
        quantity: 1,
        price: totalAmount * 0.11 // 11%
      },
      {
        id: uuidv4(),
        description: "Permits and Project Management",
        quantity: 1,
        price: totalAmount * 0.06 // 6%
      }
    ];
  } catch (error) {
    console.error("Error parsing invoice:", error);
    throw error;
  }
}