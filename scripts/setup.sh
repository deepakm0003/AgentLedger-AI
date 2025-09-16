#!/bin/bash

echo "🛡️ AgentLedger AI Setup Script"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp env.example .env.local
    echo "⚠️  Please update .env.local with your actual credentials:"
    echo "   - DATABASE_URL (TiDB Serverless connection string)"
    echo "   - NEXTAUTH_SECRET (generate a random string)"
    echo "   - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (Google OAuth)"
    echo "   - OPENAI_API_KEY (OpenAI API key)"
    echo "   - SLACK_WEBHOOK_URL (optional, for Slack alerts)"
    echo "   - EMAIL_SERVICE_API_KEY (optional, for email alerts)"
    echo "   - NOTION_API_KEY (optional, for Notion alerts)"
    echo ""
    echo "Press Enter to continue after updating .env.local..."
    read
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push database schema
echo "🗄️  Setting up database schema..."
npx prisma db push

# Seed database with demo data
echo "🌱 Seeding database with demo data..."
npm run db:seed

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "Demo accounts:"
echo "  Compliance Officer: officer@agentledger.com"
echo "  Manager: manager@agentledger.com"
echo ""
echo "Happy coding! 🚀"
