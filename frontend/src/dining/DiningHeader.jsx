export default function DiningHeader({
  isAuthenticated,
  hasPersonalizedRankings,
  userProfile,
  goalLabelMap,
  dietLabelMap,
  onBackToPlanner,
  onActivatePersonalization,
}) {
  return (
    <div className="dining-header">
      <div>
        <p className="eyebrow">Dining Explorer</p>
        <h2>
          {hasPersonalizedRankings
            ? `${userProfile.name.split(" ")[0]}'s personalized lineup`
            : isAuthenticated
            ? "Neutral campus lineup — signed in"
            : "Neutral campus lineup"}
        </h2>

        <p>
          {hasPersonalizedRankings
            ? `Ranked using your ${goalLabelMap[userProfile.goal].toLowerCase()} goal and ${dietLabelMap[userProfile.diet]
                .toLowerCase()
                .replace("no preference", "omnivore preference")}.`
            : isAuthenticated
            ? 'You are signed in. Tap “Personalize my rankings” to generate your tailored order.'
            : "Sign up or log in to sort these halls by your goals and dietary choices."}
        </p>
      </div>

      <div className="dining-actions">
        <button className="ghost-button" onClick={onBackToPlanner}>
          Back to planner
        </button>

        {isAuthenticated && !hasPersonalizedRankings && (
          <button className="primary" onClick={onActivatePersonalization}>
            Personalize my rankings
          </button>
        )}
      </div>
    </div>
  );
}
