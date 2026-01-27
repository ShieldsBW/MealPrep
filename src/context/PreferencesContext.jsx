import { createContext, useContext, useState, useEffect } from 'react'
import { loadFromStorage, saveToStorage } from '../utils/storage'

const PreferencesContext = createContext()

const defaultPreferences = {
  dietaryRestrictions: [],
  cuisinePreferences: [],
  proteinPreferences: [],
  mealsPerWeek: 5,
  servingsPerMeal: 4,
  maxPrepTimeMinutes: 60,
  freezerFriendly: false,
}

const DIETARY_OPTIONS = [
  { id: 'crohns-safe', label: "Crohn's/IBD Safe", description: 'Low-fiber, low-residue options' },
  { id: 'dairy-free', label: 'Dairy-Free', description: 'No milk products' },
  { id: 'gluten-free', label: 'Gluten-Free', description: 'No wheat, barley, rye' },
  { id: 'vegetarian', label: 'Vegetarian', description: 'No meat' },
  { id: 'vegan', label: 'Vegan', description: 'No animal products' },
  { id: 'nut-free', label: 'Nut-Free', description: 'No tree nuts or peanuts' },
  { id: 'low-fodmap', label: 'Low-FODMAP', description: 'IBS-friendly' },
]

const CUISINE_OPTIONS = [
  'American',
  'Asian',
  'Chinese',
  'Indian',
  'Italian',
  'Japanese',
  'Korean',
  'Mediterranean',
  'Mexican',
  'Thai',
  'Vietnamese',
]

const PROTEIN_OPTIONS = [
  'Chicken',
  'Beef',
  'Pork',
  'Fish',
  'Shrimp',
  'Tofu',
  'Tempeh',
  'Beans',
  'Eggs',
]

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(() => {
    const saved = loadFromStorage('preferences')
    return saved || defaultPreferences
  })

  useEffect(() => {
    saveToStorage('preferences', preferences)
  }, [preferences])

  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const toggleDietaryRestriction = (restriction) => {
    setPreferences(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter(r => r !== restriction)
        : [...prev.dietaryRestrictions, restriction]
    }))
  }

  const toggleCuisine = (cuisine) => {
    setPreferences(prev => ({
      ...prev,
      cuisinePreferences: prev.cuisinePreferences.includes(cuisine)
        ? prev.cuisinePreferences.filter(c => c !== cuisine)
        : [...prev.cuisinePreferences, cuisine]
    }))
  }

  const toggleProtein = (protein) => {
    setPreferences(prev => ({
      ...prev,
      proteinPreferences: prev.proteinPreferences.includes(protein)
        ? prev.proteinPreferences.filter(p => p !== protein)
        : [...prev.proteinPreferences, protein]
    }))
  }

  const resetPreferences = () => {
    setPreferences(defaultPreferences)
  }

  const value = {
    preferences,
    setPreferences,
    updatePreference,
    toggleDietaryRestriction,
    toggleCuisine,
    toggleProtein,
    resetPreferences,
    DIETARY_OPTIONS,
    CUISINE_OPTIONS,
    PROTEIN_OPTIONS,
  }

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider')
  }
  return context
}
