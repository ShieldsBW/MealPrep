function DayCard({ day, meal, onViewRecipe, onRemove, onReplace }) {
  if (!meal) {
    return (
      <div className="card p-4 border-dashed border-2 border-gray-200 bg-gray-50">
        <div className="text-center text-gray-500 py-8">
          <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="font-medium">{day}</p>
          <p className="text-sm">No meal planned</p>
        </div>
      </div>
    )
  }

  const calories = meal.nutrition?.nutrients?.find(n => n.name === 'Calories')

  return (
    <div className="card overflow-hidden">
      <div className="relative">
        <img
          src={meal.image || 'https://via.placeholder.com/400x200?text=No+Image'}
          alt={meal.title}
          className="w-full h-32 object-cover"
        />
        <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-lg text-sm font-semibold text-gray-700">
          {day}
        </div>
        {meal.freezable && (
          <div className="absolute top-2 right-2 badge-blue text-xs">
            Freezable
          </div>
        )}
      </div>

      <div className="p-4">
        <h3
          className="font-semibold text-gray-900 mb-2 line-clamp-1 cursor-pointer hover:text-primary-600"
          onClick={() => onViewRecipe?.(meal)}
        >
          {meal.title}
        </h3>

        <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
          <span className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            {meal.readyInMinutes}m
          </span>
          <span className="flex items-center gap-1">
            <UsersIcon className="w-4 h-4" />
            {meal.servings}
          </span>
          {calories && (
            <span className="flex items-center gap-1">
              <FireIcon className="w-4 h-4" />
              {Math.round(calories.amount)}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onViewRecipe?.(meal)}
            className="flex-1 text-sm py-2 px-3 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
          >
            View Recipe
          </button>
          {onReplace && (
            <button
              onClick={() => onReplace(day, meal)}
              className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
              title="Replace recipe"
            >
              <RefreshIcon className="w-5 h-5" />
            </button>
          )}
          {onRemove && (
            <button
              onClick={() => onRemove(day)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Remove meal"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function CalendarIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
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

function FireIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
      />
    </svg>
  )
}

function TrashIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  )
}

function RefreshIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  )
}

export default DayCard
