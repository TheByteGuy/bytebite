import { useEffect, useMemo, useState } from 'react'
import './App.css'

import HomePage from './pages/HomePage'
import DiningPage from './pages/DiningPage'
import LocationsPage from './pages/LocationsPage'
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
    area: 'Commons Dining Hall 1969 Burdett Ave, Troy, NY 12180',
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
    area: 'Russell Sage Dining Hall 1649 15th St, Troy, NY 12180',
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
    area: 'BARH Dining, 100 Albright Ct, Troy, NY 12180',
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

const SODEXO_MENU_API_BASE = 'https://api-prd.sodexomyway.net/v0.2/data/menu'
const SODEXO_API_KEY = '68717828-b754-420d-9488-4c37cb7d7ef7'

const diningMenuSources = {
  commons: { locationId: '76929001', menuId: '153148' },
  sage: { locationId: '76929002', menuId: '153157' },
  barh: { locationId: '76929003', menuId: '153626' },
  blitman: { locationId: '76929015', menuId: '153702' },
}

const EXCLUDED_MENU_GROUPS = new Set(['bakery', 'dessert', 'beverages', 'bliss'])

const buildMenuUrl = (source, dateString) =>
  `${SODEXO_MENU_API_BASE}/${source.locationId}/${source.menuId}?date=${dateString}`

const sanitizeRemoteMenu = (rawMenu) => {
  const meals = Array.isArray(rawMenu) ? rawMenu : rawMenu?.meals ?? []

  const sanitizedMeals = meals
    .map((meal) => {
      const groups = (meal?.groups ?? [])
        .filter((group) => {
          if (!group?.name) return false
          const normalizedName = String(group.name).trim().toLowerCase()
          return !EXCLUDED_MENU_GROUPS.has(normalizedName)
        })
        .map((group) => ({
          ...group,
          items: (group?.items ?? []).map((item, idx) => ({
            ...item,
            menuItemId: item?.menuItemId ?? idx,
          })),
        }))
        .filter((group) => (group?.items ?? []).length > 0)

      return groups.length > 0 ? { ...meal, groups } : null
    })
    .filter(Boolean)

  return {
    ...(Array.isArray(rawMenu) ? {} : rawMenu),
    meals: sanitizedMeals,
  }
}

const MAX_MENU_ROWS = 6
const MENU_CACHE_KEY = 'bytebite-menu-cache-v1'

