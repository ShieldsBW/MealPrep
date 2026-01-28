import { useState } from 'react'
import Login from '../components/Auth/Login'
import Register from '../components/Auth/Register'

function Landing() {
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  const features = [
    {
      icon: SearchIcon,
      title: 'Recipe Search',
      description: 'Search thousands of recipes with dietary filters for Crohn\'s, dairy-free, gluten-free, and more.'
    },
    {
      icon: CalendarIcon,
      title: 'Smart Meal Planning',
      description: 'Generate optimized weekly meal plans based on your preferences, with ingredient overlap to reduce waste.'
    },
    {
      icon: ShoppingIcon,
      title: 'Shopping Lists',
      description: 'Automatically consolidated shopping lists grouped by store section with cost estimates.'
    },
    {
      icon: SnowflakeIcon,
      title: 'Freezer-Friendly',
      description: 'Prioritize meals that freeze well for easy batch cooking and meal prep.'
    },
    {
      icon: SaveIcon,
      title: 'Save & Reuse Plans',
      description: 'Save your favorite meal plans and reload them anytime with one click.'
    },
    {
      icon: DeviceIcon,
      title: 'Access Anywhere',
      description: 'Your data syncs across all devices. Plan on desktop, shop from your phone.'
    },
  ]

  const testimonials = [
    {
      quote: "MealPrep has completely changed how I approach weekly cooking. I save so much time and money!",
      author: "Sarah M.",
      role: "Busy Parent"
    },
    {
      quote: "Finally an app that understands dietary restrictions. The Crohn's-safe filter is a lifesaver.",
      author: "James T.",
      role: "IBD Warrior"
    },
    {
      quote: "The ingredient overlap optimization means I waste almost nothing now. Brilliant!",
      author: "Michelle K.",
      role: "Home Chef"
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <ClipboardIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">MealPrep</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogin(true)}
                className="btn-outline"
              >
                Log In
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className="btn-primary"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Meal Planning <span className="text-primary-600">Made Easy</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          Plan your meals, optimize your shopping, and take the stress out of cooking.
          Save time, reduce food waste, and eat better with smart meal planning.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setShowRegister(true)}
            className="btn-primary text-lg px-8 py-3"
          >
            Start Planning for Free
          </button>
          <button
            onClick={() => setShowLogin(true)}
            className="btn-outline text-lg px-8 py-3"
          >
            Log In
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            From recipe discovery to shopping list generation, MealPrep handles it all.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="p-6 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map(({ quote, author, role }) => (
              <div key={author} className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-gray-700 mb-4 italic">&ldquo;{quote}&rdquo;</p>
                <div>
                  <div className="font-semibold text-gray-900">{author}</div>
                  <div className="text-sm text-gray-500">{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Simplify Your Meal Prep?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of home cooks who have transformed their weekly routine.
          </p>
          <button
            onClick={() => setShowRegister(true)}
            className="btn-primary text-lg px-8 py-3"
          >
            Create Your Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 MealPrep. All rights reserved.</p>
        </div>
      </footer>

      {/* Modals */}
      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false)
            setShowRegister(true)
          }}
        />
      )}

      {showRegister && (
        <Register
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false)
            setShowLogin(true)
          }}
        />
      )}
    </div>
  )
}

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function CalendarIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function ShoppingIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}

function SnowflakeIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 2a1 1 0 011 1v2.586l1.293-1.293a1 1 0 111.414 1.414L12 7.414V10h2.586l1.707-1.707a1 1 0 111.414 1.414L16.414 11H18a1 1 0 110 2h-1.586l1.293 1.293a1 1 0 11-1.414 1.414L15 14.414V12H12v2.586l1.707 1.707a1 1 0 11-1.414 1.414L11 16.414V18a1 1 0 11-2 0v-1.586l-1.293 1.293a1 1 0 11-1.414-1.414L8 14.586V12H5v2.414l-1.293 1.293a1 1 0 11-1.414-1.414L4 12.586V11H2a1 1 0 110-2h2V7.414L2.293 5.707a1 1 0 111.414-1.414L5 5.586V8h3V5.414L6.293 3.707a1 1 0 111.414-1.414L9 3.586V2a1 1 0 011-1z" />
    </svg>
  )
}

function SaveIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  )
}

function DeviceIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  )
}

function ClipboardIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
}

export default Landing
