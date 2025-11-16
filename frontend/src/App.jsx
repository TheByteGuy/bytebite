import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import HomePage from './pages/HomePage'
import DiningPage from './pages/DiningPage'
import HeroSection from "./components/HeroSection";

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

const goalLabelMap = Object.fromEntries(goalOptions.map(o => [o.value, o.label]))
const dietLabelMap = Object.fromEntries(dietOptions.map(o => [o.value, o.label]))

const diningHalls = [
  {
    id: 'commons',
    name: 'The Commons Dining Hall',
    area: 'Freshman Hill · 1999 Burdett Ave',
    description:
      'All-you-care-to-eat buffet anchored by the Simple Zone allergen-free area.',
    goalFocus: ['maintain', 'gain'],
    dietOptions: ['omnivore', 'vegetarian', 'vegan'],
    highlights: [
      'Simple Zone for nut/gluten-free plates',
      'Continuous service from breakfast to late dinner',
      'Comfort bowls plus rotating grills',
    ],
    signature: 'Primary hub for first-years',
  },
  {
    id: 'sage',
    name: 'Russell Sage Dining Hall',
    area: 'Central Academic Campus',
    description:
      'Classic buffet-style hall steps from lecture halls.',
    goalFocus: ['lose', 'maintain'],
    dietOptions: ['omnivore', 'vegetarian'],
    highlights: [
      'Quick salad/soup combos',
      'Comfort food counter & pasta theatre',
      'Great for central-campus students',
    ],
    signature: 'Central campus favorite',
  },
  {
    id: 'barh',
    name: 'BARH Dining Hall',
    area: '100 Albright Ct · Burdett Ave Residence Hall',
    description: 'Buffet hall built with athletes in mind.',
    goalFocus: ['maintain', 'gain'],
    dietOptions: ['omnivore', 'vegetarian'],
    highlights: [
      'Protein-forward carving station',
      'Weekend brunch for early practices',
      'Whole-grain sides & yogurts',
    ],
    signature: 'Athlete-ready buffet line',
  },
  {
    id: 'blitman',
    name: 'Blitman Dining Hall',
    area: 'Howard N. Blitman Residence Commons',
    description:
      'Cozy hall focused on weekday breakfast/dinner and weekend brunch.',
    goalFocus: ['lose', 'maintain'],
    dietOptions: ['omnivore', 'vegetarian', 'vegan'],
    highlights: [
      'Weekend omelet bar',
      'Weekday breakfast',
      'Plant-forward bar',
    ],
    signature: 'Neighborhood brunch spot',
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
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },
  write(v) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
    } catch {}
  },
}

const getMatchScore = (hall, profile) => {
  if (!profile) return 0
  let score = 0

  if (hall.goalFocus.includes(profile.goal)) score += 3
  if (profile.diet === 'omnivore') score += 1
  else if (hall.dietOptions.includes(profile.diet)) score += 3
  if (profile.diet === 'vegan' && hall.dietOptions.includes('vegan')) score += 2
  if (profile.goal === 'gain' && hall.goalFocus.includes('gain')) score += 1

  return Math.min(score, MAX_MATCH_SCORE)
}

const buildDietTags = (item = {}) => {
  const tags = []
  if (item.isVegan) tags.push('Vegan')
  else if (item.isVegetarian) tags.push('Vegetarian')
  if (item.isPlantBased) tags.push('Plant-based')
  if (item.isMindful) tags.push('Mindful')
  return tags
}

const stringifyAllergens = (allergens = []) =>
  Array.isArray(allergens)
    ? allergens.map(a => a?.name).filter(Boolean).join(', ')
    : ''

