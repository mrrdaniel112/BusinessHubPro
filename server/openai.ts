import OpenAI from "openai";

// Completely disable OpenAI API calls - always use templates
function isOpenAIConfigured(): boolean {
  // Always return false to use template-based content
  return false;
}

// This is just a placeholder - we're not actually using the OpenAI API anymore
// With isOpenAIConfigured() always returning false, this won't be used
const openai = new OpenAI({ 
  apiKey: "disabled_key", 
  maxRetries: 0,
  timeout: 5000,
});

// Handle AI errors gracefully with fallback responses
const handleAiError = (error: any, errorSource: string) => {
  // Detailed error logging
  if (error.status === 429) {
    console.error(`Error in ${errorSource}: OpenAI rate limit or quota exceeded`);
  } else if (error.status === 401) {
    console.error(`Error in ${errorSource}: Authentication error - Invalid API key`);
  } else if (error.status === 500) {
    console.error(`Error in ${errorSource}: OpenAI server error`);
  } else {
    console.error(`Error in ${errorSource}:`, error.message || error);
  }
  return null;
};

// Enhanced smart templates with project stories and cost breakdowns
const invoiceTemplates = {
  // Website Development template
  website: {
    items: [
      { description: "Website design and strategic planning", quantity: 1, price: 7500 },
      { description: "Advanced frontend development with animations", quantity: 1, price: 8500 },
      { description: "Custom backend integration and APIs", quantity: 1, price: 9500 },
      { description: "Responsive design across all devices", quantity: 1, price: 5500 },
      { description: "Content management system customization", quantity: 1, price: 6500 },
      { description: "E-commerce functionality integration", quantity: 1, price: 7500 },
      { description: "SEO optimization and structured data", quantity: 1, price: 4500 },
      { description: "Performance optimization and caching", quantity: 1, price: 5000 },
      { description: "Security implementation and testing", quantity: 1, price: 6000 },
      { description: "Analytics setup and user tracking", quantity: 1, price: 4500 }
    ],
    costBreakdown: [
      { category: "Design & Planning", percentage: 20, description: "Initial conceptualization, wireframing, and UI/UX design" },
      { category: "Development", percentage: 55, description: "Frontend and backend coding, database implementation" },
      { category: "Testing & Optimization", percentage: 15, description: "Cross-browser testing, performance tuning, security hardening" },
      { category: "Project Management", percentage: 10, description: "Communication, coordination, and timeline management" }
    ],
    projectStory: "This website development project began with an in-depth discovery phase where we identified your key business goals and target audience needs. Our design team crafted a modern, user-friendly interface that highlights your unique value proposition while ensuring intuitive navigation. The development phase implemented responsive design principles to deliver a seamless experience across all devices. We integrated a powerful content management system that allows you to easily update content without technical expertise. Throughout the project, we conducted rigorous testing to ensure optimal performance, security, and accessibility.",
    notes: "Thank you for your business! This invoice covers all agreed website development services. Payment is due within 30 days of issue. We offer a 30-day support period for any questions or minor adjustments needed after delivery."
  },
  
  // Consulting template
  consulting: {
    items: [
      { description: "Comprehensive initial business analysis and assessment", quantity: 1, price: 7500 },
      { description: "In-depth market research and competitor analysis", quantity: 1, price: 6500 },
      { description: "Executive strategy development workshops", quantity: 3, price: 5500 },
      { description: "Custom business growth roadmap creation", quantity: 1, price: 8000 },
      { description: "Financial modeling and projection analysis", quantity: 1, price: 7000 },
      { description: "Operational process optimization planning", quantity: 1, price: 6000 },
      { description: "Risk assessment and mitigation strategies", quantity: 1, price: 5500 },
      { description: "Detailed implementation planning and timelines", quantity: 1, price: 6500 },
      { description: "Comprehensive documentation and reporting", quantity: 1, price: 4500 },
      { description: "Follow-up review and adjustment sessions", quantity: 2, price: 3500 }
    ],
    costBreakdown: [
      { category: "Research & Analysis", percentage: 30, description: "Comprehensive market research and needs assessment" },
      { category: "Strategy Development", percentage: 40, description: "Custom strategy formulation based on insights and industry best practices" },
      { category: "Implementation Planning", percentage: 20, description: "Detailed action plans and execution roadmaps" },
      { category: "Documentation", percentage: 10, description: "Comprehensive reporting and future reference materials" }
    ],
    projectStory: "Our consulting engagement began with a thorough analysis of your current business operations, market position, and competitive landscape. We identified key areas of opportunity and potential challenges that needed addressing. Through collaborative strategy sessions, we developed a comprehensive roadmap tailored to your specific goals and resources. The implementation planning phase translated these strategies into actionable steps with clear timelines and accountability measures. Throughout the process, we documented our findings, recommendations, and plans to provide you with a valuable resource for ongoing reference and implementation.",
    notes: "Thank you for choosing our consulting services! This invoice covers all consulting services as outlined in our agreement. Payment terms: Net 15 days. Please include the invoice number with your payment."
  },
  
  // Marketing template
  marketing: {
    items: [
      { description: "Comprehensive marketing strategy development and planning", quantity: 1, price: 8500 },
      { description: "Target audience research and persona development", quantity: 1, price: 5500 },
      { description: "Brand messaging and value proposition refinement", quantity: 1, price: 6000 },
      { description: "Premium content creation and copywriting", quantity: 5, price: 3500 },
      { description: "High-quality visual asset design and production", quantity: 1, price: 6500 },
      { description: "Multi-platform social media campaign setup", quantity: 1, price: 5500 },
      { description: "Search engine optimization and digital presence", quantity: 1, price: 5000 },
      { description: "Email marketing campaign development", quantity: 1, price: 4500 },
      { description: "Marketing automation workflow implementation", quantity: 1, price: 5000 },
      { description: "Advanced analytics and performance tracking", quantity: 1, price: 4500 }
    ],
    costBreakdown: [
      { category: "Strategy & Planning", percentage: 35, description: "Comprehensive marketing strategy development aligned with business goals" },
      { category: "Content Creation", percentage: 25, description: "Professional content development optimized for target audiences" },
      { category: "Campaign Implementation", percentage: 30, description: "Platform setup, audience targeting, and campaign execution" },
      { category: "Measurement & Analytics", percentage: 10, description: "Performance tracking system implementation and baseline reporting" }
    ],
    projectStory: "This marketing project began with a deep dive into your brand identity, target audience, and business objectives. We crafted a comprehensive marketing strategy designed to maximize your reach and impact across multiple channels. Our creative team developed engaging content that resonates with your audience while maintaining consistent brand voice and messaging. The campaign implementation phase included detailed audience targeting, platform optimization, and testing to ensure maximum effectiveness. We also established robust analytics systems that provide real-time insights into campaign performance, allowing for data-driven optimization and demonstrable ROI tracking.",
    notes: "Thank you for your business! This invoice covers all marketing services as outlined in our agreement. Payment is due within 21 days. For questions regarding this invoice, please contact our accounting department."
  },
  
  // Software Development template
  software: {
    items: [
      { description: "Comprehensive requirements gathering and analysis", quantity: 1, price: 5500 },
      { description: "Advanced software architecture and system design", quantity: 1, price: 7500 },
      { description: "Core development and feature implementation", quantity: 1, price: 9000 },
      { description: "Database design and data migration services", quantity: 1, price: 6500 },
      { description: "API development and third-party integrations", quantity: 1, price: 7000 },
      { description: "Frontend user interface development", quantity: 1, price: 6000 },
      { description: "Comprehensive quality assurance and testing", quantity: 1, price: 5500 },
      { description: "Security implementation and vulnerability testing", quantity: 1, price: 6000 },
      { description: "Production deployment and system configuration", quantity: 1, price: 4000 },
      { description: "Documentation and knowledge transfer sessions", quantity: 1, price: 4500 }
    ],
    costBreakdown: [
      { category: "Analysis & Planning", percentage: 20, description: "Requirements gathering, specification development, architecture planning" },
      { category: "Development", percentage: 50, description: "Core development work including coding, integration, and feature implementation" },
      { category: "Quality Assurance", percentage: 20, description: "Comprehensive testing, bug fixing, and performance optimization" },
      { category: "Deployment & Training", percentage: 10, description: "System deployment, documentation, and knowledge transfer" }
    ],
    projectStory: "This software development project started with thorough requirements gathering sessions to deeply understand your business needs and user expectations. Our architecture team designed a robust, scalable solution that accommodates both current needs and future growth. Throughout the development phase, we maintained close communication, providing regular demos and collecting feedback to ensure alignment with your vision. Our QA team rigorously tested all aspects of the software to ensure reliability, security, and optimal performance. The deployment process included comprehensive knowledge transfer sessions to ensure your team can effectively manage and utilize the new system.",
    notes: "Thank you for choosing us for your software development needs! This invoice covers all development services as outlined in our agreement. Payment is due within 30 days of receipt. We provide 60 days of post-deployment support to ensure a smooth transition."
  },
  
  // Default template
  default: {
    items: [
      { description: "Professional services and expert consultation", quantity: 1, price: 8500 },
      { description: "Strategic project management and oversight", quantity: 1, price: 5500 },
      { description: "Implementation and delivery of core deliverables", quantity: 1, price: 6500 },
      { description: "Technical architecture and system design", quantity: 1, price: 7500 },
      { description: "Custom development and specialized programming", quantity: 1, price: 7000 },
      { description: "Quality assurance and comprehensive testing", quantity: 1, price: 4500 },
      { description: "User experience design and optimization", quantity: 1, price: 5000 },
      { description: "Documentation and knowledge transfer", quantity: 1, price: 3500 },
      { description: "Performance optimization and system tuning", quantity: 1, price: 4000 },
      { description: "Post-implementation support and maintenance", quantity: 1, price: 4500 }
    ],
    costBreakdown: [
      { category: "Professional Services", percentage: 45, description: "Core service delivery and implementation" },
      { category: "Management & Coordination", percentage: 25, description: "Project oversight, communication, and resource management" },
      { category: "Implementation", percentage: 20, description: "Practical application and system integration" },
      { category: "Quality Assurance", percentage: 10, description: "Testing, verification, and refinement" }
    ],
    projectStory: "This project was executed using our proven methodology to ensure maximum value and efficiency. We began with a thorough assessment of your needs, followed by careful planning to establish clear objectives and timelines. Our team of specialists applied their expertise to deliver high-quality results that meet or exceed industry standards. Throughout the process, we maintained clear communication and collaborative problem-solving to address any challenges that arose. The final deliverables were subject to comprehensive quality assurance to ensure they fully meet your requirements and expectations.",
    notes: "Thank you for your business! Payment is due within 30 days of receipt. If you have any questions about this invoice, please contact us."
  }
};

