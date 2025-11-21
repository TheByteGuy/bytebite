import { Fragment, useEffect, useMemo, useState } from 'react'

const MATCH_PERCENT_KEYS = [
  'matchPercent',
  'percentMatch',
  'percent',
  'percentage',
  'match_percentage',
  'match_percentage_score',
  'personalizedPercent',
  'personalizationPercent',
  'geminiPercent',
  'matchScore',
  'match_score',
]

const extractMatchPercentValue = (source) => {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return null
  }

  for (const key of MATCH_PERCENT_KEYS) {
    if (source[key] !== undefined && source[key] !== null) {
      return source[key]
    }
  }

  for (const value of Object.values(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nested = extractMatchPercentValue(value)
      if (nested !== null && nested !== undefined) {
        return nested
      }
    }
  }

  return null
}
import AIAssistant from "../components/AIAssistant";
const SAMPLE_MENU_BLUEPRINT = [
  {
    meal: 'Breakfast',
    station: '{area} Fuel Bar',
    name: '{hall} Sunrise Protein Bowl',
    calories: 410,
    tags: ['High protein', 'Vegetarian'],
    allergens: 'Eggs, dairy',
  },
  {
    meal: 'Lunch',
    station: '{area} Grill',
    name: 'Ginger Salmon Grain Bowl',
    calories: 520,
    tags: ['Pescatarian'],
    allergens: 'Fish, soy',
  },
  {
    meal: 'Dinner',
    station: 'Chef Table',
    name: 'Spiced Chickpea Power Plate',
    calories: 480,
    tags: ['Vegan', 'High fiber'],
    allergens: 'Sesame',
  },
  {
    meal: 'Lunch',
    station: 'Bakery Bliss',
    name: 'Mini Pastry Flight',
    calories: 90,
    tags: ['Vegetarian'],
    allergens: 'Gluten, dairy',
  },
  {
    meal: 'Dinner',
    station: 'Harvest Bowls',
    name: '{hall} Citrus Greens',
    calories: 305,
    tags: ['Vegetarian'],
    allergens: 'Tree nuts',
  },
]

const MENU_AUTOMATION_DELAY = 450

const buildSyntheticMenu = (hall) => {
  const hallName = hall?.name ?? 'Campus Hall'
  const areaPrefix = hall?.area?.split(' ')[0] ?? 'Campus'

  return SAMPLE_MENU_BLUEPRINT.map((item, index) => ({
    ...item,
    id: `${hall?.id ?? 'hall'}-${item.meal.toLowerCase()}-${index}`,
    name: item.name.replace('{hall}', hallName),
    station: item.station.replace('{area}', areaPrefix),
  }))
}

async function playStreamedAudio(text) {
  if (!text) return;
  const API_KEY = "sk_c1c16e8664ffd9ccbd249451e904c69324d233c7757ca2ce";
  const VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Or pick your preferred voice

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.5 },
        }),
      }
    );

    if (!response.ok) throw new Error(`TTS request failed: ${response.status}`);

    const reader = response.body.getReader();
    const audioChunks = [];

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      audioChunks.push(value);
    }

    const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  } catch (err) {
    console.error("ElevenLabs TTS error:", err);
  }
}

const simulateMenuLoad = async (hall) => {
  await new Promise((resolve) => setTimeout(resolve, MENU_AUTOMATION_DELAY))
  return buildSyntheticMenu(hall)
}

