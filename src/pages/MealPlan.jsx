import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useInventory } from '../context/InventoryContext'
import MealPlanGenerator from '../components/MealPlan/MealPlanGenerator'
import MealPlanView from '../components/MealPlan/MealPlanView'
import RecipeDetail from '../components/Recipe/RecipeDetail'
import ApiCreditsDisplay from '../components/Common/ApiCreditsDisplay'
import { generateMealPlan, generateShoppingList } from '../services/mealPlanAlgorithm'
import { MOCK_RECIPES, getSimilarRecipes, getRecipeById } from '../services/api'
import { saveMealPlan, getMealPlans, deleteMealPlan } from '../services/firebase'

function MealPlan() {
  const { mealPlan, updateMealPlan, clearMealPlan, updateShoppingList } = useApp()
  const { user, isAuthenticated } = useAuth()
  const { inventory } = useInventory()
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [showGenerator, setShowGenerator] = useState(!mealPlan)
  const [replaceModal, setReplaceModal] = useState(null)
  const [replacementOptions, setReplacementOptions] = useState([])
  const [isLoadingReplacements, setIsLoadingReplacements] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [planName, setPlanName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [savedPlans, setSavedPlans] = useState([])
  const [isLoadingPlans, setIsLoadingPlans] = useState(false)

  const handleGenerate = async (preferences) => {
    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const plan = generateMealPlan(MOCK_RECIPES, preferences, inventory)
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

  const handleSavePlan = async () => {
    if (!planName.trim() || !mealPlan || !isAuthenticated) return

    setIsSaving(true)
    try {
      await saveMealPlan(user.uid, mealPlan, planName.trim())
      setShowSaveModal(false)
      setPlanName('')
      alert('Meal plan saved successfully!')
    } catch (error) {
      console.error('Error saving meal plan:', error)
      alert('Failed to save meal plan. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoadPlans = async () => {
    if (!isAuthenticated) return

    setShowLoadModal(true)
    setIsLoadingPlans(true)
    try {
      const plans = await getMealPlans(user.uid)
      setSavedPlans(plans)
    } catch (error) {
      console.error('Error loading saved plans:', error)
    } finally {
      setIsLoadingPlans(false)
    }
  }

  const handleLoadPlan = (plan) => {
    updateMealPlan(plan)
    if (plan.shoppingList) {
      updateShoppingList(plan.shoppingList)
    }
    setShowLoadModal(false)
    setShowGenerator(false)
  }

  const handleDeleteSavedPlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this saved plan?')) return

    try {
      await deleteMealPlan(user.uid, planId)
      setSavedPlans(prev => prev.filter(p => p.id !== planId))
    } catch (error) {
      console.error('Error deleting plan:', error)
      alert('Failed to delete plan. Please try again.')
    }
  }

  const collectAllMeals = (schedule) => {
    const meals = []
    for (const item of schedule) {
      if (item.slots) {
        for (const slotData of Object.values(item.slots)) {
          if (slotData?.meal) meals.push(slotData.meal)
        }
      } else if (item.meal) {
        meals.push(item.meal)
      }
    }
    return meals
  }

  const handleRemoveMeal = (day, slot = 'dinner') => {
    if (!mealPlan) return

    const isNewFormat = mealPlan.schedule[0]?.slots

    let updatedSchedule
    if (isNewFormat) {
      updatedSchedule = mealPlan.schedule.map(item => {
        if (item.day !== day) return item
        return {
          ...item,
          slots: {
            ...item.slots,
            [slot]: { ...item.slots[slot], meal: null },
          },
        }
      })
    } else {
      updatedSchedule = mealPlan.schedule.map(item =>
        item.day === day ? { ...item, meal: null } : item
      )
    }

    const updatedMeals = collectAllMeals(updatedSchedule)

    const updatedPlan = {
      ...mealPlan,
      schedule: updatedSchedule,
      meals: updatedMeals,
    }

    updateMealPlan(updatedPlan)
    updateShoppingList(generateShoppingList(updatedMeals))
  }

  const handleReplaceMeal = async (day, slot = 'dinner', currentMeal) => {
    // Support both old signature (day, currentMeal) and new (day, slot, currentMeal)
    if (typeof slot === 'object') {
      currentMeal = slot
      slot = 'dinner'
    }
    setReplaceModal({ day, slot, currentMeal })
    setIsLoadingReplacements(true)

    try {
      // Try to get similar recipes from API
      const similar = await getSimilarRecipes(currentMeal.id, 6)

      if (similar && similar.length > 0) {
        // Fetch full recipe details for each similar recipe
        const detailedRecipes = await Promise.all(
          similar.slice(0, 4).map(async (r) => {
            try {
              return await getRecipeById(r.id)
            } catch {
              return r
            }
          })
        )
        setReplacementOptions(detailedRecipes.filter(Boolean))
      } else {
        // Fallback to mock recipes
        const alternatives = MOCK_RECIPES.filter(r =>
          r.id !== currentMeal.id &&
          !mealPlan.meals.some(m => m.id === r.id)
        ).slice(0, 4)
        setReplacementOptions(alternatives)
      }
    } catch (error) {
      console.error('Error fetching similar recipes:', error)
      // Fallback to mock recipes
      const alternatives = MOCK_RECIPES.filter(r =>
        r.id !== currentMeal.id &&
        !mealPlan.meals.some(m => m.id === r.id)
      ).slice(0, 4)
      setReplacementOptions(alternatives)
    } finally {
      setIsLoadingReplacements(false)
    }
  }

  const confirmReplaceMeal = (newRecipe) => {
    if (!mealPlan || !replaceModal) return

    const { day, slot = 'dinner' } = replaceModal
    const isNewFormat = mealPlan.schedule[0]?.slots

    let updatedSchedule
    if (isNewFormat) {
      updatedSchedule = mealPlan.schedule.map(item => {
        if (item.day !== day) return item
        return {
          ...item,
          slots: {
            ...item.slots,
            [slot]: { ...item.slots[slot], meal: newRecipe },
          },
        }
      })
    } else {
      updatedSchedule = mealPlan.schedule.map(item =>
        item.day === day ? { ...item, meal: newRecipe } : item
      )
    }

    const updatedMeals = collectAllMeals(updatedSchedule)

    const updatedPlan = {
      ...mealPlan,
      schedule: updatedSchedule,
      meals: updatedMeals,
    }

    updateMealPlan(updatedPlan)
    updateShoppingList(generateShoppingList(updatedMeals))
    setReplaceModal(null)
    setReplacementOptions([])
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Meal Plan</h1>
        <div className="flex gap-2 flex-wrap">
          {isAuthenticated && (
            <button
              onClick={handleLoadPlans}
              className="btn-outline flex items-center gap-2"
            >
              <FolderIcon className="w-4 h-4" />
              Load Saved
            </button>
          )}
          {mealPlan && !showGenerator && isAuthenticated && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="btn-outline flex items-center gap-2"
            >
              <SaveIcon className="w-4 h-4" />
              Save Plan
            </button>
          )}
          {mealPlan && !showGenerator && (
            <button
              onClick={() => setShowGenerator(true)}
              className="btn-primary"
            >
              Generate New Plan
            </button>
          )}
        </div>
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
        <>
          <div className="mb-4 md:w-64">
            <ApiCreditsDisplay />
          </div>
          <MealPlanView
            mealPlan={mealPlan}
            onViewRecipe={setSelectedRecipe}
            onRemoveMeal={handleRemoveMeal}
            onReplaceMeal={handleReplaceMeal}
            onClearPlan={handleClearPlan}
          />
        </>
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

      {replaceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Replace {replaceModal.slot !== 'dinner' || mealPlan?.preferences?.mealSlots > 1 ? `${replaceModal.slot} ` : ''}Recipe for {replaceModal.day}
                </h3>
                <p className="text-sm text-gray-600">
                  Currently: {replaceModal.currentMeal.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setReplaceModal(null)
                  setReplacementOptions([])
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {isLoadingReplacements ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-gray-600">Finding similar recipes...</p>
                </div>
              ) : replacementOptions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {replacementOptions.map(recipe => (
                    <button
                      key={recipe.id}
                      onClick={() => confirmReplaceMeal(recipe)}
                      className="text-left p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <div className="flex gap-3">
                        <img
                          src={recipe.image || 'https://via.placeholder.com/80'}
                          alt={recipe.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 line-clamp-2">
                            {recipe.title}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <span>{recipe.readyInMinutes}m</span>
                            <span>·</span>
                            <span>{recipe.servings} servings</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 py-8">
                  No alternative recipes available
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Save Meal Plan</h3>
              <button
                onClick={() => {
                  setShowSaveModal(false)
                  setPlanName('')
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan Name
              </label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="e.g., Week of Jan 27"
                className="input w-full"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSaveModal(false)
                  setPlanName('')
                }}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlan}
                disabled={!planName.trim() || isSaving}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLoadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Saved Meal Plans</h3>
              <button
                onClick={() => setShowLoadModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {isLoadingPlans ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-gray-600">Loading saved plans...</p>
                </div>
              ) : savedPlans.length > 0 ? (
                <div className="space-y-3">
                  {savedPlans.map(plan => (
                    <div
                      key={plan.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{plan.name}</h4>
                          <p className="text-sm text-gray-600">
                            {plan.stats?.totalMeals || 0} meals · Created {
                              plan.savedAt?.toDate
                                ? plan.savedAt.toDate().toLocaleDateString()
                                : plan.createdAt
                                ? new Date(plan.createdAt).toLocaleDateString()
                                : 'Unknown date'
                            }
                          </p>
                          {plan.stats?.cuisines?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {plan.stats.cuisines.slice(0, 3).map(c => (
                                <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleLoadPlan(plan)}
                            className="text-sm px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleDeleteSavedPlan(plan.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FolderIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600">No saved meal plans yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Generate a meal plan and save it to access it later
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
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

function CloseIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}

function SaveIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
      />
    </svg>
  )
}

function FolderIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
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

export default MealPlan
