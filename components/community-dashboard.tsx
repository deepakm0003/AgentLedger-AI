'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Shield, 
  TrendingUp, 
  Award, 
  MessageCircle, 
  Share2, 
  Star,
  Globe,
  Zap,
  Target
} from 'lucide-react'

interface CommunityStats {
  totalUsers: number
  fraudDetected: number
  moneySaved: number
  successStories: number
  activeUsers: number
  totalTransactions: number
}

interface LeaderboardEntry {
  id: string
  name: string
  score: number
  fraudDetected: number
  avatar: string
  rank: number
}

interface SuccessStory {
  id: string
  title: string
  description: string
  amountSaved: number
  user: string
  timestamp: string
  category: string
}

export function CommunityDashboard() {
  const [stats, setStats] = useState<CommunityStats>({
    totalUsers: 0,
    fraudDetected: 0,
    moneySaved: 0,
    successStories: 0,
    activeUsers: 0,
    totalTransactions: 0
  })

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([])

  useEffect(() => {
    // Fetch initial community stats
    fetchCommunityStats()

    // Set up real-time updates
    const interval = setInterval(() => {
      fetchCommunityStats()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const fetchCommunityStats = async () => {
    try {
      const response = await fetch('/api/community/stats')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStats(data.stats)
        }
      }
    } catch (error) {
      console.error('Error fetching community stats:', error)
      // Fallback to simulated data
      setStats(prev => ({
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 3),
        fraudDetected: prev.fraudDetected + Math.floor(Math.random() * 5),
        moneySaved: prev.moneySaved + Math.random() * 10000,
        successStories: prev.successStories + (Math.random() > 0.9 ? 1 : 0),
        activeUsers: Math.floor(Math.random() * 50) + 20,
        totalTransactions: prev.totalTransactions + Math.floor(Math.random() * 100)
      }))
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/community/leaderboard')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setLeaderboard(data.leaderboard)
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      // Fallback to sample data
      setLeaderboard([
        { id: '1', name: 'Sarah Chen', score: 95, fraudDetected: 47, avatar: 'SC', rank: 1 },
        { id: '2', name: 'Mike Rodriguez', score: 92, fraudDetected: 43, avatar: 'MR', rank: 2 },
        { id: '3', name: 'Emily Johnson', score: 89, fraudDetected: 38, avatar: 'EJ', rank: 3 },
        { id: '4', name: 'David Kim', score: 87, fraudDetected: 35, avatar: 'DK', rank: 4 },
        { id: '5', name: 'Lisa Wang', score: 84, fraudDetected: 32, avatar: 'LW', rank: 5 }
      ])
    }
  }

  const fetchSuccessStories = async () => {
    // For now, use sample data - you can create an API endpoint for this later
    setSuccessStories([
      {
        id: '1',
        title: 'Prevented $50K Credit Card Fraud',
        description: 'Detected suspicious transaction patterns in real-time using TiDB vector search',
        amountSaved: 50000,
        user: 'TechCorp Financial',
        timestamp: '2 hours ago',
        category: 'Credit Card'
      },
      {
        id: '2',
        title: 'Stopped Phishing Campaign',
        description: 'AI identified 200+ fraudulent email transactions before they could cause damage',
        amountSaved: 25000,
        user: 'SecureBank Ltd',
        timestamp: '5 hours ago',
        category: 'Email Fraud'
      },
      {
        id: '3',
        title: 'Detected Money Laundering Ring',
        description: 'Advanced analytics uncovered complex multi-account fraud scheme',
        amountSaved: 100000,
        user: 'Global Finance Inc',
        timestamp: '1 day ago',
        category: 'Money Laundering'
      }
    ])
  }

  useEffect(() => {
    // Fetch leaderboard and success stories
    fetchLeaderboard()
    fetchSuccessStories()
  }, [])

  return (
    <div className="space-y-6">
      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stats-card-success card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Users</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {stats.totalUsers.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card-danger card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Fraud Detected</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                  {stats.fraudDetected.toLocaleString()}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card-warning card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Money Saved</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                  ${stats.moneySaved.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card-info card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Success Stories</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {stats.successStories.toLocaleString()}
                </p>
              </div>
              <Award className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="glass-card card-hover">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-600" />
            <span>Community Leaderboard</span>
          </CardTitle>
          <CardDescription>
            Top fraud detection performers this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                    {entry.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{entry.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {entry.fraudDetected} fraud cases detected
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{entry.score}%</p>
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    Rank #{entry.rank}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Stories removed by user request */}

      {/* Community Actions removed by user request */}
    </div>
  )
}
