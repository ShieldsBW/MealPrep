import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">MealPrep</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <ApiStatusIndicator />
          </div>
        </div>
      </div>
    </header>
  )
}

function ApiStatusIndicator() {
  const apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500' : 'bg-yellow-500'}`} />
      <span className="text-gray-600">
        {apiKey ? 'API Connected' : 'Demo Mode'}
      </span>
    </div>
  )
}

export default Header
