function CostEstimate({ items, totalEstimate }) {
  const checkedCount = items.filter(i => i.checked).length
  const totalCount = items.length
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0

  // Calculate leftover summary
  const itemsWithLeftovers = items.filter(i => i.leftoverInfo?.leftover > 0)
  const hasLeftovers = itemsWithLeftovers.length > 0

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Shopping Progress</h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Items collected</span>
              <span className="font-medium">{checkedCount} / {totalCount}</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {totalEstimate > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Estimated Total</span>
                <span className="text-2xl font-bold text-primary-600">
                  ${totalEstimate.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Based on average prices. Actual cost may vary.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{totalCount}</div>
              <div className="text-xs text-gray-600">Total Items</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{checkedCount}</div>
              <div className="text-xs text-gray-600">Collected</div>
            </div>
          </div>
        </div>
      </div>

      {hasLeftovers && (
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <LeftoverIcon className="w-5 h-5 text-amber-500" />
            Expected Leftovers
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            Based on typical package sizes vs recipe amounts
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {itemsWithLeftovers.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-2 bg-amber-50 rounded-lg text-sm"
              >
                <span className="text-gray-700 capitalize">{item.name}</span>
                <span className="text-amber-700 font-medium">
                  +{formatLeftover(item.leftoverInfo.leftover, item.leftoverInfo.unit)}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3 italic">
            Consider recipes that use these ingredients!
          </p>
        </div>
      )}
    </div>
  )
}

function formatLeftover(amount, unit) {
  if (amount % 1 === 0) {
    return `${amount} ${unit}`
  }
  return `${amount.toFixed(1)} ${unit}`
}

function LeftoverIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  )
}

export default CostEstimate
