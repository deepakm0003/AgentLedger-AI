import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')

// Ensure data directory exists (server-side only)
if (typeof window === 'undefined' && !fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Helper function to read JSON file
function readJsonFile<T>(filePath: string): T[] {
  try {
    if (typeof window !== 'undefined') return [] // Client-side, return empty
    if (!fs.existsSync(filePath)) {
      return []
    }
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error)
    return []
  }
}

// Helper function to write JSON file
function writeJsonFile<T>(filePath: string, data: T[]): void {
  try {
    if (typeof window !== 'undefined') return // Client-side, do nothing
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error)
  }
}

// User data storage
export const userStorage = {
  getUsers: () => readJsonFile(path.join(DATA_DIR, 'users', 'users.json')),
  saveUser: (user: any) => {
    const users = userStorage.getUsers() as any[]
    const existingIndex = users.findIndex((u: any) => u.id === user.id)
    if (existingIndex >= 0) {
      users[existingIndex] = user
    } else {
      users.push(user)
    }
    writeJsonFile(path.join(DATA_DIR, 'users', 'users.json'), users)
  },
  getUserByEmail: (email: string) => {
    const users = userStorage.getUsers() as any[]
    return users.find((u: any) => u.email === email)
  },
  getUserById: (id: string) => {
    const users = userStorage.getUsers() as any[]
    return users.find((u: any) => u.id === id)
  }
}

// Transaction data storage
export const transactionStorage = {
  getTransactions: () => readJsonFile(path.join(DATA_DIR, 'transactions', 'transactions.json')),
  saveTransaction: (transaction: any) => {
    const transactions = transactionStorage.getTransactions() as any[]
    const existingIndex = transactions.findIndex((t: any) => t.id === transaction.id)
    if (existingIndex >= 0) {
      transactions[existingIndex] = transaction
    } else {
      transactions.push(transaction)
    }
    writeJsonFile(path.join(DATA_DIR, 'transactions', 'transactions.json'), transactions)
  },
  getTransactionsByUser: (userId: string) => {
    const transactions = transactionStorage.getTransactions() as any[]
    return transactions.filter((t: any) => t.userId === userId)
  },
  saveTransactions: (transactions: any[]) => {
    writeJsonFile(path.join(DATA_DIR, 'transactions', 'transactions.json'), transactions)
  }
}

// Report data storage
export const reportStorage = {
  getReports: () => readJsonFile(path.join(DATA_DIR, 'reports', 'reports.json')),
  saveReport: (report: any) => {
    const reports = reportStorage.getReports() as any[]
    const existingIndex = reports.findIndex((r: any) => r.id === report.id)
    if (existingIndex >= 0) {
      reports[existingIndex] = report
    } else {
      reports.push(report)
    }
    writeJsonFile(path.join(DATA_DIR, 'reports', 'reports.json'), reports)
  },
  getReportsByUser: (userId: string) => {
    const reports = reportStorage.getReports() as any[]
    return reports.filter((r: any) => r.userId === userId)
  }
}

// Alert data storage
export const alertStorage = {
  getAlerts: () => readJsonFile(path.join(DATA_DIR, 'alerts', 'alerts.json')),
  saveAlert: (alert: any) => {
    const alerts = alertStorage.getAlerts() as any[]
    const existingIndex = alerts.findIndex((a: any) => a.id === alert.id)
    if (existingIndex >= 0) {
      alerts[existingIndex] = alert
    } else {
      alerts.push(alert)
    }
    writeJsonFile(path.join(DATA_DIR, 'alerts', 'alerts.json'), alerts)
  },
  getAlertsByUser: (userId: string) => {
    const alerts = alertStorage.getAlerts() as any[]
    return alerts.filter((a: any) => a.userId === userId)
  }
}

// Upload data storage
export const uploadStorage = {
  getUploads: () => readJsonFile(path.join(DATA_DIR, 'uploads', 'uploads.json')),
  saveUpload: (upload: any) => {
    const uploads = uploadStorage.getUploads() as any[]
    const existingIndex = uploads.findIndex((u: any) => u.id === upload.id)
    if (existingIndex >= 0) {
      uploads[existingIndex] = upload
    } else {
      uploads.push(upload)
    }
    writeJsonFile(path.join(DATA_DIR, 'uploads', 'uploads.json'), uploads)
  },
  getUploadsByUser: (userId: string) => {
    const uploads = uploadStorage.getUploads() as any[]
    return uploads.filter((u: any) => u.uploadedBy === userId)
  }
}

// Initialize with sample data if files don't exist
export function initializeSampleData() {
  if (typeof window !== 'undefined') return // Client-side, do nothing
  
  const usersFile = path.join(DATA_DIR, 'users', 'users.json')
  const transactionsFile = path.join(DATA_DIR, 'transactions', 'transactions.json')
  const reportsFile = path.join(DATA_DIR, 'reports', 'reports.json')
  const alertsFile = path.join(DATA_DIR, 'alerts', 'alerts.json')
  const uploadsFile = path.join(DATA_DIR, 'uploads', 'uploads.json')

  // Initialize users if file doesn't exist
  if (!fs.existsSync(usersFile)) {
    const sampleUsers = [
      {
        id: 'demo-user-1',
        name: 'Demo User',
        email: 'demo@agentledger.ai',
        role: 'COMPLIANCE',
        createdAt: new Date().toISOString(),
        image: null
      }
    ]
    writeJsonFile(usersFile, sampleUsers)
  }

  // Initialize transactions if file doesn't exist
  if (!fs.existsSync(transactionsFile)) {
    const sampleTransactions = [
      {
        id: 'tx-1',
        userId: 'demo-user-1',
        amount: 1250.00,
        description: 'Suspicious refund request from new customer',
        riskLevel: 'HIGH',
        isFraudulent: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx-2',
        userId: 'demo-user-1',
        amount: 89.99,
        description: 'Regular purchase - electronics',
        riskLevel: 'LOW',
        isFraudulent: false,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]
    writeJsonFile(transactionsFile, sampleTransactions)
  }

  // Initialize reports if file doesn't exist
  if (!fs.existsSync(reportsFile)) {
    const sampleReports = [
      {
        id: 'report-1',
        userId: 'demo-user-1',
        transactionId: 'tx-1',
        title: 'High Risk Refund Analysis',
        explanation: 'Multiple red flags detected: new customer, high amount, unusual timing',
        riskScore: 85,
        riskLevel: 'HIGH',
        createdAt: new Date().toISOString()
      }
    ]
    writeJsonFile(reportsFile, sampleReports)
  }

  // Initialize alerts if file doesn't exist
  if (!fs.existsSync(alertsFile)) {
    const sampleAlerts = [
      {
        id: 'alert-1',
        userId: 'demo-user-1',
        reportId: 'report-1',
        channel: 'EMAIL',
        message: 'High risk transaction detected requiring immediate review',
        status: 'DELIVERED',
        createdAt: new Date().toISOString()
      }
    ]
    writeJsonFile(alertsFile, sampleAlerts)
  }

  // Initialize uploads if file doesn't exist
  if (!fs.existsSync(uploadsFile)) {
    writeJsonFile(uploadsFile, [])
  }
}
