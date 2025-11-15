const ChoicePillRow = ({ options, activeValue, onSelect }) => (
  <div className="chip-row">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        className={`chip ${activeValue.includes(option.value) ? 'chip--active' : ''}`}
        aria-pressed={activeValue.includes(option.value)}
        onClick={() => onSelect(option.value)}
      >
        <span>{option.label}</span>
        {option.description && <small>{option.description}</small>}
      </button>
    ))}
  </div>
)
export default ChoicePillRow;