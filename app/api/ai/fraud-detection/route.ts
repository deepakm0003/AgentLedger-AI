import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { analyzeTransactionWithGemini } from '@/lib/gemini-ai'

interface FraudDetectionRequest {
  amount: number
  description: string
  ip?: string
  userAgent?: string
  timestamp?: string
  userId: string
  merchant?: string
  location?: string
}

interface FraudAnalysis {
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  reasons: string[]
  confidence: number
  recommendations: string[]
  similarTransactions?: any[]
}

// AI-powered fraud detection using OpenAI
async function analyzeTransactionWithAI(transaction: FraudDetectionRequest): Promise<FraudAnalysis> {
  try {
    const prompt = `
Analyze this transaction for potential fraud:

Amount: $${transaction.amount}
Description: ${transaction.description}
IP: ${transaction.ip || 'Unknown'}
User Agent: ${transaction.userAgent || 'Unknown'}
Timestamp: ${transaction.timestamp || new Date().toISOString()}

Please provide a comprehensive fraud analysis including:
1. Risk score (0-100)
2. Risk level (LOW/MEDIUM/HIGH/CRITICAL)
3. Specific reasons for the risk assessment
4. Confidence level (0-100)
5. Recommendations for action

Consider factors like:
- Unusual transaction amounts
- Suspicious descriptions
- Geographic anomalies
- Time-based patterns
- Common fraud patterns
`

    // Use Gemini AI for fraud detection
    const geminiAnalysis = await analyzeTransactionWithGemini({
      amount: transaction.amount,
      description: transaction.description,
      ip: transaction.ip,
      userId: transaction.userId,
      timestamp: transaction.timestamp ? new Date(transaction.timestamp) : undefined,
      merchant: transaction.merchant,
      location: transaction.location,
      device: transaction.userAgent
    })

    // Convert Gemini analysis to the expected format
    return {
      riskScore: geminiAnalysis.riskScore,
      riskLevel: geminiAnalysis.riskLevel,
      reasons: geminiAnalysis.redFlags,
      confidence: geminiAnalysis.confidence,
      recommendations: geminiAnalysis.recommendations
    }

  } catch (error) {
    console.error('Error in AI fraud detection:', error)
    
    // Fallback to rule-based detection
    return fallbackFraudDetection(transaction)
  }
}

// Fallback rule-based fraud detection
function fallbackFraudDetection(transaction: FraudDetectionRequest): FraudAnalysis {
  let riskScore = 0
  const reasons: string[] = []
  const recommendations: string[] = []

  // Amount-based rules
  if (transaction.amount > 10000) {
    riskScore += 30
    reasons.push('High transaction amount')
    recommendations.push('Verify large transaction')
  } else if (transaction.amount > 5000) {
    riskScore += 20
    reasons.push('Moderately high transaction amount')
  }

  // Description-based rules
  const suspiciousKeywords = ['cryptocurrency', 'wire transfer', 'international', 'bitcoin', 'ethereum']
  const description = transaction.description.toLowerCase()
  
  suspiciousKeywords.forEach(keyword => {
    if (description.includes(keyword)) {
      riskScore += 25
      reasons.push(`Suspicious keyword: ${keyword}`)
    }
  })

  // Time-based rules (simplified)
  const hour = new Date(transaction.timestamp || Date.now()).getHours()
  if (hour < 6 || hour > 22) {
    riskScore += 15
    reasons.push('Unusual transaction time')
  }

  // Determine risk level
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  if (riskScore >= 80) riskLevel = 'CRITICAL'
  else if (riskScore >= 60) riskLevel = 'HIGH'
  else if (riskScore >= 30) riskLevel = 'MEDIUM'
  else riskLevel = 'LOW'

  // Add recommendations based on risk level
  if (riskLevel === 'CRITICAL') {
    recommendations.push('Immediate manual review required')
    recommendations.push('Consider blocking transaction')
  } else if (riskLevel === 'HIGH') {
    recommendations.push('Enhanced monitoring required')
    recommendations.push('Additional verification needed')
  } else if (riskLevel === 'MEDIUM') {
    recommendations.push('Monitor closely')
    recommendations.push('Consider additional checks')
  } else {
    recommendations.push('Continue normal processing')
  }

  return {
    riskScore: Math.min(riskScore, 100),
    riskLevel,
    reasons,
    confidence: Math.max(60, 100 - riskScore),
    recommendations
  }
}

// Find similar transactions using vector search
async function findSimilarTransactions(transaction: FraudDetectionRequest) {
  try {
    // Get recent transactions for comparison
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId: { not: transaction.userId }, // Exclude same user
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      take: 100
    })

    // Simple similarity based on amount and description
    const similarTransactions = recentTransactions
      .map(t => {
        const amountSimilarity = 1 - Math.abs(t.amount - transaction.amount) / Math.max(t.amount, transaction.amount)
        const descriptionSimilarity = calculateTextSimilarity(t.description, transaction.description)
        const similarity = (amountSimilarity + descriptionSimilarity) / 2
        
        return {
          ...t,
          similarity
        }
      })
      .filter(t => t.similarity > 0.7)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)

    return similarTransactions

  } catch (error) {
    console.error('Error finding similar transactions:', error)
    return []
  }
}

// Simple text similarity calculation
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(' ')
  const words2 = text2.toLowerCase().split(' ')
  
  const intersection = words1.filter(word => words2.includes(word))
  const union = Array.from(new Set([...words1, ...words2]))
  
  return intersection.length / union.length
}

export async function POST(request: NextRequest) {
  try {
    const body: FraudDetectionRequest = await request.json()
    const { amount, description, ip, userAgent, timestamp, userId } = body

    if (!amount || !description || !userId) {
      return NextResponse.json(
        { success: false, error: 'amount, description, and userId are required' },
        { status: 400 }
      )
    }

    // Perform AI-powered fraud analysis
    const fraudAnalysis = await analyzeTransactionWithAI(body)
    
    // Find similar transactions
    const similarTransactions = await findSimilarTransactions(body)
    fraudAnalysis.similarTransactions = similarTransactions

    // Store the transaction with fraud analysis
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount,
        description,
        ip,
        riskLevel: fraudAnalysis.riskLevel,
        isFraudulent: fraudAnalysis.riskLevel === 'CRITICAL' || fraudAnalysis.riskLevel === 'HIGH'
      }
    })

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        description: transaction.description,
        riskLevel: transaction.riskLevel,
        isFraudulent: transaction.isFraudulent,
        createdAt: transaction.createdAt
      },
      fraudAnalysis,
      similarTransactions
    })

  } catch (error) {
    console.error('Error in fraud detection:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to perform fraud detection' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')

    let whereClause = {}
    if (userId) {
      whereClause = { userId }
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      transactions: transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        description: t.description,
        riskLevel: t.riskLevel,
        isFraudulent: t.isFraudulent,
        createdAt: t.createdAt,
        user: t.user
      }))
    })

  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
