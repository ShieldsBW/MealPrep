import { useState, useRef } from 'react'
import { useInventory } from '../../context/InventoryContext'
import { isVisionConfigured, setVisionApiKey, analyzeImage } from '../../services/visionApi'
import { estimateExpiration, suggestSection } from '../../utils/expirationData'
import ScanResultsReview from './ScanResultsReview'

function ScanModal({ onClose }) {
  const { addItems } = useInventory()
  const fileInputRef = useRef(null)

  const [step, setStep] = useState('upload') // 'upload' | 'processing' | 'review'
  const [apiKey, setApiKey] = useState('')
  const [needsKey, setNeedsKey] = useState(!isVisionConfigured())
  const [imagePreview, setImagePreview] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [detectedItems, setDetectedItems] = useState([])
  const [error, setError] = useState(null)

  const handleKeySubmit = () => {
    if (apiKey.trim()) {
      setVisionApiKey(apiKey.trim())
      setNeedsKey(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target.result)
      setImageBase64(event.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleAnalyze = async () => {
    if (!imageBase64) return

    setStep('processing')
    setError(null)

    try {
      const items = await analyzeImage(imageBase64)
      if (items.length === 0) {
        setError('No food items were detected in the image. Try a different photo.')
        setStep('upload')
        return
      }
      // Enrich items with suggested sections
      const enrichedItems = items.map(item => ({
        ...item,
        section: item.section || suggestSection(item.name),
      }))
      setDetectedItems(enrichedItems)
      setStep('review')
    } catch (err) {
      console.error('Vision API error:', err)
      setError(err.message || 'Failed to analyze image. Please try again.')
      setStep('upload')
    }
  }

  const handleConfirmItems = (items) => {
    const today = new Date().toISOString().split('T')[0]
    const enrichedItems = items.map(item => ({
      ...item,
      purchasedDate: today,
      expirationDate: estimateExpiration(item.name, today),
      expirationEstimated: !!estimateExpiration(item.name, today),
    }))
    addItems(enrichedItems)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {step === 'upload' && 'Scan Food Items'}
            {step === 'processing' && 'Analyzing...'}
            {step === 'review' && 'Review Detected Items'}
          </h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {step === 'upload' && (
            <div className="space-y-4">
              {needsKey && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800 mb-2 font-medium">
                    OpenAI API key required for image scanning
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="input flex-1 text-sm"
                    />
                    <button
                      onClick={handleKeySubmit}
                      disabled={!apiKey.trim()}
                      className="btn-primary text-sm disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                  <p className="text-xs text-amber-600 mt-2">
                    Your key is stored locally and never sent to our servers.
                  </p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div className="text-center">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Food preview"
                      className="max-h-64 rounded-lg mx-auto"
                    />
                    <button
                      onClick={() => {
                        setImagePreview(null)
                        setImageBase64(null)
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-gray-500 hover:text-gray-700"
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => !needsKey && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 ${
                      needsKey
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-300 hover:border-primary-400 cursor-pointer'
                    }`}
                  >
                    <CameraIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 font-medium">
                      {needsKey ? 'Configure API key first' : 'Click to upload a photo'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Take a photo of your fridge, pantry, or groceries
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {imagePreview && !needsKey && (
                <button
                  onClick={handleAnalyze}
                  className="w-full btn-primary"
                >
                  Analyze Image
                </button>
              )}
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Analyzing image...</p>
              <p className="text-sm text-gray-400 mt-1">
                AI is identifying food items in your photo
              </p>
            </div>
          )}

          {step === 'review' && (
            <ScanResultsReview
              items={detectedItems}
              onConfirm={handleConfirmItems}
              onCancel={() => {
                setStep('upload')
                setDetectedItems([])
              }}
            />
          )}
        </div>
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

function CameraIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

export default ScanModal
