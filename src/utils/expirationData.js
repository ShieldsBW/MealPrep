// Shelf life data: days from purchase, default storage section
const SHELF_LIFE_DATA = {
  // Produce - Fridge
  'lettuce': { days: 7, section: 'fridge' },
  'spinach': { days: 7, section: 'fridge' },
  'kale': { days: 7, section: 'fridge' },
  'arugula': { days: 5, section: 'fridge' },
  'mixed greens': { days: 5, section: 'fridge' },
  'broccoli': { days: 7, section: 'fridge' },
  'cauliflower': { days: 7, section: 'fridge' },
  'carrots': { days: 21, section: 'fridge' },
  'celery': { days: 14, section: 'fridge' },
  'bell pepper': { days: 10, section: 'fridge' },
  'cucumber': { days: 7, section: 'fridge' },
  'zucchini': { days: 7, section: 'fridge' },
  'tomato': { days: 7, section: 'fridge' },
  'mushroom': { days: 7, section: 'fridge' },
  'green beans': { days: 7, section: 'fridge' },
  'asparagus': { days: 5, section: 'fridge' },
  'corn': { days: 5, section: 'fridge' },
  'avocado': { days: 5, section: 'fridge' },
  'lemon': { days: 21, section: 'fridge' },
  'lime': { days: 21, section: 'fridge' },
  'berries': { days: 5, section: 'fridge' },
  'strawberries': { days: 5, section: 'fridge' },
  'blueberries': { days: 7, section: 'fridge' },
  'grapes': { days: 10, section: 'fridge' },
  'apple': { days: 28, section: 'fridge' },
  'orange': { days: 21, section: 'fridge' },

  // Dairy - Fridge
  'milk': { days: 10, section: 'fridge' },
  'cream': { days: 10, section: 'fridge' },
  'heavy cream': { days: 10, section: 'fridge' },
  'sour cream': { days: 21, section: 'fridge' },
  'yogurt': { days: 14, section: 'fridge' },
  'greek yogurt': { days: 14, section: 'fridge' },
  'butter': { days: 30, section: 'fridge' },
  'cheese': { days: 28, section: 'fridge' },
  'cheddar': { days: 28, section: 'fridge' },
  'mozzarella': { days: 14, section: 'fridge' },
  'parmesan': { days: 60, section: 'fridge' },
  'cream cheese': { days: 21, section: 'fridge' },
  'eggs': { days: 35, section: 'fridge' },

  // Proteins - Fridge
  'chicken breast': { days: 3, section: 'fridge' },
  'chicken thigh': { days: 3, section: 'fridge' },
  'chicken': { days: 3, section: 'fridge' },
  'ground beef': { days: 3, section: 'fridge' },
  'ground turkey': { days: 3, section: 'fridge' },
  'steak': { days: 5, section: 'fridge' },
  'pork': { days: 5, section: 'fridge' },
  'pork chop': { days: 5, section: 'fridge' },
  'bacon': { days: 10, section: 'fridge' },
  'sausage': { days: 5, section: 'fridge' },
  'salmon': { days: 3, section: 'fridge' },
  'shrimp': { days: 3, section: 'fridge' },
  'fish': { days: 3, section: 'fridge' },
  'tofu': { days: 7, section: 'fridge' },

  // Pantry staples
  'rice': { days: 730, section: 'pantry' },
  'pasta': { days: 730, section: 'pantry' },
  'bread': { days: 7, section: 'pantry' },
  'flour': { days: 365, section: 'pantry' },
  'sugar': { days: 730, section: 'pantry' },
  'brown sugar': { days: 365, section: 'pantry' },
  'olive oil': { days: 540, section: 'pantry' },
  'vegetable oil': { days: 365, section: 'pantry' },
  'coconut oil': { days: 365, section: 'pantry' },
  'vinegar': { days: 730, section: 'pantry' },
  'soy sauce': { days: 365, section: 'pantry' },
  'honey': { days: 730, section: 'pantry' },
  'maple syrup': { days: 365, section: 'pantry' },
  'peanut butter': { days: 180, section: 'pantry' },
  'canned tomatoes': { days: 730, section: 'pantry' },
  'tomato sauce': { days: 365, section: 'pantry' },
  'tomato paste': { days: 365, section: 'pantry' },
  'canned beans': { days: 730, section: 'pantry' },
  'black beans': { days: 730, section: 'pantry' },
  'chickpeas': { days: 730, section: 'pantry' },
  'lentils': { days: 365, section: 'pantry' },
  'oats': { days: 365, section: 'pantry' },
  'cereal': { days: 180, section: 'pantry' },
  'tortillas': { days: 14, section: 'pantry' },
  'broth': { days: 365, section: 'pantry' },
  'chicken broth': { days: 365, section: 'pantry' },
  'coconut milk': { days: 365, section: 'pantry' },
  'nuts': { days: 180, section: 'pantry' },
  'almonds': { days: 180, section: 'pantry' },
  'walnuts': { days: 180, section: 'pantry' },

  // Spices
  'salt': { days: 1825, section: 'spices' },
  'pepper': { days: 1095, section: 'spices' },
  'black pepper': { days: 1095, section: 'spices' },
  'garlic powder': { days: 1095, section: 'spices' },
  'onion powder': { days: 1095, section: 'spices' },
  'cumin': { days: 1095, section: 'spices' },
  'paprika': { days: 1095, section: 'spices' },
  'chili powder': { days: 1095, section: 'spices' },
  'oregano': { days: 1095, section: 'spices' },
  'basil': { days: 1095, section: 'spices' },
  'thyme': { days: 1095, section: 'spices' },
  'rosemary': { days: 1095, section: 'spices' },
  'cinnamon': { days: 1095, section: 'spices' },
  'nutmeg': { days: 1095, section: 'spices' },
  'turmeric': { days: 1095, section: 'spices' },
  'cayenne': { days: 1095, section: 'spices' },
  'italian seasoning': { days: 1095, section: 'spices' },
  'bay leaves': { days: 1095, section: 'spices' },
  'red pepper flakes': { days: 1095, section: 'spices' },

  // Freezer
  'frozen vegetables': { days: 240, section: 'freezer' },
  'frozen peas': { days: 240, section: 'freezer' },
  'frozen corn': { days: 240, section: 'freezer' },
  'frozen berries': { days: 240, section: 'freezer' },
  'frozen shrimp': { days: 180, section: 'freezer' },
  'frozen chicken': { days: 270, section: 'freezer' },
  'ice cream': { days: 60, section: 'freezer' },

  // Condiments - Fridge once opened
  'ketchup': { days: 180, section: 'fridge' },
  'mustard': { days: 365, section: 'fridge' },
  'mayonnaise': { days: 60, section: 'fridge' },
  'hot sauce': { days: 365, section: 'fridge' },
  'salsa': { days: 14, section: 'fridge' },

  // Fresh herbs
  'cilantro': { days: 7, section: 'fridge' },
  'parsley': { days: 10, section: 'fridge' },
  'basil leaves': { days: 5, section: 'fridge' },
  'mint': { days: 7, section: 'fridge' },
  'green onion': { days: 7, section: 'fridge' },
  'scallion': { days: 7, section: 'fridge' },
  'ginger': { days: 21, section: 'fridge' },
  'garlic': { days: 60, section: 'pantry' },
  'onion': { days: 30, section: 'pantry' },
  'potato': { days: 28, section: 'pantry' },
  'sweet potato': { days: 21, section: 'pantry' },
}

