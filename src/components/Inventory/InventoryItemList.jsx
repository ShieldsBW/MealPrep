import InventoryItemCard from './InventoryItemCard'

function InventoryItemList({ items, onEdit, onDelete }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <BoxIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Items Found
        </h3>
        <p className="text-gray-600">
          Add items to your pantry to start tracking your inventory.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map(item => (
        <InventoryItemCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

function BoxIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )
}

export default InventoryItemList
