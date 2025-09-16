@echo off
echo 🛡️ AgentLedger AI Setup Script
echo ================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected
node --version

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Check if .env.local exists
if not exist ".env.local" (
    echo 📝 Creating .env.local from template...
    copy env.example .env.local
    echo ⚠️  Please update .env.local with your actual credentials:
    echo    - DATABASE_URL (TiDB Serverless connection string)
    echo    - NEXTAUTH_SECRET (generate a random string)
    echo    - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (Google OAuth)
    echo    - OPENAI_API_KEY (OpenAI API key)
    echo    - SLACK_WEBHOOK_URL (optional, for Slack alerts)
    echo    - EMAIL_SERVICE_API_KEY (optional, for email alerts)
    echo    - NOTION_API_KEY (optional, for Notion alerts)
    echo.
    echo Press Enter to continue after updating .env.local...
    pause
)

REM Generate Prisma client
echo 🔧 Generating Prisma client...
npx prisma generate

REM Push database schema
echo 🗄️  Setting up database schema...
npx prisma db push

REM Seed database with demo data
echo 🌱 Seeding database with demo data...
npm run db:seed

echo.
echo 🎉 Setup complete!
echo.
echo To start the development server:
echo   npm run dev
echo.
echo Then open http://localhost:3000 in your browser
echo.
echo Demo accounts:
echo   Compliance Officer: officer@agentledger.com
echo   Manager: manager@agentledger.com
echo.
echo Happy coding! 🚀
pause