// Fuzzy match: find best matching key in SHELF_LIFE_DATA
function findMatch(itemName) {
  const lowerName = itemName.toLowerCase()

  // Exact match first
  if (SHELF_LIFE_DATA[lowerName]) {
    return SHELF_LIFE_DATA[lowerName]
  }

  // Then check if item name contains a key
  for (const [key, value] of Object.entries(SHELF_LIFE_DATA)) {
    if (lowerName.includes(key)) {
      return value
    }
  }

  // Then check if a key contains the item name
  for (const [key, value] of Object.entries(SHELF_LIFE_DATA)) {
    if (key.includes(lowerName)) {
      return value
    }
  }

  return null
}

export function estimateExpiration(itemName, purchasedDate) {
  const match = findMatch(itemName)
  if (!match || !purchasedDate) return null

  const date = new Date(purchasedDate)
  date.setDate(date.getDate() + match.days)
  return date.toISOString().split('T')[0]
}

export function suggestSection(itemName) {
  const match = findMatch(itemName)
  return match?.section || 'pantry'
}

export function getFreshnessStatus(item) {
  if (!item.expirationDate) return 'unknown'

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const expDate = new Date(item.expirationDate)
  expDate.setHours(0, 0, 0, 0)

  const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'expired'
  if (diffDays <= 3) return 'expiring-soon'
  return 'fresh'
}

export function formatRelativeDate(dateStr) {
  if (!dateStr) return 'Unknown'

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const date = new Date(dateStr)
  date.setHours(0, 0, 0, 0)

  const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24))

  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`
  if (diffDays === -1) return 'yesterday'
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'tomorrow'
  if (diffDays <= 7) return `in ${diffDays} days`
  if (diffDays <= 14) return 'in about a week'
  if (diffDays <= 30) return `in ${Math.round(diffDays / 7)} weeks`
  return date.toLocaleDateString()
}
