import { useState } from 'react'
import { usePreferences } from '../../context/PreferencesContext'

function MealPlanGenerator({ onGenerate, isGenerating }) {
  const {
    preferences,
    updatePreference,
    toggleDietaryRestriction,
    toggleCuisine,
    toggleProtein,
    DIETARY_OPTIONS,
    CUISINE_OPTIONS,
    PROTEIN_OPTIONS,
  } = usePreferences()

  const [step, setStep] = useState(1)
  const totalSteps = 4

  const handleGenerate = () => {
    onGenerate(preferences)
  }

  return (
    <div className="card p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">Generate Meal Plan</h2>
          <span className="text-sm text-gray-500">Step {step} of {totalSteps}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Basic Settings</h3>

          <div>
            <label className="label">Meals per week</label>
            <input
              type="range"
              min="3"
              max="7"
              value={preferences.mealsPerWeek}
              onChange={(e) => updatePreference('mealsPerWeek', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>3</span>
              <span className="font-medium text-primary-600">{preferences.mealsPerWeek} meals</span>
              <span>7</span>
            </div>
          </div>

          <div>
            <label className="label">Servings per meal</label>
            <input
              type="range"
              min="1"
              max="8"
              value={preferences.servingsPerMeal}
              onChange={(e) => updatePreference('servingsPerMeal', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>1</span>
              <span className="font-medium text-primary-600">{preferences.servingsPerMeal} servings</span>
              <span>8</span>
            </div>
          </div>

          <div>
            <label className="label">Max prep time per meal</label>
            <select
              value={preferences.maxPrepTimeMinutes}
              onChange={(e) => updatePreference('maxPrepTimeMinutes', parseInt(e.target.value))}
              className="input"
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          <div>
            <label className="label">Meals per day</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 1, label: 'Dinner only' },
                { value: 2, label: 'Lunch + Dinner' },
                { value: 3, label: 'All 3 Meals' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updatePreference('mealSlots', value)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    (preferences.mealSlots || 1) === value
                      ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                      : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer mt-4">
            <input
              type="checkbox"
              checked={preferences.freezerFriendly}
              onChange={(e) => updatePreference('freezerFriendly', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-gray-700">Prioritize freezer-friendly meals</span>
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Dietary Restrictions</h3>
          <p className="text-sm text-gray-600">Select all that apply</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DIETARY_OPTIONS.map(({ id, label, description }) => (
              <button
                key={id}
                onClick={() => toggleDietaryRestriction(id)}
                className={`p-4 rounded-xl text-left transition-all ${
                  preferences.dietaryRestrictions.includes(id)
                    ? 'bg-primary-50 border-2 border-primary-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="font-medium text-gray-900">{label}</div>
                <div className="text-sm text-gray-600">{description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Cuisine Preferences</h3>
          <p className="text-sm text-gray-600">Select your favorite cuisines for variety</p>

          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => toggleCuisine(cuisine)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  preferences.cuisinePreferences.includes(cuisine)
                    ? 'bg-secondary-100 text-secondary-700 border-2 border-secondary-500'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Protein Preferences</h3>
          <p className="text-sm text-gray-600">Select proteins you want included</p>

          <div className="flex flex-wrap gap-2">
            {PROTEIN_OPTIONS.map((protein) => (
              <button
                key={protein}
                onClick={() => toggleProtein(protein)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  preferences.proteinPreferences.includes(protein)
                    ? 'bg-orange-100 text-orange-700 border-2 border-orange-500'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {protein}
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>{preferences.mealsPerWeek} meals per week</li>
              <li>{preferences.servingsPerMeal} servings per meal</li>
              <li>
                {(preferences.mealSlots || 1) === 1 && 'Dinner only'}
                {(preferences.mealSlots || 1) === 2 && 'Lunch + Dinner'}
                {(preferences.mealSlots || 1) === 3 && 'Breakfast + Lunch + Dinner'}
              </li>
              <li>Max {preferences.maxPrepTimeMinutes} min prep time</li>
              {preferences.dietaryRestrictions.length > 0 && (
                <li>Dietary: {preferences.dietaryRestrictions.join(', ')}</li>
              )}
              {preferences.cuisinePreferences.length > 0 && (
                <li>Cuisines: {preferences.cuisinePreferences.join(', ')}</li>
              )}
              {preferences.proteinPreferences.length > 0 && (
                <li>Proteins: {preferences.proteinPreferences.join(', ')}</li>
              )}
            </ul>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6 pt-6 border-t border-gray-100">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {step < totalSteps ? (
          <button
            onClick={() => setStep(step + 1)}
            className="btn-primary"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn-primary"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner />
                Generating...
              </span>
            ) : (
              'Generate Plan'
            )}
          </button>
        )}
      </div>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export default MealPlanGenerator
