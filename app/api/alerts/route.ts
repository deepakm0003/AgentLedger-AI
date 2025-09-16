import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const alerts = await prisma.alert.findMany({
      where: { userId: session.user.id },
      include: {
        report: {
          select: {
            id: true,
            title: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { channel, message, reportId, type = 'FRAUD_DETECTED' } = await request.json()

    if (!channel || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create alert record
    const alert = await prisma.alert.create({
      data: {
        reportId: reportId || null,
        userId: session.user.id,
        channel: channel as 'SLACK' | 'EMAIL' | 'NOTION',
        message,
        status: 'PENDING',
      }
    })

    // Send alert to external service (mock implementation)
    try {
      await sendAlertToExternalService(channel, message, type)
      
      // Update status to delivered
      await prisma.alert.update({
        where: { id: alert.id },
        data: { 
          status: 'DELIVERED',
          sentAt: new Date()
        }
      })
    } catch (error) {
      // Update status to failed
      await prisma.alert.update({
        where: { id: alert.id },
        data: { status: 'FAILED' }
      })
    }

    return NextResponse.json(alert)
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}

async function sendAlertToExternalService(
  channel: string, 
  message: string, 
  type: string
): Promise<void> {
  // Mock implementation - in real app, this would call actual APIs
  
  switch (channel) {
    case 'SLACK':
      // Call Slack webhook
      if (process.env.SLACK_WEBHOOK_URL) {
        const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 AgentLedger AI Alert\n${message}`,
            username: 'AgentLedger AI',
            icon_emoji: ':shield:'
          })
        })
        if (!response.ok) throw new Error('Slack webhook failed')
      }
      break
      
    case 'EMAIL':
      // Call email service
      if (process.env.EMAIL_SERVICE_API_KEY) {
        // Mock email sending
        console.log('Sending email alert:', message)
      }
      break
      
    case 'NOTION':
      // Call Notion API
      if (process.env.NOTION_API_KEY) {
        // Mock Notion page creation
        console.log('Creating Notion page:', message)
      }
      break
      
    default:
      throw new Error(`Unsupported channel: ${channel}`)
  }
}
