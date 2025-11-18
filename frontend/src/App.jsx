import { useMemo, useState } from 'react'
import HeroSection from './components/HeroSection'
import HomePage from './pages/HomePage'
import DiningPage from './pages/DiningPage'
import LocationsPage from './pages/LocationsPage'

const GOAL_OPTIONS = [
  { value: 'cut', label: 'Cutting', description: 'Drop fat, keep muscle' },
  { value: 'maintain', label: 'Maintenance', description: 'Stay steady and fueled' },
  { value: 'bulk', label: 'Bulking', description: 'Gain strength and recover fast' },
]

const DIET_OPTIONS = [
  { value: 'vegan', label: 'Vegan', description: 'No animal products' },
  { value: 'vegetarian', label: 'Vegetarian', description: 'No meat, eggs and dairy ok' },
  { value: 'none', label: 'No preference', description: 'Omnivore friendly' },
]

const HERO_PREVIEW = [
  { id: 'nucleus', name: 'Nucleus', signature: 'High-protein grill', area: 'East Campus' },
  { id: 'blitman', name: 'Blitman', signature: 'Comfort + salad bar', area: 'Freshmen Hill' },
  { id: 'commons', name: 'Commons', signature: 'Balanced bowls', area: 'Townhouses' },
  { id: 'barh', name: 'BARH', signature: 'Vegan rotation', area: 'West Hall' },
]

const DINING_HALLS = [
  {
    id: 'commons',
    name: 'Commons',
    area: 'Townhouses',
    description: 'Best fallback when the other halls are slammed. Good salad toppings and grain bowls.',
    goalFocus: ['maintain', 'bulk'],
    dietOptions: ['vegetarian', 'none'],
    matchPercent: 92,
    standout: false,
  },
  {
    id: 'nucleus',
    name: 'Nucleus',
    area: 'East Campus',
    description: 'Protein heavy grill, fast omelets, and the most consistent produce quality.',
    goalFocus: ['cut', 'maintain', 'bulk'],
    dietOptions: ['vegan', 'vegetarian', 'none'],
    matchPercent: 97,
    standout: true,
  },
  {
    id: 'blitman',
    name: 'Blitman',
    area: 'Freshmen Hill',
    description: 'Comfort food rotation but solid veggie options and quick grab-and-go.',
    goalFocus: ['maintain', 'bulk'],
    dietOptions: ['vegetarian', 'none'],
    matchPercent: 88,
    standout: false,
  },
  {
    id: 'barh',
    name: 'BARH',
    area: 'West Hall',
    description: 'Vegan-forward options and the calmest seating during dinner rush.',
    goalFocus: ['cut', 'maintain'],
    dietOptions: ['vegan', 'vegetarian'],
    matchPercent: 84,
    standout: false,
  },
]

const FLATTEN_MENU_ITEMS = (data) => {
  if (!data || typeof data !== 'object') {
    return []
  }

  return Object.values(data).flatMap((entry) => {
    if (Array.isArray(entry)) {
      return entry
    }
    if (entry && typeof entry === 'object') {
      return Object.values(entry).flatMap((nested) => (Array.isArray(nested) ? nested : []))
    }
    return []
  })
}

const LOGO_MARK = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
  <defs>
    <linearGradient id='g' x1='0%' x2='100%' y1='0%' y2='100%'>
      <stop stop-color='%23602b7d' offset='0%'/>
      <stop stop-color='%23e52b4b' offset='100%'/>
    </linearGradient>
  </defs>
  <rect width='120' height='120' rx='24' fill='url(%23g)'/>
  <path d='M28 76c6 12 18 18 32 18 20 0 36-13 36-32 0-14-9-24-26-24-12 0-22 7-22 18 0 8 6 14 16 14 10 0 18-6 18-16 0-9-6-15-16-15-4 0-8 1-10 3' stroke='white' stroke-width='8' fill='none' stroke-linecap='round'/>
