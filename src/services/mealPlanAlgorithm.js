export function generateMealPlan(recipes, preferences, inventory = []) {
  const {
    mealsPerWeek = 5,
    dietaryRestrictions = [],
    cuisinePreferences = [],
    proteinPreferences = [],
    freezerFriendly = false,
    maxPrepTimeMinutes = 60,
  } = preferences

  let filteredRecipes = recipes.filter(recipe => {
    if (maxPrepTimeMinutes && recipe.readyInMinutes > maxPrepTimeMinutes) {
      return false
    }

    if (freezerFriendly && !recipe.freezable) {
      return false
    }

    for (const restriction of dietaryRestrictions) {
      if (restriction === 'vegetarian' && !recipe.diets?.includes('vegetarian')) {
        return false
      }
      if (restriction === 'vegan' && !recipe.diets?.includes('vegan')) {
        return false
      }
      if (restriction === 'gluten-free' && !recipe.diets?.includes('gluten-free')) {
        return false
      }
      if (restriction === 'dairy-free' && !recipe.diets?.includes('dairy-free')) {
        return false
      }
    }

    return true
  })

  if (filteredRecipes.length === 0) {
    filteredRecipes = recipes
  }

  const scoredRecipes = filteredRecipes.map(recipe => ({
    recipe,
    score: calculateRecipeScore(recipe, preferences, filteredRecipes, inventory),
  }))

  scoredRecipes.sort((a, b) => b.score - a.score)

  const selectedMeals = selectMealsWithVariety(
    scoredRecipes,
    mealsPerWeek,
    cuisinePreferences
  )

  const schedule = createWeeklySchedule(selectedMeals, mealsPerWeek)

  let shoppingList = generateShoppingList(selectedMeals)

  if (inventory.length > 0) {
    shoppingList = subtractInventoryFromShoppingList(shoppingList, inventory)
  }

  return {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    meals: selectedMeals,
    schedule,
    shoppingList,
    preferences,
    stats: calculatePlanStats(selectedMeals),
  }
}

function calculateRecipeScore(recipe, preferences, allRecipes, inventory = []) {
  let score = 50

  if (recipe.healthScore) {
    score += recipe.healthScore * 0.2
  }

  if (preferences.cuisinePreferences?.length > 0) {
    const matchesCuisine = recipe.cuisines?.some(c =>
      preferences.cuisinePreferences.some(pref =>
        c.toLowerCase().includes(pref.toLowerCase())
      )
    )
    if (matchesCuisine) score += 20
  }

  const ingredientOverlapScore = calculateIngredientOverlap(recipe, allRecipes)
  score += ingredientOverlapScore * 15

  if (recipe.freezable) {
    score += 10
  }

  if (recipe.cheap) {
    score += 5
  }

  if (recipe.veryPopular) {
    score += 5
  }

  // Bonus for recipes using on-hand inventory items
  if (inventory.length > 0 && recipe.extendedIngredients?.length > 0) {
    const inventoryNames = inventory.map(i => (i.name || '').toLowerCase())
    let matchCount = 0
    for (const ing of recipe.extendedIngredients) {
      const ingName = (ing.name || '').toLowerCase()
      if (inventoryNames.some(inv => inv.includes(ingName) || ingName.includes(inv))) {
        matchCount++
      }
    }
    const matchRatio = matchCount / recipe.extendedIngredients.length
    score += matchRatio * 25
  }

  return score
}

function calculateIngredientOverlap(recipe, allRecipes) {
  if (!recipe.extendedIngredients) return 0

  const recipeIngredients = new Set(
    recipe.extendedIngredients.map(i => i.name?.toLowerCase())
  )

  let totalOverlap = 0
  let comparedRecipes = 0

  for (const other of allRecipes) {
    if (other.id === recipe.id || !other.extendedIngredients) continue

    const otherIngredients = new Set(
      other.extendedIngredients.map(i => i.name?.toLowerCase())
    )

    let overlap = 0
    for (const ing of recipeIngredients) {
      if (otherIngredients.has(ing)) overlap++
    }

    totalOverlap += overlap / recipeIngredients.size
    comparedRecipes++
  }

  return comparedRecipes > 0 ? totalOverlap / comparedRecipes : 0
}

