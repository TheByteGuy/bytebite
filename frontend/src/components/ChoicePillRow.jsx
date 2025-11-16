const ChoicePillRow = ({ options, activeValue, onSelect }) => {
  const isActive = (value) => {
    if (Array.isArray(activeValue)) {
      return activeValue.includes(value)
    }
    if (typeof activeValue === 'string') {
      return activeValue.includes(value)
    }
    return activeValue === value
  }

  return (
    <div className="chip-row">
      {options.map((option) => {
        const hoveredCopyId = option.tooltip ? `${option.value}-tooltip` : undefined
        return (
          <button
            key={option.value}
            type="button"
            className={`chip ${isActive(option.value) ? 'chip--active' : ''}`}
            aria-pressed={isActive(option.value)}
            aria-describedby={hoveredCopyId}
            onClick={() => onSelect(option.value)}
          >
            <span>{option.label}</span>
            {option.description && <small>{option.description}</small>}
            {option.tooltip && (
              <span id={hoveredCopyId} className="chip-tooltip">
                {option.tooltip}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default ChoicePillRow
