import twilio from 'twilio';

// Helper function to create Twilio client
function createTwilioClient() {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    console.log('Using Twilio client configuration');
    return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  console.log('Twilio client not configured');
  return null;
}

// Initialize Twilio client
const twilioClient = createTwilioClient();

// Get Twilio phone number from environment
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';

// Check Twilio configuration
function isTwilioConfigured(): boolean {
  return !!twilioClient && !!twilioPhoneNumber;
}

/**
 * Send an invoice notification via SMS
 * @param to Phone number to send to
 * @param invoiceNumber The invoice number
 * @param clientName The client name
 * @param amount The total amount
 * @param dueDate The invoice due date
 * @returns Promise with send info
 */
export async function sendInvoiceSMS(
  to: string,
  invoiceNumber: string,
  clientName: string,
  amount: number | string,
  dueDate: Date | string
): Promise<{ success: boolean, info?: any, error?: any }> {
  try {
    // Check if Twilio is configured
    if (!isTwilioConfigured()) {
      const errorMessage = 'Twilio is not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in environment variables.';
      console.error(errorMessage);
      return { 
        success: false, 
        error: new Error(errorMessage) 
      };
    }

    // Validate phone number (basic check)
    if (!to || to.trim().length < 10) {
      console.error('Invalid phone number format:', to);
      return { 
        success: false, 
        error: new Error('Invalid phone number format. Please include country code (e.g., +1 for US).') 
      };
    }

    // Format date if needed
    const formattedDueDate = dueDate instanceof Date 
      ? dueDate.toLocaleDateString()
      : new Date(dueDate).toLocaleDateString();
    
    // Format amount properly
    const formattedAmount = typeof amount === 'number' ? amount.toFixed(2) : amount;
    
    // Create the SMS message
    const messageBody = `Invoice #${invoiceNumber} for ${clientName}
Amount: $${formattedAmount}
Due Date: ${formattedDueDate}
Thank you for your business!`;
    
    // Standardize phone number format if needed
    let formattedPhoneNumber = to;
    if (!to.startsWith('+')) {
      // Assume US number if no country code (this is a basic assumption)
      formattedPhoneNumber = `+1${to.replace(/\D/g, '')}`;
    }
    
    // Send the SMS (we already verified twilioClient exists with isTwilioConfigured)
    const message = await twilioClient!.messages.create({
      body: messageBody,
      from: twilioPhoneNumber,
      to: formattedPhoneNumber
    });
    
    console.log('SMS sent successfully:', message.sid);
    return { success: true, info: message };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error };
  }
}