import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'bytebite-profile'
const MAX_MATCH_SCORE = 6

const goalOptions = [
  { value: 'lose', label: 'Lose Weight', description: 'lighter plates & hydration' },
  { value: 'maintain', label: 'Maintain', description: 'balanced macros every day' },
  { value: 'gain', label: 'Gain Muscle', description: 'hearty, protein-forward meals' },
]

const dietOptions = [
  { value: 'omnivore', label: 'No Preference', description: 'happy with omnivore menus' },
  { value: 'vegetarian', label: 'Vegetarian', description: 'meat-free plates only' },
  { value: 'vegan', label: 'Vegan', description: '100% plant-powered' },
]

const goalLabelMap = goalOptions.reduce((acc, option) => {
  acc[option.value] = option.label
  return acc
}, {})

const dietLabelMap = dietOptions.reduce((acc, option) => {
  acc[option.value] = option.label
  return acc
}, {})

const diningHalls = [
  {
    id: 'commons',
    name: 'The Commons Dining Hall',
    area: 'Freshman Hill · 1999 Burdett Ave',
    description:
      'All-you-care-to-eat buffet anchored by the Simple Zone allergen-free area. Open for the full day so first-years can refuel after labs or late practice.',
    goalFocus: ['maintain', 'gain'],
    dietOptions: ['omnivore', 'vegetarian', 'vegan'],
    highlights: [
      'Simple Zone for nut/gluten-free plates',
      'Continuous service from breakfast to late dinner',
      'Comfort bowls plus rotating grills for first-year athletes',
    ],
    signature: 'Primary hub for first-years',
  },
  {
    id: 'sage',
    name: 'Russell Sage Dining Hall',
    area: 'Central Academic Campus',
    description:
      'A classic buffet-style hall steps from lecture halls. Balanced plates and plenty of quick grab-and-go options keep central campus residents on schedule.',
    goalFocus: ['lose', 'maintain'],
    dietOptions: ['omnivore', 'vegetarian'],
    highlights: [
      'Quick salad/soup combos between classes',
      'Comfort food counter & pasta theatre',
      'Ideal for students living near studio spaces',
    ],
    signature: 'Central campus crowd favorite',
  },
  {
    id: 'barh',
    name: 'BARH Dining Hall',
    area: '100 Albright Ct · Burdett Ave Residence Hall',
    description:
      'Buffet-style dining hall known for menus built with student athletes in mind: lean proteins, whole grains, and recovery-friendly snacks.',
    goalFocus: ['maintain', 'gain'],
    dietOptions: ['omnivore', 'vegetarian'],
    highlights: [
      'Protein-forward carving station',
      'Weekend brunch tailored for early practices',
      'Whole-grain sides and grab-and-go yogurts',
    ],
    signature: 'Athlete-ready buffet line',
  },
  {
    id: 'blitman',
    name: 'Blitman Dining Hall',
    area: 'Howard N. Blitman Residence Commons',
    description:
      'Residential hall for ~300 students with a dining room focused on weekday breakfast/dinner and weekend brunch. Cozy atmosphere with vegetarian-friendly stations.',
    goalFocus: ['lose', 'maintain'],
    dietOptions: ['omnivore', 'vegetarian', 'vegan'],
    highlights: [
      'Weekend brunch omelet bar',
      'Weekday breakfast before downtown studios',
      'Small-hall atmosphere with plant-forward bar',
    ],
    signature: 'Neighborhood brunch + dinner spot',
  },
]
const menuFileMap = {
  commons: '/menus/commons.json',
  sage: '/menus/sage.json',
  barh: '/menus/barh.json',
  blitman: '/menus/blitman.json',
}

const MAX_MENU_ROWS = 6

const safeStorage = {
  read() {
    if (typeof window === 'undefined') return null
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch (error) {
      console.warn('Unable to read saved ByteBite profile.', error)
      return null
    }
  },
  write(profile) {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    } catch (error) {
      console.warn('Unable to store ByteBite profile.', error)
    }
  },
}

const getMatchScore = (hall, profile) => {
  if (!profile) return 0
  let score = 0
  if (hall.goalFocus.includes(profile.goal)) {
    score += 3
  }

  if (profile.diet === 'omnivore') {
    score += 1
  } else if (hall.dietOptions.includes(profile.diet)) {
    score += 3
  }

  const hasFullPlantSupport = hall.dietOptions.includes('vegan')
  if (profile.diet === 'vegan' && hasFullPlantSupport) {
    score += 2
  }

  if (profile.goal === 'gain' && hall.goalFocus.includes('gain')) {
    score += 1
  }

  return Math.min(score, MAX_MATCH_SCORE)
}

