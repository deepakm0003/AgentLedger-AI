'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Brain, 
  Target, 
  TrendingUp, 
  Zap, 
  Database,
  BarChart3,
  Network,
  Clock,
  Shield,
  AlertTriangle,
  DollarSign,
  Calendar
} from 'lucide-react'

interface Transaction {
  id: string
  amount: number
  description: string
  category: string
  similarity: number
  similarityPercentage: number
  riskLevel: string
  keywords: string[]
}

interface VectorSearchResult {
  query: string
  results: Transaction[]
  searchTime: number
  totalSimilar: number
  totalTransactions: number
  averageSimilarity: number
}

interface VectorStats {
  totalTransactions: number
  transactionsWithEmbeddings: number
  embeddingCoverage: number
  categoryStats: Record<string, number>
  riskStats: Record<string, number>
  categories: string[]
  riskLevels: string[]
  sampleTransactions: Transaction[]
}

export function VectorSearchDemo() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<VectorSearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [stats, setStats] = useState<VectorStats | null>(null)

  // Predefined search suggestions
  const searchSuggestions = [
    'credit card fraud',
    'wire transfer',
    'cryptocurrency',
    'international transfer',
    'bank fraud',
    'identity theft',
    'money laundering',
    'phishing attack',
    'online shopping fraud',
    'investment fraud'
  ]

  // Load stats on component mount
  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/search/vector')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStats(data.stats)
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery
    if (!searchTerm.trim()) return

    setIsSearching(true)
    
    try {
      const response = await fetch('/api/search/vector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchTerm,
          limit: 20
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSearchResults(data)
          setSearchHistory(prev => [searchTerm, ...prev.filter(h => h !== searchTerm).slice(0, 4)])
        }
      } else {
        throw new Error('Search failed')
      }
    } catch (error) {
      console.error('Error performing vector search:', error)
    }

    setIsSearching(false)
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200'
      case 'HIGH': return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-red-100'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200'
    }
  }

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 90) return 'text-green-600 dark:text-green-400'
    if (similarity >= 80) return 'text-yellow-600 dark:text-yellow-400'
    if (similarity >= 70) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-6 animate-fadeInUp">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Brain className="h-6 w-6 text-purple-600" />
            Vector Search Demo
          </CardTitle>
          <CardDescription>
            Search through 100+ fraud transaction patterns using semantic similarity powered by Gemini AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Try: 'credit card fraud', 'wire transfer', 'cryptocurrency'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={() => handleSearch()} 
              disabled={isSearching || !searchQuery.trim()}
              className="btn-gradient"
            >
              {isSearching ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Search Suggestions */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quick searches:</p>
            <div className="flex flex-wrap gap-2">
              {searchSuggestions.slice(0, 6).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery(suggestion)
                    handleSearch(suggestion)
                  }}
                  className="text-xs hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-900/20"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent searches:</p>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((history, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery(history)
                      handleSearch(history)
                    }}
                    className="text-xs text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400"
                  >
                    {history}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="stats-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTransactions}</p>
                </div>
                <Database className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Embedding Coverage</p>
                  <p className="text-2xl font-bold text-green-600">{stats.embeddingCoverage}%</p>
                </div>
                <Brain className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.categories.length}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search Results */}
      {searchResults && (
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Search Results</CardTitle>
                <CardDescription>
                  Found {searchResults.totalSimilar} similar transactions for "{searchResults.query}"
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {searchResults.searchTime}ms
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {searchResults.averageSimilarity}% avg similarity
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchResults.results.map((transaction, index) => (
                <Card key={transaction.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getRiskColor(transaction.riskLevel)}>
                          {transaction.riskLevel}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {transaction.category.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatAmount(transaction.amount)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          <span className={getSimilarityColor(transaction.similarityPercentage)}>
                            {transaction.similarityPercentage}% similar
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {transaction.keywords.slice(0, 5).map((keyword, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {transaction.keywords.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{transaction.keywords.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 text-right">
                      <div className={`text-lg font-bold ${getSimilarityColor(transaction.similarityPercentage)}`}>
                        {transaction.similarityPercentage}%
                      </div>
                      <div className="text-xs text-gray-500">similarity</div>
                    </div>
                  </div>
                </Card>
              ))}
              
              {searchResults.results.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No similar transactions found for this query.</p>
                  <p className="text-sm">Try different keywords or phrases.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}