const menuCache = {
  read() {
    try {
      const raw = localStorage.getItem(MENU_CACHE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  },
  write(date, hallId, payload) {
    try {
      const existing = menuCache.read()
      const next = { ...existing }

      if (!next[date]) next[date] = {}
      next[date][hallId] = {
        savedAt: Date.now(),
        data: payload,
      }

      localStorage.setItem(MENU_CACHE_KEY, JSON.stringify(next))
    } catch {}
  },
}

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
  const [signupForm, setSignupForm] = useState({ name: '', goal: '', diet: '', allergies: [] })
  const [userProfile, setUserProfile] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [menuData, setMenuData] = useState({})
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
    if (!feedback) return
    const timer = setTimeout(() => setFeedback(''), 3000)
    return () => clearTimeout(timer)
  }, [feedback])

  useEffect(() => {
    let isActive = true
    const hallEntries = Object.entries(diningMenuSources)
    const dateParam = new Date().toISOString().split('T')[0]

    const cached = menuCache.read()
    const cachedForToday = cached[dateParam] || {}

    setMenuData(() => {
      const initial = {}
      hallEntries.forEach(([hallId]) => {
        if (cachedForToday[hallId]?.data) {
          initial[hallId] = { status: 'loaded', data: cachedForToday[hallId].data }
        } else {
          initial[hallId] = { status: 'loading' }
        }
      })
      return initial
    })

    const fetchMenus = async () => {
      const hallsToFetch = hallEntries.filter(([hallId]) => !cachedForToday[hallId]?.data)
      if (hallsToFetch.length === 0) return

      await Promise.all(
        hallsToFetch.map(async ([hallId, source]) => {
          try {
            const response = await fetch(buildMenuUrl(source, dateParam), {
              headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'api-key': SODEXO_API_KEY,
              },
            })
            if (!response.ok) throw new Error(`Failed to load ${hallId} (HTTP ${response.status})`)
            const raw = await response.json()
            if (!isActive) return
            const sanitized = sanitizeRemoteMenu(raw)

            setMenuData(prev => ({
              ...prev,
              [hallId]: { status: 'loaded', data: sanitized }
            }))

            menuCache.write(dateParam, hallId, sanitized)
          } catch (err) {
            if (!isActive) return
            setMenuData(prev => ({
              ...prev,
              [hallId]: { status: 'error', error: err.message }
            }))
          }
        })
      )
    }

    fetchMenus()
    return () => { isActive = false }
  }, [])

  const isAuthenticated = Boolean(userProfile)
  const hasLoadedMenus = Object.values(menuData).some(m => m.status === 'loaded')

  const hallRankings = useMemo(() => {
    if (!userProfile) return diningHalls
    return diningHalls.map(hall => ({ ...hall, score: getMatchScore(hall, userProfile) }))
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
          <img src="/ByteBiteOfficialv1.png" alt="ByteBite"/>
          <div>
            <p className="eyebrow">ByteBite</p>
            <div id="descLogo"><strong>Campus Fuel Planner</strong></div>
          </div>
        </div>

        <div className="nav-actions">
          <button
            className={view==='home' ? 'ghost-button ghost-button--active' : 'ghost-button'}
            onClick={()=>setView('home')}
          >
            Planner
          </button>

          <button
            className={view==='dining' ? 'ghost-button ghost-button--active' : 'ghost-button'}
            onClick={()=>setView('dining')}
          >
            Dining Halls
          </button>

          <button
            className={view==='locations' ? 'ghost-button ghost-button--active' : 'ghost-button'}
            onClick={()=>setView('locations')}
          >
            Locations
          </button>
        </div>
      </nav>

      {feedback && (
        <div className="inline-banner">
          <span>{feedback}</span>
          <button onClick={()=>setFeedback('')}>×</button>
        </div>
      )}

      <header className="hero">
        <HeroSection onStartPlanning={()=>setView('home')} onSeeDining={()=>setView('dining')} />
      </header>

      {/* ⬇ Pages stay mounted, only hidden/shown */}
      <main>
        <section style={{ display: view === 'home' ? 'block' : 'none' }}>
          <HomePage
            signupForm={signupForm}
            updateSignupField={(field,val)=>setSignupForm(prev=>({...prev,[field]:val}))}
            handleSavePreferences={(e)=>{
              e.preventDefault()
              const profile={...signupForm,name:signupForm.name.trim()||'ByteBiter'}
              persistPreferences(profile)
              setFeedback(`Preferences saved! Welcome, ${profile.name.split(' ')[0]}!`)
              setView('dining')
            }}
            goalOptions={goalOptions}
            dietOptions={dietOptions}
            heroPreview={diningHalls.slice(0,3)}
            onNavigateToDining={()=>setView('dining')}
          />
        </section>

        <section style={{ display: view === 'dining' ? 'block' : 'none' }}>
          <DiningPage
            isAuthenticated={isAuthenticated}
            showPersonalizeButton={isAuthenticated && hasLoadedMenus}
            userProfile={userProfile}
            goalLabelMap={goalLabelMap}
            dietLabelMap={dietLabelMap}
            hallCount={hallCount}
            hallViewMode={hallViewMode}
            onChangeHallViewMode={setHallViewMode}
            showCarousel={showCarousel}
            spotlightHall={spotlightHall}
            goToPreviousHall={()=>setHallSpotlightIndex(i=>(i-1+hallCount)%hallCount)}
            goToNextHall={()=>setHallSpotlightIndex(i=>(i+1)%hallCount)}
            hallSpotlightIndex={hallSpotlightIndex}
            hallsToRender={hallsToRender}
            standoutHallId={standoutHallId}
            menuData={menuData}
            flattenMenuItems={flattenMenuItems}
            maxMenuRows={MAX_MENU_ROWS}
            onBackToPlanner={()=>setView('home')}
          />
        </section>

        <section style={{ display: view === 'locations' ? 'block' : 'none' }}>
          <LocationsPage diningHalls={diningHalls} />
        </section>
      </main>

      <footer className="footer">
        Built with Vite + React · Dining data is illustrative for the ByteBite prototype.
      </footer>
    </div>
  )
}

export default App
