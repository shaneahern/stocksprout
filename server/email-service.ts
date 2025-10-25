import nodemailer from 'nodemailer';

// Email configuration - using Gmail SMTP for demo purposes
// In production, you'd want to use a dedicated email service like SendGrid, AWS SES, etc.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password', // Use App Password for Gmail
  },
});

export interface PasswordResetEmailData {
  email: string;
  resetToken: string;
  userName?: string;
}

export async function sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${data.resetToken}`;
    
    const mailOptions = {
      from: `"StockSprout" <${process.env.EMAIL_USER || 'noreply@stocksprout.com'}>`,
      to: data.email,
      subject: 'Reset Your StockSprout Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - StockSprout</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding: 20px;
              background-color: #f8f9fa;
              border-radius: 8px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #16a34a;
              margin-bottom: 10px;
            }
            .content {
              background-color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            .button {
              display: inline-block;
              background-color: #2563eb;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
              margin: 20px 0;
            }
            .button:hover {
              background-color: #1d4ed8;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 14px;
              color: #6b7280;
              text-align: center;
            }
            .warning {
              background-color: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 6px;
              padding: 15px;
              margin: 20px 0;
              color: #92400e;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🌱 StockSprout</div>
            <p>Growing the future our kids deserve</p>
          </div>
          
          <div class="content">
            <h2>Reset Your Password</h2>
            
            <p>Hello${data.userName ? ` ${data.userName}` : ''},</p>
            
            <p>We received a request to reset your password for your StockSprout account. If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this password reset, please ignore this email</li>
                <li>Your password will not be changed until you create a new one</li>
              </ul>
            </div>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
            
            <p>Best regards,<br>
            The StockSprout Team</p>
          </div>
          
          <div class="footer">
            <p><strong>StockSprout LLC</strong><br>
            Member NYSE, SIPC, FCC<br>
            700 Sprout Street, Phoenix, AZ 85235</p>
            
            <p>©2025 StockSprout LLC. All rights reserved.</p>
            
            <p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/privacy-policy" style="color: #2563eb;">
                Privacy Policy
              </a>
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Reset Your StockSprout Password
        
        Hello${data.userName ? ` ${data.userName}` : ''},
        
        We received a request to reset your password for your StockSprout account. 
        If you made this request, click the link below to reset your password:
        
        ${resetUrl}
        
        This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
        
        Best regards,
        The StockSprout Team
        
        ---
        StockSprout LLC
        Member NYSE, SIPC, FCC
        700 Sprout Street, Phoenix, AZ 85235
        ©2025 StockSprout LLC. All rights reserved.
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to: ${data.email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    return false;
  }
}

// Test email configuration
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error);
    return false;
  }
}
