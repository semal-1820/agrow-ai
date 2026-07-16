import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // { name, role: 'entrepreneur' | 'officer', ... }

  const login = ({ email, role, name }) => {
    setUser({ name: name || (role === 'officer' ? 'Officer Singh' : 'Ramesh Kumar'), email, role })
  }
  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
