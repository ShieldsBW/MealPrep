import { useState } from 'react'
import { usePreferences } from '../../context/PreferencesContext'

function RecipeFilters({ filters, onFilterChange }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { DIETARY_OPTIONS, CUISINE_OPTIONS } = usePreferences()

  const handleDietChange = (diet) => {
    const newDiet = filters.diet.includes(diet)
      ? filters.diet.filter(d => d !== diet)
      : [...filters.diet, diet]
    onFilterChange({ ...filters, diet: newDiet })
  }

  const handleCuisineChange = (cuisine) => {
    onFilterChange({
      ...filters,
      cuisine: filters.cuisine === cuisine ? '' : cuisine
    })
  }

  const clearFilters = () => {
    onFilterChange({
      diet: [],
      cuisine: '',
      maxPrepTime: null,
      freezerFriendly: false,
      ostomySafe: false,
    })
  }

  const activeFilterCount = [
    filters.diet.length > 0,
    filters.cuisine !== '',
    filters.maxPrepTime !== null,
    filters.freezerFriendly,
    filters.ostomySafe,
  ].filter(Boolean).length

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-gray-700 font-medium"
        >
          <FilterIcon className="w-5 h-5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
          <ChevronIcon
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-6">
          <div>
            <h4 className="label">Dietary Restrictions</h4>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => handleDietChange(id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.diet.includes(id)
                      ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="label">Cuisine</h4>
            <div className="flex flex-wrap gap-2">
              {CUISINE_OPTIONS.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => handleCuisineChange(cuisine)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.cuisine === cuisine
                      ? 'bg-secondary-100 text-secondary-700 border-2 border-secondary-500'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="label">Max Prep Time</h4>
              <select
                value={filters.maxPrepTime || ''}
                onChange={(e) => onFilterChange({
                  ...filters,
                  maxPrepTime: e.target.value ? parseInt(e.target.value) : null
                })}
                className="input"
              >
                <option value="">Any time</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.freezerFriendly}
                  onChange={(e) => onFilterChange({
                    ...filters,
                    freezerFriendly: e.target.checked
                  })}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700">Freezer-friendly only</span>
              </label>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.ostomySafe}
                  onChange={(e) => onFilterChange({
                    ...filters,
                    ostomySafe: e.target.checked
                  })}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700">Ostomy/Ileostomy safe</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  )
}

function ChevronIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default RecipeFilters
