const KROGER_CLIENT_ID = import.meta.env.VITE_KROGER_CLIENT_ID
const KROGER_CLIENT_SECRET = import.meta.env.VITE_KROGER_CLIENT_SECRET
const KROGER_API_BASE = 'https://api.kroger.com/v1'
const KROGER_AUTH_URL = 'https://api.kroger.com/v1/connect/oauth2/token'

// Token management
let accessToken = null
let tokenExpiry = null

// Store selection
let selectedStore = loadStoreFromStorage()

function loadStoreFromStorage() {
  try {
    const saved = localStorage.getItem('kroger_store')
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function saveStoreToStorage(store) {
  try {
    localStorage.setItem('kroger_store', JSON.stringify(store))
  } catch (e) {
    console.error('Error saving store:', e)
  }
}

export function getSelectedStore() {
  return selectedStore
}

export function setSelectedStore(store) {
  selectedStore = store
  saveStoreToStorage(store)
}

export function clearSelectedStore() {
  selectedStore = null
  localStorage.removeItem('kroger_store')
}

export function isKrogerConfigured() {
  return Boolean(KROGER_CLIENT_ID && KROGER_CLIENT_SECRET)
}

async function getAccessToken() {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken
  }

  if (!KROGER_CLIENT_ID || !KROGER_CLIENT_SECRET) {
    throw new Error('Kroger API credentials not configured')
  }

  const credentials = btoa(`${KROGER_CLIENT_ID}:${KROGER_CLIENT_SECRET}`)

  const response = await fetch(KROGER_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials&scope=product.compact',
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Kroger auth error:', error)
    throw new Error('Failed to authenticate with Kroger API')
  }

  const data = await response.json()
  accessToken = data.access_token
  // Set expiry 5 minutes before actual expiry for safety
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000

  return accessToken
}

async function krogerFetch(endpoint, params = {}) {
  const token = await getAccessToken()

  const url = new URL(`${KROGER_API_BASE}${endpoint}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value)
    }
  })

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Kroger API error: ${response.status}`)
  }

  return response.json()
}

// Search for nearby stores by zip code
export async function searchStores(zipCode, radiusMiles = 10) {
  const data = await krogerFetch('/locations', {
    'filter.zipCode.near': zipCode,
    'filter.radiusInMiles': radiusMiles,
    'filter.limit': 10,
  })

  return data.data.map(store => ({
    id: store.locationId,
    name: store.name,
    address: store.address,
    chain: store.chain,
    phone: store.phone,
    hours: store.hours,
    distance: store.distance,
  }))
}

// Search for products at a specific store
export async function searchProducts(query, locationId = null) {
  const params = {
    'filter.term': query,
    'filter.limit': 10,
  }

  if (locationId) {
    params['filter.locationId'] = locationId
  }

  const data = await krogerFetch('/products', params)

  return data.data.map(product => ({
    id: product.productId,
    upc: product.upc,
    name: product.description,
    brand: product.brand,
    categories: product.categories,
    size: product.items?.[0]?.size || null,
    price: product.items?.[0]?.price?.regular || null,
    promoPrice: product.items?.[0]?.price?.promo || null,
    image: product.images?.find(img => img.perspective === 'front')?.sizes?.find(s => s.size === 'medium')?.url || null,
    inStock: product.items?.[0]?.inventory?.stockLevel !== 'TEMPORARILY_OUT_OF_STOCK',
  }))
}

// Get product details by ID
export async function getProduct(productId, locationId = null) {
  const params = {}
  if (locationId) {
    params['filter.locationId'] = locationId
  }

  const data = await krogerFetch(`/products/${productId}`, params)
  const product = data.data

  return {
    id: product.productId,
    upc: product.upc,
    name: product.description,
    brand: product.brand,
    categories: product.categories,
    size: product.items?.[0]?.size || null,
    price: product.items?.[0]?.price?.regular || null,
    promoPrice: product.items?.[0]?.price?.promo || null,
    image: product.images?.find(img => img.perspective === 'front')?.sizes?.find(s => s.size === 'medium')?.url || null,
    inStock: product.items?.[0]?.inventory?.stockLevel !== 'TEMPORARILY_OUT_OF_STOCK',
  }
}

