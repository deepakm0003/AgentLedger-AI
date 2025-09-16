#!/usr/bin/env node

/**
 * Database Connection Fix Script
 * This script helps fix TiDB connection issues
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 Fixing TiDB Database Connection...')

// Check if .env file exists
const envPath = '.env'
const envExamplePath = 'env.example'

if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!')
  
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Creating .env file from env.example...')
    
    // Read env.example
    const envExample = fs.readFileSync(envExamplePath, 'utf8')
    
    // Update database URL for TiDB Serverless
    const updatedEnv = envExample.replace(
      'DATABASE_URL="mysql://username:password@localhost:4000/agentledger"',
      'DATABASE_URL="mysql://root:your-password@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/agentledger"'
    )
    
    // Write .env file
    fs.writeFileSync(envPath, updatedEnv)
    console.log('✅ .env file created!')
    console.log('📝 Please update the DATABASE_URL with your actual TiDB Serverless connection string')
  } else {
    console.log('❌ env.example not found either!')
    process.exit(1)
  }
} else {
  console.log('✅ .env file exists')
}

// Check DATABASE_URL in .env
const envContent = fs.readFileSync(envPath, 'utf8')

if (envContent.includes('your-password') || envContent.includes('localhost:4000')) {
  console.log('⚠️  DATABASE_URL needs to be updated with actual TiDB Serverless credentials')
  console.log('📋 Current DATABASE_URL:', envContent.match(/DATABASE_URL="[^"]*"/)?.[0])
  console.log('')
  console.log('🚀 To fix this:')
  console.log('1. Go to https://tidbcloud.com/')
  console.log('2. Create a free TiDB Serverless cluster')
  console.log('3. Copy the connection string')
  console.log('4. Update DATABASE_URL in .env file')
  console.log('')
  console.log('💡 Or use SQLite for quick testing:')
  console.log('   DATABASE_URL="file:./prisma/dev.db"')
} else {
  console.log('✅ DATABASE_URL appears to be configured')
}

// Check Prisma schema
const schemaPath = 'prisma/schema.prisma'
if (fs.existsSync(schemaPath)) {
  const schemaContent = fs.readFileSync(schemaPath, 'utf8')
  
  if (schemaContent.includes('provider = "mysql"')) {
    console.log('✅ Prisma schema configured for MySQL/TiDB')
  } else if (schemaContent.includes('provider = "sqlite"')) {
    console.log('✅ Prisma schema configured for SQLite')
  } else {
    console.log('❌ Unknown database provider in Prisma schema')
  }
} else {
  console.log('❌ Prisma schema not found!')
}

console.log('')
console.log('🔧 Next Steps:')
console.log('1. Update DATABASE_URL in .env with your TiDB Serverless connection string')
console.log('2. Run: npx prisma generate')
console.log('3. Run: npx prisma db push')
console.log('4. Run: npm run dev')
console.log('')
console.log('🚀 Your enhanced dashboard will then be fully functional!')