const buildDietTags = (item = {}) => {
  const tags = []
  if (item.isVegan) {
    tags.push('Vegan')
  } else if (item.isVegetarian) {
    tags.push('Vegetarian')
  }

  if (item.isPlantBased) {
    tags.push('Plant-based')
  }

  if (item.isMindful) {
    tags.push('Mindful')
  }

  return tags
}

const stringifyAllergens = (allergens = []) => {
  if (!Array.isArray(allergens) || allergens.length === 0) return ''
  return allergens
    .map((allergen) => allergen?.name)
    .filter(Boolean)
    .join(', ')
}

const flattenMenuItems = (rawMenu) => {
  if (!rawMenu) return []
  const meals = Array.isArray(rawMenu) ? rawMenu : rawMenu?.meals ?? []
  const rows = []

  meals.forEach((meal) => {
    meal?.groups?.forEach((group) => {
      group?.items?.forEach((item, idx) => {
        rows.push({
          id: `${meal?.name || 'Meal'}-${group?.name || 'Group'}-${item?.menuItemId || idx}`,
          meal: meal?.name || 'Meal',
          station: group?.name || 'Station',
          name: item?.formalName || item?.description || 'Menu item',
          calories: item?.calories || '—',
          tags: buildDietTags(item),
          allergens: stringifyAllergens(item?.allergens),
        })
      })
    })
  })

  return rows
}

