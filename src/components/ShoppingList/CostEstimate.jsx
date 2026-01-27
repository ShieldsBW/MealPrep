function CostEstimate({ items, totalEstimate }) {
  const checkedCount = items.filter(i => i.checked).length
  const totalCount = items.length
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0

  return (
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
  )
}

export default CostEstimate
