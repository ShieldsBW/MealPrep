const STORAGE_PREFIX = 'mealprep_'

export function loadFromStorage(key) {
  try {
    const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error)
    return null
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value))
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error)
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
  } catch (error) {
    console.error(`Error removing ${key} from storage:`, error)
  }
}

export function clearStorage() {
  try {
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.error('Error clearing storage:', error)
  }
}

export function getStorageSize() {
  let total = 0
  Object.keys(localStorage)
    .filter(key => key.startsWith(STORAGE_PREFIX))
    .forEach(key => {
      total += localStorage.getItem(key).length * 2
    })
  return total
}
