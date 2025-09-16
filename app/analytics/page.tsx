'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Users,
  Activity,
  Calendar
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/navigation'
import { formatCurrency } from '@/lib/utils'

interface AnalyticsData {
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

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchAnalytics()
    }
  }, [status, router, timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Analytics Dashboard
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Comprehensive fraud detection analytics and insights.
                </p>
              </div>
              <div className="flex space-x-2">
                {['7d', '30d', '90d'].map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                  >
                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {analytics && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Transactions
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.totalTransactions.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      +12% from last period
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Fraudulent Cases
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {analytics.fraudulentTransactions}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.fraudRate.toFixed(1)}% fraud rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Amount
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(analytics.totalAmount)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      +8% from last period
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Fraud Rate
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.fraudRate.toFixed(2)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <TrendingDown className="inline h-3 w-3 mr-1" />
                      -2.1% from last period
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
                {/* Weekly Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction Trend</CardTitle>
                    <CardDescription>
                      Daily transaction volume and fraud cases over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.weeklyTrend}>
                          <defs>
                            <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                            formatter={(value, name) => [value, name === 'transactions' ? 'Total Transactions' : 'Fraudulent Cases']}
                          />
                          <Area
                            type="monotone"
                            dataKey="transactions"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorTransactions)"
                            strokeWidth={2}
                          />
                          <Area
                            type="monotone"
                            dataKey="fraudulent"
                            stroke="#ef4444"
                            fillOpacity={1}
                            fill="url(#colorFraud)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Distribution</CardTitle>
                    <CardDescription>
                      Breakdown of transactions by risk level
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Low Risk', value: analytics.riskDistribution.low, color: '#10b981' },
                              { name: 'Medium Risk', value: analytics.riskDistribution.medium, color: '#f59e0b' },
                              { name: 'High Risk', value: analytics.riskDistribution.high, color: '#f97316' },
                              { name: 'Critical Risk', value: analytics.riskDistribution.critical, color: '#ef4444' }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {[
                              { name: 'Low Risk', value: analytics.riskDistribution.low, color: '#10b981' },
                              { name: 'Medium Risk', value: analytics.riskDistribution.medium, color: '#f59e0b' },
                              { name: 'High Risk', value: analytics.riskDistribution.high, color: '#f97316' },
                              { name: 'Critical Risk', value: analytics.riskDistribution.critical, color: '#ef4444' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value, name) => [value, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Top Fraud Keywords */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Fraud Keywords</CardTitle>
                    <CardDescription>
                      Most common keywords in fraudulent transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={analytics.topFraudKeywords}
                          layout="horizontal"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" tick={{ fontSize: 12 }} />
                          <YAxis 
                            dataKey="keyword" 
                            type="category" 
                            tick={{ fontSize: 12 }}
                            width={80}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value, name) => [value, 'Occurrences']}
                          />
                          <Bar 
                            dataKey="count" 
                            fill="#ef4444" 
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* User Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>User Activity</CardTitle>
                    <CardDescription>
                      Top users by transaction volume and fraud rate
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={analytics.userActivity.slice(0, 5).map(user => ({
                            ...user,
                            fraudRate: ((user.fraudCount / user.transactionCount) * 100).toFixed(1)
                          }))}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="userId" 
                            tick={{ fontSize: 10 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value, name) => [
                              value, 
                              name === 'transactionCount' ? 'Total Transactions' : 
                              name === 'fraudCount' ? 'Fraud Cases' : 'Fraud Rate (%)'
                            ]}
                          />
                          <Bar 
                            dataKey="transactionCount" 
                            fill="#3b82f6" 
                            radius={[4, 4, 0, 0]}
                            name="transactionCount"
                          />
                          <Bar 
                            dataKey="fraudCount" 
                            fill="#ef4444" 
                            radius={[4, 4, 0, 0]}
                            name="fraudCount"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
