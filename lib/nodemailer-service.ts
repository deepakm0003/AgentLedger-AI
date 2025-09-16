import nodemailer from 'nodemailer'

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

export async function sendEmailWithNodemailer(alert: EmailAlert): Promise<boolean> {
  try {
    // Create a test account (for development)
    // In production, use real SMTP credentials
    const testAccount = await nodemailer.createTestAccount()
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })

    const html = generateEmailHTML(alert)
    
    const info = await transporter.sendMail({
      from: '"AgentLedger AI" <noreply@agentledger.ai>',
      to: alert.to,
      subject: alert.subject,
      html: html,
    })

    console.log('Email sent with Nodemailer:', nodemailer.getTestMessageUrl(info))
    return true
  } catch (error) {
    console.error('Nodemailer failed:', error)
    return false
  }
}

function generateEmailHTML(alert: EmailAlert): string {
  const riskIcon = getRiskIcon(alert.riskLevel)
  
  return `
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
          background: linear-gradient(135deg, #ff6b6b, #ee5a52);
          color: white;
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
          <div class="alert-box">
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
        </div>
        
        <div class="footer">
          <p><strong>AgentLedger AI</strong> - Autonomous Fraud Detection System</p>
          <p>This is an automated alert. Please review this transaction immediately.</p>
        </div>
      </div>
    </body>
    </html>
  `
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
