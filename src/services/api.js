import { isVisionConfigured } from './visionApi'
import { generateRecipesWithAI } from './openaiRecipes'

const API_BASE_URL = 'https://api.spoonacular.com'
const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY

// Cache - persists until user explicitly searches or clears
const apiCache = new Map()

function getCacheKey(endpoint, params) {
  return `${endpoint}:${JSON.stringify(params)}`
}

function getCachedResponse(cacheKey) {
  return apiCache.get(cacheKey) || null
}

function setCachedResponse(cacheKey, data) {
  apiCache.set(cacheKey, data)
}

// API quota tracking - persist to localStorage
function loadQuotaFromStorage() {
  try {
    const saved = localStorage.getItem('spoonacular_quota')
    if (saved) {
      const parsed = JSON.parse(saved)
      // Check if it's from today (quota resets daily at midnight UTC)
      const savedDate = new Date(parsed.lastUpdated).toISOString().split('T')[0]
      const today = new Date().toISOString().split('T')[0]
      if (savedDate === today) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Error loading quota from storage:', e)
  }
  return {
    used: 0,
    remaining: 150,
    total: 150,
    lastUpdated: null,
  }
}

function saveQuotaToStorage(quota) {
  try {
    localStorage.setItem('spoonacular_quota', JSON.stringify(quota))
  } catch (e) {
    console.error('Error saving quota to storage:', e)
  }
}

let apiQuota = loadQuotaFromStorage()

let quotaListeners = []

export function subscribeToQuota(callback) {
  quotaListeners.push(callback)
  callback(apiQuota)
  return () => {
    quotaListeners = quotaListeners.filter(cb => cb !== callback)
  }
}

function notifyQuotaListeners() {
  quotaListeners.forEach(cb => cb(apiQuota))
}

export function getApiQuota() {
  return apiQuota
}

export function clearApiCache() {
  apiCache.clear()
}

export function getCacheStats() {
  return {
    size: apiCache.size,
    keys: Array.from(apiCache.keys()),
  }
}

// Clear only recipe search cache (for when user does a new search)
export function clearSearchCache() {
  for (const key of apiCache.keys()) {
    if (key.includes('/recipes/complexSearch')) {
      apiCache.delete(key)
    }
  }
}

const DIET_MAP = {
  'vegetarian': 'vegetarian',
  'vegan': 'vegan',
  'gluten-free': 'gluten free',
  'dairy-free': 'dairy free',
}

const INTOLERANCE_MAP = {
  'dairy-free': 'dairy',
  'gluten-free': 'gluten',
  'nut-free': 'tree nut,peanut',
}

// Foods to exclude for ostomy-safe meals
const OSTOMY_EXCLUDE_INGREDIENTS = [
  'peanut', 'peanuts', 'peanut butter',
  'pickle', 'pickles', 'pickled',
  'popcorn',
  'corn on the cob',
  'celery',
  'coconut',
  'dried fruit',
  'fruit skin',
  'mushroom', 'mushrooms',
  'nuts', 'almonds', 'walnuts', 'cashews', 'pecans',
  'seeds', 'sunflower seeds', 'chia seeds',
  'raw vegetables',
  'cabbage', 'sauerkraut',
  'bean sprouts',
  'peas',
]

async function fetchApi(endpoint, params = {}, { useCache = true } = {}) {
  if (!API_KEY) {
    return getMockData(endpoint, params)
  }

  // Check cache first
  const cacheKey = getCacheKey(endpoint, params)
  if (useCache) {
    const cachedData = getCachedResponse(cacheKey)
    if (cachedData) {
      console.log('Using cached response for:', endpoint)
      return cachedData
    }
  }

  const url = new URL(`${API_BASE_URL}${endpoint}`)
  url.searchParams.append('apiKey', API_KEY)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value)
    }
  })

  const response = await fetch(url.toString())

  // Update quota from response headers
  const requestsUsed = response.headers.get('X-API-Quota-Used')
  const requestsRemaining = response.headers.get('X-API-Quota-Left')

  if (requestsUsed !== null || requestsRemaining !== null) {
    apiQuota = {
      used: requestsUsed ? parseInt(requestsUsed) : apiQuota.used,
      remaining: requestsRemaining ? parseFloat(requestsRemaining) : apiQuota.remaining,
      total: 150, // Free tier limit
      lastUpdated: new Date().toISOString(),
    }
    saveQuotaToStorage(apiQuota)
    notifyQuotaListeners()
  }

  if (!response.ok) {
    if (response.status === 402) {
      apiQuota.remaining = 0
      apiQuota.lastUpdated = new Date().toISOString()
      saveQuotaToStorage(apiQuota)
      notifyQuotaListeners()
      throw new Error('API quota exceeded. Please try again tomorrow or use demo mode.')
    }
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()

  // Cache the successful response
  if (useCache) {
    setCachedResponse(cacheKey, data)
  }

  return data
}

export async function searchRecipes({
  query = '',
  cuisine = '',
  diet = [],
  intolerances = [],
  type = '',
  maxReadyTime = null,
  number = 12,
  offset = 0,
  ostomySafe = false,
}) {
  const dietString = diet
    .map(d => DIET_MAP[d])
    .filter(Boolean)
    .join(',')

  const intoleranceString = [
    ...intolerances.map(i => INTOLERANCE_MAP[i]).filter(Boolean),
  ].join(',')

  // Add ostomy-unsafe ingredients to exclude list
  const excludeIngredients = ostomySafe ? OSTOMY_EXCLUDE_INGREDIENTS.join(',') : ''

  return fetchApi('/recipes/complexSearch', {
    query,
    cuisine,
    diet: dietString,
    intolerances: intoleranceString,
    excludeIngredients,
    type,
    maxReadyTime,
    number,
    offset,
    addRecipeInformation: true,
    addRecipeNutrition: true,
    fillIngredients: true,
  })
}

export async function getRecipeById(id) {
  return fetchApi(`/recipes/${id}/information`, {
    includeNutrition: true,
  })
}

export async function getRandomRecipes({
  number = 5,
  tags = [],
}) {
  return fetchApi('/recipes/random', {
    number,
    tags: tags.join(','),
  })
}

export async function getRecipesByIngredients(ingredients, number = 10) {
  return fetchApi('/recipes/findByIngredients', {
    ingredients: ingredients.join(','),
    number,
    ranking: 2,
    ignorePantry: true,
  })
}

