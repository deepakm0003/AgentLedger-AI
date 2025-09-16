'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { 
  Shield, 
  Upload, 
  Search, 
  BarChart3, 
  FileText, 
  Bell, 
  User, 
  Moon, 
  Sun, 
  Menu, 
  X,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Shield },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'Detect', href: '/detect', icon: Search },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Alerts', href: '/alerts', icon: Bell },
]

export function Navigation() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!session) return null

  return (
    <nav className="glass-card sticky top-0 z-50 border-b border-white/10 dark:border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-3 group">
                <div className="relative">
                  <Shield className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AgentLedger AI
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800/50 transition-all duration-200 group"
                  >
                    <Icon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200">
              <Avatar className="h-8 w-8 ring-2 ring-blue-500/20">
                <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                  {session.user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {session.user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {session.user?.role || 'Compliance Officer'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className="hover:bg-red-100/50 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="sm:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-4">
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800 dark:text-white">
                  {session.user?.name}
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {session.user?.role || 'Compliance Officer'}
                </div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
