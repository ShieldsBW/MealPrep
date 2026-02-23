import { getFreshnessStatus } from '../../utils/expirationData'
import { FOOD_GROUPS } from '../../utils/foodGroups'
import { getFoodEmoji } from '../../utils/foodEmojis'

function InventoryGridCard({ item, onEdit, onDelete }) {
  const freshness = getFreshnessStatus(item)
  const emoji = getFoodEmoji(item.name, item.section)

  const borderColor = {
    'fresh': 'border-green-300',
    'expiring-soon': 'border-amber-300',
    'expired': 'border-red-300',
    'unknown': 'border-gray-200',
  }[freshness]

  const freshnessLabel = {
    'fresh': { text: 'Fresh', className: 'bg-green-100 text-green-700' },
    'expiring-soon': { text: 'Expiring', className: 'bg-amber-100 text-amber-700' },
    'expired': { text: 'Expired', className: 'bg-red-100 text-red-700' },
    'unknown': { text: 'No Date', className: 'bg-gray-100 text-gray-600' },
  }[freshness]

  const quantityDisplay = item.amount
    ? `${item.amount} ${item.unit || ''}`.trim()
    : null

  const foodGroup = FOOD_GROUPS.find(g => g.key === item.foodGroup)

  return (
    <div
      onClick={() => onEdit(item)}
      className={`card p-4 border-2 ${borderColor} cursor-pointer hover:shadow-md transition-all flex flex-col items-center text-center`}
    >
      <div className="text-4xl mb-2">{emoji}</div>
      <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
        {item.displayName || item.name}
      </h3>
      {quantityDisplay && (
        <p className="text-xs text-gray-500 mb-2">{quantityDisplay}</p>
      )}
      <span className={`text-xs px-2 py-0.5 rounded-full ${freshnessLabel.className}`}>
        {freshnessLabel.text}
      </span>
      {foodGroup && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 mt-1">
          {foodGroup.emoji} {foodGroup.label}
        </span>
      )}
    </div>
  )
}

export default InventoryGridCard
