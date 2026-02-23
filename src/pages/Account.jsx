import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { usePreferences } from '../context/PreferencesContext'
import { getVisionApiKey, setVisionApiKey, clearVisionApiKey, isVisionConfigured } from '../services/visionApi'

function Account() {
  const { user, userData } = useAuth()
  const { preferences, DIETARY_OPTIONS } = usePreferences()
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [hasKey, setHasKey] = useState(isVisionConfigured())
  const [showKey, setShowKey] = useState(false)

  const memberSince = userData?.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Account</h1>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 font-bold text-2xl">
                {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">{user?.displayName || 'User'}</div>
              <div className="text-gray-600">{user?.email}</div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Member since</span>
                <div className="font-medium text-gray-900">{memberSince}</div>
              </div>
              <div>
                <span className="text-gray-500">Account ID</span>
                <div className="font-medium text-gray-900 truncate">{user?.uid?.slice(0, 12)}...</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences Summary</h2>
        <div className="space-y-4">
          <div>
            <span className="text-sm text-gray-500">Dietary Restrictions</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {preferences.dietaryRestrictions.length > 0 ? (
                preferences.dietaryRestrictions.map(id => {
                  const option = DIETARY_OPTIONS.find(o => o.id === id)
                  return (
                    <span key={id} className="badge-green">{option?.label || id}</span>
                  )
                })
              ) : (
                <span className="text-gray-400">None set</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-sm text-gray-500">Preferred Cuisines</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {preferences.cuisinePreferences.length > 0 ? (
                preferences.cuisinePreferences.map(cuisine => (
                  <span key={cuisine} className="badge-orange">{cuisine}</span>
                ))
              ) : (
                <span className="text-gray-400">None set</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-sm text-gray-500">Preferred Proteins</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {preferences.proteinPreferences.length > 0 ? (
                preferences.proteinPreferences.map(protein => (
                  <span key={protein} className="badge-blue">{protein}</span>
                ))
              ) : (
                <span className="text-gray-400">None set</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <span className="text-sm text-gray-500">Meals per week</span>
              <div className="font-medium text-gray-900">{preferences.mealsPerWeek}</div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Servings per meal</span>
              <div className="font-medium text-gray-900">{preferences.servingsPerMeal}</div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Max prep time</span>
              <div className="font-medium text-gray-900">{preferences.maxPrepTimeMinutes} min</div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Freezer-friendly</span>
              <div className="font-medium text-gray-900">{preferences.freezerFriendly ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Features</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenAI API Key
            </label>
            {hasKey ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 input bg-gray-50 text-gray-500 text-sm">
                  {showKey ? getVisionApiKey() : 'sk-••••••••••••••••••••'}
                </div>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => {
                    clearVisionApiKey()
                    setHasKey(false)
                    setApiKeyInput('')
                    setShowKey(false)
                  }}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-..."
                  className="input flex-1"
                />
                <button
                  onClick={() => {
                    if (apiKeyInput.trim()) {
                      setVisionApiKey(apiKeyInput.trim())
                      setHasKey(true)
                      setApiKeyInput('')
                    }
                  }}
                  disabled={!apiKeyInput.trim()}
                  className="btn-primary disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Your API key is stored locally and never sent to our servers. Used for AI-powered pantry scanning with GPT-4o Vision.
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Data & Storage</h2>
        <p className="text-gray-600 text-sm mb-4">
          Your data is synced to the cloud and available across all your devices.
        </p>
        <div className="text-sm text-gray-500">
          Local storage is used as a cache for offline access.
        </div>
      </div>
    </div>
  )
}

export default Account
