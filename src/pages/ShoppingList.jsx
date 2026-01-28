import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ShoppingListView from '../components/ShoppingList/ShoppingListView'
import KrogerStoreSelector from '../components/ShoppingList/KrogerStoreSelector'
import { getPackageSize, calculateLeftover } from '../services/kroger'

function ShoppingList() {
  const { shoppingList, toggleShoppingItem, clearShoppingList, mealPlan } = useApp()

  // Calculate leftovers and enrich items with package size info
  const enrichedItems = useMemo(() => {
    return shoppingList.map(item => {
      const packageSize = getPackageSize(item.name)
      const leftoverInfo = packageSize
        ? calculateLeftover(item.name, item.amount, item.unit, packageSize)
        : null
      return { ...item, packageSize, leftoverInfo }
    })
  }, [shoppingList])

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your shopping list?')) {
      clearShoppingList()
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Shopping List</h1>
      </div>

      <KrogerStoreSelector />

      <ShoppingListView
        items={enrichedItems}
        onToggleItem={toggleShoppingItem}
        onClear={handleClear}
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
