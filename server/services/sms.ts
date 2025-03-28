import twilio from 'twilio';

// Initialize Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';

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
    if (!twilioClient || !twilioPhoneNumber) {
      throw new Error('Twilio is not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER');
    }

    // Format date if needed
    const formattedDueDate = dueDate instanceof Date 
      ? dueDate.toLocaleDateString()
      : new Date(dueDate).toLocaleDateString();
    
    // Create the SMS message
    const messageBody = `Invoice #${invoiceNumber} for ${clientName}
Amount: $${typeof amount === 'number' ? amount.toFixed(2) : amount}
Due Date: ${formattedDueDate}
Thank you for your business!`;
    
    // Send the SMS
    const message = await twilioClient.messages.create({
      body: messageBody,
      from: twilioPhoneNumber,
      to
    });
    
    console.log('SMS sent successfully:', message.sid);
    return { success: true, info: message };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error };
  }
}