import { useState, useEffect } from 'react'
import { estimateExpiration, suggestSection } from '../../utils/expirationData'
import { FOOD_GROUPS, suggestFoodGroup } from '../../utils/foodGroups'

function AddItemModal({ onClose, onAdd }) {
  const [name, setName] = useState('')
  const [section, setSection] = useState('fridge')
  const [foodGroup, setFoodGroup] = useState('condiments')
  const [amount, setAmount] = useState('')
  const [unit, setUnit] = useState('')
  const [dateMode, setDateMode] = useState('expiration')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')

  // Auto-suggest section and food group when name changes
  useEffect(() => {
    if (name.length >= 3) {
      setSection(suggestSection(name))
      setFoodGroup(suggestFoodGroup(name))
    }
  }, [name])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    let expirationDate = null
    let purchasedDate = null
    let expirationEstimated = false

    if (dateMode === 'expiration' && date) {
      expirationDate = date
    } else if (dateMode === 'purchased' && date) {
      purchasedDate = date
      const estimated = estimateExpiration(name, date)
      if (estimated) {
        expirationDate = estimated
        expirationEstimated = true
      }
    }

    onAdd({
      name: name.trim().toLowerCase(),
      displayName: name.trim(),
      section,
      foodGroup,
      amount: amount ? parseFloat(amount) : null,
      unit: unit || null,
      expirationDate,
      purchasedDate,
      expirationEstimated,
      source: 'manual',
      notes: notes.trim() || null,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add Pantry Item</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Chicken breast"
              className="input w-full"
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="input w-full"
              >
                <option value="fridge">Fridge</option>
                <option value="pantry">Pantry</option>
                <option value="freezer">Freezer</option>
                <option value="spices">Spices</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Food Group
              </label>
              <select
                value={foodGroup}
                onChange={(e) => setFoodGroup(e.target.value)}
                className="input w-full"
              >
                {FOOD_GROUPS.map(({ key, label, emoji }) => (
                  <option key={key} value={key}>{emoji} {label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 2"
                className="input w-full"
                min="0"
                step="any"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g., lbs"
                className="input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Type
            </label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setDateMode('expiration')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  dateMode === 'expiration'
                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                }`}
              >
                Expiration Date
              </button>
              <button
                type="button"
                onClick={() => setDateMode('purchased')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  dateMode === 'purchased'
                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                }`}
              >
                Purchase Date
              </button>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input w-full"
            />
            {dateMode === 'purchased' && date && name && (
              <p className="text-xs text-gray-500 mt-1">
                {estimateExpiration(name, date)
                  ? `Estimated expiration: ${new Date(estimateExpiration(name, date)).toLocaleDateString()}`
                  : 'No expiration estimate available for this item'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              className="input w-full"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim()} className="flex-1 btn-primary disabled:opacity-50">
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CloseIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export default AddItemModal
