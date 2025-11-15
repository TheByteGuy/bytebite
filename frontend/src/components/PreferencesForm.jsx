import ChoicePillRow from "./ChoicePillRow"

export default function PreferencesForm({
  signupForm,
  updateSignupField,
  handleSavePreferences,
  allergyOptions,
  goalOptions,
  dietOptions,
  handleAllergySelect,
}) {
  return (
    <section className="card auth-card preferences-card">
      <h2 className="preferences-title">Dining Preferences</h2>
      <p className="preferences-subcopy">Customize your experience to get personalized meal rankings.</p>

      <form className="auth-form" onSubmit={handleSavePreferences}>
        <label className="input-field elegant-input">
          <span className="input-label">Your Name</span>
          <input
            type="text"
            value={signupForm.name}
            onChange={(event) => updateSignupField("name", event.target.value)}
            required
            placeholder="Avery Byte"
          />
        </label>

        <div className="choice-field">
          <span className="choice-label">Allergies</span>
          <ChoicePillRow
            options={allergyOptions}
            activeValue={signupForm.allergies || []}
            onSelect={handleAllergySelect}
          />
        </div>

        <div className="choice-field">
          <span className="choice-label">Body Goal</span>
          <ChoicePillRow
            options={goalOptions}
            activeValue={signupForm.goal}
            onSelect={(value) => updateSignupField("goal", value)}
          />
        </div>

        <div className="choice-field">
          <span className="choice-label">Diet Style</span>
          <ChoicePillRow
            options={dietOptions}
            activeValue={signupForm.diet}
            onSelect={(value) => updateSignupField("diet", value)}
          />
        </div>

        <button className="primary professional-btn" type="submit">
          Save My Preferences
        </button>
      </form>
    </section>
  )
}
