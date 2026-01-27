import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function Home() {
  const { mealPlan, favorites, shoppingList } = useApp()

  const quickStats = [
    {
      label: 'Saved Recipes',
      value: favorites.length,
      icon: HeartIcon,
      link: '/recipes',
      color: 'bg-red-100 text-red-600',
    },
    {
      label: 'Planned Meals',
      value: mealPlan?.meals?.length || 0,
      icon: CalendarIcon,
      link: '/meal-plan',
      color: 'bg-primary-100 text-primary-600',
    },
    {
      label: 'Shopping Items',
      value: shoppingList.length,
      icon: ShoppingIcon,
      link: '/shopping-list',
      color: 'bg-secondary-100 text-secondary-600',
    },
  ]

  return (
    <div className="space-y-8">
      <section className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to MealPrep
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Plan your meals, optimize your shopping, and make meal prep effortless.
          Save time and reduce food waste with smart meal planning.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickStats.map(({ label, value, icon: Icon, link, color }) => (
          <Link
            key={label}
            to={link}
            className="card p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{value}</div>
                <div className="text-gray-600">{label}</div>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/recipes"
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <SearchIcon className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Browse Recipes</div>
                <div className="text-sm text-gray-600">Find new meal ideas</div>
              </div>
            </Link>
            <Link
              to="/meal-plan"
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <SparkleIcon className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Generate Meal Plan</div>
                <div className="text-sm text-gray-600">Create a weekly plan</div>
              </div>
            </Link>
            <Link
              to="/shopping-list"
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <ClipboardIcon className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">View Shopping List</div>
                <div className="text-sm text-gray-600">Check off ingredients</div>
              </div>
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Features</h2>
          <ul className="space-y-3">
            {[
              'Search recipes with dietary filters',
              'Generate optimized meal plans',
              'Consolidated shopping lists',
              'Track freezer-friendly meals',
              'Offline access to saved recipes',
              'Mobile-friendly design',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-gray-700">
                <CheckIcon className="w-5 h-5 text-primary-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {mealPlan && mealPlan.schedule?.length > 0 && (
        <section className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">This Week&apos;s Plan</h2>
            <Link to="/meal-plan" className="text-primary-600 hover:underline text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {mealPlan.schedule.slice(0, 7).map(({ day, meal }) => (
              <div key={day} className="text-center">
                <div className="text-xs font-medium text-gray-500 mb-2">{day.slice(0, 3)}</div>
                {meal ? (
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <img
                      src={meal.image}
                      alt={meal.title}
                      className="w-full h-16 object-cover rounded mb-1"
                    />
                    <div className="text-xs text-gray-900 line-clamp-2">{meal.title}</div>
                  </div>
                ) : (
                  <div className="p-2 bg-gray-50 rounded-lg h-24 flex items-center justify-center">
                    <span className="text-xs text-gray-400">No meal</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="text-center py-6">
        <p className="text-sm text-gray-500">
          {import.meta.env.VITE_SPOONACULAR_API_KEY
            ? 'Connected to Spoonacular API'
            : 'Running in demo mode with sample recipes'}
        </p>
      </section>
    </div>
  )
}

function HeartIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function SparkleIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
}

function ClipboardIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  )
}

function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default Home
