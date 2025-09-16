'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  XCircle,
  Slack,
  Mail,
  FileText,
  Filter,
  Search,
  Send,
  AlertTriangle,
  Shield,
  Eye,
  DollarSign
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Navigation } from '@/components/navigation'
import { formatDate, formatCurrency, getRiskColor } from '@/lib/utils'

interface Alert {
  id: string
  channel: 'SLACK' | 'EMAIL' | 'NOTION'
  message: string
  status: 'PENDING' | 'DELIVERED' | 'FAILED'
  sentAt: string | null
  createdAt: string
  report?: {
    id: string
    title: string
    riskLevel: string
    riskScore: number
    explanation: string
    transaction: {
      id: string
      amount: number
      description: string
    }
  }
}

export default function AlertsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [channelFilter, setChannelFilter] = useState('ALL')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchAlerts()
    }
  }, [status, router])

  useEffect(() => {
    filterAlerts()
  }, [alerts, searchTerm, statusFilter, channelFilter])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts')
      if (response.ok) {
        const data = await response.json()
        setAlerts(data)
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAlerts = () => {
    let filtered = alerts

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.channel.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(alert => alert.status === statusFilter)
    }

    // Channel filter
    if (channelFilter !== 'ALL') {
      filtered = filtered.filter(alert => alert.channel === channelFilter)
    }

    setFilteredAlerts(filtered)
  }

  const sendTestAlert = async (channel: 'SLACK' | 'EMAIL' | 'NOTION') => {
    try {
      const response = await fetch('/api/alerts/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel,
          message: `Test alert from AgentLedger AI - ${new Date().toLocaleString()}`,
          type: 'TEST'
        })
      })

      if (response.ok) {
        // Refresh alerts list
        fetchAlerts()
      }
    } catch (error) {
      console.error('Failed to send test alert:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'SLACK':
        return <Slack className="h-4 w-4" />
      case 'EMAIL':
        return <Mail className="h-4 w-4" />
      case 'NOTION':
        return <FileText className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Alerts Center
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Monitor and manage fraud detection alerts sent to external channels.
            </p>
          </div>

          {/* High-Risk Detection Summary */}
          <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-800 dark:text-red-200">
                <AlertTriangle className="h-5 w-5" />
                <span>High-Risk Detection Summary</span>
              </CardTitle>
              <CardDescription className="text-red-700 dark:text-red-300">
                Recent high-risk transactions that triggered automatic email alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {alerts.filter(a => a.report?.riskLevel === 'HIGH' || a.report?.riskLevel === 'CRITICAL').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    High-Risk Alerts
                  </div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {alerts.filter(a => a.status === 'DELIVERED').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Emails Sent
                  </div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {alerts.filter(a => a.channel === 'EMAIL').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Email Alerts
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters and Actions */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search alerts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="FAILED">Failed</option>
                  </select>

                  <select
                    value={channelFilter}
                    onChange={(e) => setChannelFilter(e.target.value)}
                    className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="ALL">All Channels</option>
                    <option value="SLACK">Slack</option>
                    <option value="EMAIL">Email</option>
                    <option value="NOTION">Notion</option>
                  </select>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => sendTestAlert('SLACK')}
                  >
                    <Slack className="h-4 w-4 mr-2" />
                    Test Slack
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => sendTestAlert('EMAIL')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Test Email
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => sendTestAlert('NOTION')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Test Notion
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No alerts found
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    {alerts.length === 0 
                      ? "No alerts have been sent yet. Alerts will appear here when fraud is detected."
                      : "No alerts match your current filters. Try adjusting your search criteria."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredAlerts.map((alert) => (
                <Card key={alert.id} className={alert.report?.riskLevel === 'HIGH' || alert.report?.riskLevel === 'CRITICAL' ? 'border-red-200 bg-red-50 dark:bg-red-900/20' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(alert.status)}
                          <div className="flex items-center space-x-2">
                            {getChannelIcon(alert.channel)}
                            <span className="font-medium">{alert.channel}</span>
                          </div>
                          <Badge className={getStatusColor(alert.status)}>
                            {alert.status}
                          </Badge>
                          {alert.report && (
                            <Badge className={getRiskColor(alert.report.riskLevel)}>
                              {alert.report.riskLevel} RISK
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-900 dark:text-white mb-4">
                          {alert.message}
                        </p>

                        {/* High-Risk Transaction Details */}
                        {alert.report && (alert.report.riskLevel === 'HIGH' || alert.report.riskLevel === 'CRITICAL') && (
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-200 mb-4">
                            <div className="flex items-center space-x-2 mb-3">
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                              <h4 className="font-semibold text-red-800 dark:text-red-200">
                                High-Risk Transaction Details
                              </h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">
                                  <span className="font-medium">Amount:</span> {formatCurrency(alert.report.transaction.amount)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Shield className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">
                                  <span className="font-medium">Risk Score:</span> {alert.report.riskScore}/100
                                </span>
                              </div>
                              <div className="md:col-span-2">
                                <span className="text-sm">
                                  <span className="font-medium">Description:</span> {alert.report.transaction.description}
                                </span>
                              </div>
                              <div className="md:col-span-2">
                                <span className="text-sm">
                                  <span className="font-medium">AI Analysis:</span> {alert.report.explanation}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Created: {formatDate(new Date(alert.createdAt))}</span>
                          {alert.sentAt && (
                            <span>Sent: {formatDate(new Date(alert.sentAt))}</span>
                          )}
                          {alert.report && (
                            <span>Report: {alert.report.title}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        {alert.status === 'FAILED' && (
                          <Button variant="outline" size="sm">
                            <Send className="h-4 w-4 mr-2" />
                            Retry
                          </Button>
                        )}
                        {alert.report && (
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Report
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Summary Stats */}
          {filteredAlerts.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Alert Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {filteredAlerts.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Alerts
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {filteredAlerts.filter(a => a.status === 'DELIVERED').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Delivered
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {filteredAlerts.filter(a => a.status === 'PENDING').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Pending
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {filteredAlerts.filter(a => a.status === 'FAILED').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Failed
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
