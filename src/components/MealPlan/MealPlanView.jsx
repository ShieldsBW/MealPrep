import { Link } from 'react-router-dom'
import DayCard from './DayCard'

function MealPlanView({ mealPlan, onViewRecipe, onRemoveMeal, onClearPlan }) {
  if (!mealPlan) {
    return null
  }

  const { schedule, stats, createdAt } = mealPlan

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your Meal Plan</h2>
          <p className="text-sm text-gray-600">
            Created {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/shopping-list"
            className="btn-primary"
          >
            View Shopping List
          </Link>
          <button
            onClick={onClearPlan}
            className="btn-outline text-red-600 border-red-600 hover:bg-red-50"
          >
            Clear Plan
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Meals"
            value={stats.totalMeals}
            icon={<MealIcon className="w-5 h-5" />}
          />
          <StatCard
            label="Total Servings"
            value={stats.totalServings}
            icon={<UsersIcon className="w-5 h-5" />}
          />
          <StatCard
            label="Avg Prep Time"
            value={`${stats.avgPrepTime}m`}
            icon={<ClockIcon className="w-5 h-5" />}
          />
          <StatCard
            label="Est. Cost"
            value={`$${stats.estimatedCost.toFixed(2)}`}
            icon={<DollarIcon className="w-5 h-5" />}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {schedule.map(({ day, meal }) => (
          <DayCard
            key={day}
            day={day}
            meal={meal}
            onViewRecipe={onViewRecipe}
            onRemove={onRemoveMeal}
          />
        ))}
      </div>

      {stats?.cuisines?.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Cuisine Variety</h3>
          <div className="flex flex-wrap gap-2">
            {stats.cuisines.map(cuisine => (
              <span key={cuisine} className="badge-gray">{cuisine}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
          {icon}
        </div>
        <div>
          <div className="text-xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-600">{label}</div>
        </div>
      </div>
    </div>
  )
}

function MealIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  )
}

function UsersIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  )
}

function ClockIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

function DollarIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

export default MealPlanView
