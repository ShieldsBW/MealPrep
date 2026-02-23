import { useState, useMemo } from 'react'
import { useInventory } from '../context/InventoryContext'
import InventorySectionTabs from '../components/Inventory/InventorySectionTabs'
import InventoryItemList from '../components/Inventory/InventoryItemList'
import ExpirationAlerts from '../components/Inventory/ExpirationAlerts'
import AddItemModal from '../components/Inventory/AddItemModal'
import EditItemModal from '../components/Inventory/EditItemModal'
import ScanModal from '../components/Inventory/ScanModal'

function Inventory() {
  const { inventory, addItem, updateItem, removeItem } = useInventory()
  const [activeSection, setActiveSection] = useState('all')
  const [activeFoodGroup, setActiveFoodGroup] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [showScanModal, setShowScanModal] = useState(false)

  const filteredItems = useMemo(() => {
    let items = inventory

    if (activeSection !== 'all') {
      items = items.filter(item => item.section === activeSection)
    }

    if (activeFoodGroup !== 'all') {
      items = items.filter(item => item.foodGroup === activeFoodGroup)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      items = items.filter(item =>
        (item.name || '').toLowerCase().includes(query) ||
        (item.displayName || '').toLowerCase().includes(query)
      )
    }

    return items
  }, [inventory, activeSection, activeFoodGroup, searchQuery])

  const handleDelete = (itemId) => {
    if (window.confirm('Remove this item from your pantry?')) {
      removeItem(itemId)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Pantry</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowScanModal(true)}
            className="btn-outline flex items-center gap-2"
          >
            <CameraIcon className="w-4 h-4" />
            Scan
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      <InventorySectionTabs
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        activeFoodGroup={activeFoodGroup}
        onFoodGroupChange={setActiveFoodGroup}
        inventory={inventory}
      />

      <div className="flex items-center gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search items..."
          className="input flex-1 max-w-sm"
        />
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="List view"
          >
            <ListIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="Grid view"
          >
            <GridIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <InventoryItemList
            items={filteredItems}
            onEdit={setEditingItem}
            onDelete={handleDelete}
            viewMode={viewMode}
          />
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <ExpirationAlerts />
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onAdd={addItem}
        />
      )}

      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={updateItem}
        />
      )}

      {showScanModal && (
        <ScanModal
          onClose={() => setShowScanModal(false)}
        />
      )}
    </div>
  )
}

function PlusIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}

function CameraIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function ListIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function GridIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  )
}

export default Inventory
