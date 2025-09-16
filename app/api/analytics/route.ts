import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
    }

    // Get analytics data for the current user
    const [
      totalTransactions,
      fraudulentTransactions,
      totalAmount,
      riskDistribution,
      weeklyTrend,
    ] = await Promise.all([
      prisma.transaction.count({
        where: { 
          userId: session.user.id,
          createdAt: { gte: startDate } 
        }
      }),
      prisma.transaction.count({
        where: { 
          userId: session.user.id,
          createdAt: { gte: startDate },
          isFraudulent: true 
        }
      }),
      prisma.transaction.aggregate({
        where: { 
          userId: session.user.id,
          createdAt: { gte: startDate } 
        },
        _sum: { amount: true }
      }),
      prisma.transaction.groupBy({
        by: ['riskLevel'],
        where: { 
          userId: session.user.id,
          createdAt: { gte: startDate } 
        },
        _count: { riskLevel: true }
      }),
      // Generate mock weekly trend data
      Promise.resolve(generateWeeklyTrend(startDate, now))
    ])

    // Calculate fraud rate
    const fraudRate = totalTransactions > 0 ? (fraudulentTransactions / totalTransactions) * 100 : 0

    // Format risk distribution
    const riskDist = {
      low: riskDistribution.find(r => r.riskLevel === 'LOW')?._count.riskLevel || 0,
      medium: riskDistribution.find(r => r.riskLevel === 'MEDIUM')?._count.riskLevel || 0,
      high: riskDistribution.find(r => r.riskLevel === 'HIGH')?._count.riskLevel || 0,
      critical: riskDistribution.find(r => r.riskLevel === 'CRITICAL')?._count.riskLevel || 0,
    }

    // Mock top fraud keywords
    const topFraudKeywords = [
      { keyword: 'refund', count: 45 },
      { keyword: 'chargeback', count: 32 },
      { keyword: 'duplicate', count: 28 },
      { keyword: 'urgent', count: 22 },
      { keyword: 'immediate', count: 18 },
    ]

    // Mock user activity
    const userActivity = [
      { userId: 'user_123', transactionCount: 156, fraudCount: 12 },
      { userId: 'user_456', transactionCount: 89, fraudCount: 8 },
      { userId: 'user_789', transactionCount: 134, fraudCount: 5 },
      { userId: 'user_101', transactionCount: 67, fraudCount: 3 },
      { userId: 'user_202', transactionCount: 98, fraudCount: 7 },
    ]

    const analytics = {
      totalTransactions,
      fraudulentTransactions,
      totalAmount: totalAmount._sum.amount || 0,
      fraudRate,
      weeklyTrend,
      riskDistribution: riskDist,
      topFraudKeywords,
      userActivity,
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

function generateWeeklyTrend(startDate: Date, endDate: Date) {
  const trend = []
  const current = new Date(startDate)
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay()
    
    // Weekend patterns (lower activity)
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.6 : 1.0
    
    // Generate more realistic data
    const baseTransactions = Math.floor(Math.random() * 30) + 15
    const baseFraudulent = Math.floor(Math.random() * 5) + 1
    
    trend.push({
      date: current.toISOString().split('T')[0],
      transactions: Math.floor(baseTransactions * weekendMultiplier),
      fraudulent: Math.floor(baseFraudulent * weekendMultiplier),
    })
    
    current.setDate(current.getDate() + 1)
  }
  
  return trend
}
