import { sendInvoiceEmail } from './email';
import { sendInvoiceSMS } from './sms';
import { Invoice } from '../../shared/schema';

/**
 * Options for sending notifications
 */
export interface NotificationOptions {
  sendEmail?: boolean;
  emailAddress?: string;
  sendSMS?: boolean;
  phoneNumber?: string;
}

/**
 * Send invoice notifications via specified channels
 * @param invoice The invoice data
 * @param options The notification options
 * @returns Results of notification attempts
 */
export async function sendInvoiceNotifications(
  invoice: Invoice,
  options: NotificationOptions
): Promise<{
  email: { sent: boolean, error?: any } | null,
  sms: { sent: boolean, error?: any } | null
}> {
  const result = {
    email: null as { sent: boolean, error?: any } | null,
    sms: null as { sent: boolean, error?: any } | null
  };

  // Check if we need to send an email
  if (options.sendEmail && options.emailAddress) {
    try {
      // Extract line items if available
      const items = invoice.items ? JSON.parse(invoice.items as string) : [];
      
      // Send the email
      const emailResult = await sendInvoiceEmail(
        options.emailAddress,
        invoice.invoiceNumber,
        invoice.clientName,
        invoice.amount,
        invoice.issueDate,
        invoice.dueDate,
        items
      );
      
      result.email = {
        sent: emailResult.success,
        error: emailResult.error
      };
    } catch (error) {
      result.email = {
        sent: false,
        error
      };
    }
  }

  // Check if we need to send an SMS
  if (options.sendSMS && options.phoneNumber) {
    try {
      // Send the SMS
      const smsResult = await sendInvoiceSMS(
        options.phoneNumber,
        invoice.invoiceNumber,
        invoice.clientName,
        invoice.amount,
        invoice.dueDate
      );
      
      result.sms = {
        sent: smsResult.success,
        error: smsResult.error
      };
    } catch (error) {
      result.sms = {
        sent: false,
        error
      };
    }
  }

  return result;
}