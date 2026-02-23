import { getFreshnessStatus, formatRelativeDate } from '../../utils/expirationData'

function InventoryItemCard({ item, onEdit, onDelete }) {
  const freshness = getFreshnessStatus(item)

  const freshnessConfig = {
    'fresh': { badge: 'Fresh', className: 'bg-green-100 text-green-700' },
    'expiring-soon': { badge: 'Expiring Soon', className: 'bg-amber-100 text-amber-700' },
    'expired': { badge: 'Expired', className: 'bg-red-100 text-red-700' },
    'unknown': { badge: 'No Date', className: 'bg-gray-100 text-gray-600' },
  }

  const { badge, className: badgeClass } = freshnessConfig[freshness]

  const quantityDisplay = item.amount
    ? `${item.amount} ${item.unit || ''}`.trim()
    : null

  return (
    <div className="card p-4 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-gray-900 truncate">
            {item.displayName || item.name}
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${badgeClass}`}>
            {badge}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          {quantityDisplay ? (
            <span className="text-gray-600">{quantityDisplay}</span>
          ) : (
            <span className="text-amber-600">Quantity unknown</span>
          )}

          {item.expirationDate && (
            <span className="text-gray-500">
              {freshness === 'expired' ? 'Expired ' : 'Expires '}
              {formatRelativeDate(item.expirationDate)}
              {item.expirationEstimated && (
                <span className="text-gray-400 ml-1">(est.)</span>
              )}
            </span>
          )}

          <span className="text-gray-400 capitalize">{item.section}</span>
        </div>

        {item.notes && (
          <p className="text-xs text-gray-400 mt-1 truncate">{item.notes}</p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onEdit(item)}
          className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
          title="Edit item"
        >
          <EditIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          title="Delete item"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function EditIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function TrashIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

export default InventoryItemCard
