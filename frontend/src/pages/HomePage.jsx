const ChoicePillRow = ({ options, activeValue, onSelect }) => (
  <div className="chip-row">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        className={`chip ${activeValue === option.value ? 'chip--active' : ''}`}
        aria-pressed={activeValue === option.value}
        onClick={() => onSelect(option.value)}
      >
        <span>{option.label}</span>
        <small>{option.description}</small>
      </button>
    ))}
  </div>
)

function HomePage({
  authMode,
  setAuthMode,
  signupForm,
  loginForm,
  updateSignupField,
  setLoginForm,
  handleSignupSubmit,
  handleLoginSubmit,
  authError,
  goalOptions,
  dietOptions,
  heroPreview,
  onNavigateToDining,
}) {
  return (
    <main className="home-grid">
      <section className="card auth-card">
        <div className="auth-toggle">
          <button
            type="button"
            className={authMode === 'signup' ? 'auth-tab auth-tab--active' : 'auth-tab'}
            onClick={() => setAuthMode('signup')}
          >
            Sign up
          </button>
          <button
            type="button"
            className={authMode === 'login' ? 'auth-tab auth-tab--active' : 'auth-tab'}
            onClick={() => setAuthMode('login')}
          >
            Log in
          </button>
        </div>

        {authMode === 'signup' ? (
          <form className="auth-form" onSubmit={handleSignupSubmit}>
            <label className="input-field">
              <span>Full name</span>
              <input
                type="text"
                value={signupForm.name}
                onChange={(event) => updateSignupField('name', event.target.value)}
                required
                placeholder="Avery Byte"
              />
            </label>
            <label className="input-field">
              <span>Campus email</span>
              <input
                type="email"
                value={signupForm.email}
                onChange={(event) => updateSignupField('email', event.target.value)}
                required
                placeholder="you@school.edu"
              />
            </label>
            <label className="input-field">
              <span>Password</span>
              <input
                type="password"
                value={signupForm.password}
                onChange={(event) => updateSignupField('password', event.target.value)}
                required
                placeholder="••••••••"
              />
            </label>

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
              Create my plan
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <p className="form-subcopy">
              Log in to pull up your saved goal and dietary preferences.
            </p>
            <label className="input-field">
              <span>Campus email</span>
              <input
                type="email"
                value={loginForm.email}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                required
                placeholder="you@school.edu"
              />
            </label>
            <label className="input-field">
              <span>Password</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                required
                placeholder="••••••••"
              />
            </label>
            <button className="primary" type="submit">
              Log in & personalize
            </button>
          </form>
        )}

        {authError && <p className="form-error">{authError}</p>}
      </section>

      <section className="card preview-card">
        <p className="eyebrow">Campus snapshot</p>
        <h2>Here’s what’s cooking tonight</h2>
        <p className="preview-copy">
          See every dining hall in a neutral lineup. Once you sign up or log in, ByteBite ranks them
          based on your goal and if you are vegetarian or vegan.
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