function DiningPage({
  isAuthenticated,
  hasPersonalizedRankings,
  userProfile,
  goalLabelMap,
  dietLabelMap,
  hallViewMode,
  onChangeHallViewMode,
  hallCount,
  showCarousel,
  hallSpotlightIndex,
  spotlightHall,
  hallsToRender,
  goToPreviousHall,
  goToNextHall,
  onBackToPlanner,
  menuData,
  flattenMenuItems,
  standoutHallId,
  maxMenuRows,
}) {

  const [parsedHalls, setParsedHalls] = useState({});
  const [matchPercent, setMatchPercent] = useState(null);
  const [isPersonalizing, setIsPersonalizing] = useState(false);
  const [pendingChatMessages, setPendingChatMessages] = useState([]);
  const heroName = userProfile?.name?.split(' ')[0]
  const isCarouselActive = hallViewMode === 'carousel' && showCarousel
  const [autoMenuData, setAutoMenuData] = useState({})

  const mergedMenuData = useMemo(
    () => ({ ...autoMenuData, ...(menuData ?? {}) }),
    [autoMenuData, menuData],
  )

  const filteredMenuCache = useMemo(() => new Map(), [])
  const readyForPersonalize =
    isAuthenticated &&
    !hasPersonalizedRankings &&
    userProfile?.goal &&
    userProfile?.diet &&
    hallsToRender.length > 0 &&
    hallsToRender.every((hall) => mergedMenuData[hall.id]?.status === 'loaded')

  const pushChatMessages = (entries) => {
    setPendingChatMessages((previous) => [...previous, ...entries])
  }

  const handlePersonalizeRankings = async () => {
    if (!readyForPersonalize || isPersonalizing) return
    setIsPersonalizing(true)
    pushChatMessages([
      {
        role: 'user',
        content: `Give me a personalized list of dining hall items.`,
      },
    ])
    try {
      const compactJSON = JSON.stringify(mergedMenuData, null, 0)
      console.log(userProfile);
      const prompt =`Rank RPI dining halls for this user. Total must equal 100%.
                      User Profile:
                      - Goal: ${userProfile.goal} weight
                      - Diet: ${userProfile.diet}
                      - Allergies: ${userProfile.allergies?.join(", ") || "none"}

                      Use these constraints to rank dining halls.  
                      Output EXACTLY in this format for EACH hall — no extra text, no explanations:

                      Hall: X%
                      Top3: food1, food2, food3

                      Data: ${compactJSON}
                      `;

      const resp = await fetch('https://bytebite-615j.onrender.com/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const data = await resp.json()
      

      if (data.text) {
        const halls = {}
        const regex = /(\w+):\s*(\d+)%[\s\S]*?Top3:\s*([^\n]+)/g

        let match
        while ((match = regex.exec(data.text)) !== null) {
          const hall = match[1]
          const percent = Number(match[2])
          const top3 = match[3].split(',').map((s) => s.trim())

          halls[hall] = { percent, top3 }
        }

        setParsedHalls(halls)

        if (userProfile.visuallyImpaired) {
          const speechText = `AI Ranking Result: ${data.text}`
          playStreamedAudio(speechText)
        }

        pushChatMessages([
          {
            role: 'assistant',
            content: `Here are your personalized rankings:\n\n${data.text}`,
          },
        ])
      } else if (data.error) {
        console.error('Gemini API error:', data.error)
        pushChatMessages([
          { role: 'assistant', content: `Gemini API error: ${data.error}` },
        ])
      }
    } catch (err) {
      console.error('Failed to call Gemini:', err)
      pushChatMessages([
        { role: 'assistant', content: 'Failed to fetch AI ranking. Please try again later.' },
      ])
    } finally {
      setIsPersonalizing(false)
    }
  }
    
  useEffect(() => {
    if (!spotlightHall || !parsedHalls) return;

    const normalize = (str) => str?.trim().toLowerCase();
    const spotlightName = normalize(spotlightHall.name);

    // Try exact match first
    let hallData = parsedHalls[spotlightHall.name];

    if (!hallData) {
      // Fallback: search for a key that is included in the spotlight name
      hallData = Object.entries(parsedHalls).find(([key]) =>
        spotlightName.includes(normalize(key))
      )?.[1];
    }

    const percent = hallData?.percent ?? null;
    setMatchPercent(percent);
  }, [parsedHalls, spotlightHall]);


  useEffect(() => {
    filteredMenuCache.clear()
  }, [menuData, hallsToRender, filteredMenuCache])

  const loadingHallCount = hallsToRender.filter(
    (hall) => mergedMenuData[hall.id]?.status === 'loading',
  ).length

  const errorHallNames = hallsToRender
    .filter((hall) => mergedMenuData[hall.id]?.status === 'error')
    .map((hall) => hall.name)

  const parseCalories = (value) => {
    if (typeof value === 'number') return value
    const numericValue = parseInt(String(value ?? '').replace(/[^0-9-]/g, ''), 10)
    return Number.isNaN(numericValue) ? 0 : numericValue
  }

  const shouldIncludeMenuRow = (row) => {
    const textBlob = `${row.station ?? ''} ${row.name ?? ''}`.toLowerCase()
    const hasExcludedKeyword = textBlob.includes('bakery') || textBlob.includes('bliss')
    if (hasExcludedKeyword) return false
    const calories = parseCalories(row.calories)
    return calories >= 100
  }

  const addMealBreaks = (rows) => {
    let previousMeal = null
    return rows.map((row) => {
      const mealLabel = row.meal ?? ''
      const isMealStart = previousMeal !== null && mealLabel !== previousMeal
      previousMeal = mealLabel
      return { ...row, isMealStart }
    })
  }

  const getFilteredMenuRows = (hall) => {
    if (!hall) return []

    if (filteredMenuCache.has(hall.id)) return filteredMenuCache.get(hall.id)

    const hallMenu = (menuData ?? {})[hall.id]
    let rows =
      hallMenu?.status === 'loaded'
        ? flattenMenuItems(hallMenu.data).filter(shouldIncludeMenuRow)
        : []

          const blockedAllergens = userProfile?.allergies?.map(a => a.toLowerCase()) ?? []

    if (blockedAllergens.length > 0) {
      rows = rows.filter((row) => {
        const allergenStr = row.allergens?.toLowerCase() ?? ""

        // remove row if any blocked allergen appears in the allergens string
        return !blockedAllergens.some((bad) => allergenStr.includes(bad))
      })
    }

    const diet = userProfile?.diet?.toLowerCase() ?? "omnivore"

    const getTags = (row) =>
      Array.isArray(row.tags)
        ? row.tags.map(t => t.toLowerCase())
        : (row.tags ? [row.tags.toLowerCase()] : [])

    // apply diet filters
    if (diet === "vegetarian") {
      rows = rows.filter((row) => {
        const tags = getTags(row)
        return tags.includes("vegetarian") || tags.includes("vegan")
      })
    }

    if (diet === "vegan") {
      rows = rows.filter((row) => {
        const tags = getTags(row)
        return tags.includes("vegan")
      })
}
    filteredMenuCache.set(hall.id, rows)
    return rows
  }

  const totalMenuItems = hallsToRender.reduce(
    (count, hall) => count + getFilteredMenuRows(hall).length,
    0,
  )

  const renderSpotlightView = () => {
    if (!spotlightHall) {
      return (
        <div className="menu-note">
          Select a hall to spotlight and see its full food lineup.
        </div>
      )
    }

    const hallMenu = (menuData ?? {})[spotlightHall.id]
    const hallMenuItems = getFilteredMenuRows(spotlightHall)
    const matchesGoal =
      hasPersonalizedRankings && spotlightHall.goalFocus.includes(userProfile.goal)
    const matchesDiet =
      hasPersonalizedRankings && spotlightHall.dietOptions.includes(userProfile.diet)
    const hallName = spotlightHall.name;

    // pull personalized AI % if available
    const normalizedHallName = spotlightHall.name.split(' ')[0]; // match AI naming
    const hallMatchPercent =
      hasPersonalizedRankings && parsedHalls[normalizedHallName]
        ? parsedHalls[normalizedHallName].percent
        : null;

   const personalizationNote = hasPersonalizedRankings
      ? [
          matchesGoal ? `${goalLabelMap[userProfile.goal]} dishes on rotation` : null,
          matchesDiet
            ? `${dietLabelMap[userProfile.diet]} stations ready`
            : 'Good fallback when your go-to is busy',
        ]
          .filter(Boolean)
          .join(' · ')
      : `${spotlightHall.goalFocus
          .map((code) => goalLabelMap[code])
          .slice(0, 2)
          .join(' · ')} ready today`

    return (
      <section className="spotlight-section" aria-live="polite">
        <div className="spotlight-heading">
          <div className="spotlight-heading__info">
            <p className="eyebrow">Spotlight hall</p>
            <h3>{spotlightHall.name}</h3>
            <div className="spotlight-badge-row">
              <p className="spotlight-area">{spotlightHall.area}</p>
            </div>
          </div>
        </div>

        <p className="spotlight-desc">{spotlightHall.description}</p>

        <ul className="spotlight-meta">
          <li>
            <span className="meta-label">Best for: </span>
            <strong>
              {spotlightHall.goalFocus.map((code) => goalLabelMap[code]).join(' · ')}
            </strong>
          </li>
          <li>
            <span className="meta-label">Diet ready: </span>
            <strong>
              {spotlightHall.dietOptions.map((code) => dietLabelMap[code]).join(' · ')}
            </strong>
          </li>
          <li>
            <span className="meta-label">Personal note: </span>
            <strong>{personalizationNote}</strong>
          </li>
        </ul>

        {/* NAV ROW: Prev | 1/4 Halls | Next */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            margin: "1rem 0 0.5rem",
          }}
        >
          <button
            type="button"
            className="carousel-button"
            onClick={goToPreviousHall}
            aria-label="Show previous dining hall"
            style={{ flexShrink: 0 }}
          >
            Prev
          </button>

          <div
            style={{
              flex: "1 1 auto",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            <strong>
              {hallSpotlightIndex + 1}/{hallCount}
            </strong>
            <div>Halls</div>
          </div>

          <button
            type="button"
            className="carousel-button"
            onClick={goToNextHall}
            aria-label="Show next dining hall"
            style={{ flexShrink: 0 }}
          >
            Next
          </button>
        </div>

        {/* MATCH BAR ROW RIGHT ABOVE TABLE */}
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ marginBottom: "1rem" }}>

            <div
              style={{
                height: "12px",
                width: "100%",
                background: "#eee",
                borderRadius: "6px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${matchPercent ?? 0}%`,
                  height: "100%",
                  background: "#4caf50",
                  transition: "width 0.5s ease",
                }}
              />
            </div>

            <div className="percent-box">
              {matchPercent !== null
                ? `${matchPercent}% Match`
                : "Percent match not calculated yet"}
            </div>

          </div>
        </div>

        {/* MENU TABLE SECTION */}
        <div className="menu-section menu-section--full">
          <div className="menu-section__top">
            <div>
              <span className="meta-label">Live menu: </span>
              <strong>
                {hallMenu?.status === 'loaded'
                  ? `${hallMenuItems.length} dish${
                      hallMenuItems.length === 1 ? '' : 'es'
                    } today`
                  : 'Menu feed'}
              </strong>
            </div>
            {hallMenuItems.length > 0 && (
              <span className="menu-note">
                Pulling every dish from {spotlightHall.name} that matches your needs.
              </span>
            )}
          </div>

          {!hallMenu && (
            <p className="menu-note">Menu loads when you open this view.</p>
          )}
          {hallMenu?.status === 'loading' && (
            <p className="menu-note">Pulling today's feed...</p>
          )}
          {hallMenu?.status === 'error' && (
            <p className="menu-note error-text">
              Unable to load menu file: {hallMenu.error}
            </p>
          )}
          {hallMenu?.status === 'loaded' && hallMenuItems.length === 0 && (
            <p className="menu-note">No menu items listed in the JSON yet.</p>
          )}
        
          {hallMenu?.status === 'loaded' && hallMenuItems.length > 0 && (
            <>
            <div className="hidden md:block">

            <div className="menu-table-wrapper menu-table-wrapper--full">
              <table className="menu-table menu-table--dense">
                <thead>
                  <tr>
                    <th>Meal</th>
                    <th>Station</th>
                    <th>Dish</th>
                    <th>Calories</th>
                    <th>Tags</th>
                    <th>Allergens</th>
                  </tr>
                </thead>
                <tbody>
                  {addMealBreaks(hallMenuItems).map((row) => (
                    <tr
                      key={row.id}
                      className={
                        row.isMealStart ? 'menu-row menu-row--meal-start' : 'menu-row'
                      }
                    >
                      <td>{row.meal}</td>
                      <td>{row.station}</td>
                      <td>{row.name}</td>
                      <td>{row.calories}</td>
                      <td>{row.tags?.length ? row.tags.join(' · ') : '--'}</td>
                      <td>{row.allergens || 'None listed'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
                        
            {/* MOBILE VERSION — OUTSIDE the hidden div */}
            <div className="block md:hidden ">
              {hallMenuItems.map(item => (
                <div key={item.id} className="mobile-card bg-white rounded-xl shadow p-4 mb-4 border border-gray-200">
                    
                  <h4 className = "font-bold">{item.name}</h4>
                  
                  <div className="flex justify-between items-start mb-2">
                  <p>{item.station}</p>
                  <p>{item.meal}</p>

                    </div>
                  <p>{item.calories} cal</p>
                  <p>{item.tags?.join(" · ")}</p>
                  <p>{item.allergens}</p>
                </div>
              ))}
            </div>
        </>
          )}
        </div>
      </section>
    )
  }

  const renderAllHallsTable = () => {
    const aggregatedRows = hallsToRender.flatMap((hall) => {
      const hallRows = getFilteredMenuRows(hall)
      if (hallRows.length === 0) return []

      return addMealBreaks(hallRows.slice(0, maxMenuRows)).map((row) => ({
        ...row,
        hallId: hall.id,
        hallName: hall.name,
        hallArea: hall.area,
      }))
    })

    return (
      <section className="all-halls-section">
        <div className="all-halls-header">
          <div>
            <p className="eyebrow">All halls</p>
            <h3>Food at a glance</h3>
            <p>
              {aggregatedRows.length > 0
                ? `Showing ${aggregatedRows.length} dishes across ${hallsToRender.length} halls.`
                : 'Menus load as soon as the JSON feed finishes downloading.'}
            </p>
          </div>
          <div className="all-halls-metrics">
            <div>
              <span className="meta-label">Halls ready: </span>
              <strong>{Math.max(hallCount - loadingHallCount, 0)}</strong>
            </div>
            <div>
              <span className="meta-label">Dishes tracked: </span>
              <strong>{totalMenuItems}</strong>
            </div>
          </div>
        </div>

        {aggregatedRows.length > 0 ? (
          <div className="menu-table-wrapper menu-table-wrapper--full">
            <table className="menu-table menu-table--dense">
              <thead>
                <tr>
                  <th>Hall</th>
                  <th>Meal</th>
                  <th>Station</th>
                  <th>Dish</th>
                  <th>Calories</th>
                  <th>Tags</th>
                  <th>Allergens</th>
                </tr>
              </thead>
              <tbody>
                {aggregatedRows.map((row) => (
                  <tr
                    key={`${row.hallId}-${row.id}`}
                    className={
                      row.isMealStart ? 'menu-row menu-row--meal-start' : 'menu-row'
                    }
                  >
                    <td>
                      <div className="hall-col">
                        <strong>{row.hallName}</strong>
                        <small>{row.hallArea}</small>
                      </div>
                    </td>
                    <td>{row.meal}</td>
                    <td>{row.station}</td>
                    <td>{row.name}</td>
                    <td>{row.calories}</td>
                    <td>{row.tags?.length ? row.tags.join(' · ') : '--'}</td>
                    <td>{row.allergens || 'None listed'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="menu-table-empty">
            {loadingHallCount > 0 ? (
              <p className="menu-note">Pulling menus for {loadingHallCount} hall(s)...</p>
            ) : (
              <p className="menu-note">Open a hall to trigger its food feed.</p>
            )}
          </div>
        )}

        {totalMenuItems > aggregatedRows.length && aggregatedRows.length > 0 && (
          <p className="menu-note">
            Showing up to {maxMenuRows} dishes per hall for quick scanning.
          </p>
        )}

        {errorHallNames.length > 0 && (
          <p className="menu-note error-text">
            Unable to load menus for {errorHallNames.join(', ')}.
          </p>
        )}
      </section>
    )
  }

  return (
    <section
      className={`dining-page ${isPersonalizing ? 'dining-page--loading' : ''}`}
      aria-busy={isPersonalizing}
    >
      <div className="dining-header">
        <div>
          <p className="eyebrow">Dining Explorer</p>
          <h2>
          {hasPersonalizedRankings
            ? `${heroName}'s Personalized Lineup`
            : isAuthenticated
            ? "Campus Menu — Signed In"
            : "Campus Menu — Guest View"}
        </h2>

        <p>
        {hasPersonalizedRankings
          ? `Ranked using your ${goalLabelMap[userProfile.goal]} goal and ${dietLabelMap[userProfile.diet]
              .replace("no preference", "Omnivore Preference")}.`
          : isAuthenticated
          ? `You are signed in. Tap “Personalize My Rankings” to generate your tailored list.`
          : `Sign up or log in to sort dining halls based on your goals and dietary preferences.`}
      </p>

        </div>

        <div className="dining-actions">
          <button className="ghost-button" type="button" onClick={onBackToPlanner}>
            Back to planner
          </button>

          {readyForPersonalize && (
            <button
              className="primary"
              type="button"
              onClick={handlePersonalizeRankings}
              disabled={isPersonalizing}
            >
              {isPersonalizing ? 'Personalizing…' : 'Personalize my rankings'}
            </button>
          )}
        </div>
      </div>

      {hallCount > 0 && (
        <div className="view-toggle">
          <span>VIEW STYLE:</span>

          <div className="segmented-control">
            <div
              className="segmented-highlight"
              style={{
                transform:
                  hallViewMode === 'carousel'
                    ? 'translateX(0%)'
                    : 'translateX(100%)',
              }}
            />

            <button
              className={`segmented-btn ${
                hallViewMode === 'carousel' ? 'active' : ''
              }`}
              onClick={() => onChangeHallViewMode('carousel')}
            >
              Spotlight
            </button>

            <button
              className={`segmented-btn ${
                hallViewMode === 'grid' ? 'active' : ''
              }`}
              onClick={() => onChangeHallViewMode('grid')}
            >
              All halls
            </button>
          </div>
        </div>
      )}

      {isCarouselActive ? renderSpotlightView() : renderAllHallsTable()}
      <AIAssistant
        menuJson={mergedMenuData}
        externalMessages={pendingChatMessages}
        onConsumeExternalMessages={() => setPendingChatMessages([])}
      />

      {isPersonalizing && (
        <div className="personalize-overlay" role="status" aria-live="assertive">
          <div className="personalize-card">
            <div className="personalize-spinner" aria-hidden="true" />
            <p>Please wait while we load your personalized rankings.</p>
            <small>We're crunching menus, macros, and your goals.</small>
          </div>
        </div>
      )}
    </section>
  )
}

export default DiningPage
