function IngredientGroup({ aisle, items, onToggleItem }) {
  const checkedCount = items.filter(i => i.checked).length
  const allChecked = checkedCount === items.length

  return (
    <div className="card overflow-hidden">
      <div className={`px-4 py-3 border-b border-gray-100 ${allChecked ? 'bg-green-50' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{aisle}</h3>
          <span className="text-sm text-gray-600">
            {checkedCount}/{items.length}
          </span>
        </div>
      </div>

      <ul className="divide-y divide-gray-50">
        {items.map((item) => (
          <li key={item.id} className="p-3 hover:bg-gray-50">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => onToggleItem(item.id)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex-1">
                <div className={`font-medium ${item.checked ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                  {formatAmount(item.amount, item.unit)} {item.name}
                </div>
                {item.recipes && item.recipes.length > 0 && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    Used in: {item.recipes.slice(0, 2).join(', ')}
                    {item.recipes.length > 2 && ` +${item.recipes.length - 2} more`}
                  </div>
                )}
              </div>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

function formatAmount(amount, unit) {
  if (!amount) return ''

  const formatted = amount % 1 === 0 ? amount : amount.toFixed(2)

  const fractions = {
    0.25: '1/4',
    0.33: '1/3',
    0.5: '1/2',
    0.67: '2/3',
    0.75: '3/4',
  }

  const decimal = amount % 1
  const whole = Math.floor(amount)

  for (const [key, value] of Object.entries(fractions)) {
    if (Math.abs(decimal - parseFloat(key)) < 0.05) {
      return whole > 0 ? `${whole} ${value} ${unit}` : `${value} ${unit}`
    }
  }

  return `${formatted} ${unit}`
}

export default IngredientGroup
