const API_BASE_URL = 'https://api.spoonacular.com'
const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY

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

async function fetchApi(endpoint, params = {}) {
  if (!API_KEY) {
    return getMockData(endpoint, params)
  }

  const url = new URL(`${API_BASE_URL}${endpoint}`)
  url.searchParams.append('apiKey', API_KEY)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value)
    }
  })

  const response = await fetch(url.toString())

  if (!response.ok) {
    if (response.status === 402) {
      throw new Error('API quota exceeded. Please try again tomorrow or use demo mode.')
    }
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
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
}) {
  const dietString = diet
    .map(d => DIET_MAP[d])
    .filter(Boolean)
    .join(',')

  const intoleranceString = [
    ...intolerances.map(i => INTOLERANCE_MAP[i]).filter(Boolean),
  ].join(',')

  return fetchApi('/recipes/complexSearch', {
    query,
    cuisine,
    diet: dietString,
    intolerances: intoleranceString,
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

function getMockData(endpoint, params) {
  if (endpoint.includes('/recipes/complexSearch') || endpoint.includes('/recipes/random')) {
    return { results: MOCK_RECIPES, totalResults: MOCK_RECIPES.length }
  }

  if (endpoint.includes('/recipes/') && endpoint.includes('/information')) {
    const id = parseInt(endpoint.split('/')[2])
    return MOCK_RECIPES.find(r => r.id === id) || MOCK_RECIPES[0]
  }

  return { results: MOCK_RECIPES }
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
]

export { MOCK_RECIPES }
