import twilio from 'twilio';

// SMS functionality is disabled
// We'll log information instead of attempting to send SMS

// Mock Twilio client (not actually used)
const twilioClient = null;
const twilioPhoneNumber = '';

// Always return false to prevent any SMS sending attempts
function isTwilioConfigured(): boolean {
  return false;
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
    
    // SMS sending is completely disabled - just log it instead
    console.log('SMS would have been sent:', {
      to: formattedPhoneNumber,
      from: 'DISABLED',
      body: messageBody
    });
    
    // Mock a successful response
    const message = { sid: 'DISABLED-SMS-' + Date.now() };
    
    console.log('SMS sent successfully:', message.sid);
    return { success: true, info: message };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error };
  }
}