import { sendInvoiceEmail } from './email';
import { Invoice } from '../../shared/schema';

/**
 * Options for sending notifications
 */
export interface NotificationOptions {
  sendEmail?: boolean;
  emailAddress?: string;
  // SMS functionality has been removed as per user request
}

/**
 * Send invoice notifications via email
 * @param invoice The invoice data
 * @param options The notification options
 * @returns Results of notification attempts
 */
export async function sendInvoiceNotifications(
  invoice: Invoice,
  options: NotificationOptions
): Promise<{
  email: { sent: boolean, error?: any } | null
}> {
  const result = {
    email: null as { sent: boolean, error?: any } | null
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

  return result;
}