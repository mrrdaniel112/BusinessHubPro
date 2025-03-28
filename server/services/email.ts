import nodemailer from 'nodemailer';

// Helper function to create transporter
function createTransporter() {
  // Check for Gmail configuration
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    console.log('Using Gmail SMTP configuration');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD // This should be an app password, not the regular Gmail password
      }
    });
  }
  
  // Fallback to Ethereal for testing/development
  console.log('Using Ethereal test mail configuration');
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'demo_user@example.com',
      pass: process.env.EMAIL_PASSWORD || 'demo_password'
    }
  });
}

// Create the transporter object
const transporter = createTransporter();

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
    // Check if email configuration is available
    if (!process.env.GMAIL_USER && !process.env.GMAIL_APP_PASSWORD && 
        !process.env.EMAIL_USER && !process.env.EMAIL_PASSWORD) {
      console.error('Email configuration missing. Set GMAIL_USER and GMAIL_APP_PASSWORD or EMAIL_USER and EMAIL_PASSWORD.');
      return { 
        success: false, 
        error: new Error('Email configuration missing. Please configure email credentials in the environment.') 
      };
    }
    
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
          ${items.map(item => {
            // Safe handling of values
            const price = typeof item.price === 'number' ? item.price : 0;
            const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
            
            return `
              <tr>
                <td>${item.description || 'Item'}</td>
                <td align="right">${quantity}</td>
                <td align="right">$${price.toFixed(2)}</td>
                <td align="right">$${(quantity * price).toFixed(2)}</td>
              </tr>
            `;
          }).join('')}
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
    
    // Validate email address
    if (!to || !to.includes('@')) {
      console.error('Invalid email address:', to);
      return { 
        success: false, 
        error: new Error('Invalid recipient email address') 
      };
    }
    
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