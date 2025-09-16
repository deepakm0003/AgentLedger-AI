import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { channel, message, type } = await request.json()

    if (!channel || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create test alert record
    const alert = await prisma.alert.create({
      data: {
        userId: session.user.id,
        channel: channel as 'SLACK' | 'EMAIL' | 'NOTION',
        message,
        status: 'PENDING',
      }
    })

    // Simulate sending alert (mock implementation)
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock success/failure (90% success rate)
      const success = Math.random() > 0.1
      
      if (success) {
        await prisma.alert.update({
          where: { id: alert.id },
          data: { 
            status: 'DELIVERED',
            sentAt: new Date()
          }
        })
      } else {
        await prisma.alert.update({
          where: { id: alert.id },
          data: { status: 'FAILED' }
        })
      }

      return NextResponse.json({
        success,
        alertId: alert.id,
        message: success ? 'Alert sent successfully' : 'Alert failed to send'
      })
    } catch (error) {
      await prisma.alert.update({
        where: { id: alert.id },
        data: { status: 'FAILED' }
      })
      
      return NextResponse.json(
        { error: 'Failed to send alert' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error sending alert:', error)
    return NextResponse.json(
      { error: 'Failed to send alert' },
      { status: 500 }
    )
  }
}
