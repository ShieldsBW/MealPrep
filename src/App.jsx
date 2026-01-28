import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Header from './components/Layout/Header'
import Navigation from './components/Layout/Navigation'
import MobileNav from './components/Layout/MobileNav'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Recipes from './pages/Recipes'
import MealPlan from './pages/MealPlan'
import ShoppingList from './pages/ShoppingList'
import Account from './pages/Account'

function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Landing />
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/meal-plan" element={<MealPlan />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </main>
      <MobileNav />
    </div>
  )
}

export default App
