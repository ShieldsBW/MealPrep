import DayCard from './DayCard'

const SLOT_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
}

function DayColumn({ day, slots, activeSlots, onViewRecipe, onRemoveMeal, onReplaceMeal }) {
  const multiSlot = activeSlots.length > 1

  return (
    <div className="space-y-3">
      {multiSlot && (
        <h3 className="text-sm font-semibold text-gray-700 text-center bg-gray-100 rounded-lg py-2">
          {day}
        </h3>
      )}
      {activeSlots.map(slot => {
        const slotData = slots[slot]
        if (!slotData) return null
        return (
          <DayCard
            key={slot}
            day={multiSlot ? undefined : day}
            slotLabel={multiSlot ? SLOT_LABELS[slot] : undefined}
            meal={slotData.meal}
            onViewRecipe={onViewRecipe}
            onRemove={onRemoveMeal ? () => onRemoveMeal(day, slot) : undefined}
            onReplace={onReplaceMeal ? () => onReplaceMeal(day, slot, slotData.meal) : undefined}
          />
        )
      })}
    </div>
  )
}

export default DayColumn
