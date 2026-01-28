import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { loadFromStorage, saveToStorage } from '../utils/storage'
import { useAuth } from './AuthContext'
import {
  saveFavorites,
  saveCurrentMealPlan,
  saveShoppingList,
  getUserData
} from '../services/firebase'

const AppContext = createContext()

export function AppProvider({ children }) {
  const { user, isAuthenticated } = useAuth()

  const [favorites, setFavorites] = useState(() => {
    return loadFromStorage('favorites') || []
  })

  const [customRecipes, setCustomRecipes] = useState(() => {
    return loadFromStorage('customRecipes') || []
  })

  const [mealPlan, setMealPlan] = useState(() => {
    return loadFromStorage('mealPlan') || null
  })

  const [shoppingList, setShoppingList] = useState(() => {
    return loadFromStorage('shoppingList') || []
  })

  const [isLoading, setIsLoading] = useState(false)

  // Load user data from Firestore when authenticated
  useEffect(() => {
    async function loadUserData() {
      if (isAuthenticated && user) {
        setIsLoading(true)
        try {
          const userData = await getUserData(user.uid)
          if (userData) {
            if (userData.favorites) setFavorites(userData.favorites)
            if (userData.currentMealPlan) setMealPlan(userData.currentMealPlan)
            if (userData.shoppingList) setShoppingList(userData.shoppingList)
            if (userData.customRecipes) setCustomRecipes(userData.customRecipes)
          }
        } catch (err) {
          console.error('Error loading user data:', err)
        } finally {
          setIsLoading(false)
        }
      }
    }
    loadUserData()
  }, [isAuthenticated, user])

  // Save to localStorage (always) and Firestore (if authenticated)
  useEffect(() => {
    saveToStorage('favorites', favorites)
    if (isAuthenticated && user && !isLoading) {
      saveFavorites(user.uid, favorites).catch(console.error)
    }
  }, [favorites, isAuthenticated, user, isLoading])

  useEffect(() => {
    saveToStorage('customRecipes', customRecipes)
  }, [customRecipes])

  useEffect(() => {
    saveToStorage('mealPlan', mealPlan)
    if (isAuthenticated && user && !isLoading) {
      saveCurrentMealPlan(user.uid, mealPlan).catch(console.error)
    }
  }, [mealPlan, isAuthenticated, user, isLoading])

  useEffect(() => {
    saveToStorage('shoppingList', shoppingList)
    if (isAuthenticated && user && !isLoading) {
      saveShoppingList(user.uid, shoppingList).catch(console.error)
    }
  }, [shoppingList, isAuthenticated, user, isLoading])

  const addFavorite = useCallback((recipe) => {
    setFavorites(prev => {
      if (prev.some(r => r.id === recipe.id)) return prev
      return [...prev, recipe]
    })
  }, [])

  const removeFavorite = useCallback((recipeId) => {
    setFavorites(prev => prev.filter(r => r.id !== recipeId))
  }, [])

  const isFavorite = useCallback((recipeId) => {
    return favorites.some(r => r.id === recipeId)
  }, [favorites])

  const addCustomRecipe = useCallback((recipe) => {
    const newRecipe = {
      ...recipe,
      id: `custom-${Date.now()}`,
      isCustom: true,
    }
    setCustomRecipes(prev => [...prev, newRecipe])
    return newRecipe
  }, [])

  const updateCustomRecipe = useCallback((recipeId, updates) => {
    setCustomRecipes(prev =>
      prev.map(r => r.id === recipeId ? { ...r, ...updates } : r)
    )
  }, [])

  const deleteCustomRecipe = useCallback((recipeId) => {
    setCustomRecipes(prev => prev.filter(r => r.id !== recipeId))
    setFavorites(prev => prev.filter(r => r.id !== recipeId))
  }, [])

  const updateMealPlan = useCallback((plan) => {
    setMealPlan(plan)
  }, [])

  const clearMealPlan = useCallback(() => {
    setMealPlan(null)
  }, [])

  const updateShoppingList = useCallback((list) => {
    setShoppingList(list)
  }, [])

  const toggleShoppingItem = useCallback((itemId) => {
    setShoppingList(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    )
  }, [])

  const clearShoppingList = useCallback(() => {
    setShoppingList([])
  }, [])

  const value = {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    customRecipes,
    addCustomRecipe,
    updateCustomRecipe,
    deleteCustomRecipe,
    mealPlan,
    updateMealPlan,
    clearMealPlan,
    shoppingList,
    updateShoppingList,
    toggleShoppingItem,
    clearShoppingList,
    isLoading,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
