import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { HybridAuth } from './hybrid-auth'
import { initializeSampleData } from './local-storage'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    // Enable Google only when env vars are present
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          authorization: {
            params: {
              prompt: "consent",
              access_type: "offline",
              response_type: "code"
            }
          },
          httpOptions: {
            timeout: 10000, // 10 seconds timeout
          }
        })]
      : []),
    Credentials({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        // Initialize sample data if needed
        initializeSampleData()
        
        const user = await HybridAuth.findUserByEmail(credentials.email)
        if (!user || !user.passwordHash) return null
        
        const valid = await HybridAuth.verifyPassword(user, credentials.password)
        if (!valid) return null
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        } as any
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow Google OAuth sign-in
      if (account?.provider === 'google') {
        // Initialize sample data if needed
        initializeSampleData()
        
        // Check if user exists in our system, if not create them
        const existingUser = await HybridAuth.findUserByEmail(user.email!)
        if (!existingUser) {
          // Create local account with a random password for OAuth users
          const randomPassword = Math.random().toString(36).slice(-12) + 'A1!'
          const newUser = await HybridAuth.createUser({
            name: user.name || '',
            email: user.email!,
            password: randomPassword,
            role: 'COMPLIANCE',
          })
          // Persist photo if provided
          if (user.image) {
            await HybridAuth.updateUser(newUser.id, { image: user.image })
          }
        }
        return true
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Persist id and role in the token
        token.role = (user as any).role || 'COMPLIANCE'
        token.id = user.id
      }
      return token
    },
    async session({ session, token, user }) {
      // Attach id and role from token/user into session
      if (session.user) {
        session.user.id = (user?.id as string) || (token.id as string) || (token.sub as string)
        session.user.role = (user as any)?.role || (token as any)?.role || 'COMPLIANCE'
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}