</svg>`

function App() {
  const [activePage, setActivePage] = useState('home')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasPersonalizedRankings, setHasPersonalizedRankings] = useState(false)
  const [hallViewMode, setHallViewMode] = useState('carousel')
  const [hallSpotlightIndex, setHallSpotlightIndex] = useState(0)
  const [signupForm, setSignupForm] = useState({
    name: 'Avery Byte',
    email: 'avery@school.edu',
    allergies: [],
    goal: 'maintain',
    diet: 'none',
    visuallyImpaired: false,
    colorblindFriendly: false,
  })
  const [menuData] = useState({})

  const goalLabelMap = useMemo(
    () => GOAL_OPTIONS.reduce((map, option) => ({ ...map, [option.value]: option.label }), {}),
    [],
  )
  const dietLabelMap = useMemo(
    () => DIET_OPTIONS.reduce((map, option) => ({ ...map, [option.value]: option.label }), {}),
    [],
  )

  const hallsToRender = useMemo(() => {
    if (!hasPersonalizedRankings) {
      return [...DINING_HALLS]
    }
    return [...DINING_HALLS].sort(
      (hallA, hallB) => (hallB.matchPercent ?? 0) - (hallA.matchPercent ?? 0),
    )
  }, [hasPersonalizedRankings])

  const standoutHallId = useMemo(
    () => hallsToRender.find((hall) => hall.standout)?.id ?? hallsToRender[0]?.id,
    [hallsToRender],
  )

  const userProfile = {
    name: signupForm.name || 'Student',
    goal: signupForm.goal || 'maintain',
    diet: signupForm.diet || 'none',
  }

  const hallCount = hallsToRender.length
  const spotlightHall = hallCount ? hallsToRender[hallSpotlightIndex % hallCount] : null

  const updateSignupField = (field, value) =>
    setSignupForm((previous) => ({ ...previous, [field]: value }))

  const handleSavePreferences = (event) => {
    event.preventDefault()
    setHasPersonalizedRankings(true)
    setIsAuthenticated(true)
    setActivePage('dining')
  }

  const goToPreviousHall = () =>
    setHallSpotlightIndex((index) =>
      hallCount === 0 ? 0 : (index - 1 + hallCount) % Math.max(hallCount, 1),
    )
  const goToNextHall = () =>
    setHallSpotlightIndex((index) => (hallCount === 0 ? 0 : (index + 1) % hallCount))

  const handleSignOut = () => {
    setIsAuthenticated(false)
    setHasPersonalizedRankings(false)
    setActivePage('home')
  }

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="brand">
          <div className="brand-logo">
            <img src={LOGO_MARK} alt="ByteBite logo" loading="lazy" />
          </div>
          <div className="brand-text">
            <strong>ByteBite</strong>
            <div id="descLogo">Campus dining coach</div>
          </div>
        </div>
        <div className="nav-actions">
          <button
            type="button"
            className={`ghost-button ${activePage === 'home' ? 'ghost-button--active' : ''}`}
            onClick={() => setActivePage('home')}
          >
            Planner
          </button>
          <button
            type="button"
            className={`ghost-button ${activePage === 'dining' ? 'ghost-button--active' : ''}`}
            onClick={() => setActivePage('dining')}
          >
            Dining explorer
          </button>
          <button
            type="button"
            className={`ghost-button ${activePage === 'locations' ? 'ghost-button--active' : ''}`}
            onClick={() => setActivePage('locations')}
          >
            Locations
          </button>
          {isAuthenticated && (
            <button type="button" className="ghost-button danger" onClick={handleSignOut}>
              Sign out
            </button>
          )}
        </div>
      </header>

      {activePage === 'home' && (
        <>
          <HeroSection
            onStartPlanning={() => setActivePage('home')}
            onSeeDining={() => setActivePage('dining')}
          />
          <HomePage
            signupForm={signupForm}
            updateSignupField={updateSignupField}
            handleSavePreferences={handleSavePreferences}
            goalOptions={GOAL_OPTIONS}
            dietOptions={DIET_OPTIONS}
            heroPreview={HERO_PREVIEW}
            onNavigateToDining={() => setActivePage('dining')}
          />
        </>
      )}

      {activePage === 'dining' && (
        <DiningPage
          isAuthenticated={isAuthenticated}
          hasPersonalizedRankings={hasPersonalizedRankings}
          userProfile={userProfile}
          goalLabelMap={goalLabelMap}
          dietLabelMap={dietLabelMap}
          hallViewMode={hallViewMode}
          onChangeHallViewMode={setHallViewMode}
          hallCount={hallCount}
          showCarousel={hallCount > 1}
          hallSpotlightIndex={hallSpotlightIndex}
          spotlightHall={spotlightHall}
          hallsToRender={hallsToRender}
          goToPreviousHall={goToPreviousHall}
          goToNextHall={goToNextHall}
          onBackToPlanner={() => setActivePage('home')}
          flattenMenuItems={FLATTEN_MENU_ITEMS}
          standoutHallId={standoutHallId}
          maxMenuRows={10}
          menuData={menuData}
        />
      )}

      {activePage === 'locations' && <LocationsPage diningHalls={hallsToRender} />}

      <footer className="footer">
        <p>ByteBite · Built for fast menu scouting and personalized rankings.</p>
      </footer>
    </div>
  )
}

export default App
