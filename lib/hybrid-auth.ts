import { userStorage } from './local-storage'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export interface User {
  id: string
  name: string
  email: string
  role: 'COMPLIANCE' | 'MANAGER'
  passwordHash?: string
  image?: string
  createdAt: string
}

export class HybridAuth {
  // Try database first, fallback to local storage
  static async findUserByEmail(email: string): Promise<User | null> {
    if (typeof window !== 'undefined') return null // Client-side, return null
    
    try {
      // Try database first
      const dbUser = await prisma.user.findUnique({ where: { email } })
      if (dbUser) {
        return {
          id: dbUser.id,
          name: dbUser.name || '',
          email: dbUser.email,
          role: dbUser.role as 'COMPLIANCE' | 'MANAGER',
          passwordHash: dbUser.passwordHash || undefined,
          image: dbUser.image || undefined,
          createdAt: dbUser.createdAt.toISOString()
        }
      }
    } catch (error) {
      console.log('Database unavailable, using local storage')
    }

    // Fallback to local storage
    return userStorage.getUserByEmail(email) as User | null
  }

  static async findUserById(id: string): Promise<User | null> {
    if (typeof window !== 'undefined') return null // Client-side, return null
    
    try {
      // Try database first
      const dbUser = await prisma.user.findUnique({ where: { id } })
      if (dbUser) {
        return {
          id: dbUser.id,
          name: dbUser.name || '',
          email: dbUser.email,
          role: dbUser.role as 'COMPLIANCE' | 'MANAGER',
          passwordHash: dbUser.passwordHash || undefined,
          image: dbUser.image || undefined,
          createdAt: dbUser.createdAt.toISOString()
        }
      }
    } catch (error) {
      console.log('Database unavailable, using local storage')
    }

    // Fallback to local storage
    return userStorage.getUserById(id) as User | null
  }

  static async createUser(userData: {
    name: string
    email: string
    password: string
    role: 'COMPLIANCE' | 'MANAGER'
  }): Promise<User> {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot create user on client-side')
    }
    
    const passwordHash = await bcrypt.hash(userData.password, 12)
    const user: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      passwordHash,
      createdAt: new Date().toISOString()
    }

    try {
      // Try database first
      const dbUser = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          passwordHash: user.passwordHash,
          role: user.role,
        }
      })
      return {
        id: dbUser.id,
        name: dbUser.name || '',
        email: dbUser.email,
        role: dbUser.role as 'COMPLIANCE' | 'MANAGER',
        passwordHash: dbUser.passwordHash || undefined,
        image: dbUser.image || undefined,
        createdAt: dbUser.createdAt.toISOString()
      }
    } catch (error) {
      console.log('Database unavailable, using local storage')
      // Fallback to local storage
      userStorage.saveUser(user)
      return user
    }
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    if (!user.passwordHash) return false
    return bcrypt.compare(password, user.passwordHash)
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      // Try database first
      const updateData: any = {}
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.email !== undefined) updateData.email = updates.email
      if (updates.role !== undefined) updateData.role = updates.role
      if (updates.image !== undefined) updateData.image = updates.image
      
      const dbUser = await prisma.user.update({
        where: { id: userId },
        data: updateData
      })
      return {
        id: dbUser.id,
        name: dbUser.name || '',
        email: dbUser.email,
        role: dbUser.role as 'COMPLIANCE' | 'MANAGER',
        passwordHash: dbUser.passwordHash || undefined,
        image: dbUser.image || undefined,
        createdAt: dbUser.createdAt.toISOString()
      }
    } catch (error) {
      console.log('Database unavailable, using local storage')
      // Fallback to local storage
      const user = userStorage.getUserById(userId) as User | null
      if (user) {
        const updatedUser = { 
          ...user, 
          ...updates,
          // Ensure image field is properly handled
          image: updates.image !== undefined ? updates.image : user.image
        } as User
        userStorage.saveUser(updatedUser)
        return updatedUser
      }
      return null
    }
  }
}