function selectMealsWithVariety(scoredRecipes, count, cuisinePreferences) {
  const selected = []
  const usedCuisines = new Set()

  for (const { recipe } of scoredRecipes) {
    if (selected.length >= count) break

    const recipeCuisine = recipe.cuisines?.[0]

    if (cuisinePreferences.length > 0 && selected.length < cuisinePreferences.length) {
      if (recipeCuisine && !usedCuisines.has(recipeCuisine)) {
        selected.push(recipe)
        usedCuisines.add(recipeCuisine)
        continue
      }
    }

    if (!selected.some(s => s.id === recipe.id)) {
      selected.push(recipe)
      if (recipeCuisine) usedCuisines.add(recipeCuisine)
    }
  }

  while (selected.length < count && scoredRecipes.length > selected.length) {
    const remaining = scoredRecipes.filter(
      ({ recipe }) => !selected.some(s => s.id === recipe.id)
    )
    if (remaining.length > 0) {
      selected.push(remaining[0].recipe)
    } else {
      break
    }
  }

  return selected
}

function createWeeklySchedule(meals, mealsPerWeek) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const schedule = []

  const prepIntensive = meals.filter(m => m.readyInMinutes > 40)
  const quickMeals = meals.filter(m => m.readyInMinutes <= 40)

  const weekendDays = ['Saturday', 'Sunday']
  const weekdays = days.filter(d => !weekendDays.includes(d))

  let mealIndex = 0
  let prepIndex = 0
  let quickIndex = 0

  for (let i = 0; i < Math.min(mealsPerWeek, 7); i++) {
    const day = days[i]
    let meal

    if (weekendDays.includes(day) && prepIntensive.length > prepIndex) {
      meal = prepIntensive[prepIndex++]
    } else if (quickMeals.length > quickIndex) {
      meal = quickMeals[quickIndex++]
    } else if (mealIndex < meals.length) {
      meal = meals[mealIndex++]
    }

    if (meal) {
      schedule.push({
        day,
        meal,
        prepDay: meal.readyInMinutes > 40 ? day : null,
      })
    }
  }

  return schedule
}

export function generateShoppingList(meals) {
  const ingredientMap = new Map()

  for (const meal of meals) {
    if (!meal.extendedIngredients) continue

    for (const ingredient of meal.extendedIngredients) {
      const key = ingredient.name?.toLowerCase()
      if (!key) continue

      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key)
        if (existing.unit === ingredient.unit) {
          existing.amount += ingredient.amount
        }
        existing.recipes.push(meal.title)
      } else {
        ingredientMap.set(key, {
          id: ingredient.id || Date.now() + Math.random(),
          name: ingredient.name,
          amount: ingredient.amount,
          unit: ingredient.unit,
          aisle: ingredient.aisle || 'Other',
          recipes: [meal.title],
          checked: false,
        })
      }
    }
  }

  const items = Array.from(ingredientMap.values())

  items.sort((a, b) => {
    if (a.aisle !== b.aisle) {
      return a.aisle.localeCompare(b.aisle)
    }
    return a.name.localeCompare(b.name)
  })

  return items
}

function calculatePlanStats(meals) {
  const stats = {
    totalMeals: meals.length,
    totalServings: 0,
    totalPrepTime: 0,
    avgPrepTime: 0,
    avgCalories: 0,
    freezerFriendlyCount: 0,
    cuisines: new Set(),
    estimatedCost: 0,
  }

  for (const meal of meals) {
    stats.totalServings += meal.servings || 0
    stats.totalPrepTime += meal.readyInMinutes || 0

    if (meal.nutrition?.nutrients) {
      const calories = meal.nutrition.nutrients.find(n => n.name === 'Calories')
      if (calories) stats.avgCalories += calories.amount
    }

    if (meal.freezable) stats.freezerFriendlyCount++

    meal.cuisines?.forEach(c => stats.cuisines.add(c))

    if (meal.pricePerServing) {
      stats.estimatedCost += (meal.pricePerServing * (meal.servings || 1)) / 100
    }
  }

  if (meals.length > 0) {
    stats.avgPrepTime = Math.round(stats.totalPrepTime / meals.length)
    stats.avgCalories = Math.round(stats.avgCalories / meals.length)
  }

  stats.cuisines = Array.from(stats.cuisines)

  return stats
}

