import { useEffect, useMemo, useState } from 'react'

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
  onActivatePersonalization,
  menuData,
  flattenMenuItems,
  standoutHallId,
  maxMenuRows,
}) {
  const heroName = userProfile?.name?.split(' ')[0]
  const isCarouselActive = hallViewMode === 'carousel' && showCarousel
  const [autoMenuData, setAutoMenuData] = useState({})

  const mergedMenuData = useMemo(
    () => ({ ...autoMenuData, ...(menuData ?? {}) }),
    [autoMenuData, menuData],
  )

  // cache for filtered rows
  const filteredMenuCache = useMemo(() => new Map(), [])

  useEffect(() => {
    // clear cached rows when menuData/halls change
    filteredMenuCache.clear()
  }, [menuData, hallsToRender, filteredMenuCache])

  const loadingHallCount = hallsToRender.filter(
    (hall) => mergedMenuData[hall.id]?.status === 'loading',
  ).length

  const errorHallNames = hallsToRender
    .filter((hall) => mergedMenuData[hall.id]?.status === 'error')
    .map((hall) => hall.name)

  const parseCalories = (value) => {
    if (typeof value === 'number') {
      return value
    }
    const numericValue = parseInt(String(value ?? '').replace(/[^0-9-]/g, ''), 10)
    return Number.isNaN(numericValue) ? 0 : numericValue
  }

  const shouldIncludeMenuRow = (row) => {
    const textBlob = `${row.station ?? ''} ${row.name ?? ''}`.toLowerCase()
    const hasExcludedKeyword = textBlob.includes('bakery') || textBlob.includes('bliss')
    if (hasExcludedKeyword) {
      return false
    }
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
    if (!hall) {
      return []
    }

    if (filteredMenuCache.has(hall.id)) {
      return filteredMenuCache.get(hall.id)
    }

    const hallMenu = (menuData ?? {})[hall.id]
    const rows =
      hallMenu?.status === 'loaded'
        ? flattenMenuItems(hallMenu.data).filter(shouldIncludeMenuRow)
        : []

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
    const matchPercent = hasPersonalizedRankings ? spotlightHall.matchPercent ?? 0 : null
    const personalizationNote = hasPersonalizedRankings
      ? [
          matchesGoal ? `${goalLabelMap[userProfile.goal]} dishes on rotation` : null,
          matchesDiet
            ? `${dietLabelMap[userProfile.diet]} stations ready`
            : 'Good fallback when your go-to is busy',
        ]
          .filter(Boolean)
          .join(' · ')
      : `${spotlightHall.goalFocus.map((code) => goalLabelMap[code]).slice(0, 2).join(' · ')} ready today`

    return (
      <section className="spotlight-section" aria-live="polite">
        <div className="spotlight-heading">
          <div className="spotlight-heading__info">
            <p className="eyebrow">Spotlight hall</p>
            <h3>{spotlightHall.name}</h3>
            <div className="spotlight-badge-row">
              <p className="spotlight-area">{spotlightHall.area}</p>
              <div
                className={`match-chip ${
                  standoutHallId === spotlightHall.id ? 'match-chip--primary' : ''
                }`.trim()}
              >
                {hasPersonalizedRankings ? `${matchPercent}% match` : 'Neutral favorite'}
              </div>
            </div>
          </div>
          <div className="spotlight-heading__actions">
            <div className="carousel-controls carousel-controls--compact">
              <button
                type="button"
                className="carousel-button"
                onClick={goToPreviousHall}
                aria-label="Show previous dining hall"
              >
                Prev
              </button>
              <div className="carousel-status">
                <strong>
                  {hallSpotlightIndex + 1}/{hallCount}
                </strong>
                <span>Halls</span>
              </div>
              <button
                type="button"
                className="carousel-button"
                onClick={goToNextHall}
                aria-label="Show next dining hall"
              >
                Next
              </button>
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

        <div className="menu-section menu-section--full">
          <div className="menu-section__top">
            <div>
              <span className="meta-label">Live menu </span>
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
                Pulling every dish from today's sample JSON feed for {spotlightHall.name}.
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
                        row.isMealStart
                          ? 'menu-row menu-row--meal-start'
                          : 'menu-row'
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
          )}
        </div>
      </section>
    )
  }

  const renderAllHallsTable = () => {
    const aggregatedRows = hallsToRender.flatMap((hall) => {
      const hallRows = getFilteredMenuRows(hall)
      if (hallRows.length === 0) {
        return []
      }

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
              <span className="meta-label">Halls ready</span>
              <strong>{Math.max(hallCount - loadingHallCount, 0)}</strong>
            </div>
            <div>
              <span className="meta-label">Dishes tracked</span>
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
                      row.isMealStart
                        ? 'menu-row menu-row--meal-start'
                        : 'menu-row'
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
              <p className="menu-note">
                Pulling menus for {loadingHallCount} hall(s)...
              </p>
            ) : (
              <p className="menu-note">
                Open a hall to trigger its food feed.
              </p>
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
    <section className="dining-page">
      <div className="dining-header">
        <div>
          <p className="eyebrow">Dining Explorer</p>
          <h2>
            {hasPersonalizedRankings
              ? `${heroName}'s personalized lineup`
              : isAuthenticated
              ? 'Neutral campus lineup - signed in'
              : 'Neutral campus lineup'}
          </h2>
          <p>
            {hasPersonalizedRankings
              ? `Ranked using your ${goalLabelMap[
                  userProfile.goal
                ].toLowerCase()} goal and ${dietLabelMap[
                  userProfile.diet
                ]
                  .toLowerCase()
                  .replace('no preference', 'omnivore preference')}.`
              : isAuthenticated
              ? 'You are signed in. Tap "Personalize my rankings" to generate your tailored order.'
              : 'Sign up or log in to sort these halls by your goals and dietary choices.'}
          </p>
        </div>
        <div className="dining-actions">
          <button className="ghost-button" type="button" onClick={onBackToPlanner}>
            Back to planner
          </button>
          {isAuthenticated && !hasPersonalizedRankings && (
            <button className="primary" type="button" onClick={onActivatePersonalization}>
              Personalize my rankings
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
                  hallViewMode === "carousel"
                    ? "translateX(0%)"
                    : "translateX(100%)"
              }}
            />

            <button
              className={`segmented-btn ${hallViewMode === "carousel" ? "active" : ""}`}
              onClick={() => onChangeHallViewMode("carousel")}
            >
              Spotlight
            </button>

            <button
              className={`segmented-btn ${hallViewMode === "grid" ? "active" : ""}`}
              onClick={() => onChangeHallViewMode("grid")}
            >
              All halls
            </button>
          </div>
        </div>
      )}

      {isCarouselActive ? renderSpotlightView() : renderAllHallsTable()}
    </section>
  )
}

export default DiningPage