// Common package sizes for calculating leftovers
const COMMON_PACKAGE_SIZES = {
  // Produce
  'onion': { amount: 3, unit: 'medium', description: '3-pack onions' },
  'garlic': { amount: 1, unit: 'head', description: 'head of garlic (~10 cloves)' },
  'carrot': { amount: 1, unit: 'lb', description: '1 lb bag carrots' },
  'celery': { amount: 1, unit: 'bunch', description: 'bunch of celery' },
  'bell pepper': { amount: 1, unit: 'each', description: 'single pepper' },
  'tomato': { amount: 4, unit: 'medium', description: '4-pack tomatoes' },
  'potato': { amount: 5, unit: 'lb', description: '5 lb bag potatoes' },
  'lemon': { amount: 1, unit: 'each', description: 'single lemon' },
  'lime': { amount: 1, unit: 'each', description: 'single lime' },

  // Dairy
  'egg': { amount: 12, unit: 'large', description: 'dozen eggs' },
  'milk': { amount: 1, unit: 'gallon', description: 'gallon of milk' },
  'butter': { amount: 1, unit: 'lb', description: '1 lb (4 sticks) butter' },
  'cheese': { amount: 8, unit: 'oz', description: '8 oz block/shredded' },
  'parmesan': { amount: 5, unit: 'oz', description: '5 oz wedge' },
  'sour cream': { amount: 16, unit: 'oz', description: '16 oz container' },
  'cream cheese': { amount: 8, unit: 'oz', description: '8 oz block' },

  // Proteins
  'chicken breast': { amount: 1.5, unit: 'lb', description: '~1.5 lb pack' },
  'ground beef': { amount: 1, unit: 'lb', description: '1 lb pack' },
  'ground turkey': { amount: 1, unit: 'lb', description: '1 lb pack' },
  'bacon': { amount: 12, unit: 'oz', description: '12 oz pack' },
  'shrimp': { amount: 1, unit: 'lb', description: '1 lb bag' },
  'salmon': { amount: 1, unit: 'lb', description: '~1 lb fillet' },

  // Grains
  'rice': { amount: 2, unit: 'lb', description: '2 lb bag' },
  'pasta': { amount: 1, unit: 'lb', description: '1 lb box' },
  'bread': { amount: 1, unit: 'loaf', description: 'loaf of bread' },
  'flour': { amount: 5, unit: 'lb', description: '5 lb bag' },
  'breadcrumbs': { amount: 15, unit: 'oz', description: '15 oz can' },

  // Canned goods
  'black beans': { amount: 15, unit: 'oz', description: '15 oz can' },
  'diced tomatoes': { amount: 14.5, unit: 'oz', description: '14.5 oz can' },
  'tomato sauce': { amount: 8, unit: 'oz', description: '8 oz can' },
  'chicken broth': { amount: 32, unit: 'oz', description: '32 oz carton' },
  'coconut milk': { amount: 13.5, unit: 'oz', description: '13.5 oz can' },

  // Oils & Condiments
  'olive oil': { amount: 17, unit: 'oz', description: '17 oz bottle' },
  'vegetable oil': { amount: 48, unit: 'oz', description: '48 oz bottle' },
  'soy sauce': { amount: 10, unit: 'oz', description: '10 oz bottle' },
  'fish sauce': { amount: 6.76, unit: 'oz', description: '200ml bottle' },

  // Spices (typically last a long time)
  'salt': { amount: 26, unit: 'oz', description: '26 oz container' },
  'pepper': { amount: 4, unit: 'oz', description: '4 oz container' },
  'cumin': { amount: 1.5, unit: 'oz', description: 'spice jar' },
  'paprika': { amount: 2.1, unit: 'oz', description: 'spice jar' },
}

// Match ingredient to common package size
export function getPackageSize(ingredientName) {
  const lowerName = ingredientName.toLowerCase()

  for (const [key, value] of Object.entries(COMMON_PACKAGE_SIZES)) {
    if (lowerName.includes(key)) {
      return { ingredient: key, ...value }
    }
  }

  return null
}

// Calculate leftover amount
export function calculateLeftover(ingredient, recipeAmount, recipeUnit, packageSize) {
  if (!packageSize) return null

  // Simple unit conversion for common cases
  const normalizedRecipeAmount = normalizeAmount(recipeAmount, recipeUnit, packageSize.unit)

  if (normalizedRecipeAmount === null) {
    return null // Can't compare units
  }

  // Calculate how many packages needed
  const packagesNeeded = Math.ceil(normalizedRecipeAmount / packageSize.amount)
  const totalPurchased = packagesNeeded * packageSize.amount
  const leftover = totalPurchased - normalizedRecipeAmount

  return {
    packagesNeeded,
    totalPurchased,
    leftover,
    unit: packageSize.unit,
    description: packageSize.description,
  }
}

// Normalize amounts to same unit (simplified)
function normalizeAmount(amount, fromUnit, toUnit) {
  if (fromUnit === toUnit) return amount

  const fromLower = fromUnit?.toLowerCase() || ''
  const toLower = toUnit?.toLowerCase() || ''

  // Handle common conversions
  const conversions = {
    'tbsp_to_cup': 1/16,
    'tsp_to_cup': 1/48,
    'oz_to_lb': 1/16,
    'oz_to_cup': 1/8,
    'cloves_to_head': 1/10,
    'cups_to_lb': 0.5, // rough estimate
  }

  const conversionKey = `${fromLower}_to_${toLower}`
  if (conversions[conversionKey]) {
    return amount * conversions[conversionKey]
  }

  // If same base unit, return as-is
  if (fromLower.includes(toLower) || toLower.includes(fromLower)) {
    return amount
  }

  return null // Can't convert
}

// Analyze shopping list for pricing and leftovers
export async function analyzeShoppingList(items, locationId = null) {
  const storeId = locationId || selectedStore?.id

  const results = await Promise.all(
    items.map(async (item) => {
      try {
        // Search for the product
        const products = await searchProducts(item.name, storeId)
        const bestMatch = products[0] // Take first result

        // Get package size estimate
        const packageSize = getPackageSize(item.name)
        const leftoverInfo = packageSize
          ? calculateLeftover(item.name, item.amount, item.unit, packageSize)
          : null

        return {
          ...item,
          krogerProduct: bestMatch || null,
          packageSize,
          leftoverInfo,
          estimatedPrice: bestMatch?.price || null,
        }
      } catch (error) {
        console.error(`Error searching for ${item.name}:`, error)
        return {
          ...item,
          krogerProduct: null,
          packageSize: getPackageSize(item.name),
          leftoverInfo: null,
          estimatedPrice: null,
        }
      }
    })
  )

  // Calculate totals
  const totalPrice = results.reduce((sum, item) => {
    if (item.estimatedPrice && item.leftoverInfo?.packagesNeeded) {
      return sum + (item.estimatedPrice * item.leftoverInfo.packagesNeeded)
    } else if (item.estimatedPrice) {
      return sum + item.estimatedPrice
    }
    return sum
  }, 0)

  return {
    items: results,
    totalPrice,
    storeId,
  }
}
