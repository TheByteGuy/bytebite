import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import HomePage from './pages/HomePage'
import DiningPage from './pages/DiningPage'

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
  const [personalizationUnlocked, setPersonalizationUnlocked] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [authError, setAuthError] = useState('')
  const [menuData, setMenuData] = useState({})
  const menuDataRef = useRef(menuData)
  const [hallSpotlightIndex, setHallSpotlightIndex] = useState(0)
  const [hallViewMode, setHallViewMode] = useState('carousel') // 'carousel' | 'grid'

  const persistPreferences = (profile) => {
    setStoredPreferences(profile)
    safeStorage.write(profile)
  }

  useEffect(() => {
    const saved = safeStorage.read()
    if (!saved) return

    persistPreferences(saved)
    setPersonalizationUnlocked(Boolean(saved.personalizationUnlocked))
    setSignupForm((prev) => ({
      ...prev,
      name: saved.name || prev.name,
      email: saved.email || prev.email,
      goal: saved.goal || prev.goal,
      diet: saved.diet || prev.diet,
    }))
    setLoginForm((prev) => ({ ...prev, email: saved.email || prev.email }))

    if (saved.goal && saved.diet) {
      setUserProfile({ ...saved, isAuthenticated: true })
      if (saved.personalizationUnlocked) {
        setFeedback(
          `Welcome back, ${saved.name?.split(' ')[0] || 'ByteBiter'}! Your plan is ready.`,
        )
        setView('dining')
      } else {
        setFeedback(
          `Welcome back, ${saved.name?.split(' ')[0] || 'ByteBiter'}! Personalize your rankings when you're ready.`,
        )
      }
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
  const hasPersonalizedRankings = isAuthenticated && personalizationUnlocked

  useEffect(() => {
    if (view !== 'dining') return
    setHallSpotlightIndex(0)
    if (!hasPersonalizedRankings) {
      setHallViewMode('carousel')
    }
  }, [hasPersonalizedRankings, view])

  const hallRankings = useMemo(() => {
    const baseList = diningHalls.map((hall) => {
      if (!hasPersonalizedRankings) {
        return { ...hall, score: null, matchPercent: null }
      }
      const score = getMatchScore(hall, userProfile)
      return { ...hall, score }
    })

    if (!hasPersonalizedRankings) {
      return baseList
    }

    const totalScore = baseList.reduce((sum, hall) => sum + (hall.score ?? 0), 0)
    const withPercent = baseList.map((hall) => {
      const percent =
        totalScore > 0 ? Math.round(((hall.score ?? 0) / totalScore) * 100) : 0
      return { ...hall, matchPercent: percent }
    })
    const percentSum = withPercent.reduce((sum, hall) => sum + (hall.matchPercent ?? 0), 0)
    if (totalScore > 0 && percentSum !== 100 && withPercent.length > 0) {
      withPercent[0] = {
        ...withPercent[0],
        matchPercent: (withPercent[0].matchPercent ?? 0) + (100 - percentSum),
      }
    }
    return withPercent
  }, [hasPersonalizedRankings, userProfile])

  const hallDisplayList = useMemo(() => {
    if (!hasPersonalizedRankings) return hallRankings
    return [...hallRankings].sort((first, second) => (second.score ?? 0) - (first.score ?? 0))
  }, [hallRankings, hasPersonalizedRankings])

  const baseHallList = hasPersonalizedRankings ? hallDisplayList : hallRankings
  const hallCount = baseHallList.length

  useEffect(() => {
    if (hallCount === 0) {
      setHallSpotlightIndex(0)
      return
    }
    setHallSpotlightIndex((prev) => prev % hallCount)
  }, [hallCount])

  const standoutHallId = hasPersonalizedRankings ? hallDisplayList[0]?.id : null
  const showCarousel = hallViewMode === 'carousel'
  const spotlightHall =
    showCarousel && hallCount > 0 ? baseHallList[hallSpotlightIndex % hallCount] : null
  const hallsToRender = showCarousel
    ? spotlightHall
      ? [spotlightHall]
      : []
    : baseHallList

  const goToPreviousHall = () => {
    if (!hallCount) return
    setHallSpotlightIndex((prev) => (prev - 1 + hallCount) % hallCount)
  }

  const goToNextHall = () => {
    if (!hallCount) return
    setHallSpotlightIndex((prev) => (prev + 1) % hallCount)
  }

  const changeHallViewMode = (mode) => {
    setHallViewMode(mode)
  }

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
      personalizationUnlocked: false,
    }

    persistPreferences(profileToPersist)
    setPersonalizationUnlocked(false)
    setUserProfile({ ...profileToPersist, isAuthenticated: true })
    setFeedback(
      `Welcome, ${trimmedName.split(' ')[0]}! Click "Personalize my rankings" whenever you're ready.`,
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

    const personalizationReady = Boolean(storedPreferences.personalizationUnlocked)
    setPersonalizationUnlocked(personalizationReady)
    setUserProfile({ ...storedPreferences, isAuthenticated: true })
    setFeedback(
      personalizationReady
        ? `Welcome back, ${storedPreferences.name?.split(' ')[0] || 'ByteBiter'}! Your rankings are ready.`
        : `Welcome back, ${storedPreferences.name?.split(' ')[0] || 'ByteBiter'}! Tap "Personalize my rankings" to see your lineup.`,
    )
    setView('dining')
  }

  const handleSignOut = () => {
    setUserProfile(null)
    setPersonalizationUnlocked(false)
    setFeedback('Signed out. You can still explore the campus halls without personalization.')
    setView('home')
  }

  const handleActivatePersonalization = () => {
    if (!isAuthenticated || hasPersonalizedRankings) return

    const sourceProfile = storedPreferences || userProfile
    if (sourceProfile) {
      const { isAuthenticated: _ignored, ...profileData } = sourceProfile
      const updatedProfile = { ...profileData, personalizationUnlocked: true }
      persistPreferences(updatedProfile)
      setUserProfile((prev) =>
        prev ? { ...prev, personalizationUnlocked: true, isAuthenticated: true } : prev,
      )
    }

    setPersonalizationUnlocked(true)
    setFeedback('Personalized rankings activated. Enjoy your tailored lineup!')
  }

  const heroPreview = diningHalls.slice(0, 3)

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <div className="brand">
          <div id="logo">
            <img src="/ByteBiteOfficialv1.png" alt="ByteBite Logo"/>
          </div>
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
        <HomePage
          authMode={authMode}
          setAuthMode={setAuthMode}
          signupForm={signupForm}
          loginForm={loginForm}
          updateSignupField={updateSignupField}
          setLoginForm={setLoginForm}
          handleSignupSubmit={handleSignupSubmit}
          handleLoginSubmit={handleLoginSubmit}
          authError={authError}
          goalOptions={goalOptions}
          dietOptions={dietOptions}
          heroPreview={heroPreview}
          onNavigateToDining={() => setView('dining')}
        />
      )}

      {view === 'dining' && (
        <DiningPage
          isAuthenticated={isAuthenticated}
          hasPersonalizedRankings={hasPersonalizedRankings}
          userProfile={userProfile}
          goalLabelMap={goalLabelMap}
          dietLabelMap={dietLabelMap}
          hallCount={hallCount}
          hallViewMode={hallViewMode}
          onChangeHallViewMode={changeHallViewMode}
          showCarousel={showCarousel}
          spotlightHall={spotlightHall}
          goToPreviousHall={goToPreviousHall}
          goToNextHall={goToNextHall}
          hallSpotlightIndex={hallSpotlightIndex}
          hallsToRender={hallsToRender}
          standoutHallId={standoutHallId}
          menuData={menuData}
          flattenMenuItems={flattenMenuItems}
          maxMenuRows={MAX_MENU_ROWS}
          onBackToPlanner={() => setView('home')}
          onActivatePersonalization={handleActivatePersonalization}
        />
      )}

      <footer className="footer">
        Built with Vite + React · Dining data is illustrative for the ByteBite prototype.
      </footer>
    </div>
  )
}

export default App
