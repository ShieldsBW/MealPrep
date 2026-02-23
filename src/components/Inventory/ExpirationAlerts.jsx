import { useInventory } from '../../context/InventoryContext'
import { formatRelativeDate } from '../../utils/expirationData'
import { getFoodEmoji } from '../../utils/foodEmojis'

function ExpirationAlerts() {
  const { getExpiredItems, getExpiringItems, removeItem } = useInventory()

  const expiredItems = getExpiredItems()
  const expiringItems = getExpiringItems(3)

  if (expiredItems.length === 0 && expiringItems.length === 0) {
    return (
      <div className="card p-6 text-center">
        <CheckIcon className="w-10 h-10 mx-auto text-green-500 mb-2" />
        <p className="font-medium text-green-700">All items are fresh!</p>
        <p className="text-sm text-gray-500 mt-1">No expiration warnings</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {expiredItems.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 bg-red-50 border-b border-red-100">
            <h3 className="font-semibold text-red-800 flex items-center gap-2">
              <AlertIcon className="w-4 h-4" />
              Expired ({expiredItems.length})
            </h3>
          </div>
          <ul className="divide-y divide-gray-50">
            {expiredItems.map(item => (
              <li key={item.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {getFoodEmoji(item.name, item.section)} {item.displayName || item.name}
                  </div>
                  <div className="text-xs text-red-600">
                    Expired {formatRelativeDate(item.expirationDate)}
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {expiringItems.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
            <h3 className="font-semibold text-amber-800 flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              Expiring Soon ({expiringItems.length})
            </h3>
          </div>
          <ul className="divide-y divide-gray-50">
            {expiringItems.map(item => (
              <li key={item.id} className="px-4 py-3">
                <div className="text-sm font-medium text-gray-900">
                  {getFoodEmoji(item.name, item.section)} {item.displayName || item.name}
                </div>
                <div className="text-xs text-amber-600">
                  Expires {formatRelativeDate(item.expirationDate)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function AlertIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  )
}

function ClockIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

export default ExpirationAlerts
