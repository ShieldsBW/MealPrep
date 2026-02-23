import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { loadFromStorage, saveToStorage } from '../utils/storage'
import { useAuth } from './AuthContext'
import { saveInventory, getUserData } from '../services/firebase'
import { getFreshnessStatus } from '../utils/expirationData'

const InventoryContext = createContext()

export function InventoryProvider({ children }) {
  const { user, isAuthenticated } = useAuth()

  const [inventory, setInventory] = useState(() => {
    return loadFromStorage('inventory') || []
  })

  const [isLoading, setIsLoading] = useState(false)

  // Load from Firestore when authenticated
  useEffect(() => {
    async function loadUserInventory() {
      if (isAuthenticated && user) {
        setIsLoading(true)
        try {
          const userData = await getUserData(user.uid)
          if (userData?.inventory) {
            setInventory(userData.inventory)
          }
        } catch (err) {
          console.error('Error loading inventory:', err)
        } finally {
          setIsLoading(false)
        }
      }
    }
    loadUserInventory()
  }, [isAuthenticated, user])

  // Save to localStorage (always) and Firestore (if authenticated)
  useEffect(() => {
    saveToStorage('inventory', inventory)
    if (isAuthenticated && user && !isLoading) {
      saveInventory(user.uid, inventory).catch(console.error)
    }
  }, [inventory, isAuthenticated, user, isLoading])

  const addItem = useCallback((item) => {
    const newItem = {
      ...item,
      id: item.id || `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setInventory(prev => [...prev, newItem])
    return newItem
  }, [])

  const addItems = useCallback((items) => {
    const newItems = items.map(item => ({
      ...item,
      id: item.id || `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
    setInventory(prev => [...prev, ...newItems])
    return newItems
  }, [])

  const updateItem = useCallback((itemId, updates) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      )
    )
  }, [])

  const removeItem = useCallback((itemId) => {
    setInventory(prev => prev.filter(item => item.id !== itemId))
  }, [])

  const removeItems = useCallback((itemIds) => {
    const idSet = new Set(itemIds)
    setInventory(prev => prev.filter(item => !idSet.has(item.id)))
  }, [])

  const clearSection = useCallback((section) => {
    setInventory(prev => prev.filter(item => item.section !== section))
  }, [])

  const clearAll = useCallback(() => {
    setInventory([])
  }, [])

  const getItemsBySection = useCallback((section) => {
    if (!section || section === 'all') return inventory
    return inventory.filter(item => item.section === section)
  }, [inventory])

  const getExpiringItems = useCallback((withinDays = 3) => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    return inventory.filter(item => {
      if (!item.expirationDate) return false
      const expDate = new Date(item.expirationDate)
      expDate.setHours(0, 0, 0, 0)
      const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24))
      return diffDays >= 0 && diffDays <= withinDays
    })
  }, [inventory])

  const getExpiredItems = useCallback(() => {
    return inventory.filter(item => getFreshnessStatus(item) === 'expired')
  }, [inventory])

  const findMatchingItem = useCallback((name) => {
    const lowerName = name.toLowerCase()
    return inventory.find(item => {
      const itemName = (item.name || '').toLowerCase()
      return itemName === lowerName || itemName.includes(lowerName) || lowerName.includes(itemName)
    })
  }, [inventory])

  const value = {
    inventory,
    isLoading,
    addItem,
    addItems,
    updateItem,
    removeItem,
    removeItems,
    clearSection,
    clearAll,
    getItemsBySection,
    getExpiringItems,
    getExpiredItems,
    findMatchingItem,
  }

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider')
  }
  return context
}
