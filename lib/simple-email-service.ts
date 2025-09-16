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

// Simple email service using a public API
export async function sendEmailWithPublicAPI(alert: EmailAlert): Promise<boolean> {
  try {
    // Using a free email service API
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 'service_agentledger',
        template_id: 'template_fraud_alert',
        user_id: 'user_agentledger',
        template_params: {
          to_email: alert.to,
          subject: alert.subject,
          risk_level: alert.riskLevel,
          risk_score: alert.riskScore,
          amount: alert.transaction.amount,
          description: alert.transaction.description,
          transaction_id: alert.transaction.id,
          explanation: alert.explanation,
          alert_time: new Date().toLocaleString(),
        },
      }),
    })

    if (response.ok) {
      console.log('Email sent successfully via public API')
      return true
    } else {
      console.error('Public API email failed:', await response.text())
      return false
    }
  } catch (error) {
    console.error('Public API email error:', error)
    return false
  }
}

// Alternative: Use a simple HTTP email service
export async function sendEmailWithHTTP(alert: EmailAlert): Promise<boolean> {
  try {
    // This is a mock implementation - in reality you'd use a real email service
    const emailData = {
      to: alert.to,
      subject: alert.subject,
      html: generateSimpleEmailHTML(alert),
      text: generateSimpleEmailText(alert),
    }

    // For demo purposes, we'll simulate sending an email
    console.log('=== SIMULATED EMAIL SENT ===')
    console.log('To:', emailData.to)
    console.log('Subject:', emailData.subject)
    console.log('Content:', emailData.text)
    console.log('============================')

    // In a real implementation, you would:
    // 1. Use a service like Resend, SendGrid, or Mailgun
    // 2. Or use a simple SMTP server
    // 3. Or use a webhook to send to Slack/Discord

    return true
  } catch (error) {
    console.error('HTTP email service failed:', error)
    return false
  }
}

function generateSimpleEmailHTML(alert: EmailAlert): string {
  return `
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #dc3545; margin: 0;">🚨 Fraud Alert</h1>
        <p style="margin: 10px 0 0 0; color: #666;">AgentLedger AI has detected a high-risk transaction</p>
      </div>
      
      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
        <h2 style="margin: 0 0 10px 0; color: #856404;">${alert.riskLevel} RISK DETECTED</h2>
        <div style="font-size: 32px; font-weight: bold; color: #dc3545; text-align: center;">${alert.riskScore}/100</div>
      </div>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
        <h3 style="margin: 0 0 15px 0;">Transaction Details</h3>
        <p><strong>Amount:</strong> $${alert.transaction.amount.toLocaleString()}</p>
        <p><strong>Description:</strong> ${alert.transaction.description}</p>
        <p><strong>Transaction ID:</strong> ${alert.transaction.id}</p>
        <p><strong>AI Analysis:</strong> ${alert.explanation}</p>
        <p><strong>Alert Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background: #d1ecf1; border-radius: 8px;">
        <p style="margin: 0; color: #0c5460;"><strong>Action Required:</strong> Please review this transaction immediately and take appropriate action if necessary.</p>
      </div>
      
      <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>AgentLedger AI - Enterprise Fraud Detection System</p>
        <p>This is an automated alert. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `
}

function generateSimpleEmailText(alert: EmailAlert): string {
  return `
🚨 FRAUD ALERT - ${alert.riskLevel} RISK DETECTED

AgentLedger AI has detected a high-risk transaction that requires your attention.

RISK SCORE: ${alert.riskScore}/100

TRANSACTION DETAILS:
- Amount: $${alert.transaction.amount.toLocaleString()}
- Description: ${alert.transaction.description}
- Transaction ID: ${alert.transaction.id}
- AI Analysis: ${alert.explanation}
- Alert Time: ${new Date().toLocaleString()}

ACTION REQUIRED:
Please review this transaction immediately and take appropriate action if necessary.

---
AgentLedger AI - Enterprise Fraud Detection System
This is an automated alert. Please do not reply to this email.
  `
}
