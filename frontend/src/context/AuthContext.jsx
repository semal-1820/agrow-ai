import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore logged-in user when app reloads
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await api.get(
          '/auth/profile'
        )

        setUser(response.data)
      } catch (error) {
        console.error(
          'Failed to restore session:',
          error
        )

        localStorage.removeItem('token')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  // Real registration
  const register = async ({
    name,
    email,
    password,
    role = 'entrepreneur',
  }) => {
    const response = await api.post(
      '/auth/register',
      {
        name,
        email,
        password,
        role,
      }
    )

    const { token, user } = response.data

    localStorage.setItem(
      'token',
      token
    )

    setUser(user)

    return user
  }

  // Real login
  const login = async ({
    email,
    password,
  }) => {
    const response = await api.post(
      '/auth/login',
      {
        email,
        password,
      }
    )

    const { token, user } = response.data

    localStorage.setItem(
      'token',
      token
    )

    setUser(user)

    return user
  }

  // Logout
  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        register,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    )
  }

  return ctx
}