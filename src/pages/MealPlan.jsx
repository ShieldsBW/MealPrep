import { useState } from 'react'
import { useApp } from '../context/AppContext'
import MealPlanGenerator from '../components/MealPlan/MealPlanGenerator'
import MealPlanView from '../components/MealPlan/MealPlanView'
import RecipeDetail from '../components/Recipe/RecipeDetail'
import { generateMealPlan } from '../services/mealPlanAlgorithm'
import { MOCK_RECIPES } from '../services/api'

function MealPlan() {
  const { mealPlan, updateMealPlan, clearMealPlan, updateShoppingList } = useApp()
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [showGenerator, setShowGenerator] = useState(!mealPlan)

  const handleGenerate = async (preferences) => {
    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const plan = generateMealPlan(MOCK_RECIPES, preferences)
      updateMealPlan(plan)
      updateShoppingList(plan.shoppingList)
      setShowGenerator(false)
    } catch (error) {
      console.error('Error generating meal plan:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClearPlan = () => {
    if (window.confirm('Are you sure you want to clear your meal plan?')) {
      clearMealPlan()
      setShowGenerator(true)
    }
  }

  const handleRemoveMeal = (day) => {
    if (!mealPlan) return

    const updatedSchedule = mealPlan.schedule.map(item =>
      item.day === day ? { ...item, meal: null } : item
    )

    const updatedMeals = updatedSchedule
      .filter(item => item.meal)
      .map(item => item.meal)

    updateMealPlan({
      ...mealPlan,
      schedule: updatedSchedule,
      meals: updatedMeals,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Meal Plan</h1>
        {mealPlan && !showGenerator && (
          <button
            onClick={() => setShowGenerator(true)}
            className="btn-outline"
          >
            Generate New Plan
          </button>
        )}
      </div>

      {showGenerator ? (
        <div className="max-w-2xl mx-auto">
          <MealPlanGenerator
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
          {mealPlan && (
            <button
              onClick={() => setShowGenerator(false)}
              className="mt-4 w-full text-center text-gray-600 hover:text-gray-900"
            >
              Cancel and view current plan
            </button>
          )}
        </div>
      ) : mealPlan ? (
        <MealPlanView
          mealPlan={mealPlan}
          onViewRecipe={setSelectedRecipe}
          onRemoveMeal={handleRemoveMeal}
          onClearPlan={handleClearPlan}
        />
      ) : (
        <div className="text-center py-12">
          <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Meal Plan Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Generate a personalized meal plan based on your preferences.
          </p>
          <button
            onClick={() => setShowGenerator(true)}
            className="btn-primary"
          >
            Create Meal Plan
          </button>
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

export default MealPlan
