import { getVisionApiKey, isVisionConfigured } from './visionApi'

export { isVisionConfigured }

const SLOT_PROMPTS = {
  breakfast: `Generate actual breakfast recipes - foods people eat in the morning.
Include options like: oatmeal, eggs, pancakes, smoothie bowls, granola, yogurt parfaits, breakfast sandwiches, french toast, waffles, overnight oats, etc.
Do NOT include dinner-style entrees like stir-fry, pasta, or curry.`,
  lunch: `Generate lunch recipes - lighter meals suitable for midday.
Include options like: sandwiches, wraps, salads, grain bowls, soups, quesadillas, etc.`,
  dinner: `Generate dinner recipes - hearty main course meals.
Include options like: stir-fries, pastas, grilled proteins, curries, casseroles, roasted dishes, etc.`,
}

function buildPreferencesPrompt(preferences) {
  const parts = []
  const { dietaryRestrictions = [], cuisinePreferences = [], maxPrepTimeMinutes, freezerFriendly } = preferences

  if (dietaryRestrictions.length > 0) {
    parts.push(`Dietary restrictions: ${dietaryRestrictions.join(', ')}`)
  }
  if (cuisinePreferences.length > 0) {
    parts.push(`Preferred cuisines: ${cuisinePreferences.join(', ')}`)
  }
  if (maxPrepTimeMinutes) {
    parts.push(`Maximum prep time: ${maxPrepTimeMinutes} minutes`)
  }
  if (freezerFriendly) {
    parts.push('Prefer freezer-friendly recipes that store and reheat well')
  }
  return parts.length > 0 ? parts.join('\n') : 'No special preferences.'
}

const RECIPE_FORMAT_INSTRUCTIONS = `Return a JSON array of recipes. Each recipe MUST have this exact structure:
{
  "title": "Recipe Name",
  "readyInMinutes": 30,
  "servings": 4,
  "cuisines": ["Italian"],
  "diets": ["vegetarian"],
  "mealTypes": ["dinner"],
  "extendedIngredients": [
    { "id": 1, "name": "ingredient name", "amount": 1.5, "unit": "cups", "aisle": "Produce" }
  ],
  "nutrition": {
    "nutrients": [
      { "name": "Calories", "amount": 400, "unit": "kcal" },
      { "name": "Protein", "amount": 25, "unit": "g" },
      { "name": "Carbohydrates", "amount": 40, "unit": "g" },
      { "name": "Fat", "amount": 15, "unit": "g" }
    ]
  },
  "analyzedInstructions": [{ "steps": [{ "number": 1, "step": "Step description" }] }],
  "pricePerServing": 350,
  "healthScore": 75,
  "freezable": false
}

Return ONLY the JSON array, no other text.`

async function callOpenAI(systemPrompt, userPrompt) {
  const apiKey = getVisionApiKey()
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 4000,
      temperature: 0.8,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `OpenAI API request failed: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || '[]'

  // Parse JSON, handling markdown code blocks
  let jsonStr = content.trim()
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  return JSON.parse(jsonStr)
}

function formatRecipe(raw, slot, index) {
  const id = -(Date.now() + index)
  const encodedTitle = encodeURIComponent(raw.title || 'Recipe')
  return {
    id,
    title: raw.title || 'Untitled Recipe',
    image: `https://via.placeholder.com/400x300?text=${encodedTitle}`,
    readyInMinutes: raw.readyInMinutes || 30,
    servings: raw.servings || 4,
    cuisines: raw.cuisines || [],
    diets: raw.diets || [],
    mealTypes: raw.mealTypes || [slot],
    source: 'openai',
    extendedIngredients: (raw.extendedIngredients || []).map((ing, i) => ({
      id: id * 100 - i,
      name: ing.name || 'ingredient',
      amount: ing.amount || 1,
      unit: ing.unit || '',
      aisle: ing.aisle || 'Other',
    })),
    nutrition: {
      nutrients: raw.nutrition?.nutrients || [
        { name: 'Calories', amount: 300, unit: 'kcal' },
        { name: 'Protein', amount: 20, unit: 'g' },
        { name: 'Carbohydrates', amount: 35, unit: 'g' },
        { name: 'Fat', amount: 12, unit: 'g' },
      ],
    },
    analyzedInstructions: raw.analyzedInstructions || [{ steps: [] }],
    pricePerServing: raw.pricePerServing || 300,
    healthScore: raw.healthScore || 70,
    freezable: raw.freezable || false,
  }
}

export async function generateRecipesWithAI(slot, preferences, count = 8) {
  const systemPrompt = `You are a meal prep recipe generator. ${SLOT_PROMPTS[slot] || SLOT_PROMPTS.dinner}

User preferences:
${buildPreferencesPrompt(preferences)}

Generate ${count} diverse recipes for the "${slot}" meal slot.
Each recipe should be practical for weekly meal prep.

${RECIPE_FORMAT_INSTRUCTIONS}`

  const userPrompt = `Generate ${count} ${slot} recipes that are diverse in cuisine and ingredients.`

  const rawRecipes = await callOpenAI(systemPrompt, userPrompt)

  if (!Array.isArray(rawRecipes)) return []

  return rawRecipes.map((raw, i) => formatRecipe(raw, slot, i))
}

export async function generateAlternativeRecipes(currentMeal, slot, preferences, excludeIds = []) {
  const currentCuisine = currentMeal.cuisines?.join(', ') || 'unknown'
  const currentIngredients = (currentMeal.extendedIngredients || [])
    .map(i => i.name)
    .filter(Boolean)
    .join(', ')

  const systemPrompt = `You are a meal prep recipe generator. Generate recipes that are SIGNIFICANTLY DIFFERENT from the current meal.

Current meal to replace: "${currentMeal.title}"
Current cuisine: ${currentCuisine}
Current main ingredients: ${currentIngredients}

Requirements for alternatives:
- Use a DIFFERENT cuisine than ${currentCuisine}
- Use DIFFERENT primary proteins/ingredients
- Use a DIFFERENT cooking style (if current is grilled, suggest baked/sauteed/raw/etc.)
- Each alternative should also be different from the others

User preferences:
${buildPreferencesPrompt(preferences)}

${SLOT_PROMPTS[slot] || SLOT_PROMPTS.dinner}

${RECIPE_FORMAT_INSTRUCTIONS}`

  const userPrompt = `Generate 4 ${slot} recipes that are very different from "${currentMeal.title}" (${currentCuisine} cuisine). Make them diverse from each other too.`

  const rawRecipes = await callOpenAI(systemPrompt, userPrompt)

  if (!Array.isArray(rawRecipes)) return []

  return rawRecipes
    .map((raw, i) => formatRecipe(raw, slot, i))
    .filter(r => !excludeIds.includes(r.id))
}
