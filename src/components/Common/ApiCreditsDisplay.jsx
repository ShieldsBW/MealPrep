import { useState, useEffect } from 'react'
import { subscribeToQuota } from '../../services/api'

function ApiCreditsDisplay({ compact = false }) {
  const [quota, setQuota] = useState({
    used: 0,
    remaining: 150,
    total: 150,
    isDemo: false,
  })

  useEffect(() => {
    const unsubscribe = subscribeToQuota(setQuota)
    return unsubscribe
  }, [])

  const percentUsed = (quota.used / quota.total) * 100
  const percentRemaining = (quota.remaining / quota.total) * 100

  const getStatusColor = () => {
    if (quota.isDemo) return 'text-gray-500'
    if (percentRemaining > 50) return 'text-green-600'
    if (percentRemaining > 20) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getBarColor = () => {
    if (quota.isDemo) return 'bg-gray-400'
    if (percentRemaining > 50) return 'bg-green-500'
    if (percentRemaining > 20) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <ApiIcon className="w-4 h-4 text-gray-400" />
        <span className={getStatusColor()}>
          {quota.isDemo ? 'Demo Mode' : `${Math.round(quota.remaining)} credits left`}
        </span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ApiIcon className="w-5 h-5 text-primary-500" />
          <span className="font-medium text-gray-900">API Credits</span>
        </div>
        {quota.isDemo ? (
          <span className="text-sm text-gray-500">Demo Mode</span>
        ) : (
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {Math.round(quota.remaining)} / {quota.total}
          </span>
        )}
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getBarColor()}`}
          style={{ width: `${Math.min(100, quota.isDemo ? 100 : percentRemaining)}%` }}
        />
      </div>

      <p className="text-xs text-gray-500 mt-2">
        {quota.isDemo
          ? 'Running without API key - using sample recipes'
          : quota.remaining <= 0
          ? 'Daily quota exceeded. Resets at midnight UTC.'
          : 'Spoonacular API free tier resets daily at midnight UTC'}
      </p>
    </div>
  )
}

function ApiIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  )
}

export default ApiCreditsDisplay