export async function getIngredientSubstitutes(ingredientName) {
  return fetchApi('/food/ingredients/substitutes', {
    ingredientName,
  })
}

export async function getSimilarRecipes(recipeId, number = 5) {
  return fetchApi(`/recipes/${recipeId}/similar`, {
    number,
  })
}

const SLOT_TO_API_TYPE = {
  breakfast: 'breakfast',
  lunch: 'main course',
  dinner: 'main course',
}

const SLOT_TO_QUERY = {
  breakfast: 'breakfast',
  lunch: 'lunch',
  dinner: 'dinner',
}

export async function searchRecipesForMealPlan(preferences) {
  const {
    mealSlots = 1,
    mealsPerWeek = 5,
    dietaryRestrictions = [],
    maxPrepTimeMinutes = 60,
    cuisinePreferences = [],
    freezerFriendly = false,
  } = preferences

  const SLOT_CONFIGS = { 1: ['dinner'], 2: ['lunch', 'dinner'], 3: ['breakfast', 'lunch', 'dinner'] }
  const activeSlots = SLOT_CONFIGS[mealSlots] || ['dinner']

  const ostomySafe = dietaryRestrictions.includes('ostomy-safe')

  // Decision flow: Spoonacular (if quota available) → OpenAI → Mock
  const useSpoonacular = API_KEY && apiQuota.remaining >= 20
  const useOpenAI = !useSpoonacular && isVisionConfigured()

  if (useOpenAI) {
    console.log('Using OpenAI for recipe generation (Spoonacular quota low or unavailable)')
    const slotFetches = activeSlots.map(async (slot) => {
      try {
        return await generateRecipesWithAI(slot, preferences, Math.max(mealsPerWeek + 3, 8))
      } catch (err) {
        console.error(`Error generating ${slot} recipes with OpenAI:`, err)
        return []
      }
    })

    const slotResults = await Promise.all(slotFetches)
    const all = slotResults.flat()
    if (all.length > 0) return all

    // Fall through to Spoonacular/mock if OpenAI returned nothing
    console.log('OpenAI returned no recipes, falling back')
  }

  // Fetch recipes for each slot in parallel (Spoonacular or mock)
  const slotFetches = activeSlots.map(async (slot) => {
    try {
      const result = await searchRecipes({
        query: SLOT_TO_QUERY[slot],
        type: SLOT_TO_API_TYPE[slot],
        diet: dietaryRestrictions.filter(d => DIET_MAP[d]),
        intolerances: dietaryRestrictions.filter(d => INTOLERANCE_MAP[d]),
        cuisine: cuisinePreferences.join(','),
        maxReadyTime: maxPrepTimeMinutes,
        number: Math.max(mealsPerWeek + 3, 10),
        ostomySafe,
      })
      const recipes = result.results || result || []
      // Tag each recipe with the slot it was fetched for
      return recipes.map(r => ({
        ...r,
        mealTypes: r.mealTypes || [slot],
      }))
    } catch (err) {
      console.error(`Error fetching ${slot} recipes:`, err)
      return []
    }
  })

  const slotResults = await Promise.all(slotFetches)

  // Combine all recipes, dedup by id (keep first occurrence with its mealTypes)
  const seen = new Map()
  for (const recipes of slotResults) {
    for (const recipe of recipes) {
      if (seen.has(recipe.id)) {
        // Merge mealTypes
        const existing = seen.get(recipe.id)
        const merged = new Set([...(existing.mealTypes || []), ...(recipe.mealTypes || [])])
        existing.mealTypes = Array.from(merged)
      } else {
        seen.set(recipe.id, recipe)
      }
    }
  }

  return Array.from(seen.values())
}

function getMockData(endpoint, params) {
  // Set mock quota for demo mode
  apiQuota = {
    used: 0,
    remaining: 150,
    total: 150,
    lastUpdated: new Date().toISOString(),
    isDemo: true,
  }
  notifyQuotaListeners()

  if (endpoint.includes('/recipes/complexSearch') || endpoint.includes('/recipes/random')) {
    let recipes = [...MOCK_RECIPES]
    // Filter by meal type based on query/type params in demo mode
    const query = (params.query || '').toLowerCase()
    if (query === 'breakfast') {
      recipes = MOCK_RECIPES.filter(r => r.mealTypes?.includes('breakfast'))
    } else if (query === 'lunch') {
      recipes = MOCK_RECIPES.filter(r => r.mealTypes?.includes('lunch'))
    } else if (query === 'dinner') {
      recipes = MOCK_RECIPES.filter(r => r.mealTypes?.includes('dinner'))
    }
    return { results: recipes, totalResults: recipes.length }
  }

  if (endpoint.includes('/recipes/') && endpoint.includes('/information')) {
    const id = parseInt(endpoint.split('/')[2])
    return MOCK_RECIPES.find(r => r.id === id) || MOCK_RECIPES[0]
  }

  if (endpoint.includes('/similar')) {
    return MOCK_RECIPES.slice(0, 5)
  }

  return { results: MOCK_RECIPES }
}

// Helper to check if a recipe is ostomy-safe
export function isOstomySafe(recipe) {
  if (!recipe.extendedIngredients) return true

  const ingredientNames = recipe.extendedIngredients
    .map(i => i.name?.toLowerCase() || '')
    .join(' ')

  return !OSTOMY_EXCLUDE_INGREDIENTS.some(exclude =>
    ingredientNames.includes(exclude.toLowerCase())
  )
}

