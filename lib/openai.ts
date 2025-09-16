import OpenAI from 'openai'

const OPENAI_KEY = process.env.OPENAI_API_KEY
const openai = OPENAI_KEY ? new OpenAI({ apiKey: OPENAI_KEY }) : null

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!openai) return []
  
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })
    return response.data[0].embedding
  } catch (error: any) {
    console.error('OpenAI API error:', error.message)
    // Return empty embedding if API fails (quota exceeded, etc.)
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
  if (!openai) {
    // Fallback when no API key: simple heuristic
    const highKeywords = ['refund', 'chargeback', 'duplicate', 'urgent']
    const text = `${transaction.description} ${transaction.amount}`.toLowerCase()
    const matches = highKeywords.filter(k => text.includes(k)).length
    const score = Math.min(95, matches * 25 + (transaction.amount > 1000 ? 20 : 0))
    const level = score >= 80 ? 'HIGH' : score >= 50 ? 'MEDIUM' : 'LOW'
    return {
      riskLevel: level,
      explanation: 'Heuristic score without LLM (set OPENAI_API_KEY for AI analysis).',
      riskScore: score,
    }
  }

  try {
  const prompt = `
Analyze this transaction for fraud risk:

Transaction Details:
- Amount: $${transaction.amount}
- Description: ${transaction.description}
- User ID: ${transaction.userId}
- IP: ${transaction.ip || 'Unknown'}

Similar Historical Cases:
${similarCases.map((case_, index) => `
Case ${index + 1}:
- Amount: $${case_.amount}
- Description: ${case_.description}
- Risk Level: ${case_.riskLevel}
- Fraudulent: ${case_.isFraudulent}
`).join('\n')}

Please analyze this transaction and provide:
1. Risk Level (LOW, MEDIUM, HIGH, or CRITICAL)
2. A clear explanation of why this risk level was assigned
3. A risk score from 0-100

Consider factors like:
- Amount patterns compared to similar cases
- Description keywords that indicate fraud
- IP address patterns
- Historical fraud patterns
- Unusual transaction characteristics

Respond in JSON format:
{
  "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "explanation": "Detailed explanation...",
  "riskScore": 85
}
`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert fraud detection analyst. Analyze transactions for fraud risk and provide detailed explanations.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
  })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return {
      riskLevel: result.riskLevel || 'LOW',
      explanation: result.explanation || 'No explanation provided',
      riskScore: result.riskScore || 0,
    }
  } catch (error: any) {
    console.error('OpenAI API error (quota exceeded or other):', error.message)
    // Fallback to heuristic when API fails
    const highKeywords = ['refund', 'chargeback', 'duplicate', 'urgent']
    const text = `${transaction.description} ${transaction.amount}`.toLowerCase()
    const matches = highKeywords.filter(k => text.includes(k)).length
    const score = Math.min(95, matches * 25 + (transaction.amount > 1000 ? 20 : 0))
    const level = score >= 80 ? 'HIGH' : score >= 50 ? 'MEDIUM' : 'LOW'
    return {
      riskLevel: level,
      explanation: `Heuristic analysis (OpenAI quota exceeded): ${matches > 0 ? 'High-risk keywords detected' : 'Standard transaction analysis'}`,
      riskScore: score,
    }
  }
}
