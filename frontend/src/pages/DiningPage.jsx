function DiningPage({
  isAuthenticated,
  hasPersonalizedRankings,
  userProfile,
  goalLabelMap,
  dietLabelMap,
  hallCount,
  hallViewMode,
  onChangeHallViewMode,
  showCarousel,
  spotlightHall,
  goToPreviousHall,
  goToNextHall,
  hallSpotlightIndex,
  hallsToRender,
  standoutHallId,
  menuData,
  flattenMenuItems,
  maxMenuRows,
  onBackToPlanner,
  onActivatePersonalization,
}) {
  return (
    <section className="dining-page">
      <div className="dining-header">
        <div>
          <p className="eyebrow">Dining Explorer</p>
          <h2>
            {hasPersonalizedRankings
              ? `${userProfile.name.split(' ')[0]}'s personalized lineup`
              : isAuthenticated
              ? 'Neutral campus lineup — signed in'
              : 'Neutral campus lineup'}
          </h2>
          <p>
            {hasPersonalizedRankings
              ? `Ranked using your ${goalLabelMap[userProfile.goal].toLowerCase()} goal and ${dietLabelMap[userProfile.diet]
                  .toLowerCase()
                  .replace('no preference', 'omnivore preference')}.`
              : isAuthenticated
              ? 'You are signed in. Tap “Personalize my rankings” to generate your tailored order.'
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
          <span>View style:</span>
          <div className="view-toggle__buttons">
            <button
              type="button"
              className={hallViewMode === 'carousel' ? 'toggle-btn toggle-btn--active' : 'toggle-btn'}
              onClick={() => onChangeHallViewMode('carousel')}
            >
              Spotlight
            </button>
            <button
              type="button"
              className={hallViewMode === 'grid' ? 'toggle-btn toggle-btn--active' : 'toggle-btn'}
              onClick={() => onChangeHallViewMode('grid')}
            >
              All halls
            </button>
          </div>
        </div>
      )}

      {showCarousel && spotlightHall && (
        <div className="carousel-controls">
          <button
            type="button"
            className="carousel-button"
            onClick={goToPreviousHall}
            aria-label="Show previous dining hall"
          >
            Prev
          </button>
          <div className="carousel-status">
            <strong>{spotlightHall.name}</strong>
            <span>{spotlightHall.area}</span>
            <small>
              {hallSpotlightIndex + 1}/{hallCount}
            </small>
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
      )}

      <div className={showCarousel ? 'hall-grid hall-grid--single' : 'hall-grid'}>
        {hallsToRender.map((hall) => {
          const matchesGoal = hasPersonalizedRankings && hall.goalFocus.includes(userProfile.goal)
          const matchesDiet = hasPersonalizedRankings && hall.dietOptions.includes(userProfile.diet)
          const matchPercent = hasPersonalizedRankings ? hall.matchPercent ?? 0 : null
          const hallMenu = menuData[hall.id]
          const hallMenuItems = flattenMenuItems(hallMenu?.data)
          const shouldShowFullMenu = showCarousel && spotlightHall?.id === hall.id
          const menuRows = shouldShowFullMenu ? hallMenuItems : hallMenuItems.slice(0, maxMenuRows)

          return (
            <article
              key={hall.id}
              className={[
                'hall-card',
                standoutHallId === hall.id ? 'hall-card--top' : '',
                !hasPersonalizedRankings ? 'hall-card--featured' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className="hall-card__header">
                <div>
                  <p className="eyebrow">{hall.area}</p>
                  <h3>{hall.name}</h3>
                </div>
                <div
                  className={`match-chip ${standoutHallId === hall.id ? 'match-chip--primary' : ''}`.trim()}
                >
                  {hasPersonalizedRankings ? `${matchPercent}% match` : 'Campus favorite'}
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
                {hallMenu?.status === 'loading' && <p className="menu-note">Pulling today's feed...</p>}
                {hallMenu?.status === 'error' && (
                  <p className="menu-note error-text">Unable to load menu file: {hallMenu.error}</p>
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
                      {shouldShowFullMenu
                        ? `Showing all ${hallMenuItems.length} dishes from the sample feed.`
                        : `Showing ${menuRows.length} of ${hallMenuItems.length} dishes from the sample feed.`}
                    </p>
                  </div>
                )}
              </div>

              {hasPersonalizedRankings && (
                <p className="personal-note">
                  {[
                    matchesGoal ? `${goalLabelMap[userProfile.goal]} dishes on rotation` : null,
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
  )
}

export default DiningPage
