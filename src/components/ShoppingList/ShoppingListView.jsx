import { useMemo } from 'react'
import IngredientGroup from './IngredientGroup'
import CostEstimate from './CostEstimate'

function ShoppingListView({ items, onToggleItem, onClear, onExport, krogerTotal, hasKrogerPrices }) {
  const groupedItems = useMemo(() => {
    const groups = {}
    for (const item of items) {
      const aisle = item.aisle || 'Other'
      if (!groups[aisle]) {
        groups[aisle] = []
      }
      groups[aisle].push(item)
    }

    const aisleOrder = [
      'Produce',
      'Meat',
      'Seafood',
      'Dairy',
      'Bakery',
      'Frozen',
      'Canned',
      'Grains',
      'Pasta',
      'Asian',
      'Spices',
      'Oils',
      'Other',
    ]

    return Object.entries(groups).sort((a, b) => {
      const indexA = aisleOrder.indexOf(a[0])
      const indexB = aisleOrder.indexOf(b[0])
      if (indexA === -1 && indexB === -1) return a[0].localeCompare(b[0])
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      return indexA - indexB
    })
  }, [items])

  const totalEstimate = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0)
  }, [items])

  const handleExport = () => {
    const text = groupedItems
      .map(([aisle, groupItems]) => {
        const itemList = groupItems
          .map(i => `  [ ] ${formatAmount(i.amount, i.unit)} ${i.name}`)
          .join('\n')
        return `${aisle}:\n${itemList}`
      })
      .join('\n\n')

    if (navigator.share) {
      navigator.share({
        title: 'Shopping List',
        text: text,
      }).catch(() => {
        copyToClipboard(text)
      })
    } else {
      copyToClipboard(text)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Shopping list copied to clipboard!')
    })
  }

  if (items.length === 0) {
    return (
      <div className="card p-8 text-center">
        <ShoppingCartIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Shopping List</h3>
        <p className="text-gray-600 mb-4">
          Generate a meal plan first to create your shopping list.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">Shopping List</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="btn-outline flex items-center gap-2"
          >
            <ShareIcon className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={onClear}
            className="btn-outline text-red-600 border-red-600 hover:bg-red-50"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {groupedItems.map(([aisle, groupItems]) => (
            <IngredientGroup
              key={aisle}
              aisle={aisle}
              items={groupItems}
              onToggleItem={onToggleItem}
            />
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <CostEstimate
              items={items}
              totalEstimate={totalEstimate}
              krogerTotal={krogerTotal}
              hasKrogerPrices={hasKrogerPrices}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function formatAmount(amount, unit) {
  if (!amount) return ''
  const formatted = amount % 1 === 0 ? amount : amount.toFixed(2)
  return `${formatted} ${unit}`
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

function ShareIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  )
}

export default ShoppingListView
