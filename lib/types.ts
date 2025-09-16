import { User } from '@prisma/client'

export type UserRole = 'COMPLIANCE' | 'MANAGER'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type AlertChannel = 'SLACK' | 'EMAIL' | 'NOTION'
export type AlertStatus = 'PENDING' | 'DELIVERED' | 'FAILED'

export interface ExtendedUser extends User {
  role: UserRole
}

export interface TransactionWithUser {
  id: string
  userId: string
  amount: number
  ip?: string
  description: string
  embedding?: string
  riskLevel: RiskLevel
  isFraudulent: boolean
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string
    email: string
  }
}

export interface ReportWithDetails {
  id: string
  transactionId: string
  userId: string
  title: string
  explanation: string
  riskScore: number
  similarCases: string
  createdAt: Date
  updatedAt: Date
  transaction: {
    id: string
    amount: number
    description: string
    userId: string
  }
  user: {
    name: string
    email: string
  }
}

export interface AlertWithReport {
  id: string
  reportId?: string
  userId: string
  channel: AlertChannel
  message: string
  status: AlertStatus
  sentAt?: Date
  createdAt: Date
  report?: {
    id: string
    title: string
  }
}

export interface FraudAnalysis {
  riskLevel: RiskLevel
  riskScore: number
  explanation: string
  similarCases: Array<{
    id: string
    amount: number
    description: string
    riskLevel: RiskLevel
    similarity: number
  }>
}

export interface DashboardStats {
  totalTransactions: number
  fraudulentTransactions: number
  alertsSent: number
  totalAmount: number
  recentTransactions: Array<{
    id: string
    amount: number
    description: string
    riskLevel: RiskLevel
    createdAt: string
  }>
  fraudTrend: Array<{
    date: string
    count: number
  }>
}

export interface AnalyticsData {
  totalTransactions: number
  fraudulentTransactions: number
  totalAmount: number
  fraudRate: number
  weeklyTrend: Array<{
    date: string
    transactions: number
    fraudulent: number
  }>
  riskDistribution: {
    low: number
    medium: number
    high: number
    critical: number
  }
  topFraudKeywords: Array<{
    keyword: string
    count: number
  }>
  userActivity: Array<{
    userId: string
    transactionCount: number
    fraudCount: number
  }>
}