const flattenMenuItems = (rawMenu) => {
  if (!rawMenu) return []
  const meals = Array.isArray(rawMenu) ? rawMenu : rawMenu?.meals ?? []
  const rows = []
  meals.forEach((meal) => {
    meal?.groups?.forEach((group) => {
      group?.items?.forEach((item, idx) => {
        rows.push({
          id: `${meal?.name}-${group?.name}-${item?.menuItemId || idx}`,
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

  const [signupForm, setSignupForm] = useState({
  name: '',
  goal: '',
  diet: '',
  allergies: [],
})


  const [userProfile, setUserProfile] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [menuData, setMenuData] = useState({})
  const menuDataRef = useRef(menuData)

  const [hallSpotlightIndex, setHallSpotlightIndex] = useState(0)
  const [hallViewMode, setHallViewMode] = useState('carousel')

  const persistPreferences = (profile) => {
    safeStorage.write(profile)
    setUserProfile(profile)
  }

  useEffect(() => {
    const saved = safeStorage.read()
    if (saved) {
      setUserProfile(saved)
      setSignupForm(saved)
      setFeedback(`Welcome back, ${saved.name.split(' ')[0]}!`)
      setView('dining')
    }
  }, [])

  useEffect(() => {
    menuDataRef.current = menuData
  }, [menuData])

  useEffect(() => {
    if (view !== 'dining') return
    const pending = diningHalls.filter((h) => !menuDataRef.current[h.id])
    pending.forEach((hall) => {
      setMenuData((p) => ({ ...p, [hall.id]: { status: 'loading' } }))
      fetch(menuFileMap[hall.id])
        .then(r => r.json())
        .then((data) =>
          setMenuData((p) => ({ ...p, [hall.id]: { status: 'loaded', data } }))
        )
        .catch(() =>
          setMenuData((p) => ({ ...p, [hall.id]: { status: 'error' } }))
        )
    })
  }, [view])

  const isAuthenticated = Boolean(userProfile)
  const hasPersonalizedRankings = Boolean(userProfile)

  const updateSignupField = (field, value) =>
    setSignupForm((prev) => ({ ...prev, [field]: value }))

  const handleSavePreferences = (event) => {
    event.preventDefault()
    const trimmedName = signupForm.name.trim() || 'ByteBiter'

    const profile = {
      name: trimmedName,
      goal: signupForm.goal,
      diet: signupForm.diet,
      allergies: signupForm.allergies || [],
    }

    persistPreferences(profile)
    setFeedback(`Preferences saved! Welcome, ${trimmedName.split(' ')[0]}!`)
    setView('dining')
  }

  const hallRankings = useMemo(() => {
    if (!userProfile) return diningHalls
    return diningHalls.map((hall) => {
      const score = getMatchScore(hall, userProfile)
      return { ...hall, score }
    })
  }, [userProfile])

  const hallDisplayList = [...hallRankings].sort((a, b) => b.score - a.score)
  const hallCount = hallDisplayList.length
  const showCarousel = hallViewMode === 'carousel'
  const spotlightHall = hallDisplayList[hallSpotlightIndex % hallCount]
  const hallsToRender = showCarousel ? [spotlightHall] : hallDisplayList
  const standoutHallId = hallDisplayList[0]?.id

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <div className="brand">
          <img src="/ByteBiteOfficialv1.png"/>
          <div>
            <p className="eyebrow">ByteBite</p>
            <div id="descLogo">
              <strong>Campus Fuel Planner</strong>
            </div>
          </div>
        </div>

        <div className="nav-actions">
          <button
            className={view === 'home' ? 'ghost-button ghost-button--active' : 'ghost-button'}
            onClick={() => setView('home')}
          >
            Planner
          </button>

          <button
            className={view === 'dining' ? 'ghost-button ghost-button--active' : 'ghost-button'}
            onClick={() => setView('dining')}
          >
            Dining Halls
          </button>
        </div>
      </nav>

      {feedback && (
        <div className="inline-banner">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')}>×</button>
        </div>
      )}

      <header className="hero">
        <HeroSection
          onStartPlanning={() => setView('home')}
          onSeeDining={() => setView('dining')}
        />
      </header>

      {view === 'home' && (
        <HomePage
          signupForm={signupForm}
          updateSignupField={updateSignupField}
          handleSavePreferences={handleSavePreferences}
          goalOptions={goalOptions}
          dietOptions={dietOptions}
          heroPreview={diningHalls.slice(0, 3)}
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
          onChangeHallViewMode={setHallViewMode}
          showCarousel={showCarousel}
          spotlightHall={spotlightHall}
          goToPreviousHall={() => setHallSpotlightIndex((i) => (i - 1 + hallCount) % hallCount)}
          goToNextHall={() => setHallSpotlightIndex((i) => (i + 1) % hallCount)}
          hallSpotlightIndex={hallSpotlightIndex}
          hallsToRender={hallsToRender}
          standoutHallId={standoutHallId}
          menuData={menuData}
          flattenMenuItems={flattenMenuItems}
          maxMenuRows={MAX_MENU_ROWS}
          onBackToPlanner={() => setView('home')}
          onActivatePersonalization={() => {}}
        />
      )}

      <footer className="footer">
        Built with Vite + React · Dining data is illustrative for the ByteBite prototype.
      </footer>
    </div>
  )
}

export default App
