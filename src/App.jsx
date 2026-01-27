import { Routes, Route } from 'react-router-dom'
import Header from './components/Layout/Header'
import Navigation from './components/Layout/Navigation'
import MobileNav from './components/Layout/MobileNav'
import Home from './pages/Home'
import Recipes from './pages/Recipes'
import MealPlan from './pages/MealPlan'
import ShoppingList from './pages/ShoppingList'

function App() {
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
        </Routes>
      </main>
      <MobileNav />
    </div>
  )
}

export default App
