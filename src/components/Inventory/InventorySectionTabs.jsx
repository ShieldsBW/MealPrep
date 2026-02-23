import { FOOD_GROUPS } from '../../utils/foodGroups'

const SECTIONS = [
  { key: 'all', label: 'All' },
  { key: 'fridge', label: 'Fridge' },
  { key: 'pantry', label: 'Pantry' },
  { key: 'freezer', label: 'Freezer' },
  { key: 'spices', label: 'Spices' },
]

function InventorySectionTabs({
  activeSection,
  onSectionChange,
  activeFoodGroup,
  onFoodGroupChange,
  inventory,
}) {
  const getSectionCount = (section) => {
    if (section === 'all') return inventory.length
    return inventory.filter(item => item.section === section).length
  }

  const getFoodGroupCount = (group) => {
    if (group === 'all') return inventory.length
    return inventory.filter(item => item.foodGroup === group).length
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Storage</div>
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map(({ key, label }) => {
            const count = getSectionCount(key)
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
      </div>

      {onFoodGroupChange && (
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Food Group</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onFoodGroupChange('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                activeFoodGroup === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeFoodGroup === 'all'
                    ? 'bg-orange-400 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {inventory.length}
              </span>
            </button>
            {FOOD_GROUPS.map(({ key, label, emoji }) => {
              const count = getFoodGroupCount(key)
              const isActive = activeFoodGroup === key
              return (
                <button
                  key={key}
                  onClick={() => onFoodGroupChange(key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {emoji} {label}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-orange-400 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default InventorySectionTabs
