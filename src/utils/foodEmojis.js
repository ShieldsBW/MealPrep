const FOOD_EMOJI_MAP = {
  // Produce - Vegetables
  'lettuce': '\u{1F96C}',
  'spinach': '\u{1F96C}',
  'kale': '\u{1F96C}',
  'arugula': '\u{1F96C}',
  'mixed greens': '\u{1F96C}',
  'broccoli': '\u{1F966}',
  'cauliflower': '\u{1F966}',
  'carrots': '\u{1F955}',
  'celery': '\u{1F96C}',
  'bell pepper': '\u{1FAD1}',
  'cucumber': '\u{1F952}',
  'zucchini': '\u{1F952}',
  'tomato': '\u{1F345}',
  'cherry tomatoes': '\u{1F345}',
  'mushroom': '\u{1F344}',
  'mushrooms': '\u{1F344}',
  'green beans': '\u{1FAD8}',
  'asparagus': '\u{1F96C}',
  'corn': '\u{1F33D}',
  'avocado': '\u{1F951}',
  'onion': '\u{1F9C5}',
  'red onion': '\u{1F9C5}',
  'green onion': '\u{1F9C5}',
  'green onions': '\u{1F9C5}',
  'scallion': '\u{1F9C5}',
  'garlic': '\u{1F9C4}',
  'ginger': '\u{1FAD0}',
  'potato': '\u{1F954}',
  'sweet potato': '\u{1F360}',
  'frozen vegetables': '\u{1F966}',
  'frozen peas': '\u{1FAD8}',
  'frozen corn': '\u{1F33D}',

  // Fruits
  'berries': '\u{1FAD0}',
  'strawberries': '\u{1F353}',
  'blueberries': '\u{1FAD0}',
  'grapes': '\u{1F347}',
  'apple': '\u{1F34E}',
  'orange': '\u{1F34A}',
  'lemon': '\u{1F34B}',
  'lime': '\u{1F34B}',
  'banana': '\u{1F34C}',
  'frozen berries': '\u{1F353}',

  // Dairy
  'milk': '\u{1F95B}',
  'cream': '\u{1F95B}',
  'heavy cream': '\u{1F95B}',
  'sour cream': '\u{1F95B}',
  'yogurt': '\u{1F95B}',
  'greek yogurt': '\u{1F95B}',
  'butter': '\u{1F9C8}',
  'cheese': '\u{1F9C0}',
  'cheddar': '\u{1F9C0}',
  'mozzarella': '\u{1F9C0}',
  'parmesan': '\u{1F9C0}',
  'cream cheese': '\u{1F9C0}',
  'eggs': '\u{1F95A}',
  'egg': '\u{1F95A}',
  'ice cream': '\u{1F368}',

  // Proteins
  'chicken breast': '\u{1F357}',
  'chicken thigh': '\u{1F357}',
  'chicken thighs': '\u{1F357}',
  'chicken': '\u{1F357}',
  'ground beef': '\u{1F969}',
  'beef sirloin': '\u{1F969}',
  'beef': '\u{1F969}',
  'steak': '\u{1F969}',
  'ground turkey': '\u{1F357}',
  'turkey': '\u{1F983}',
  'pork': '\u{1F969}',
  'pork shoulder': '\u{1F969}',
  'pork chop': '\u{1F969}',
  'bacon': '\u{1F953}',
  'sausage': '\u{1F32D}',
  'salmon': '\u{1F41F}',
  'salmon fillets': '\u{1F41F}',
  'shrimp': '\u{1F990}',
  'fish': '\u{1F41F}',
  'tofu': '\u{1F9C6}',
  'tempeh': '\u{1F9C6}',
  'frozen shrimp': '\u{1F990}',
  'frozen chicken': '\u{1F357}',

  // Grains
  'rice': '\u{1F35A}',
  'pasta': '\u{1F35D}',
  'noodles': '\u{1F35C}',
  'bread': '\u{1F35E}',
  'flour': '\u{1F33E}',
  'oats': '\u{1F33E}',
  'cereal': '\u{1F35A}',
  'tortillas': '\u{1FAD3}',
  'quinoa': '\u{1F33E}',
  'breadcrumbs': '\u{1F35E}',
  'lentils': '\u{1FAD8}',
  'black beans': '\u{1FAD8}',
  'canned beans': '\u{1FAD8}',
  'chickpeas': '\u{1FAD8}',

  // Condiments & Oils
  'olive oil': '\u{1FAD2}',
  'vegetable oil': '\u{1FAD2}',
  'coconut oil': '\u{1F965}',
  'sesame oil': '\u{1FAD2}',
  'vinegar': '\u{1FAD7}',
  'soy sauce': '\u{1FAD9}',
  'fish sauce': '\u{1FAD9}',
  'honey': '\u{1F36F}',
  'maple syrup': '\u{1F36F}',
  'sugar': '\u{1F36C}',
  'brown sugar': '\u{1F36C}',
  'peanut butter': '\u{1F95C}',
  'canned tomatoes': '\u{1F345}',
  'tomato sauce': '\u{1F345}',
  'tomato paste': '\u{1F345}',
  'marinara sauce': '\u{1F345}',
  'broth': '\u{1F372}',
  'chicken broth': '\u{1F372}',
  'vegetable broth': '\u{1F372}',
  'coconut milk': '\u{1F965}',
  'ketchup': '\u{1F345}',
  'mustard': '\u{1F311}',
  'mayonnaise': '\u{1F95A}',
  'hot sauce': '\u{1F336}\uFE0F',
  'salsa': '\u{1FAD5}',
  'red curry paste': '\u{1F336}\uFE0F',
  'gochujang': '\u{1F336}\uFE0F',
  'nuts': '\u{1F95C}',
  'almonds': '\u{1F95C}',
  'walnuts': '\u{1F95C}',

  // Beverages & Juices
  'juice': '\u{1F9C3}',
  'orange juice': '\u{1F34A}',
  'apple juice': '\u{1F34E}',
  'cranberry juice': '\u{1F9C3}',
  'grape juice': '\u{1F347}',
  'lemonade': '\u{1F34B}',
  'water': '\u{1F4A7}',
  'sparkling water': '\u{1F4A7}',
  'soda': '\u{1F964}',
  'coffee': '\u{2615}',
  'tea': '\u{1F375}',
  'kombucha': '\u{1F9C3}',
  'smoothie': '\u{1F964}',
  'almond milk': '\u{1F95B}',
  'oat milk': '\u{1F95B}',
  'soy milk': '\u{1F95B}',

  // Spices & Herbs
  'seasoning': '\u{1F33F}',
  'spice': '\u{1F33F}',
  'lemon pepper': '\u{1F33F}',
  'garlic salt': '\u{1F9C2}',
  'taco seasoning': '\u{1F33F}',
  'ranch seasoning': '\u{1F33F}',
  'everything bagel seasoning': '\u{1F33F}',
  'salt': '\u{1F9C2}',
  'pepper': '\u{1F311}',
  'black pepper': '\u{1F311}',
  'garlic powder': '\u{1F9C4}',
  'onion powder': '\u{1F9C5}',
  'cumin': '\u{1F33F}',
  'paprika': '\u{1F336}\uFE0F',
  'chili powder': '\u{1F336}\uFE0F',
  'oregano': '\u{1F33F}',
  'basil': '\u{1F33F}',
  'thyme': '\u{1F33F}',
  'rosemary': '\u{1F33F}',
  'cinnamon': '\u{1F33F}',
  'nutmeg': '\u{1F33F}',
  'turmeric': '\u{1F33F}',
  'cayenne': '\u{1F336}\uFE0F',
  'italian seasoning': '\u{1F33F}',
  'bay leaves': '\u{1F343}',
  'red pepper flakes': '\u{1F336}\uFE0F',
  'dill': '\u{1F33F}',
  'cilantro': '\u{1F33F}',
  'parsley': '\u{1F33F}',
  'basil leaves': '\u{1F33F}',
  'mint': '\u{1F33F}',
}

const DEFAULT_SECTION_EMOJI = {
  fridge: '\u{1F37D}\uFE0F',
  pantry: '\u{1F4E6}',
  freezer: '\u{2744}\uFE0F',
  spices: '\u{1F33F}',
}

export function getFoodEmoji(itemName, section) {
  if (!itemName) return DEFAULT_SECTION_EMOJI[section] || '\u{1F37D}\uFE0F'

  const lowerName = itemName.toLowerCase()

  // Exact match
  if (FOOD_EMOJI_MAP[lowerName]) {
    return FOOD_EMOJI_MAP[lowerName]
  }

  // Find the longest key contained in the item name (prefer most specific match)
  let bestEmoji = null
  let bestLen = 0
  for (const [key, emoji] of Object.entries(FOOD_EMOJI_MAP)) {
    if (lowerName.includes(key) && key.length > bestLen) {
      bestEmoji = emoji
      bestLen = key.length
    }
  }
  if (bestEmoji) return bestEmoji

  // Key contains item name
  for (const [key, emoji] of Object.entries(FOOD_EMOJI_MAP)) {
    if (key.includes(lowerName)) {
      return emoji
    }
  }

  return DEFAULT_SECTION_EMOJI[section] || '\u{1F37D}\uFE0F'
}
