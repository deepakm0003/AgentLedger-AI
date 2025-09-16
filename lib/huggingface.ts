import { HfInference } from '@huggingface/inference'

const HF_TOKEN = process.env.HUGGINGFACE_API_KEY
const hf = HF_TOKEN ? new HfInference(HF_TOKEN) : null

function deterministicEmbedding(text: string, size = 1536): number[] {
  let s = Array.from(text).reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 2166136261)
  const rnd = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 0xffffffff }
  return Array.from({ length: size }, () => rnd() * 2 - 1)
}

export async function generateEmbedding(text: string): Promise<number[]> {
  // If no token, return deterministic embedding so cosine works
  if (!hf) return deterministicEmbedding(text)
  try {
    const response = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text,
    })
    // Some providers return nested arrays
    const vector = Array.isArray((response as any)[0]) ? (response as number[][])[0] : (response as number[])
    if (!vector || vector.length === 0) return deterministicEmbedding(text)
    // Normalize to 1536 by padding/truncating
    const out = new Array(1536).fill(0).map((_, i) => vector[i] ?? 0)
    return out
  } catch (error: any) {
    console.error('Hugging Face API error:', error.message)
    return deterministicEmbedding(text)
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
  if (!hf) {
    // Fallback when no API key
    return getHeuristicAnalysis(transaction)
  }

  try {
    // Use a more reliable model for text analysis
    const text = `Transaction: ${transaction.description}, Amount: $${transaction.amount}, IP: ${transaction.ip || 'Unknown'}`
    
    // Try sentiment analysis first (more reliable)
    const response = await hf.textClassification({
      model: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
      inputs: text,
    })

    // Convert sentiment to risk score
    let riskScore = 20 // Base score
    
    if (response && response.length > 0) {
      const sentiment = response[0]
      if (sentiment.label === 'LABEL_2') { // Negative sentiment
        riskScore += 40
      } else if (sentiment.label === 'LABEL_1') { // Neutral
        riskScore += 20
      }
    }
    
    // Add amount-based risk
    if (transaction.amount > 1000) riskScore += 25
    if (transaction.amount > 5000) riskScore += 15
    
    // Add keyword-based risk
    const highRiskKeywords = ['urgent', 'suspicious', 'refund', 'chargeback', 'duplicate']
    const textLower = text.toLowerCase()
    const keywordMatches = highRiskKeywords.filter(k => textLower.includes(k)).length
    riskScore += keywordMatches * 15
    
    riskScore = Math.min(95, Math.max(5, riskScore))
    const level = riskScore >= 80 ? 'HIGH' : riskScore >= 50 ? 'MEDIUM' : 'LOW'
    
    return {
      riskLevel: level,
      explanation: `AI-powered fraud analysis: ${keywordMatches > 0 ? 'High-risk keywords detected' : 'Standard transaction analysis'} (Score: ${Math.round(riskScore)})`,
      riskScore,
    }
  } catch (error: any) {
    console.error('Hugging Face API error:', error.message)
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
