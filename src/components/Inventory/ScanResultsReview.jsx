import { useState } from 'react'

function ScanResultsReview({ items, onConfirm, onCancel }) {
  const [editableItems, setEditableItems] = useState(
    items.map((item, i) => ({ ...item, _key: i, included: true }))
  )

  const updateField = (index, field, value) => {
    setEditableItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    )
  }

  const selectedItems = editableItems.filter(item => item.included)

  const handleConfirm = () => {
    const itemsToAdd = selectedItems.map(({ _key, included, ...item }) => ({
      ...item,
      amount: item.amount ? parseFloat(item.amount) : null,
      source: 'scan',
    }))
    onConfirm(itemsToAdd)
  }

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        Review the detected items below. Uncheck items you don&apos;t want to add, and edit any details.
      </p>

      <div className="space-y-3 max-h-[50vh] overflow-y-auto">
        {editableItems.map((item, index) => (
          <div
            key={item._key}
            className={`p-3 rounded-lg border ${
              item.included ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={item.included}
                onChange={(e) => updateField(index, 'included', e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs text-gray-500">Name</label>
                  <input
                    type="text"
                    value={item.displayName}
                    onChange={(e) => {
                      updateField(index, 'displayName', e.target.value)
                      updateField(index, 'name', e.target.value.toLowerCase())
                    }}
                    className="input w-full text-sm"
                    disabled={!item.included}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Amount</label>
                  <input
                    type="number"
                    value={item.amount ?? ''}
                    onChange={(e) => updateField(index, 'amount', e.target.value)}
                    placeholder="?"
                    className={`input w-full text-sm ${!item.amount && item.included ? 'border-amber-300 bg-amber-50' : ''}`}
                    disabled={!item.included}
                    min="0"
                    step="any"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Unit</label>
                  <input
                    type="text"
                    value={item.unit || ''}
                    onChange={(e) => updateField(index, 'unit', e.target.value)}
                    placeholder="?"
                    className="input w-full text-sm"
                    disabled={!item.included}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Section</label>
                  <select
                    value={item.section}
                    onChange={(e) => updateField(index, 'section', e.target.value)}
                    className="input w-full text-sm"
                    disabled={!item.included}
                  >
                    <option value="fridge">Fridge</option>
                    <option value="pantry">Pantry</option>
                    <option value="freezer">Freezer</option>
                    <option value="spices">Spices</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
        <button onClick={onCancel} className="flex-1 btn-outline">
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={selectedItems.length === 0}
          className="flex-1 btn-primary disabled:opacity-50"
        >
          Add {selectedItems.length} Item{selectedItems.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  )
}

export default ScanResultsReview
