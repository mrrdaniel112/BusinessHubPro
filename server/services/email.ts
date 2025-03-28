import nodemailer from 'nodemailer';

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email', // For development/testing
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'demo_user@example.com',
    pass: process.env.EMAIL_PASSWORD || 'demo_password'
  }
});

/**
 * Send an invoice email
 * @param to Email address to send to
 * @param invoiceNumber The invoice number
 * @param clientName The client name
 * @param amount The total amount
 * @param issueDate The invoice issue date
 * @param dueDate The invoice due date
 * @param items Optional invoice line items
 * @returns Promise with send info
 */
export async function sendInvoiceEmail(
  to: string,
  invoiceNumber: string,
  clientName: string,
  amount: number | string,
  issueDate: Date | string,
  dueDate: Date | string,
  items?: Array<{ description: string, quantity: number, price: number }>
): Promise<{ success: boolean, info?: any, error?: any }> {
  try {
    // Format dates if needed
    const formattedIssueDate = issueDate instanceof Date 
      ? issueDate.toLocaleDateString()
      : new Date(issueDate).toLocaleDateString();
    
    const formattedDueDate = dueDate instanceof Date 
      ? dueDate.toLocaleDateString()
      : new Date(dueDate).toLocaleDateString();
    
    // Generate HTML for items if provided
    let itemsHtml = '';
    if (items && items.length > 0) {
      itemsHtml = `
        <h3>Invoice Items:</h3>
        <table border="1" cellpadding="5" style="border-collapse: collapse;">
          <tr>
            <th align="left">Description</th>
            <th align="right">Quantity</th>
            <th align="right">Price</th>
            <th align="right">Total</th>
          </tr>
          ${items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td align="right">${item.quantity}</td>
              <td align="right">$${item.price.toFixed(2)}</td>
              <td align="right">$${(item.quantity * item.price).toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
      `;
    }
    
    // Create the email HTML
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Invoice #${invoiceNumber}</h2>
        <p><strong>Client:</strong> ${clientName}</p>
        <p><strong>Amount:</strong> $${typeof amount === 'number' ? amount.toFixed(2) : amount}</p>
        <p><strong>Issue Date:</strong> ${formattedIssueDate}</p>
        <p><strong>Due Date:</strong> ${formattedDueDate}</p>
        ${itemsHtml}
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
          <p>Thank you for your business!</p>
        </div>
      </div>
    `;
    
    // Send the email
    const info = await transporter.sendMail({
      from: '"Business Platform" <noreply@businessplatform.com>',
      to,
      subject: `Invoice #${invoiceNumber} for ${clientName}`,
      html
    });
    
    console.log('Email sent successfully:', info.messageId);
    return { success: true, info };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}