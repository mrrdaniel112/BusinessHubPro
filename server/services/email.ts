import nodemailer from 'nodemailer';
import { Contract, Invoice } from '@shared/schema';

// Configure email transporter
let transporter: nodemailer.Transporter;

export function initializeEmailService() {
  // Check if email credentials are available
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('Email service credentials not found. Email functionality will be disabled.');
    return false;
  }

  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    
    console.log('Email service initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize email service:', error);
    return false;
  }
}

export function isEmailServiceAvailable(): boolean {
  return !!transporter;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: { 
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
  }[];
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  if (!isEmailServiceAvailable()) {
    console.error('Email service is not available');
    return false;
  }

  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: options.to,
      subject: options.subject,
      text: options.text || '',
      html: options.html || '',
      attachments: options.attachments || [],
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendContractEmail(contract: Contract, recipientEmail: string): Promise<boolean> {
  if (!isEmailServiceAvailable()) {
    console.error('Email service is not available');
    return false;
  }

  // Format the contract date
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Create HTML for the contract
  const contractHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #444; margin-bottom: 5px;">${contract.title}</h1>
        <p style="color: #666; font-size: 14px;">Contract #${contract.id}</p>
      </div>
      
      <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #444;">Contract Details</h3>
        <p><strong>Client:</strong> ${contract.clientName}</p>
        ${contract.vendorName ? `<p><strong>Vendor:</strong> ${contract.vendorName}</p>` : ''}
        ${contract.startDate ? `<p><strong>Start Date:</strong> ${formatDate(contract.startDate)}</p>` : ''}
        ${contract.expiryDate ? `<p><strong>Expiry Date:</strong> ${formatDate(contract.expiryDate)}</p>` : ''}
        ${contract.value ? `<p><strong>Contract Value:</strong> $${parseFloat(contract.value as string).toLocaleString()}</p>` : ''}
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #444;">Contract Content</h3>
        <div style="white-space: pre-line; color: #333; line-height: 1.5;">
          ${contract.content}
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
        <p style="color: #666; font-size: 13px;">
          This contract was sent via the Business Platform. Please review the contract and respond accordingly.
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: recipientEmail,
    subject: `Contract: ${contract.title}`,
    html: contractHtml,
  });
}

interface InvoiceEmailResult {
  success: boolean;
  error?: any;
}

export async function sendInvoiceEmail(
  recipientEmail: string,
  invoiceNumber: string,
  clientName: string,
  amount: number | string,
  issueDate: Date | string,
  dueDate: Date | string,
  items: any[] = []
): Promise<InvoiceEmailResult> {
  if (!isEmailServiceAvailable()) {
    console.error('Email service is not available');
    return { success: false, error: 'Email service not available' };
  }

  try {
    // Format dates
    const formatDate = (date: Date | string) => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    // Format currency
    const formatCurrency = (value: number | string) => {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      return numValue.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      });
    };

    // Create line items HTML
    let itemsHtml = '';
    if (items && items.length > 0) {
      itemsHtml = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Description</th>
              <th style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">Quantity</th>
              <th style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">Price</th>
              <th style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatCurrency(item.price)}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatCurrency(item.quantity * item.price)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
              <td style="padding: 10px; text-align: right; font-weight: bold;">${formatCurrency(amount)}</td>
            </tr>
          </tfoot>
        </table>
      `;
    }

    // Create HTML for the invoice
    const invoiceHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #444; margin-bottom: 5px;">Invoice #${invoiceNumber}</h1>
          <p style="color: #666; font-size: 14px;">For ${clientName}</p>
        </div>
        
        <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #444;">Invoice Details</h3>
          <p><strong>Invoice Date:</strong> ${formatDate(issueDate)}</p>
          <p><strong>Due Date:</strong> ${formatDate(dueDate)}</p>
          <p><strong>Amount Due:</strong> ${formatCurrency(amount)}</p>
        </div>
        
        ${itemsHtml}
        
        <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #444;">Payment Instructions</h3>
          <p>Please make payment by the due date to avoid any late fees.</p>
          <p>Thank you for your business!</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; font-size: 13px;">
            This invoice was sent via the Business Platform.
          </p>
        </div>
      </div>
    `;

    const emailSent = await sendEmail({
      to: recipientEmail,
      subject: `Invoice #${invoiceNumber} for ${clientName}`,
      html: invoiceHtml,
    });

    return {
      success: emailSent,
      error: emailSent ? undefined : 'Failed to send email'
    };
  } catch (error) {
    console.error('Failed to send invoice email:', error);
    return {
      success: false,
      error
    };
  }
}