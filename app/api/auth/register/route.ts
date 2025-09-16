import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { HybridAuth } from '@/lib/hybrid-auth'
import { initializeSampleData } from '@/lib/local-storage'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Initialize sample data if needed
    initializeSampleData()

    // Check if user already exists using hybrid auth
    const existing = await HybridAuth.findUserByEmail(email)
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // Create user using hybrid auth
    const user = await HybridAuth.createUser({
      name,
      email,
      password,
      role: role === 'MANAGER' ? 'MANAGER' : 'COMPLIANCE',
    })

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
  }
}


