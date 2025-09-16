import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getRiskColor(risk?: string): string {
  const value = (risk || 'LOW').toLowerCase()
  switch (value) {
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'critical':
      return 'bg-red-200 text-red-900 border-red-300'
    default:
      return 'bg-green-100 text-green-800 border-green-200'
  }
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}
