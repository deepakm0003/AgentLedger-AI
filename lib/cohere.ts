import { CohereClient } from 'cohere-ai'

const COHERE_API_KEY = process.env.COHERE_API_KEY
const cohere = COHERE_API_KEY ? new CohereClient({ token: COHERE_API_KEY }) : null

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!cohere) return []
  
  try {
    const response = await cohere.embed({
      texts: [text],
      model: 'embed-english-v3.0',
    })
    return response.embeddings[0]
  } catch (error: any) {
    console.error('Cohere API error:', error.message)
    return []
  }
}

export async function analyzeFraudRisk(
  transaction: {
    amount: number
    description: string
    ip?: string
    userId: string
  },
  similarCases: any[]
): Promise<{
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  explanation: string
  riskScore: number
}> {
  if (!cohere) {
    return getHeuristicAnalysis(transaction)
  }

  try {
    const prompt = `Analyze this transaction for fraud risk:

Transaction Details:
- Amount: $${transaction.amount}
- Description: ${transaction.description}
- User ID: ${transaction.userId}
- IP: ${transaction.ip || 'Unknown'}

Please provide a risk assessment with:
1. Risk Level (LOW, MEDIUM, HIGH, or CRITICAL)
2. Risk Score (0-100)
3. Brief explanation

Respond in JSON format: {"riskLevel": "LOW|MEDIUM|HIGH|CRITICAL", "riskScore": 85, "explanation": "..."}`

    const response = await cohere.generate({
      model: 'command',
      prompt: prompt,
      max_tokens: 200,
      temperature: 0.3,
    })

    const result = response.generations[0].text
    try {
      const parsed = JSON.parse(result)
      return {
        riskLevel: parsed.riskLevel || 'LOW',
        explanation: parsed.explanation || 'No explanation provided',
        riskScore: parsed.riskScore || 0,
      }
    } catch {
      // If JSON parsing fails, use heuristic
      return getHeuristicAnalysis(transaction)
    }
  } catch (error: any) {
    console.error('Cohere API error:', error.message)
    return getHeuristicAnalysis(transaction)
  }
}

function getHeuristicAnalysis(transaction: {
  amount: number
  description: string
  ip?: string
  userId: string
}): {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  explanation: string
  riskScore: number
} {
  const highKeywords = ['refund', 'chargeback', 'duplicate', 'urgent', 'suspicious']
  const text = `${transaction.description} ${transaction.amount}`.toLowerCase()
  const matches = highKeywords.filter(k => text.includes(k)).length
  const score = Math.min(95, matches * 25 + (transaction.amount > 1000 ? 20 : 0))
  const level = score >= 80 ? 'HIGH' : score >= 50 ? 'MEDIUM' : 'LOW'
  
  return {
    riskLevel: level,
    explanation: `Heuristic analysis: ${matches > 0 ? 'High-risk keywords detected' : 'Standard transaction analysis'}`,
    riskScore: score,
  }
}
