import { initializeApp } from 'firebase/app'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBIlMOziJ_FL4qAioZOW_G0j5i43SrgKek",
  authDomain: "mealprep-37420.firebaseapp.com",
  projectId: "mealprep-37420",
  storageBucket: "mealprep-37420.firebasestorage.app",
  messagingSenderId: "506270862476",
  appId: "1:506270862476:web:6983f0b013f9423072bfa9",
  measurementId: "G-WXCMFRYY48"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Auth functions
export async function registerUser(email, password, displayName) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(userCredential.user, { displayName })

  // Create user document in Firestore
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    email,
    displayName,
    createdAt: serverTimestamp(),
    preferences: {
      dietaryRestrictions: [],
      cuisinePreferences: [],
      proteinPreferences: [],
      mealsPerWeek: 5,
      servingsPerMeal: 4,
      maxPrepTimeMinutes: 60,
      freezerFriendly: false,
    }
  })

  return userCredential.user
}

export async function loginUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export async function logoutUser() {
  await signOut(auth)
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}

// User data functions
export async function getUserData(userId) {
  const docRef = doc(db, 'users', userId)
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? docSnap.data() : null
}

export async function updateUserPreferences(userId, preferences) {
  const docRef = doc(db, 'users', userId)
  await updateDoc(docRef, { preferences })
}

// Favorites functions
export async function saveFavorites(userId, favorites) {
  const docRef = doc(db, 'users', userId)
  await updateDoc(docRef, { favorites })
}

export async function getFavorites(userId) {
  const userData = await getUserData(userId)
  return userData?.favorites || []
}

// Meal Plans functions
export async function saveMealPlan(userId, mealPlan, name) {
  const mealPlansRef = collection(db, 'users', userId, 'mealPlans')
  const planDoc = doc(mealPlansRef)
  await setDoc(planDoc, {
    ...mealPlan,
    name,
    savedAt: serverTimestamp()
  })
  return planDoc.id
}

export async function getMealPlans(userId) {
  const mealPlansRef = collection(db, 'users', userId, 'mealPlans')
  const querySnapshot = await getDocs(mealPlansRef)
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function getMealPlan(userId, planId) {
  const docRef = doc(db, 'users', userId, 'mealPlans', planId)
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
}

export async function updateMealPlanInDb(userId, planId, updates) {
  const docRef = doc(db, 'users', userId, 'mealPlans', planId)
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

export async function deleteMealPlan(userId, planId) {
  const docRef = doc(db, 'users', userId, 'mealPlans', planId)
  await deleteDoc(docRef)
}

// Current active meal plan and shopping list
export async function saveCurrentMealPlan(userId, mealPlan) {
  const docRef = doc(db, 'users', userId)
  await updateDoc(docRef, { currentMealPlan: mealPlan })
}

export async function saveShoppingList(userId, shoppingList) {
  const docRef = doc(db, 'users', userId)
  await updateDoc(docRef, { shoppingList })
}

export async function saveInventory(userId, inventory) {
  const docRef = doc(db, 'users', userId)
  await updateDoc(docRef, { inventory })
}
