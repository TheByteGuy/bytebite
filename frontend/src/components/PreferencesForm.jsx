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
  // Option for visual impairment (single pill)
  const visuallyImpairedOptions = [
    { label: "Visually Impaired Mode", value: true }
  ];

  return (
    <section className="card auth-card preferences-card">
      <h2 className="preferences-title">Dining Preferences</h2>
      <p className="preferences-subcopy">
        Customize your experience to get personalized meal rankings.
      </p>

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

        {/* NEW: Accessibility Modes */}
        <div className="choice-field full-width-pill">
          <span className="choice-label">Accessibility</span>

          <ChoicePillRow
            options={[
              {
                label: "Visually Impaired Mode",
                value: "visuallyImpaired",
                tooltip: "(Speaks recommended meal)",
              },
              {
                label: "Colorblind-Friendly Mode",
                value: "colorblindFriendly",
                tooltip: "(Red-green colorblindness support)",
              },
            ]}
            activeValue={[
              ...(signupForm.visuallyImpaired ? ["visuallyImpaired"] : []),
              ...(signupForm.colorblindFriendly ? ["colorblindFriendly"] : []),
            ]}
            onSelect={(value) => {
              if (value === "visuallyImpaired") {
                updateSignupField("visuallyImpaired", !signupForm.visuallyImpaired);
              } else if (value === "colorblindFriendly") {
                updateSignupField(
                  "colorblindFriendly",
                  !signupForm.colorblindFriendly
                );
              }
            }}
          />
        </div>



        <button className="primary professional-btn" type="submit">
          Save My Preferences
        </button>
      </form>
    </section>
  );
}