export function optimizeForIngredientOverlap(recipes, targetCount) {
  if (recipes.length <= targetCount) return recipes

  const selected = [recipes[0]]

  while (selected.length < targetCount) {
    let bestRecipe = null
    let bestScore = -1

    for (const recipe of recipes) {
      if (selected.some(s => s.id === recipe.id)) continue

      let overlapScore = 0
      for (const selectedRecipe of selected) {
        overlapScore += calculatePairwiseOverlap(recipe, selectedRecipe)
      }

      if (overlapScore > bestScore) {
        bestScore = overlapScore
        bestRecipe = recipe
      }
    }

    if (bestRecipe) {
      selected.push(bestRecipe)
    } else {
      break
    }
  }

  return selected
}

function calculatePairwiseOverlap(recipe1, recipe2) {
  if (!recipe1.extendedIngredients || !recipe2.extendedIngredients) return 0

  const set1 = new Set(recipe1.extendedIngredients.map(i => i.name?.toLowerCase()))
  const set2 = new Set(recipe2.extendedIngredients.map(i => i.name?.toLowerCase()))

  let overlap = 0
  for (const ing of set1) {
    if (set2.has(ing)) overlap++
  }

  return overlap
}

// Unit normalization for inventory comparison
const UNIT_ALIASES = {
  'lb': 'lbs', 'pound': 'lbs', 'pounds': 'lbs',
  'oz': 'oz', 'ounce': 'oz', 'ounces': 'oz',
  'cup': 'cups', 'c': 'cups',
  'tbsp': 'tbsp', 'tablespoon': 'tbsp', 'tablespoons': 'tbsp',
  'tsp': 'tsp', 'teaspoon': 'tsp', 'teaspoons': 'tsp',
  'clove': 'cloves',
  'piece': 'count', 'pieces': 'count', 'count': 'count',
  'can': 'cans', 'jar': 'jars',
}

function normalizeUnit(unit) {
  if (!unit) return null
  const lower = unit.toLowerCase().trim()
  return UNIT_ALIASES[lower] || lower
}

export function subtractInventoryFromShoppingList(shoppingList, inventory) {
  return shoppingList.map(item => {
    const itemName = (item.name || '').toLowerCase()

    // Find matching inventory item
    const match = inventory.find(inv => {
      const invName = (inv.name || '').toLowerCase()
      return invName === itemName || invName.includes(itemName) || itemName.includes(invName)
    })

    if (!match) return item

    // If inventory item has no known quantity, flag it but can't subtract
    if (match.amount == null) {
      return {
        ...item,
        onHand: true,
        onHandNote: `You may have ${match.displayName || match.name} in your pantry`,
      }
    }

    // Check if units are compatible
    const itemUnit = normalizeUnit(item.unit)
    const invUnit = normalizeUnit(match.unit)

    if (itemUnit && invUnit && itemUnit !== invUnit) {
      // Units not compatible — just flag it
      return {
        ...item,
        onHand: true,
        onHandNote: `You have ${match.amount} ${match.unit} of ${match.displayName || match.name}`,
      }
    }

    // Calculate adjusted amount
    if (item.amount && match.amount) {
      const needed = item.amount
      const onHand = match.amount
      const adjustedAmount = needed - onHand

      if (adjustedAmount <= 0) {
        return {
          ...item,
          coveredByInventory: true,
          onHand: true,
          originalAmount: needed,
          adjustedAmount: 0,
        }
      }

      return {
        ...item,
        onHand: true,
        originalAmount: needed,
        adjustedAmount,
        onHandAmount: onHand,
        onHandUnit: match.unit,
      }
    }

    return {
      ...item,
      onHand: true,
      onHandNote: `You have some ${match.displayName || match.name} on hand`,
    }
  })
}
