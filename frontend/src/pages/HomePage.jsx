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

function HomePage({
  signupForm,
  updateSignupField,
  handleSavePreferences,
  goalOptions,
  dietOptions,
  heroPreview,
  onNavigateToDining,
}) {
  const allergyOptions = [
    { value: 'eggs', label: 'Eggs' },
    { value: 'nuts', label: 'Nuts' },
    { value: 'milk', label: 'Milk' },
  ]

  const handleAllergySelect = (value) => {
    const current = signupForm.allergies || []
    if (current.includes(value)) {
      updateSignupField('allergies', current.filter((a) => a !== value))
    } else {
      updateSignupField('allergies', [...current, value])
    }
  }

  return (
    <main className="home-grid">
      <section className="card auth-card">
        <h2>Save your dining preferences</h2>

        <form className="auth-form" onSubmit={handleSavePreferences}>
          <label className="input-field">
            <span>Your name</span>
            <input
              type="text"
              value={signupForm.name}
              onChange={(event) => updateSignupField('name', event.target.value)}
              required
              placeholder="Avery Byte"
            />
          </label>

          <div className="choice-field">
            <span>Allergies</span>
            <ChoicePillRow
              options={allergyOptions}
              activeValue={signupForm.allergies || []}
              onSelect={handleAllergySelect}
            />
          </div>

          <div className="choice-field">
            <span>Body goal</span>
            <ChoicePillRow
              options={goalOptions}
              activeValue={signupForm.goal}
              onSelect={(value) => updateSignupField('goal', value)}
            />
          </div>

          <div className="choice-field">
            <span>Diet style</span>
            <ChoicePillRow
              options={dietOptions}
              activeValue={signupForm.diet}
              onSelect={(value) => updateSignupField('diet', value)}
            />
          </div>

          <button className="primary" type="submit">
            Save my preferences
          </button>
        </form>
      </section>

      <section className="card preview-card">
        <p className="eyebrow">Campus snapshot</p>
        <h2>Here’s what’s cooking tonight</h2>
        <p className="preview-copy">
          ByteBite ranks every hall automatically once you save your preferences.
        </p>

        <ul className="mini-hall-list">
          {heroPreview.map((hall) => (
            <li key={hall.id}>
              <div id="mini-hall-info">
                <strong>{hall.name}</strong>
                <span>{hall.signature}</span>
              </div>
              <span className="mini-area">{hall.area}</span>
            </li>
          ))}
        </ul>

        <button className="secondary" type="button" onClick={onNavigateToDining}>
          Go to the dining explorer
        </button>
      </section>
    </main>
  )
}

export default HomePage