const MOCK_RECIPES = [
  {
    id: 1,
    title: 'Mediterranean Chicken Bowl',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    readyInMinutes: 35,
    servings: 4,
    cuisines: ['Mediterranean'],
    diets: ['gluten-free', 'dairy-free'],
    mealTypes: ['dinner'],
    summary: 'A healthy Mediterranean-inspired chicken bowl with quinoa, vegetables, and a lemon herb dressing.',
    pricePerServing: 425,
    healthScore: 85,
    veryHealthy: true,
    cheap: false,
    veryPopular: true,
    sustainable: true,
    freezable: true,
    extendedIngredients: [
      { id: 1, name: 'chicken breast', amount: 1.5, unit: 'lbs', aisle: 'Meat' },
      { id: 2, name: 'quinoa', amount: 1, unit: 'cup', aisle: 'Grains' },
      { id: 3, name: 'cucumber', amount: 1, unit: 'medium', aisle: 'Produce' },
      { id: 4, name: 'cherry tomatoes', amount: 1, unit: 'cup', aisle: 'Produce' },
      { id: 5, name: 'red onion', amount: 0.5, unit: 'medium', aisle: 'Produce' },
      { id: 6, name: 'olive oil', amount: 3, unit: 'tbsp', aisle: 'Oils' },
      { id: 7, name: 'lemon', amount: 1, unit: 'medium', aisle: 'Produce' },
      { id: 8, name: 'garlic', amount: 2, unit: 'cloves', aisle: 'Produce' },
    ],
    analyzedInstructions: [{
      steps: [
        { number: 1, step: 'Cook quinoa according to package directions.' },
        { number: 2, step: 'Season chicken with salt, pepper, and herbs.' },
        { number: 3, step: 'Grill or pan-fry chicken until cooked through.' },
        { number: 4, step: 'Dice vegetables and prepare lemon dressing.' },
        { number: 5, step: 'Assemble bowls with quinoa, sliced chicken, and vegetables.' },
      ]
    }],
    nutrition: {
      nutrients: [
        { name: 'Calories', amount: 420, unit: 'kcal' },
        { name: 'Protein', amount: 35, unit: 'g' },
        { name: 'Carbohydrates', amount: 32, unit: 'g' },
        { name: 'Fat', amount: 16, unit: 'g' },
      ]
    }
  },
  {
    id: 2,
    title: 'Asian Beef Stir-Fry',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
    readyInMinutes: 25,
    servings: 4,
    cuisines: ['Asian', 'Chinese'],
    diets: ['dairy-free'],
    mealTypes: ['dinner'],
    summary: 'Quick and flavorful beef stir-fry with colorful vegetables and a savory ginger-soy sauce.',
    pricePerServing: 550,
    healthScore: 72,
    veryHealthy: true,
    cheap: false,
    veryPopular: true,
    sustainable: false,
    freezable: true,
    extendedIngredients: [
      { id: 9, name: 'beef sirloin', amount: 1, unit: 'lb', aisle: 'Meat' },
      { id: 10, name: 'broccoli', amount: 2, unit: 'cups', aisle: 'Produce' },
      { id: 11, name: 'bell pepper', amount: 1, unit: 'medium', aisle: 'Produce' },
      { id: 12, name: 'soy sauce', amount: 3, unit: 'tbsp', aisle: 'Asian' },
      { id: 13, name: 'ginger', amount: 1, unit: 'inch', aisle: 'Produce' },
      { id: 14, name: 'sesame oil', amount: 1, unit: 'tbsp', aisle: 'Oils' },
    ],
    analyzedInstructions: [{
      steps: [
        { number: 1, step: 'Slice beef thin against the grain.' },
        { number: 2, step: 'Prepare vegetables and sauce mixture.' },
        { number: 3, step: 'Stir-fry beef until browned, set aside.' },
        { number: 4, step: 'Stir-fry vegetables until crisp-tender.' },
        { number: 5, step: 'Return beef to pan, add sauce, and cook until thickened.' },
      ]
    }],
    nutrition: {
      nutrients: [
        { name: 'Calories', amount: 380, unit: 'kcal' },
        { name: 'Protein', amount: 32, unit: 'g' },
        { name: 'Carbohydrates', amount: 18, unit: 'g' },
        { name: 'Fat', amount: 20, unit: 'g' },
      ]
    }
  },
  {
    id: 3,
    title: 'Italian Turkey Meatballs',
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400',
    readyInMinutes: 45,
    servings: 6,
    cuisines: ['Italian'],
    diets: [],
    mealTypes: ['dinner'],
    summary: 'Lean turkey meatballs in a rich marinara sauce, perfect for meal prep and freezing.',
    pricePerServing: 380,
    healthScore: 68,
    veryHealthy: true,
    cheap: true,
    veryPopular: true,
    sustainable: true,
    freezable: true,
    extendedIngredients: [
      { id: 15, name: 'ground turkey', amount: 1.5, unit: 'lbs', aisle: 'Meat' },
      { id: 16, name: 'breadcrumbs', amount: 0.5, unit: 'cup', aisle: 'Bakery' },
      { id: 17, name: 'egg', amount: 1, unit: 'large', aisle: 'Dairy' },
      { id: 18, name: 'marinara sauce', amount: 24, unit: 'oz', aisle: 'Pasta' },
      { id: 19, name: 'parmesan', amount: 0.25, unit: 'cup', aisle: 'Dairy' },
      { id: 20, name: 'Italian seasoning', amount: 1, unit: 'tbsp', aisle: 'Spices' },
    ],
    analyzedInstructions: [{
      steps: [
        { number: 1, step: 'Mix turkey with breadcrumbs, egg, parmesan, and seasonings.' },
        { number: 2, step: 'Form into 24 meatballs.' },
        { number: 3, step: 'Brown meatballs in a skillet.' },
        { number: 4, step: 'Add marinara sauce and simmer for 20 minutes.' },
      ]
    }],
    nutrition: {
      nutrients: [
        { name: 'Calories', amount: 290, unit: 'kcal' },
        { name: 'Protein', amount: 28, unit: 'g' },
        { name: 'Carbohydrates', amount: 15, unit: 'g' },
        { name: 'Fat', amount: 12, unit: 'g' },
      ]
    }
  },
  {
    id: 4,
    title: 'Thai Coconut Curry Shrimp',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400',
    readyInMinutes: 30,
    servings: 4,
    cuisines: ['Thai', 'Asian'],
    diets: ['gluten-free', 'dairy-free'],
    mealTypes: ['dinner'],
    summary: 'Creamy Thai coconut curry with succulent shrimp, perfect for a quick weeknight dinner.',
    pricePerServing: 620,
    healthScore: 75,
    veryHealthy: true,
    cheap: false,
    veryPopular: true,
    sustainable: true,
    freezable: false,
    extendedIngredients: [
      { id: 21, name: 'shrimp', amount: 1, unit: 'lb', aisle: 'Seafood' },
      { id: 22, name: 'coconut milk', amount: 14, unit: 'oz', aisle: 'Asian' },
      { id: 23, name: 'red curry paste', amount: 2, unit: 'tbsp', aisle: 'Asian' },
      { id: 24, name: 'bell pepper', amount: 1, unit: 'medium', aisle: 'Produce' },
      { id: 25, name: 'basil', amount: 0.25, unit: 'cup', aisle: 'Produce' },
      { id: 26, name: 'fish sauce', amount: 1, unit: 'tbsp', aisle: 'Asian' },
    ],
    analyzedInstructions: [{
      steps: [
        { number: 1, step: 'Sauté curry paste in oil until fragrant.' },
        { number: 2, step: 'Add coconut milk and bring to a simmer.' },
        { number: 3, step: 'Add shrimp and bell pepper.' },
        { number: 4, step: 'Cook until shrimp is pink, about 5 minutes.' },
        { number: 5, step: 'Finish with fish sauce and fresh basil.' },
      ]
    }],
    nutrition: {
      nutrients: [
        { name: 'Calories', amount: 340, unit: 'kcal' },
        { name: 'Protein', amount: 24, unit: 'g' },
        { name: 'Carbohydrates', amount: 8, unit: 'g' },
        { name: 'Fat', amount: 24, unit: 'g' },
      ]
    }
  },
  {
    id: 5,
    title: 'Mexican Chicken Burrito Bowl',
    image: 'https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?w=400',
    readyInMinutes: 40,
    servings: 4,
    cuisines: ['Mexican'],
    diets: ['gluten-free'],
    mealTypes: ['dinner'],
    summary: 'Build-your-own burrito bowl with seasoned chicken, rice, beans, and fresh toppings.',
    pricePerServing: 350,
    healthScore: 80,
    veryHealthy: true,
    cheap: true,
    veryPopular: true,
    sustainable: true,
    freezable: true,
    extendedIngredients: [
      { id: 27, name: 'chicken thighs', amount: 1.5, unit: 'lbs', aisle: 'Meat' },
      { id: 28, name: 'rice', amount: 1.5, unit: 'cups', aisle: 'Grains' },
      { id: 29, name: 'black beans', amount: 15, unit: 'oz', aisle: 'Canned' },
      { id: 30, name: 'corn', amount: 1, unit: 'cup', aisle: 'Frozen' },
      { id: 31, name: 'lime', amount: 2, unit: 'medium', aisle: 'Produce' },
      { id: 32, name: 'cilantro', amount: 0.25, unit: 'cup', aisle: 'Produce' },
    ],
    analyzedInstructions: [{
      steps: [
        { number: 1, step: 'Season chicken with cumin, chili powder, and garlic.' },
        { number: 2, step: 'Cook rice according to package directions.' },
        { number: 3, step: 'Grill or pan-fry chicken until done.' },
        { number: 4, step: 'Warm beans and corn.' },
        { number: 5, step: 'Assemble bowls with all components.' },
      ]
    }],
    nutrition: {
      nutrients: [
        { name: 'Calories', amount: 480, unit: 'kcal' },
        { name: 'Protein', amount: 38, unit: 'g' },
        { name: 'Carbohydrates', amount: 52, unit: 'g' },
        { name: 'Fat', amount: 14, unit: 'g' },
      ]
    }
  },
  {
    id: 6,
    title: 'Vegetarian Lentil Soup',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    readyInMinutes: 50,
    servings: 6,
    cuisines: ['Mediterranean'],
    diets: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free'],
    mealTypes: ['dinner'],
    summary: 'Hearty and nutritious lentil soup packed with vegetables and warming spices.',
    pricePerServing: 180,
    healthScore: 92,
    veryHealthy: true,
    cheap: true,
    veryPopular: true,
    sustainable: true,
    freezable: true,
    extendedIngredients: [
      { id: 33, name: 'lentils', amount: 1.5, unit: 'cups', aisle: 'Grains' },
      { id: 34, name: 'carrots', amount: 3, unit: 'medium', aisle: 'Produce' },
      { id: 35, name: 'celery', amount: 3, unit: 'stalks', aisle: 'Produce' },
      { id: 36, name: 'onion', amount: 1, unit: 'large', aisle: 'Produce' },
      { id: 37, name: 'vegetable broth', amount: 6, unit: 'cups', aisle: 'Canned' },
      { id: 38, name: 'cumin', amount: 1, unit: 'tsp', aisle: 'Spices' },
    ],
    analyzedInstructions: [{
      steps: [
        { number: 1, step: 'Sauté onion, carrots, and celery until softened.' },
        { number: 2, step: 'Add lentils, broth, and spices.' },
        { number: 3, step: 'Bring to boil, then simmer for 30 minutes.' },
        { number: 4, step: 'Season to taste and serve.' },
      ]
    }],
    nutrition: {
      nutrients: [
        { name: 'Calories', amount: 220, unit: 'kcal' },
        { name: 'Protein', amount: 14, unit: 'g' },
        { name: 'Carbohydrates', amount: 38, unit: 'g' },
        { name: 'Fat', amount: 2, unit: 'g' },
      ]
    }
  },
  {
    id: 7,
    title: 'Korean BBQ Pork',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
    readyInMinutes: 35,
    servings: 4,
    cuisines: ['Korean', 'Asian'],
    diets: ['dairy-free'],
    mealTypes: ['dinner'],
    summary: 'Sweet and savory Korean-style marinated pork with traditional accompaniments.',
    pricePerServing: 420,
    healthScore: 65,
    veryHealthy: false,
    cheap: false,
    veryPopular: true,
    sustainable: false,
    freezable: true,
    extendedIngredients: [
      { id: 39, name: 'pork shoulder', amount: 1.5, unit: 'lbs', aisle: 'Meat' },
      { id: 40, name: 'gochujang', amount: 2, unit: 'tbsp', aisle: 'Asian' },
      { id: 41, name: 'soy sauce', amount: 3, unit: 'tbsp', aisle: 'Asian' },
      { id: 42, name: 'sesame oil', amount: 2, unit: 'tbsp', aisle: 'Oils' },
      { id: 43, name: 'green onions', amount: 4, unit: 'stalks', aisle: 'Produce' },
      { id: 44, name: 'garlic', amount: 4, unit: 'cloves', aisle: 'Produce' },
    ],
    analyzedInstructions: [{
      steps: [
        { number: 1, step: 'Mix marinade ingredients together.' },
        { number: 2, step: 'Slice pork thin and marinate for at least 30 minutes.' },
        { number: 3, step: 'Grill or pan-fry pork until caramelized.' },
        { number: 4, step: 'Garnish with green onions and sesame seeds.' },
      ]
    }],
    nutrition: {
      nutrients: [
        { name: 'Calories', amount: 350, unit: 'kcal' },
        { name: 'Protein', amount: 30, unit: 'g' },
        { name: 'Carbohydrates', amount: 12, unit: 'g' },
        { name: 'Fat', amount: 20, unit: 'g' },
      ]
    }
  },
  {
    id: 8,
    title: 'Grilled Salmon with Vegetables',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    readyInMinutes: 30,
    servings: 4,
    cuisines: ['American'],
    diets: ['gluten-free', 'dairy-free', 'low-fodmap'],
    mealTypes: ['dinner'],
    summary: 'Simple grilled salmon with roasted seasonal vegetables - a healthy weeknight staple.',
    pricePerServing: 750,
    healthScore: 95,
    veryHealthy: true,
    cheap: false,
    veryPopular: true,
    sustainable: true,
    freezable: false,
    extendedIngredients: [
      { id: 45, name: 'salmon fillets', amount: 4, unit: '6oz', aisle: 'Seafood' },
      { id: 46, name: 'asparagus', amount: 1, unit: 'bunch', aisle: 'Produce' },
      { id: 47, name: 'zucchini', amount: 2, unit: 'medium', aisle: 'Produce' },
      { id: 48, name: 'olive oil', amount: 3, unit: 'tbsp', aisle: 'Oils' },
      { id: 49, name: 'lemon', amount: 1, unit: 'medium', aisle: 'Produce' },
      { id: 50, name: 'dill', amount: 2, unit: 'tbsp', aisle: 'Produce' },
    ],
    analyzedInstructions: [{
      steps: [
        { number: 1, step: 'Preheat grill to medium-high.' },
        { number: 2, step: 'Season salmon with salt, pepper, and dill.' },
        { number: 3, step: 'Toss vegetables with olive oil.' },
        { number: 4, step: 'Grill salmon 4-5 minutes per side.' },
        { number: 5, step: 'Grill vegetables until tender.' },
      ]
    }],
    nutrition: {
      nutrients: [
        { name: 'Calories', amount: 380, unit: 'kcal' },
        { name: 'Protein', amount: 40, unit: 'g' },
        { name: 'Carbohydrates', amount: 10, unit: 'g' },
        { name: 'Fat', amount: 20, unit: 'g' },
      ]
    }
  },
  // === BREAKFAST RECIPES ===
  {
    id: 9,
    title: 'Oatmeal Bowl',
    image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400',
    readyInMinutes: 10,
    servings: 2,
    cuisines: ['American'],
    diets: ['vegetarian', 'vegan', 'dairy-free'],
    mealTypes: ['breakfast'],
    summary: 'Warm oatmeal topped with fresh berries, banana, and a drizzle of honey.',
    pricePerServing: 150,
    healthScore: 88,
    veryHealthy: true,
    cheap: true,
    veryPopular: true,
    sustainable: true,
    freezable: false,
    extendedIngredients: [
      { id: 101, name: 'oats', amount: 1, unit: 'cup', aisle: 'Grains' },
      { id: 102, name: 'milk', amount: 2, unit: 'cups', aisle: 'Dairy' },
      { id: 103, name: 'banana', amount: 1, unit: 'medium', aisle: 'Produce' },
      { id: 104, name: 'blueberries', amount: 0.5, unit: 'cup', aisle: 'Produce' },
      { id: 105, name: 'honey', amount: 1, unit: 'tbsp', aisle: 'Condiments' },
    ],
    analyzedInstructions: [{ steps: [
      { number: 1, step: 'Bring milk to a simmer and add oats.' },
      { number: 2, step: 'Cook for 5 minutes, stirring occasionally.' },
      { number: 3, step: 'Top with sliced banana, blueberries, and honey.' },
    ]}],
    nutrition: { nutrients: [
      { name: 'Calories', amount: 310, unit: 'kcal' },
      { name: 'Protein', amount: 10, unit: 'g' },
      { name: 'Carbohydrates', amount: 55, unit: 'g' },
      { name: 'Fat', amount: 6, unit: 'g' },
    ]}
  },
  {
    id: 10,
    title: 'Veggie Egg Scramble',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
    readyInMinutes: 15,
    servings: 2,
    cuisines: ['American'],
    diets: ['gluten-free', 'vegetarian'],
    mealTypes: ['breakfast'],
    summary: 'Fluffy scrambled eggs with sauteed bell peppers, spinach, and cherry tomatoes.',
    pricePerServing: 200,
    healthScore: 82,
    veryHealthy: true,
    cheap: true,
    veryPopular: true,
    sustainable: true,
    freezable: false,
    extendedIngredients: [
      { id: 106, name: 'eggs', amount: 4, unit: 'large', aisle: 'Dairy' },
      { id: 107, name: 'bell pepper', amount: 1, unit: 'medium', aisle: 'Produce' },
      { id: 108, name: 'spinach', amount: 1, unit: 'cup', aisle: 'Produce' },
      { id: 109, name: 'cherry tomatoes', amount: 0.5, unit: 'cup', aisle: 'Produce' },
      { id: 110, name: 'olive oil', amount: 1, unit: 'tbsp', aisle: 'Oils' },
    ],
    analyzedInstructions: [{ steps: [
      { number: 1, step: 'Saute diced pepper in olive oil until softened.' },
      { number: 2, step: 'Add spinach and tomatoes, cook 1 minute.' },
      { number: 3, step: 'Pour in beaten eggs and scramble until set.' },
    ]}],
    nutrition: { nutrients: [
      { name: 'Calories', amount: 250, unit: 'kcal' },
      { name: 'Protein', amount: 18, unit: 'g' },
      { name: 'Carbohydrates', amount: 8, unit: 'g' },
      { name: 'Fat', amount: 16, unit: 'g' },
    ]}
  },
  {
    id: 11,
    title: 'Greek Yogurt Parfait',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
    readyInMinutes: 5,
    servings: 1,
    cuisines: ['American'],
    diets: ['vegetarian', 'gluten-free'],
    mealTypes: ['breakfast'],
    summary: 'Layers of creamy Greek yogurt, crunchy granola, and fresh mixed berries.',
    pricePerServing: 250,
    healthScore: 90,
    veryHealthy: true,
    cheap: true,
    veryPopular: true,
    sustainable: true,
    freezable: false,
    extendedIngredients: [
      { id: 111, name: 'greek yogurt', amount: 1, unit: 'cup', aisle: 'Dairy' },
      { id: 112, name: 'strawberries', amount: 0.5, unit: 'cup', aisle: 'Produce' },
      { id: 113, name: 'blueberries', amount: 0.25, unit: 'cup', aisle: 'Produce' },
      { id: 114, name: 'honey', amount: 1, unit: 'tsp', aisle: 'Condiments' },
      { id: 115, name: 'oats', amount: 0.25, unit: 'cup', aisle: 'Grains' },
    ],
    analyzedInstructions: [{ steps: [
      { number: 1, step: 'Layer yogurt, berries, and granola in a glass.' },
      { number: 2, step: 'Drizzle with honey and serve immediately.' },
    ]}],
    nutrition: { nutrients: [
      { name: 'Calories', amount: 280, unit: 'kcal' },
      { name: 'Protein', amount: 20, unit: 'g' },
      { name: 'Carbohydrates', amount: 35, unit: 'g' },
      { name: 'Fat', amount: 5, unit: 'g' },
    ]}
  },
  {
    id: 12,
    title: 'Banana Pancakes',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
    readyInMinutes: 20,
    servings: 2,
    cuisines: ['American'],
    diets: ['vegetarian'],
    mealTypes: ['breakfast'],
    summary: 'Fluffy pancakes made with ripe bananas, served with maple syrup and fresh fruit.',
    pricePerServing: 180,
    healthScore: 60,
    veryHealthy: false,
    cheap: true,
    veryPopular: true,
    sustainable: true,
    freezable: true,
    extendedIngredients: [
      { id: 116, name: 'banana', amount: 2, unit: 'medium', aisle: 'Produce' },
      { id: 117, name: 'eggs', amount: 2, unit: 'large', aisle: 'Dairy' },
      { id: 118, name: 'flour', amount: 1, unit: 'cup', aisle: 'Grains' },
      { id: 119, name: 'milk', amount: 0.5, unit: 'cup', aisle: 'Dairy' },
      { id: 120, name: 'maple syrup', amount: 2, unit: 'tbsp', aisle: 'Condiments' },
    ],
    analyzedInstructions: [{ steps: [
      { number: 1, step: 'Mash bananas and mix with eggs, flour, and milk.' },
      { number: 2, step: 'Cook on a buttered griddle until golden on both sides.' },
      { number: 3, step: 'Serve with maple syrup.' },
    ]}],
    nutrition: { nutrients: [
      { name: 'Calories', amount: 350, unit: 'kcal' },
      { name: 'Protein', amount: 12, unit: 'g' },
      { name: 'Carbohydrates', amount: 60, unit: 'g' },
      { name: 'Fat', amount: 8, unit: 'g' },
    ]}
  },
  {
    id: 13,
    title: 'Breakfast Burrito',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400',
    readyInMinutes: 20,
    servings: 2,
    cuisines: ['Mexican'],
    diets: [],
    mealTypes: ['breakfast'],
    summary: 'Hearty flour tortilla filled with scrambled eggs, black beans, cheese, and salsa.',
    pricePerServing: 280,
    healthScore: 70,
    veryHealthy: true,
    cheap: true,
    veryPopular: true,
    sustainable: true,
    freezable: true,
    extendedIngredients: [
      { id: 121, name: 'eggs', amount: 4, unit: 'large', aisle: 'Dairy' },
      { id: 122, name: 'tortillas', amount: 2, unit: 'large', aisle: 'Bakery' },
      { id: 123, name: 'black beans', amount: 0.5, unit: 'cup', aisle: 'Canned' },
      { id: 124, name: 'cheddar', amount: 0.5, unit: 'cup', aisle: 'Dairy' },
      { id: 125, name: 'salsa', amount: 0.25, unit: 'cup', aisle: 'Condiments' },
    ],
    analyzedInstructions: [{ steps: [
      { number: 1, step: 'Scramble eggs in a pan.' },
      { number: 2, step: 'Warm tortillas, fill with eggs, beans, cheese, and salsa.' },
      { number: 3, step: 'Roll up and serve.' },
    ]}],
    nutrition: { nutrients: [
      { name: 'Calories', amount: 420, unit: 'kcal' },
      { name: 'Protein', amount: 24, unit: 'g' },
      { name: 'Carbohydrates', amount: 38, unit: 'g' },
      { name: 'Fat', amount: 18, unit: 'g' },
    ]}
  },
  // === LUNCH RECIPES ===
  {
    id: 14,
    title: 'Chicken Caesar Wrap',
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400',
    readyInMinutes: 15,
    servings: 2,
    cuisines: ['American'],
    diets: [],
    mealTypes: ['lunch'],
    summary: 'Grilled chicken with crisp romaine, parmesan, and Caesar dressing in a flour tortilla.',
    pricePerServing: 350,
    healthScore: 72,
    veryHealthy: true,
    cheap: false,
    veryPopular: true,
    sustainable: true,
    freezable: false,
    extendedIngredients: [
      { id: 126, name: 'chicken breast', amount: 0.75, unit: 'lbs', aisle: 'Meat' },
      { id: 127, name: 'tortillas', amount: 2, unit: 'large', aisle: 'Bakery' },
      { id: 128, name: 'lettuce', amount: 2, unit: 'cups', aisle: 'Produce' },
      { id: 129, name: 'parmesan', amount: 0.25, unit: 'cup', aisle: 'Dairy' },
      { id: 130, name: 'lemon', amount: 0.5, unit: 'medium', aisle: 'Produce' },
    ],
    analyzedInstructions: [{ steps: [
      { number: 1, step: 'Grill seasoned chicken breast and slice.' },
      { number: 2, step: 'Toss lettuce with dressing and parmesan.' },
      { number: 3, step: 'Fill tortillas with chicken and salad, roll up.' },
    ]}],
    nutrition: { nutrients: [
      { name: 'Calories', amount: 380, unit: 'kcal' },
      { name: 'Protein', amount: 30, unit: 'g' },
      { name: 'Carbohydrates', amount: 28, unit: 'g' },
      { name: 'Fat', amount: 16, unit: 'g' },
    ]}
  },
  {
    id: 15,
    title: 'Quinoa Black Bean Bowl',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    readyInMinutes: 25,
    servings: 2,
    cuisines: ['Mexican'],
    diets: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free'],
    mealTypes: ['lunch'],
    summary: 'Protein-packed quinoa bowl with black beans, corn, avocado, and lime dressing.',
    pricePerServing: 250,
    healthScore: 92,
    veryHealthy: true,
    cheap: true,
    veryPopular: true,
    sustainable: true,
    freezable: false,
    extendedIngredients: [
      { id: 131, name: 'quinoa', amount: 1, unit: 'cup', aisle: 'Grains' },
      { id: 132, name: 'black beans', amount: 15, unit: 'oz', aisle: 'Canned' },
      { id: 133, name: 'corn', amount: 0.5, unit: 'cup', aisle: 'Frozen' },
      { id: 134, name: 'avocado', amount: 1, unit: 'medium', aisle: 'Produce' },
      { id: 135, name: 'lime', amount: 1, unit: 'medium', aisle: 'Produce' },
    ],
    analyzedInstructions: [{ steps: [
      { number: 1, step: 'Cook quinoa according to package directions.' },
      { number: 2, step: 'Warm black beans and corn.' },
      { number: 3, step: 'Assemble bowls and top with avocado and lime juice.' },
    ]}],
    nutrition: { nutrients: [
      { name: 'Calories', amount: 420, unit: 'kcal' },
      { name: 'Protein', amount: 18, unit: 'g' },
      { name: 'Carbohydrates', amount: 62, unit: 'g' },
      { name: 'Fat', amount: 12, unit: 'g' },
    ]}
  },
  {
    id: 16,
    title: 'Turkey Avocado Sandwich',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
    readyInMinutes: 10,
    servings: 2,
    cuisines: ['American'],
    diets: [],
    mealTypes: ['lunch'],
    summary: 'Sliced turkey breast with mashed avocado, tomato, and lettuce on whole grain bread.',
    pricePerServing: 320,
    healthScore: 78,
    veryHealthy: true,
    cheap: false,
    veryPopular: true,
    sustainable: true,
    freezable: false,
    extendedIngredients: [
      { id: 136, name: 'ground turkey', amount: 0.5, unit: 'lbs', aisle: 'Meat' },
      { id: 137, name: 'bread', amount: 4, unit: 'slices', aisle: 'Bakery' },
      { id: 138, name: 'avocado', amount: 1, unit: 'medium', aisle: 'Produce' },
      { id: 139, name: 'tomato', amount: 1, unit: 'medium', aisle: 'Produce' },
      { id: 140, name: 'lettuce', amount: 2, unit: 'leaves', aisle: 'Produce' },
    ],
    analyzedInstructions: [{ steps: [
      { number: 1, step: 'Toast bread slices.' },
      { number: 2, step: 'Spread mashed avocado on bread.' },
      { number: 3, step: 'Layer turkey, tomato, and lettuce. Close sandwich.' },
    ]}],
    nutrition: { nutrients: [
      { name: 'Calories', amount: 360, unit: 'kcal' },
      { name: 'Protein', amount: 28, unit: 'g' },
      { name: 'Carbohydrates', amount: 30, unit: 'g' },
      { name: 'Fat', amount: 14, unit: 'g' },
    ]}
  },
  {
    id: 17,
    title: 'Asian Noodle Salad',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
    readyInMinutes: 20,
    servings: 2,
    cuisines: ['Asian'],
    diets: ['vegan', 'vegetarian', 'dairy-free'],
    mealTypes: ['lunch'],
    summary: 'Cold rice noodles tossed with crunchy vegetables and a tangy sesame-soy dressing.',
    pricePerServing: 220,
    healthScore: 75,
    veryHealthy: true,
    cheap: true,
    veryPopular: true,
    sustainable: true,
    freezable: false,
    extendedIngredients: [
      { id: 141, name: 'rice', amount: 8, unit: 'oz', aisle: 'Grains' },
      { id: 142, name: 'cucumber', amount: 1, unit: 'medium', aisle: 'Produce' },
      { id: 143, name: 'carrots', amount: 1, unit: 'medium', aisle: 'Produce' },
      { id: 144, name: 'soy sauce', amount: 2, unit: 'tbsp', aisle: 'Asian' },
      { id: 145, name: 'sesame oil', amount: 1, unit: 'tbsp', aisle: 'Oils' },
    ],
    analyzedInstructions: [{ steps: [
      { number: 1, step: 'Cook rice noodles, drain and cool.' },
      { number: 2, step: 'Julienne cucumber and carrots.' },
      { number: 3, step: 'Toss everything with soy-sesame dressing.' },
    ]}],
    nutrition: { nutrients: [
      { name: 'Calories', amount: 320, unit: 'kcal' },
      { name: 'Protein', amount: 8, unit: 'g' },
      { name: 'Carbohydrates', amount: 52, unit: 'g' },
      { name: 'Fat', amount: 10, unit: 'g' },
    ]}
  },
  {
    id: 18,
    title: 'Tomato Soup & Grilled Cheese',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    readyInMinutes: 30,
    servings: 2,
    cuisines: ['American'],
    diets: ['vegetarian'],
    mealTypes: ['lunch'],
    summary: 'Classic creamy tomato soup paired with a golden, crispy grilled cheese sandwich.',
    pricePerServing: 200,
    healthScore: 62,
    veryHealthy: false,
    cheap: true,
    veryPopular: true,
    sustainable: true,
    freezable: true,
    extendedIngredients: [
      { id: 146, name: 'canned tomatoes', amount: 28, unit: 'oz', aisle: 'Canned' },
      { id: 147, name: 'bread', amount: 4, unit: 'slices', aisle: 'Bakery' },
      { id: 148, name: 'cheddar', amount: 4, unit: 'slices', aisle: 'Dairy' },
      { id: 149, name: 'butter', amount: 2, unit: 'tbsp', aisle: 'Dairy' },
      { id: 150, name: 'garlic', amount: 2, unit: 'cloves', aisle: 'Produce' },
    ],
    analyzedInstructions: [{ steps: [
      { number: 1, step: 'Saute garlic in butter, add tomatoes and simmer 15 min.' },
      { number: 2, step: 'Blend soup until smooth.' },
      { number: 3, step: 'Make grilled cheese on a skillet until golden.' },
    ]}],
    nutrition: { nutrients: [
      { name: 'Calories', amount: 380, unit: 'kcal' },
      { name: 'Protein', amount: 14, unit: 'g' },
      { name: 'Carbohydrates', amount: 40, unit: 'g' },
      { name: 'Fat', amount: 18, unit: 'g' },
    ]}
  },
  // === DUAL LUNCH+DINNER RECIPES ===
  {
    id: 19,
    title: 'Mediterranean Chickpea Salad',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    readyInMinutes: 15,
    servings: 4,
    cuisines: ['Mediterranean'],
    diets: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free'],
    mealTypes: ['lunch', 'dinner'],
    summary: 'Refreshing salad with chickpeas, cucumber, tomatoes, and a lemon-herb vinaigrette.',
    pricePerServing: 200,
    healthScore: 90,
    veryHealthy: true,
    cheap: true,
    veryPopular: true,
    sustainable: true,
    freezable: false,
    extendedIngredients: [
      { id: 151, name: 'chickpeas', amount: 30, unit: 'oz', aisle: 'Canned' },
      { id: 152, name: 'cucumber', amount: 1, unit: 'medium', aisle: 'Produce' },
      { id: 153, name: 'cherry tomatoes', amount: 1, unit: 'cup', aisle: 'Produce' },
      { id: 154, name: 'red onion', amount: 0.5, unit: 'medium', aisle: 'Produce' },
      { id: 155, name: 'olive oil', amount: 3, unit: 'tbsp', aisle: 'Oils' },
      { id: 156, name: 'lemon', amount: 1, unit: 'medium', aisle: 'Produce' },
    ],
    analyzedInstructions: [{ steps: [
      { number: 1, step: 'Drain and rinse chickpeas.' },
      { number: 2, step: 'Dice cucumber, tomatoes, and onion.' },
      { number: 3, step: 'Toss with olive oil and lemon juice. Season to taste.' },
    ]}],
    nutrition: { nutrients: [
      { name: 'Calories', amount: 280, unit: 'kcal' },
      { name: 'Protein', amount: 12, unit: 'g' },
      { name: 'Carbohydrates', amount: 35, unit: 'g' },
      { name: 'Fat', amount: 12, unit: 'g' },
    ]}
  },
  {
    id: 20,
    title: 'Teriyaki Chicken Rice Bowl',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
    readyInMinutes: 30,
    servings: 4,
    cuisines: ['Japanese', 'Asian'],
    diets: ['dairy-free'],
    mealTypes: ['lunch', 'dinner'],
    summary: 'Glazed teriyaki chicken over steamed rice with stir-fried vegetables.',
    pricePerServing: 380,
    healthScore: 74,
    veryHealthy: true,
    cheap: false,
    veryPopular: true,
    sustainable: true,
    freezable: true,
    extendedIngredients: [
      { id: 157, name: 'chicken thighs', amount: 1.5, unit: 'lbs', aisle: 'Meat' },
      { id: 158, name: 'rice', amount: 2, unit: 'cups', aisle: 'Grains' },
      { id: 159, name: 'soy sauce', amount: 3, unit: 'tbsp', aisle: 'Asian' },
      { id: 160, name: 'honey', amount: 2, unit: 'tbsp', aisle: 'Condiments' },
      { id: 161, name: 'broccoli', amount: 2, unit: 'cups', aisle: 'Produce' },
      { id: 162, name: 'ginger', amount: 1, unit: 'inch', aisle: 'Produce' },
    ],
    analyzedInstructions: [{ steps: [
      { number: 1, step: 'Cook rice according to package directions.' },
      { number: 2, step: 'Pan-fry chicken until golden, add teriyaki glaze.' },
      { number: 3, step: 'Stir-fry broccoli and serve over rice with chicken.' },
    ]}],
    nutrition: { nutrients: [
      { name: 'Calories', amount: 450, unit: 'kcal' },
      { name: 'Protein', amount: 32, unit: 'g' },
      { name: 'Carbohydrates', amount: 50, unit: 'g' },
      { name: 'Fat', amount: 12, unit: 'g' },
    ]}
  },
  {
    id: 21,
    title: 'Black Bean Sweet Potato Tacos',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400',
    readyInMinutes: 35,
    servings: 4,
    cuisines: ['Mexican'],
    diets: ['vegan', 'vegetarian', 'dairy-free'],
    mealTypes: ['lunch', 'dinner'],
    summary: 'Roasted sweet potato and seasoned black bean tacos with avocado crema.',
    pricePerServing: 220,
    healthScore: 85,
    veryHealthy: true,
    cheap: true,
    veryPopular: true,
    sustainable: true,
    freezable: false,
    extendedIngredients: [
      { id: 163, name: 'sweet potato', amount: 2, unit: 'medium', aisle: 'Produce' },
      { id: 164, name: 'black beans', amount: 15, unit: 'oz', aisle: 'Canned' },
      { id: 165, name: 'tortillas', amount: 8, unit: 'small', aisle: 'Bakery' },
      { id: 166, name: 'avocado', amount: 1, unit: 'medium', aisle: 'Produce' },
      { id: 167, name: 'lime', amount: 1, unit: 'medium', aisle: 'Produce' },
      { id: 168, name: 'cumin', amount: 1, unit: 'tsp', aisle: 'Spices' },
    ],
    analyzedInstructions: [{ steps: [
      { number: 1, step: 'Cube and roast sweet potatoes with cumin at 400F for 25 min.' },
      { number: 2, step: 'Warm black beans and tortillas.' },
      { number: 3, step: 'Assemble tacos and top with mashed avocado and lime.' },
    ]}],
    nutrition: { nutrients: [
      { name: 'Calories', amount: 380, unit: 'kcal' },
      { name: 'Protein', amount: 14, unit: 'g' },
      { name: 'Carbohydrates', amount: 58, unit: 'g' },
      { name: 'Fat', amount: 10, unit: 'g' },
    ]}
  },
]

export { MOCK_RECIPES }
