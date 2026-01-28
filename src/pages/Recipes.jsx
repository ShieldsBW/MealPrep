import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import RecipeCard from '../components/Recipe/RecipeCard'
import RecipeDetail from '../components/Recipe/RecipeDetail'
import RecipeSearch from '../components/Recipe/RecipeSearch'
import RecipeFilters from '../components/Recipe/RecipeFilters'
import ApiCreditsDisplay from '../components/Common/ApiCreditsDisplay'
import { searchRecipes, MOCK_RECIPES } from '../services/api'

function Recipes() {
  const { favorites, customRecipes } = useApp()
  const [recipes, setRecipes] = useState([])
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('browse')
  const [filters, setFilters] = useState({
    diet: [],
    cuisine: '',
    maxPrepTime: null,
    freezerFriendly: false,
    ostomySafe: false,
  })

  useEffect(() => {
    loadRecipes()
  }, [])

  const loadRecipes = async (query = '', showLoading = true) => {
    // Only show loading spinner if we don't have recipes yet
    if (showLoading && recipes.length === 0) {
      setIsLoading(true)
    }
    setError(null)
    try {
      const result = await searchRecipes({
        query,
        diet: filters.diet,
        cuisine: filters.cuisine,
        maxReadyTime: filters.maxPrepTime,
        ostomySafe: filters.ostomySafe,
      })
      setRecipes(result.results || MOCK_RECIPES)
    } catch (err) {
      setError(err.message)
      if (recipes.length === 0) {
        setRecipes(MOCK_RECIPES)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query) => {
    setIsLoading(true) // Show loading for explicit searches
    loadRecipes(query, false)
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const applyFilters = (recipeList) => {
    return recipeList.filter(recipe => {
      if (filters.maxPrepTime && recipe.readyInMinutes > filters.maxPrepTime) {
        return false
      }
      if (filters.freezerFriendly && !recipe.freezable) {
        return false
      }
      if (filters.cuisine && !recipe.cuisines?.some(c =>
        c.toLowerCase().includes(filters.cuisine.toLowerCase())
      )) {
        return false
      }
      if (filters.diet.length > 0) {
        for (const diet of filters.diet) {
          if (!recipe.diets?.includes(diet) && !recipe.diets?.includes(diet.replace('-', ' '))) {
            return false
          }
        }
      }
      return true
    })
  }

  const displayedRecipes = activeTab === 'browse'
    ? applyFilters(recipes)
    : activeTab === 'favorites'
    ? applyFilters(favorites)
    : applyFilters(customRecipes)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Recipes</h1>
        <div className="flex gap-2">
          {['browse', 'favorites', 'custom'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
              {tab === 'favorites' && favorites.length > 0 && (
                <span className="ml-1 text-xs">({favorites.length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'browse' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <RecipeSearch onSearch={handleSearch} isLoading={isLoading} />
            </div>
            <div className="md:w-64">
              <ApiCreditsDisplay />
            </div>
          </div>
          <RecipeFilters filters={filters} onFilterChange={handleFilterChange} />
        </div>
      )}

      {error && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">{error}</p>
          <p className="text-sm text-yellow-600 mt-1">Showing demo recipes instead.</p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : displayedRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={setSelectedRecipe}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {activeTab === 'favorites'
              ? 'No favorites yet'
              : activeTab === 'custom'
              ? 'No custom recipes'
              : 'No recipes found'}
          </h3>
          <p className="text-gray-600">
            {activeTab === 'favorites'
              ? 'Start browsing and save your favorite recipes!'
              : activeTab === 'custom'
              ? 'Create your own recipes to add them here.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      )}

      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="flex gap-2">
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-12" />
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-14" />
        </div>
      </div>
    </div>
  )
}

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  )
}

export default Recipes
