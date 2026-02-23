import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useInventory } from '../context/InventoryContext'
import ShoppingListView from '../components/ShoppingList/ShoppingListView'
import KrogerStoreSelector from '../components/ShoppingList/KrogerStoreSelector'
import { getPackageSize, calculateLeftover } from '../services/kroger'
import { estimateExpiration, suggestSection } from '../utils/expirationData'

function ShoppingList() {
  const { shoppingList, toggleShoppingItem, clearShoppingList, mealPlan } = useApp()
  const { addItems } = useInventory()
  const [addedToPantry, setAddedToPantry] = useState(false)

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

  const checkedItems = enrichedItems.filter(item => item.checked)

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your shopping list?')) {
      clearShoppingList()
    }
  }

  const handleAddToPantry = () => {
    const today = new Date().toISOString().split('T')[0]
    const inventoryItems = checkedItems.map(item => ({
      name: (item.name || '').toLowerCase(),
      displayName: item.name,
      section: suggestSection(item.name),
      amount: item.amount || null,
      unit: item.unit || null,
      purchasedDate: today,
      expirationDate: estimateExpiration(item.name, today),
      expirationEstimated: !!estimateExpiration(item.name, today),
      source: 'shopping-list',
    }))
    addItems(inventoryItems)
    setAddedToPantry(true)
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

      {checkedItems.length > 0 && !addedToPantry && (
        <div className="card p-4 bg-green-50 border border-green-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-green-800">
                {checkedItems.length} item{checkedItems.length !== 1 ? 's' : ''} checked off
              </p>
              <p className="text-sm text-green-600">
                Add purchased items to your pantry inventory
              </p>
            </div>
            <button
              onClick={handleAddToPantry}
              className="btn-primary bg-green-600 hover:bg-green-700 whitespace-nowrap flex items-center gap-2"
            >
              <PantryIcon className="w-4 h-4" />
              Add to Pantry
            </button>
          </div>
        </div>
      )}

      {addedToPantry && (
        <div className="card p-4 bg-green-50 border border-green-200 text-center">
          <p className="text-green-700 font-medium">
            Items added to your pantry!
          </p>
          <Link to="/inventory" className="text-sm text-green-600 hover:underline">
            View Pantry
          </Link>
        </div>
      )}
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

function PantryIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )
}

export default ShoppingList
