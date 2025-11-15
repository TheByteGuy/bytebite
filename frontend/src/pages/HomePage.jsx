import PreferencesForm from "../components/PreferencesForm"
import PreviewCard from "../components/PreviewCard"



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
      
      <PreferencesForm
      signupForm={signupForm}
      updateSignupField={updateSignupField}
      handleSavePreferences={handleSavePreferences}
      allergyOptions={allergyOptions}
      goalOptions={goalOptions}
      dietOptions={dietOptions}
      handleAllergySelect={handleAllergySelect}
    />

      <PreviewCard
        heroPreview={heroPreview}
        onNavigateToDining={onNavigateToDining}
      />

    </main>
  )
}

export default HomePage
