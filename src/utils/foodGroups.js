export const FOOD_GROUPS = [
  { key: 'proteins', label: 'Proteins', emoji: '\u{1F969}', color: 'red' },
  { key: 'vegetables', label: 'Vegetables', emoji: '\u{1F966}', color: 'green' },
  { key: 'fruits', label: 'Fruits', emoji: '\u{1F34E}', color: 'pink' },
  { key: 'grains', label: 'Grains', emoji: '\u{1F33E}', color: 'amber' },
  { key: 'dairy', label: 'Dairy', emoji: '\u{1F9C0}', color: 'blue' },
  { key: 'condiments', label: 'Condiments', emoji: '\u{1F9C2}', color: 'orange' },
]

const FOOD_GROUP_MAP = {
  // Proteins
  'chicken breast': 'proteins',
  'chicken thigh': 'proteins',
  'chicken thighs': 'proteins',
  'chicken': 'proteins',
  'ground beef': 'proteins',
  'beef sirloin': 'proteins',
  'beef': 'proteins',
  'steak': 'proteins',
  'ground turkey': 'proteins',
  'turkey': 'proteins',
  'pork': 'proteins',
  'pork shoulder': 'proteins',
  'pork chop': 'proteins',
  'bacon': 'proteins',
  'sausage': 'proteins',
  'salmon': 'proteins',
  'salmon fillets': 'proteins',
  'shrimp': 'proteins',
  'fish': 'proteins',
  'tofu': 'proteins',
  'tempeh': 'proteins',
  'eggs': 'proteins',
  'egg': 'proteins',
  'frozen shrimp': 'proteins',
  'frozen chicken': 'proteins',

  // Vegetables
  'lettuce': 'vegetables',
  'spinach': 'vegetables',
  'kale': 'vegetables',
  'arugula': 'vegetables',
  'mixed greens': 'vegetables',
  'broccoli': 'vegetables',
  'cauliflower': 'vegetables',
  'carrots': 'vegetables',
  'celery': 'vegetables',
  'bell pepper': 'vegetables',
  'cucumber': 'vegetables',
  'zucchini': 'vegetables',
  'tomato': 'vegetables',
  'cherry tomatoes': 'vegetables',
  'mushroom': 'vegetables',
  'mushrooms': 'vegetables',
  'green beans': 'vegetables',
  'asparagus': 'vegetables',
  'corn': 'vegetables',
  'onion': 'vegetables',
  'red onion': 'vegetables',
  'green onion': 'vegetables',
  'green onions': 'vegetables',
  'scallion': 'vegetables',
  'garlic': 'vegetables',
  'ginger': 'vegetables',
  'potato': 'vegetables',
  'sweet potato': 'vegetables',
  'avocado': 'vegetables',
  'frozen vegetables': 'vegetables',
  'frozen peas': 'vegetables',
  'frozen corn': 'vegetables',

  // Fruits
  'berries': 'fruits',
  'strawberries': 'fruits',
  'blueberries': 'fruits',
  'grapes': 'fruits',
  'apple': 'fruits',
  'orange': 'fruits',
  'lemon': 'fruits',
  'lime': 'fruits',
  'banana': 'fruits',
  'frozen berries': 'fruits',

  // Grains
  'rice': 'grains',
  'pasta': 'grains',
  'bread': 'grains',
  'flour': 'grains',
  'oats': 'grains',
  'cereal': 'grains',
  'tortillas': 'grains',
  'quinoa': 'grains',
  'breadcrumbs': 'grains',
  'lentils': 'grains',
  'black beans': 'grains',
  'canned beans': 'grains',
  'chickpeas': 'grains',
  'noodles': 'grains',

  // Dairy
  'milk': 'dairy',
  'cream': 'dairy',
  'heavy cream': 'dairy',
  'sour cream': 'dairy',
  'yogurt': 'dairy',
  'greek yogurt': 'dairy',
  'butter': 'dairy',
  'cheese': 'dairy',
  'cheddar': 'dairy',
  'mozzarella': 'dairy',
  'parmesan': 'dairy',
  'cream cheese': 'dairy',
  'coconut milk': 'dairy',
  'ice cream': 'dairy',

  // Condiments & pantry items
  'olive oil': 'condiments',
  'vegetable oil': 'condiments',
  'coconut oil': 'condiments',
  'sesame oil': 'condiments',
  'vinegar': 'condiments',
  'soy sauce': 'condiments',
  'fish sauce': 'condiments',
  'honey': 'condiments',
  'maple syrup': 'condiments',
  'sugar': 'condiments',
  'brown sugar': 'condiments',
  'peanut butter': 'condiments',
  'canned tomatoes': 'condiments',
  'tomato sauce': 'condiments',
  'tomato paste': 'condiments',
  'marinara sauce': 'condiments',
  'broth': 'condiments',
  'chicken broth': 'condiments',
  'vegetable broth': 'condiments',
  'ketchup': 'condiments',
  'mustard': 'condiments',
  'mayonnaise': 'condiments',
  'hot sauce': 'condiments',
  'salsa': 'condiments',
  'red curry paste': 'condiments',
  'gochujang': 'condiments',
  'nuts': 'condiments',
  'almonds': 'condiments',
  'walnuts': 'condiments',

  // Spices (also condiments group)
  'seasoning': 'condiments',
  'spice': 'condiments',
  'spice blend': 'condiments',
  'lemon pepper': 'condiments',
  'garlic salt': 'condiments',
  'onion salt': 'condiments',
  'taco seasoning': 'condiments',
  'ranch seasoning': 'condiments',
  'everything bagel seasoning': 'condiments',
  'salt': 'condiments',
  'pepper': 'condiments',
  'black pepper': 'condiments',
  'garlic powder': 'condiments',
  'onion powder': 'condiments',
  'cumin': 'condiments',
  'paprika': 'condiments',
  'chili powder': 'condiments',
  'oregano': 'condiments',
  'basil': 'condiments',
  'thyme': 'condiments',
  'rosemary': 'condiments',
  'cinnamon': 'condiments',
  'nutmeg': 'condiments',
  'turmeric': 'condiments',
  'cayenne': 'condiments',
  'italian seasoning': 'condiments',
  'bay leaves': 'condiments',
  'red pepper flakes': 'condiments',
  'dill': 'condiments',
  'cilantro': 'condiments',
  'parsley': 'condiments',
  'basil leaves': 'condiments',
  'mint': 'condiments',
}

function findMatch(itemName) {
  const lowerName = itemName.toLowerCase()

  // Exact match first
  if (FOOD_GROUP_MAP[lowerName]) {
    return FOOD_GROUP_MAP[lowerName]
  }

  // Find the longest key contained in the item name (prefer most specific match)
  let bestMatch = null
  let bestLen = 0
  for (const [key, value] of Object.entries(FOOD_GROUP_MAP)) {
    if (lowerName.includes(key) && key.length > bestLen) {
      bestMatch = value
      bestLen = key.length
    }
  }
  if (bestMatch) return bestMatch

  // Then check if a key contains the item name
  for (const [key, value] of Object.entries(FOOD_GROUP_MAP)) {
    if (key.includes(lowerName)) {
      return value
    }
  }

  return null
}

export function getFoodGroup(itemName) {
  if (!itemName) return null
  return findMatch(itemName)
}

export function suggestFoodGroup(itemName) {
  if (!itemName) return 'condiments'
  return findMatch(itemName) || 'condiments'
}