function App() {
  const [view, setView] = useState('home')
  const [authMode, setAuthMode] = useState('signup')
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    goal: 'maintain',
    diet: 'omnivore',
  })
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [userProfile, setUserProfile] = useState(null)
  const [storedPreferences, setStoredPreferences] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [authError, setAuthError] = useState('')
  const [menuData, setMenuData] = useState({})
  const menuDataRef = useRef(menuData)

  useEffect(() => {
    const saved = safeStorage.read()
    if (saved) {
      setStoredPreferences(saved)
      setSignupForm((prev) => ({
        ...prev,
        name: saved.name || prev.name,
        email: saved.email || prev.email,
      }))
      setLoginForm((prev) => ({ ...prev, email: saved.email || prev.email }))
    }
  }, [])

  useEffect(() => {
    setAuthError('')
  }, [authMode])

  useEffect(() => {
    menuDataRef.current = menuData
  }, [menuData])

  useEffect(() => {
    if (view !== 'dining') return
    const pendingHalls = diningHalls.filter((hall) => !menuDataRef.current[hall.id])
    if (pendingHalls.length === 0) return
    let cancelled = false

    pendingHalls.forEach((hall) => {
      setMenuData((prev) => ({
        ...prev,
        [hall.id]: { status: 'loading' },
      }))

      fetch(menuFileMap[hall.id])
        .then((response) => {
          if (!response.ok) {
            throw new Error('Menu not available')
          }
          return response.json()
        })
        .then((data) => {
          if (cancelled) return
          setMenuData((prev) => ({
            ...prev,
            [hall.id]: { status: 'loaded', data },
          }))
        })
        .catch((error) => {
          if (cancelled) return
          setMenuData((prev) => ({
            ...prev,
            [hall.id]: { status: 'error', error: error.message },
          }))
        })
    })

    return () => {
      cancelled = true
    }
  }, [view])

  const isAuthenticated = Boolean(userProfile)

  const hallRankings = useMemo(() => {
    return diningHalls.map((hall) => {
      if (!isAuthenticated) {
        return { ...hall, score: null }
      }
      return { ...hall, score: getMatchScore(hall, userProfile) }
    })
  }, [isAuthenticated, userProfile])

  const hallDisplayList = useMemo(() => {
    if (!isAuthenticated) return hallRankings
    return [...hallRankings].sort((first, second) => (second.score ?? 0) - (first.score ?? 0))
  }, [hallRankings, isAuthenticated])

  const standoutHallId = isAuthenticated ? hallDisplayList[0]?.id : null

  const updateSignupField = (field, value) => {
    setSignupForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignupSubmit = (event) => {
    event.preventDefault()
    setAuthError('')
    const trimmedName = signupForm.name.trim() || 'ByteBiter'
    const profileToPersist = {
      name: trimmedName,
      email: signupForm.email.trim(),
      password: signupForm.password,
      goal: signupForm.goal,
      diet: signupForm.diet,
    }

    safeStorage.write(profileToPersist)
    setStoredPreferences(profileToPersist)
    setUserProfile({ ...profileToPersist, isAuthenticated: true })
    setFeedback(
      `Welcome, ${trimmedName.split(' ')[0]}! We’ll focus on ${goalLabelMap[signupForm.goal].toLowerCase()}.`,
    )
    setView('dining')
  }

  const handleLoginSubmit = (event) => {
    event.preventDefault()
    setAuthError('')
    if (!storedPreferences) {
      setAuthError('No saved plan yet. Create one with Sign Up.')
      return
    }

    const emailMatches =
      storedPreferences.email.trim().toLowerCase() === loginForm.email.trim().toLowerCase()
    const passwordMatches = storedPreferences.password === loginForm.password

    if (!emailMatches || !passwordMatches) {
      setAuthError('Email or password does not match your saved plan.')
      return
    }

    setUserProfile({ ...storedPreferences, isAuthenticated: true })
    setFeedback(`Welcome back, ${storedPreferences.name?.split(' ')[0] || 'ByteBiter'}!`)
    setView('dining')
  }

  const handleSignOut = () => {
    setUserProfile(null)
    setFeedback('Signed out. You can still explore the campus halls without personalization.')
    setView('home')
  }

  const heroPreview = diningHalls.slice(0, 3)

  const renderChoicePill = (collection, activeValue, onSelect) => (
    <div className="chip-row">
      {collection.map((option) => (
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

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <div className="brand">
          <span className="logo-dot" aria-hidden="true" />
          <div>
            <p className="eyebrow">ByteBite</p>
            <strong>Campus Fuel Planner</strong>
          </div>
        </div>
        <div className="nav-actions">
          <button
            className={view === 'home' ? 'ghost-button ghost-button--active' : 'ghost-button'}
            onClick={() => setView('home')}
            type="button"
          >
            Planner
          </button>
          <button
            className={view === 'dining' ? 'ghost-button ghost-button--active' : 'ghost-button'}
            onClick={() => setView('dining')}
            type="button"
          >
            Dining Halls
          </button>
          {isAuthenticated && (
            <button className="ghost-button danger" onClick={handleSignOut} type="button">
              Sign out
            </button>
          )}
        </div>
      </nav>

      {feedback && (
        <div className="inline-banner">
          <span>{feedback}</span>
          <button type="button" onClick={() => setFeedback('')} aria-label="Dismiss message">
            ×
          </button>
        </div>
      )}

      <header className="hero">
        <div>
          <p className="eyebrow">Build a smarter dining routine</p>
          <h1>Sign up, choose your goals, and we rank campus dining for you.</h1>
          <p className="hero-copy">
            Tell us if you’re cutting, maintaining, or bulking and whether you’re vegetarian or
            vegan. ByteBite keeps a personalized scorecard ready every time you log in.
          </p>
          <div className="hero-cta">
            <button className="primary" type="button" onClick={() => setView('home')}>
              Start planning
            </button>
            <button className="secondary" type="button" onClick={() => setView('dining')}>
              See dining halls
            </button>
          </div>
        </div>
        <ul className="stat-list">
          <li>
            <strong>3 goals</strong>
            <span>Lose · Maintain · Gain</span>
          </li>
          <li>
            <strong>Vegan & vegetarian</strong>
            <span>Flagged in every ranking</span>
          </li>
          <li>
            <strong>4 dining halls</strong>
            <span>Main RPI spots ranked instantly</span>
          </li>
        </ul>
      </header>

      {view === 'home' && (
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
                  {renderChoicePill(goalOptions, signupForm.goal, (value) =>
                    updateSignupField('goal', value),
                  )}
                </div>

                <div className="choice-field">
                  <span>Diet style</span>
                  {renderChoicePill(dietOptions, signupForm.diet, (value) =>
                    updateSignupField('diet', value),
                  )}
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
                    onChange={(event) =>
                      setLoginForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                    required
                    placeholder="you@school.edu"
                  />
                </label>
                <label className="input-field">
                  <span>Password</span>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                    }
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
              See every dining hall in a neutral lineup. Once you sign up or log in, ByteBite ranks
              them based on your goal and if you are vegetarian or vegan.
            </p>
            <ul className="mini-hall-list">
              {heroPreview.map((hall) => (
                <li key={hall.id}>
                  <div>
                    <strong>{hall.name}</strong>
                    <span>{hall.signature}</span>
                  </div>
                  <span className="mini-area">{hall.area}</span>
                </li>
              ))}
            </ul>

            <button className="secondary" type="button" onClick={() => setView('dining')}>
              Go to the dining explorer
            </button>
          </section>
        </main>
      )}

      {view === 'dining' && (
        <section className="dining-page">
          <div className="dining-header">
            <div>
              <p className="eyebrow">Dining Explorer</p>
              <h2>
                {isAuthenticated
                  ? `${userProfile.name.split(' ')[0]}'s personalized lineup`
                  : 'Neutral campus lineup'}
              </h2>
              <p>
                {isAuthenticated
                  ? `Ranked using your ${goalLabelMap[userProfile.goal].toLowerCase()} goal and ${dietLabelMap[userProfile.diet]
                      .toLowerCase()
                      .replace('no preference', 'omnivore preference')}.`
                  : 'Sign up or log in to sort these halls by your goals and dietary choices.'}
              </p>
            </div>
            <div className="dining-actions">
              <button className="ghost-button" type="button" onClick={() => setView('home')}>
                Back to planner
              </button>
              {!isAuthenticated && (
                <button className="primary" type="button" onClick={() => setAuthMode('signup')}>
                  Personalize my rankings
                </button>
              )}
            </div>
          </div>

          <div className="hall-grid">
            {hallDisplayList.map((hall) => {
              const matchesGoal = isAuthenticated && hall.goalFocus.includes(userProfile.goal)
              const matchesDiet = isAuthenticated && hall.dietOptions.includes(userProfile.diet)
              const matchPercent = isAuthenticated
                ? Math.round(((hall.score ?? 0) / MAX_MATCH_SCORE) * 100)
                : null
              const hallMenu = menuData[hall.id]
              const hallMenuItems = flattenMenuItems(hallMenu?.data)
              const menuRows = hallMenuItems.slice(0, MAX_MENU_ROWS)

              return (
                <article
                  key={hall.id}
                  className={`hall-card ${
                    standoutHallId === hall.id ? 'hall-card--top' : ''
                  }`.trim()}
                >
                  <div className="hall-card__header">
                    <div>
                      <p className="eyebrow">{hall.area}</p>
                      <h3>{hall.name}</h3>
                    </div>
                    <div
                      className={`match-chip ${
                        standoutHallId === hall.id ? 'match-chip--primary' : ''
                      }`.trim()}
                    >
                      {isAuthenticated ? `${matchPercent}% match` : 'Campus favorite'}
                    </div>
                  </div>

                  <p className="hall-desc">{hall.description}</p>

                  <div className="hall-meta">
                    <div>
                      <span className="meta-label">Best for</span>
                      <strong>{hall.goalFocus.map((code) => goalLabelMap[code]).join(' · ')}</strong>
                    </div>
                    <div>
                      <span className="meta-label">Diet ready</span>
                      <strong>{hall.dietOptions.map((code) => dietLabelMap[code]).join(' · ')}</strong>
                    </div>
                  </div>

                  <ul className="highlight-list">
                    {hall.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>

                  <div className="menu-section">
                    <span className="meta-label">Menu snapshot</span>
                    {!hallMenu && <p className="menu-note">Menu loads when you open this view.</p>}
                    {hallMenu?.status === 'loading' && (
                      <p className="menu-note">Pulling today's feed...</p>
                    )}
                    {hallMenu?.status === 'error' && (
                      <p className="menu-note error-text">
                        Unable to load menu file: {hallMenu.error}
                      </p>
                    )}
                    {hallMenu?.status === 'loaded' && menuRows.length === 0 && (
                      <p className="menu-note">No menu items listed in the JSON yet.</p>
                    )}
                    {hallMenu?.status === 'loaded' && menuRows.length > 0 && (
                      <div className="menu-table-wrapper">
                        <table className="menu-table">
                          <thead>
                            <tr>
                              <th>Meal</th>
                              <th>Station</th>
                              <th>Item</th>
                              <th>Calories</th>
                              <th>Tags</th>
                              <th>Allergens</th>
                            </tr>
                          </thead>
                          <tbody>
                            {menuRows.map((row) => (
                              <tr key={row.id}>
                                <td>{row.meal}</td>
                                <td>{row.station}</td>
                                <td>{row.name}</td>
                                <td>{row.calories}</td>
                                <td>{row.tags.length ? row.tags.join(' · ') : '—'}</td>
                                <td>{row.allergens || 'None listed'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="menu-note">
                          Showing {menuRows.length} of {hallMenuItems.length} dishes from the sample
                          feed.
                        </p>
                      </div>
                    )}
                  </div>

                  {isAuthenticated && (
                    <p className="personal-note">
                      {[
                        matchesGoal
                          ? `${goalLabelMap[userProfile.goal]} dishes on rotation`
                          : null,
                        matchesDiet
                          ? `${dietLabelMap[userProfile.diet]} stations ready`
                          : 'Good fallback option when your go-to is busy',
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      )}

      <footer className="footer">
        Built with Vite + React · Dining data is illustrative for the ByteBite prototype.
      </footer>
    </div>
  )
}

export default App
