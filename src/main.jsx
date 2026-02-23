import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { PreferencesProvider } from './context/PreferencesContext.jsx'
import { InventoryProvider } from './context/InventoryContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <PreferencesProvider>
          <AppProvider>
            <InventoryProvider>
              <App />
            </InventoryProvider>
          </AppProvider>
        </PreferencesProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
)
