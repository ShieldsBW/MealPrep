import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ShoppingListView from '../components/ShoppingList/ShoppingListView'
import KrogerStoreSelector from '../components/ShoppingList/KrogerStoreSelector'
import {
  isKrogerConfigured,
  getSelectedStore,
  analyzeShoppingList,
  getPackageSize,
  calculateLeftover,
} from '../services/kroger'

function ShoppingList() {
  const { shoppingList, toggleShoppingItem, clearShoppingList, mealPlan } = useApp()
  const [krogerData, setKrogerData] = useState(null)
  const [isLoadingPrices, setIsLoadingPrices] = useState(false)
  const [priceError, setPriceError] = useState(null)

  const loadKrogerPrices = useCallback(async () => {
    if (!isKrogerConfigured() || shoppingList.length === 0) return

    const store = getSelectedStore()
    if (!store) return

    setIsLoadingPrices(true)
    setPriceError(null)

    try {
      const data = await analyzeShoppingList(shoppingList, store.id)
      setKrogerData(data)
    } catch (err) {
      console.error('Error loading Kroger prices:', err)
      setPriceError('Failed to load prices. Using estimates.')
      // Still calculate leftovers even without Kroger prices
      const itemsWithLeftovers = shoppingList.map(item => {
        const packageSize = getPackageSize(item.name)
        const leftoverInfo = packageSize
          ? calculateLeftover(item.name, item.amount, item.unit, packageSize)
          : null
        return { ...item, packageSize, leftoverInfo }
      })
      setKrogerData({ items: itemsWithLeftovers, totalPrice: 0 })
    } finally {
      setIsLoadingPrices(false)
    }
  }, [shoppingList])

  useEffect(() => {
    loadKrogerPrices()
  }, [loadKrogerPrices])

  const handleStoreChange = (store) => {
    if (store) {
      loadKrogerPrices()
    } else {
      setKrogerData(null)
    }
  }

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your shopping list?')) {
      clearShoppingList()
      setKrogerData(null)
    }
  }

  if (!mealPlan && shoppingList.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping List</h1>
        <div className="text-center py-12">
          <ShoppingCartIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Shopping List Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Generate a meal plan first to create your shopping list.
          </p>
          <Link to="/meal-plan" className="btn-primary">
            Create Meal Plan
          </Link>
        </div>
      </div>
    )
  }

  // Merge Kroger data with shopping list
  const enrichedItems = krogerData?.items || shoppingList.map(item => ({
    ...item,
    packageSize: getPackageSize(item.name),
    leftoverInfo: null,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Shopping List</h1>
        {isLoadingPrices && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            Loading prices...
          </div>
        )}
      </div>

      {isKrogerConfigured() && (
        <KrogerStoreSelector onStoreChange={handleStoreChange} />
      )}

      {priceError && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          {priceError}
        </div>
      )}

      <ShoppingListView
        items={enrichedItems}
        onToggleItem={toggleShoppingItem}
        onClear={handleClear}
        krogerTotal={krogerData?.totalPrice}
        hasKrogerPrices={Boolean(krogerData && getSelectedStore())}
      />
    </div>
  )
}

function ShoppingCartIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  )
}

export default ShoppingList