// Generate invoice details - uses templates as fallback when OpenAI is unavailable
export async function generateInvoiceDetails(
  projectDescription: string,
  clientName: string
): Promise<{
  items: Array<{ description: string, quantity: number, price: number }>,
  notes: string,
  projectStory?: string,
  costBreakdown?: Array<{ category: string, percentage: number, description: string }>
}> {
  try {
    // First check if OpenAI API is properly configured
    if (!isOpenAIConfigured()) {
      console.log('OpenAI API key not configured properly, using template fallback');
      throw new Error('OpenAI API key not configured');
    }
    
    // Use OpenAI to generate custom invoice content
    const prompt = `
      Based on the following project description, generate a highly detailed and professional invoice that tells a compelling story about the project while providing an intelligent breakdown of costs. BE VERY SPECIFIC and directly address the exact details provided.

      Project Description: ${projectDescription}
      Client Name: ${clientName}

      Please generate:
      1. Between 3-6 line items with DETAILED descriptions that precisely match the project described. Each description should be very specific (not generic) and use at least 6-10 words.
      2. Set realistic prices based on industry standards - each line item should have a specific price that reflects the complexity and scope of work.
      3. A professional invoice note that includes payment terms (30 days), a thank you message to ${clientName} specifically, and relevant completion details.
      4. A compelling project story (150-200 words) that narrates the exact journey of THIS specific project from start to finish. Include specific challenges faced and how they were overcome, specific deliverables created, and clear value provided to ${clientName}.
      5. A detailed cost breakdown that divides the total cost into 4-5 meaningful categories with accurate percentages and specific descriptions of what each category includes.

      IMPORTANT: Be extremely specific to the project described. Do NOT use generic language or templates. Read the project description carefully and ensure every aspect of your response directly relates to the specific work mentioned.

      Format your response as JSON in this structure:
      {
        "items": [
          {
            "description": "Very detailed and specific item description that clearly relates to the project",
            "quantity": number,
            "price": number (realistic USD amount)
          },
          ...
        ],
        "notes": "Professional invoice note specifically addressing ${clientName} with payment terms and other information",
        "projectStory": "Detailed narrative description of THIS specific project journey...",
        "costBreakdown": [
          {
            "category": "Specific category name relevant to this project",
            "percentage": number (must add up to 100),
            "description": "Detailed explanation of exactly what this category includes for THIS project"
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
          content: "You are an AI expert in business finance and professional invoicing with decades of experience. Your specialty is creating highly customized, accurate, and detailed invoices that precisely match the specific project described. Generate realistic, detailed invoice items and notes based on project descriptions. NEVER use generic descriptions or placeholder text. Each output MUST directly relate to the specific details mentioned in the project description. Your invoices should be professional, detailed, and personalized to the exact client and project."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7, // Slightly creative but still focused
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      items: Array.isArray(result.items) ? result.items : [],
      notes: result.notes || "Thank you for your business. Payment is due within 30 days of receipt.",
      projectStory: result.projectStory || undefined,
      costBreakdown: Array.isArray(result.costBreakdown) ? result.costBreakdown : undefined
    };
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
      notes: personalizedNotes,
      projectStory: template.projectStory || undefined,
      costBreakdown: template.costBreakdown || undefined
    };
  }
}

// Categorize transaction
export async function categorizeTransaction(description: string): Promise<string> {
  try {
    // Check if OpenAI API is properly configured
    if (!isOpenAIConfigured()) {
      console.log('OpenAI API key not configured properly, using fallback categorization');
      
      // Use keyword matching as fallback
      const lowerDesc = description.toLowerCase();
      if (lowerDesc.includes('sale') || lowerDesc.includes('revenue') || lowerDesc.includes('income')) {
        return "Sales";
      } else if (lowerDesc.includes('software') || lowerDesc.includes('subscription')) {
        return "Software";
      } else if (lowerDesc.includes('marketing') || lowerDesc.includes('advertis')) {
        return "Marketing";
      } else if (lowerDesc.includes('travel') || lowerDesc.includes('flight') || lowerDesc.includes('hotel')) {
        return "Travel";
      } else if (lowerDesc.includes('food') || lowerDesc.includes('restaurant') || lowerDesc.includes('meal')) {
        return "Food";
      } else if (lowerDesc.includes('office') || lowerDesc.includes('supplies')) {
        return "Office";
      } else {
        return "Other";
      }
    }
    
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
    // Check if OpenAI API is properly configured
    if (!isOpenAIConfigured()) {
      console.log('OpenAI API key not configured properly, using fallback business insights');
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
