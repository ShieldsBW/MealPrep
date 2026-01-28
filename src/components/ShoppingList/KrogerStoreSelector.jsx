import { useState } from 'react'

// Kroger API requires a backend proxy due to CORS restrictions
// For now, show a message about this limitation
const KROGER_AVAILABLE = false // Set to true when backend proxy is available

function KrogerStoreSelector({ onStoreChange }) {
  const [showInfo, setShowInfo] = useState(false)

  if (!KROGER_AVAILABLE) {
    return (
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KrogerLogo className="w-6 h-6" />
            <h3 className="font-semibold text-gray-900">Store Pricing</h3>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-sm text-primary-600 hover:underline"
          >
            {showInfo ? 'Hide' : 'Learn more'}
          </button>
        </div>
        {showInfo && (
          <p className="text-sm text-gray-600 mt-3">
            Real-time Kroger pricing requires a backend server due to API restrictions.
            Prices shown are estimates based on average costs. Leftover calculations
            are based on typical package sizes.
          </p>
        )}
      </div>
    )
  }

  // Original Kroger store selector code (for when backend is available)
  const [zipCode, setZipCode] = useState('')
  const [stores, setStores] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState(null)
  const [showSelector, setShowSelector] = useState(false)
  const selectedStore = null

  const handleSearch = async () => {
    if (!zipCode || zipCode.length < 5) return

    setIsSearching(true)
    setError(null)

    try {
      const results = await searchStores(zipCode)
      setStores(results)
      if (results.length === 0) {
        setError('No stores found in this area')
      }
    } catch (err) {
      console.error('Error searching stores:', err)
      setError('Failed to search stores. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectStore = (store) => {
    setSelectedStore(store)
    setShowSelector(false)
    onStoreChange?.(store)
  }

  const handleClearStore = () => {
    clearSelectedStore()
    onStoreChange?.(null)
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <KrogerLogo className="w-6 h-6" />
          <h3 className="font-semibold text-gray-900">Kroger Pricing</h3>
        </div>
        {selectedStore && (
          <button
            onClick={handleClearStore}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Change Store
          </button>
        )}
      </div>

      {selectedStore ? (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="font-medium text-gray-900">{selectedStore.name}</div>
          <div className="text-sm text-gray-600">
            {selectedStore.address?.addressLine1}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Prices shown are from this store
          </div>
        </div>
      ) : (
        <>
          {!showSelector ? (
            <button
              onClick={() => setShowSelector(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors"
            >
              + Select a Store for Local Prices
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="Enter ZIP code"
                  className="input flex-1"
                  maxLength={5}
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching || zipCode.length < 5}
                  className="btn-primary px-4 disabled:opacity-50"
                >
                  {isSearching ? '...' : 'Search'}
                </button>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              {stores.length > 0 && (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {stores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => handleSelectStore(store)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{store.name}</div>
                      <div className="text-sm text-gray-600">
                        {store.address?.addressLine1}, {store.address?.city}
                      </div>
                      {store.distance && (
                        <div className="text-xs text-gray-500 mt-1">
                          {store.distance.toFixed(1)} miles away
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setShowSelector(false)
                  setStores([])
                  setError(null)
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function KrogerLogo({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#E31837" />
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">K</text>
    </svg>
  )
}

export default KrogerStoreSelector
