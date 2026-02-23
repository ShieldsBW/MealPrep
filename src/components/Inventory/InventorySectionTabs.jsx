const SECTIONS = [
  { key: 'all', label: 'All' },
  { key: 'fridge', label: 'Fridge' },
  { key: 'pantry', label: 'Pantry' },
  { key: 'freezer', label: 'Freezer' },
  { key: 'spices', label: 'Spices' },
]

function InventorySectionTabs({ activeSection, onSectionChange, inventory }) {
  const getCounts = (section) => {
    if (section === 'all') return inventory.length
    return inventory.filter(item => item.section === section).length
  }

  return (
    <div className="flex flex-wrap gap-2">
      {SECTIONS.map(({ key, label }) => {
        const count = getCounts(key)
        const isActive = activeSection === key
        return (
          <button
            key={key}
            onClick={() => onSectionChange(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
              isActive
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                isActive
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default InventorySectionTabs
