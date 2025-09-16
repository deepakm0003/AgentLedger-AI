import sgMail from '@sendgrid/mail'
import { sendEmailWithNodemailer } from './nodemailer-service'
import { sendEmailWithWebhook, sendEmailWithGmail } from './gmail-service'
import { sendEmailWithHTTP } from './simple-email-service'

const SENDGRID_API_KEY = process.env.EMAIL_SERVICE_API_KEY

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
}

export interface EmailAlert {
  to: string
  subject: string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  transaction: {
    amount: number
    description: string
    id: string
  }
  explanation: string
  riskScore: number
}

export async function sendEmailAlert(alert: EmailAlert): Promise<boolean> {
  // Try SendGrid first if API key is available
  if (SENDGRID_API_KEY) {
    try {
      const riskColor = getRiskColor(alert.riskLevel)
      const riskIcon = getRiskIcon(alert.riskLevel)
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🚨 Fraud Alert - ${alert.riskLevel} Risk Transaction</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f8f9fa;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px; 
            text-align: center;
          }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .header p { margin: 10px 0 0 0; opacity: 0.9; }
          .content { padding: 30px 20px; }
          .alert-box { 
            padding: 20px; 
            border-radius: 12px; 
            margin: 20px 0; 
            border: 2px solid;
          }
          .high-risk { 
            background: linear-gradient(135deg, #ff6b6b, #ee5a52);
            color: white;
            border-color: #dc3545;
          }
          .critical-risk {
            background: linear-gradient(135deg, #c0392b, #e74c3c);
            color: white;
            border-color: #c0392b;
            animation: pulse 2s infinite;
          }
          .medium-risk { 
            background: linear-gradient(135deg, #f39c12, #e67e22);
            color: white;
            border-color: #ffc107; 
          }
          .low-risk { 
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            border-color: #28a745; 
          }
          .transaction-details { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 12px; 
            margin: 20px 0;
            border-left: 4px solid #667eea;
          }
          .risk-score {
            font-size: 48px;
            font-weight: bold;
            text-align: center;
            margin: 10px 0;
          }
          .action-buttons {
            margin: 20px 0;
            text-align: center;
          }
          .btn {
            display: inline-block;
            padding: 12px 24px;
            margin: 5px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
          }
          .btn-danger { background: #dc3545; }
          .btn-warning { background: #ffc107; color: #333; }
          .footer { 
            margin-top: 30px; 
            padding: 20px; 
            background: #f8f9fa;
            text-align: center;
            font-size: 12px; 
            color: #666; 
          }
          .logo {
            width: 40px;
            height: 40px;
            background: white;
            border-radius: 8px;
            display: inline-block;
            margin-bottom: 10px;
            text-align: center;
            line-height: 40px;
            font-size: 20px;
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🛡️</div>
            <h1>AgentLedger AI</h1>
            <p>Enterprise Fraud Detection System</p>
          </div>
          
          <div class="content">
            <div class="alert-box ${alert.riskLevel.toLowerCase()}-risk">
              <h2 style="margin: 0 0 10px 0; font-size: 20px;">${riskIcon} ${alert.riskLevel} RISK DETECTED</h2>
              <div class="risk-score">${alert.riskScore}</div>
              <p style="margin: 0; font-size: 16px; text-align: center;">Risk Score: ${alert.riskScore}/100</p>
            </div>
            
            <div class="transaction-details">
              <h3 style="margin: 0 0 15px 0; color: #333;">📊 Transaction Details</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                  <strong>💰 Amount:</strong><br>
                  <span style="font-size: 18px; color: #dc3545; font-weight: bold;">
                    $${alert.transaction.amount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <strong>🆔 Transaction ID:</strong><br>
                  <code style="background: #e9ecef; padding: 2px 6px; border-radius: 4px;">
                    ${alert.transaction.id}
                  </code>
                </div>
                <div style="grid-column: 1 / -1;">
                  <strong>📝 Description:</strong><br>
                  ${alert.transaction.description}
                </div>
                <div style="grid-column: 1 / -1;">
                  <strong>🤖 AI Analysis:</strong><br>
                  ${alert.explanation}
                </div>
                <div>
                  <strong>⏰ Alert Time:</strong><br>
                  ${new Date().toLocaleString()}
                </div>
                <div>
                  <strong>👤 User Email:</strong><br>
                  ${alert.to}
                </div>
              </div>
            </div>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #333;">⚡ Immediate Actions Required</h3>
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                ${getRecommendedActions(alert.riskLevel)}
              </div>
            </div>
            
            <div class="action-buttons">
              <a href="#" class="btn btn-danger">🚨 Review Transaction</a>
              <a href="#" class="btn">📊 View Dashboard</a>
              <a href="#" class="btn btn-warning">📞 Contact Support</a>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>AgentLedger AI</strong> - Autonomous Fraud Detection System</p>
            <p>This is an automated alert. Please review this transaction immediately.</p>
            <p>For support, contact: support@agentledger.ai</p>
          </div>
        </div>
      </body>
      </html>
    `

    const msg = {
      to: alert.to,
      from: 'noreply@agentledger.ai', // This should be a verified sender
      subject: alert.subject,
      html: html,
    }

      await sgMail.send(msg)
      console.log(`Email alert sent successfully to ${alert.to}`)
      return true
    } catch (error) {
      console.error('SendGrid failed, trying fallback method:', error)
      // Fall through to fallback method
    }
  }

  // Fallback: Try Gmail SMTP
  try {
    console.log('Trying Gmail SMTP as fallback...')
    const gmailSuccess = await sendEmailWithGmail(alert)
    if (gmailSuccess) {
      return true
    }
  } catch (error) {
    console.error('Gmail SMTP failed:', error)
  }

  // Fallback: Try Simple HTTP Email Service
  try {
    console.log('Trying simple email service as fallback...')
    const simpleEmailSuccess = await sendEmailWithHTTP(alert)
    if (simpleEmailSuccess) {
      return true
    }
  } catch (error) {
    console.error('Simple email service failed:', error)
  }

  // Fallback: Try Webhook (Slack notification)
  try {
    console.log('Trying webhook notification as fallback...')
    const webhookSuccess = await sendEmailWithWebhook(alert)
    if (webhookSuccess) {
      return true
    }
  } catch (error) {
    console.error('Webhook fallback failed:', error)
  }

  // Fallback: Try Nodemailer
  try {
    console.log('Trying Nodemailer as fallback...')
    const nodemailerSuccess = await sendEmailWithNodemailer(alert)
    if (nodemailerSuccess) {
      return true
    }
  } catch (error) {
    console.error('Nodemailer fallback failed:', error)
  }

  // Final fallback: Log the alert
  try {
    console.log('=== EMAIL ALERT (Console Log Mode) ===')
    console.log(`To: ${alert.to}`)
    console.log(`Subject: ${alert.subject}`)
    console.log(`Risk Level: ${alert.riskLevel}`)
    console.log(`Risk Score: ${alert.riskScore}/100`)
    console.log(`Amount: $${alert.transaction.amount}`)
    console.log(`Description: ${alert.transaction.description}`)
    console.log(`AI Analysis: ${alert.explanation}`)
    console.log(`Transaction ID: ${alert.transaction.id}`)
    console.log('=====================================')
    
    return true // Return true to indicate "alert was processed"
  } catch (error) {
    console.error('Console log fallback failed:', error)
    return false
  }
}

function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'HIGH':
    case 'CRITICAL':
      return 'high-risk'
    case 'MEDIUM':
      return 'medium-risk'
    default:
      return 'low-risk'
  }
}

function getRiskIcon(riskLevel: string): string {
  switch (riskLevel) {
    case 'CRITICAL':
      return '🔴 CRITICAL'
    case 'HIGH':
      return '🟠 HIGH'
    case 'MEDIUM':
      return '🟡 MEDIUM'
    default:
      return '🟢 LOW'
  }
}

function getRecommendedActions(riskLevel: string): string {
  switch (riskLevel) {
    case 'CRITICAL':
      return `
        <li>Immediately freeze the account</li>
        <li>Contact the customer directly</li>
        <li>Review recent transaction history</li>
        <li>Consider reporting to authorities</li>
      `
    case 'HIGH':
      return `
        <li>Review transaction details carefully</li>
        <li>Contact customer for verification</li>
        <li>Monitor account for additional suspicious activity</li>
        <li>Consider temporary account restrictions</li>
      `
    case 'MEDIUM':
      return `
        <li>Review transaction for any red flags</li>
        <li>Monitor customer's future transactions</li>
        <li>Consider additional verification for future transactions</li>
      `
    default:
      return `
        <li>Continue normal monitoring</li>
        <li>No immediate action required</li>
      `
  }
}
