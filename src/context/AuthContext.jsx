import { createContext, useContext, useState, useEffect } from 'react'
import {
  onAuthChange,
  loginUser,
  registerUser,
  logoutUser,
  getUserData
} from '../services/firebase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        try {
          const data = await getUserData(firebaseUser.uid)
          setUserData(data)
        } catch (err) {
          console.error('Error fetching user data:', err)
        }
      } else {
        setUserData(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email, password) => {
    setError(null)
    try {
      await loginUser(email, password)
    } catch (err) {
      setError(getErrorMessage(err.code))
      throw err
    }
  }

  const register = async (email, password, displayName) => {
    setError(null)
    try {
      await registerUser(email, password, displayName)
    } catch (err) {
      setError(getErrorMessage(err.code))
      throw err
    }
  }

  const logout = async () => {
    setError(null)
    try {
      await logoutUser()
    } catch (err) {
      setError(getErrorMessage(err.code))
      throw err
    }
  }

  const clearError = () => setError(null)

  const refreshUserData = async () => {
    if (user) {
      const data = await getUserData(user.uid)
      setUserData(data)
    }
  }

  const value = {
    user,
    userData,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    refreshUserData,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

function getErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please log in instead.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    case 'auth/user-disabled':
      return 'This account has been disabled.'
    case 'auth/user-not-found':
      return 'No account found with this email.'
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.'
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.'
    default:
      return 'An error occurred. Please try again.'
  }
}
