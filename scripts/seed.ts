import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo users
  const complianceOfficer = await prisma.user.upsert({
    where: { email: 'officer@agentledger.com' },
    update: {},
    create: {
      email: 'officer@agentledger.com',
      name: 'Alice Kumar',
      role: 'COMPLIANCE',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: 'manager@agentledger.com' },
    update: {},
    create: {
      email: 'manager@agentledger.com',
      name: 'Bob Smith',
      role: 'MANAGER',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
  })

  console.log('✅ Created demo users')

  // Create sample transactions
  const transactions = [
    {
      userId: complianceOfficer.id,
      amount: 150.00,
      ip: '192.168.1.100',
      description: 'Online purchase - Electronics store',
      riskLevel: 'LOW' as const,
      isFraudulent: false,
    },
    {
      userId: complianceOfficer.id,
      amount: 2500.00,
      ip: '10.0.0.1',
      description: 'Refund request - Duplicate purchase claim',
      riskLevel: 'HIGH' as const,
      isFraudulent: true,
    },
    {
      userId: complianceOfficer.id,
      amount: 75.50,
      ip: '172.16.0.1',
      description: 'Subscription payment - Monthly service',
      riskLevel: 'LOW' as const,
      isFraudulent: false,
    },
    {
      userId: complianceOfficer.id,
      amount: 1200.00,
      ip: '203.0.113.1',
      description: 'Chargeback dispute - Product not received',
      riskLevel: 'CRITICAL' as const,
      isFraudulent: true,
    },
    {
      userId: complianceOfficer.id,
      amount: 45.00,
      ip: '198.51.100.1',
      description: 'Regular transaction - Coffee shop',
      riskLevel: 'LOW' as const,
      isFraudulent: false,
    },
  ]

  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: transaction,
    })
  }

  console.log('✅ Created sample transactions')

  // Create sample reports
  const highRiskTransaction = await prisma.transaction.findFirst({
    where: { riskLevel: 'HIGH' }
  })

  const criticalRiskTransaction = await prisma.transaction.findFirst({
    where: { riskLevel: 'CRITICAL' }
  })

  if (highRiskTransaction) {
    await prisma.report.create({
      data: {
        transactionId: highRiskTransaction.id,
        userId: complianceOfficer.id,
        title: 'High Risk Refund Request Detected',
        explanation: 'This transaction matches patterns from 3 previous fraudulent refund claims. The user is requesting a refund for a "duplicate purchase" but our records show only one legitimate transaction. The IP address is associated with previous fraud attempts.',
        riskScore: 85,
        similarCases: JSON.stringify([
          {
            id: 'txn_001',
            amount: 1800.00,
            description: 'Refund request - Duplicate order',
            riskLevel: 'HIGH',
            similarity: 0.92
          },
          {
            id: 'txn_002',
            amount: 2200.00,
            description: 'Refund claim - Product not delivered',
            riskLevel: 'HIGH',
            similarity: 0.88
          }
        ]),
      },
    })
  }

  if (criticalRiskTransaction) {
    await prisma.report.create({
      data: {
        transactionId: criticalRiskTransaction.id,
        userId: complianceOfficer.id,
        title: 'Critical Risk Chargeback Detected',
        explanation: 'This chargeback dispute shows clear signs of fraud. The user claims "product not received" but our delivery records show successful delivery with signature confirmation. The IP address has been flagged in multiple fraud databases.',
        riskScore: 95,
        similarCases: JSON.stringify([
          {
            id: 'txn_003',
            amount: 1500.00,
            description: 'Chargeback - Item not as described',
            riskLevel: 'CRITICAL',
            similarity: 0.95
          }
        ]),
      },
    })
  }

  console.log('✅ Created sample reports')

  // Create sample alerts
  const reports = await prisma.report.findMany()
  
  for (const report of reports) {
    await prisma.alert.create({
      data: {
        reportId: report.id,
        userId: complianceOfficer.id,
        channel: 'SLACK',
        message: `🚨 High Risk Fraud Detected: ${report.title}`,
        status: 'DELIVERED',
        sentAt: new Date(),
      },
    })

    await prisma.alert.create({
      data: {
        reportId: report.id,
        userId: complianceOfficer.id,
        channel: 'EMAIL',
        message: `Fraud Alert: ${report.title} - Risk Score: ${report.riskScore}/100`,
        status: 'DELIVERED',
        sentAt: new Date(),
      },
    })
  }

  console.log('✅ Created sample alerts')

  // Create sample uploaded files
  await prisma.uploadedFile.create({
    data: {
      filename: 'transactions_2024.csv',
      originalName: 'transactions_2024.csv',
      size: 1024 * 50, // 50KB
      type: 'text/csv',
      content: JSON.stringify({
        type: 'csv',
        headers: ['transaction_id', 'user_id', 'amount', 'description', 'ip_address'],
        rows: [
          ['TXN001', 'user_123', '150.00', 'Online purchase', '192.168.1.1'],
          ['TXN002', 'user_456', '2500.00', 'Refund request', '10.0.0.1'],
          ['TXN003', 'user_789', '75.50', 'Subscription payment', '172.16.0.1'],
        ]
      }),
      uploadedBy: complianceOfficer.id,
    },
  })

  console.log('✅ Created sample uploaded files')

  console.log('🎉 Database seeded successfully!')
  console.log('\nDemo accounts:')
  console.log('Compliance Officer: officer@agentledger.com')
  console.log('Manager: manager@agentledger.com')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
