import { useApp } from '../../context/AppContext'

function RecipeCard({ recipe, onClick, showActions = true }) {
  const { isFavorite, addFavorite, removeFavorite } = useApp()
  const favorite = isFavorite(recipe.id)

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    if (favorite) {
      removeFavorite(recipe.id)
    } else {
      addFavorite(recipe)
    }
  }

  const calories = recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')

  return (
    <div
      className="card cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(recipe)}
    >
      <div className="relative">
        <img
          src={recipe.image || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={recipe.title}
          className="w-full h-48 object-cover"
        />
        {showActions && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 p-2 rounded-full bg-white shadow-md hover:scale-110 transition-transform"
          >
            <HeartIcon filled={favorite} />
          </button>
        )}
        {recipe.freezable && (
          <span className="absolute top-3 left-3 badge-blue">
            <SnowflakeIcon className="w-3 h-3 mr-1" />
            Freezable
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {recipe.title}
        </h3>

        <div className="flex flex-wrap gap-2 mb-3">
          {recipe.cuisines?.slice(0, 2).map(cuisine => (
            <span key={cuisine} className="badge-gray text-xs">
              {cuisine}
            </span>
          ))}
          {recipe.diets?.slice(0, 2).map(diet => (
            <span key={diet} className="badge-green text-xs">
              {diet}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            <span>{recipe.readyInMinutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            <UsersIcon className="w-4 h-4" />
            <span>{recipe.servings} servings</span>
          </div>
          {calories && (
            <div className="flex items-center gap-1">
              <FireIcon className="w-4 h-4" />
              <span>{Math.round(calories.amount)} cal</span>
            </div>
          )}
        </div>

        {recipe.healthScore && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Health Score</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      recipe.healthScore >= 70 ? 'bg-green-500' :
                      recipe.healthScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${recipe.healthScore}%` }}
                  />
                </div>
                <span className="font-medium">{recipe.healthScore}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function HeartIcon({ filled }) {
  return (
    <svg
      className={`w-5 h-5 ${filled ? 'text-red-500 fill-current' : 'text-gray-400'}`}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
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

function SnowflakeIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 2a1 1 0 011 1v2.586l1.293-1.293a1 1 0 111.414 1.414L12 7.414V10h2.586l1.707-1.707a1 1 0 111.414 1.414L16.414 11H18a1 1 0 110 2h-1.586l1.293 1.293a1 1 0 11-1.414 1.414L15 14.414V12H12v2.586l1.707 1.707a1 1 0 11-1.414 1.414L11 16.414V18a1 1 0 11-2 0v-1.586l-1.293 1.293a1 1 0 11-1.414-1.414L8 14.586V12H5v2.414l-1.293 1.293a1 1 0 11-1.414-1.414L4 12.586V11H2a1 1 0 110-2h2V7.414L2.293 5.707a1 1 0 111.414-1.414L5 5.586V8h3V5.414L6.293 3.707a1 1 0 111.414-1.414L9 3.586V2a1 1 0 011-1z" />
    </svg>
  )
}

export default RecipeCard
