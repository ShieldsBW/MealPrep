import { useApp } from '../../context/AppContext'

function RecipeDetail({ recipe, onClose, onAddToPlan }) {
  const { isFavorite, addFavorite, removeFavorite } = useApp()
  const favorite = isFavorite(recipe.id)

  const handleFavorite = () => {
    if (favorite) {
      removeFavorite(recipe.id)
    } else {
      addFavorite(recipe)
    }
  }

  const nutrition = recipe.nutrition?.nutrients || []
  const calories = nutrition.find(n => n.name === 'Calories')
  const protein = nutrition.find(n => n.name === 'Protein')
  const carbs = nutrition.find(n => n.name === 'Carbohydrates')
  const fat = nutrition.find(n => n.name === 'Fat')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <img
            src={recipe.image || 'https://via.placeholder.com/800x400?text=No+Image'}
            alt={recipe.title}
            className="w-full h-64 object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
          >
            <XIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{recipe.title}</h2>
            <button
              onClick={handleFavorite}
              className={`p-2 rounded-full ${
                favorite ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <HeartIcon filled={favorite} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.cuisines?.map(cuisine => (
              <span key={cuisine} className="badge-gray">{cuisine}</span>
            ))}
            {recipe.diets?.map(diet => (
              <span key={diet} className="badge-green">{diet}</span>
            ))}
            {recipe.freezable && (
              <span className="badge-blue">Freezer-Friendly</span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {recipe.readyInMinutes}
              </div>
              <div className="text-sm text-gray-600">minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {recipe.servings}
              </div>
              <div className="text-sm text-gray-600">servings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {calories ? Math.round(calories.amount) : '-'}
              </div>
              <div className="text-sm text-gray-600">calories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {recipe.healthScore || '-'}
              </div>
              <div className="text-sm text-gray-600">health score</div>
            </div>
          </div>

          {(protein || carbs || fat) && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Nutrition per Serving</h3>
              <div className="grid grid-cols-3 gap-4">
                {protein && (
                  <NutrientBar label="Protein" value={protein.amount} unit="g" color="bg-blue-500" />
                )}
                {carbs && (
                  <NutrientBar label="Carbs" value={carbs.amount} unit="g" color="bg-yellow-500" />
                )}
                {fat && (
                  <NutrientBar label="Fat" value={fat.amount} unit="g" color="bg-red-500" />
                )}
              </div>
            </div>
          )}

          {recipe.summary && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p
                className="text-gray-600"
                dangerouslySetInnerHTML={{
                  __html: recipe.summary.replace(/<a[^>]*>|<\/a>/g, '')
                }}
              />
            </div>
          )}

          {recipe.extendedIngredients && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Ingredients</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {recipe.extendedIngredients.map((ing, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-700">
                    <span className="w-2 h-2 bg-primary-500 rounded-full" />
                    <span>
                      {ing.amount} {ing.unit} {ing.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recipe.analyzedInstructions?.[0]?.steps && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Instructions</h3>
              <ol className="space-y-3">
                {recipe.analyzedInstructions[0].steps.map((step) => (
                  <li key={step.number} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-sm">
                      {step.number}
                    </span>
                    <p className="text-gray-700 pt-1">{step.step}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="btn-outline flex-1"
            >
              Close
            </button>
            {onAddToPlan && (
              <button
                onClick={() => onAddToPlan(recipe)}
                className="btn-primary flex-1"
              >
                Add to Meal Plan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function NutrientBar({ label, value, unit, color }) {
  const maxValue = 100
  const percentage = Math.min((value / maxValue) * 100, 100)

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{Math.round(value)}{unit}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function HeartIcon({ filled }) {
  return (
    <svg
      className={`w-6 h-6 ${filled ? 'fill-current' : ''}`}
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

function XIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export default RecipeDetail
