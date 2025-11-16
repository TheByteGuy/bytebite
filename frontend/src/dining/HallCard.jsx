import MenuSection from "./MenuSection";
import PersonalNote from "./PersonalNote";

export default function HallCard({
  hall,
  standoutHallId,
  hasPersonalizedRankings,
  userProfile,
  goalLabelMap,
  dietLabelMap,
  menuData,
  flattenMenuItems,
  maxMenuRows,
  spotlightHall,
}) {
  const matchesGoal =
    hasPersonalizedRankings && hall.goalFocus.includes(userProfile.goal);

  const matchesDiet =
    hasPersonalizedRankings && hall.dietOptions.includes(userProfile.diet);

  const matchPercent = hasPersonalizedRankings ? hall.matchPercent ?? 0 : null;

  const hallMenu = menuData[hall.id];
  const hallMenuItems = flattenMenuItems(hallMenu?.data);

  const shouldShowFullMenu =
    spotlightHall && spotlightHall.id === hall.id;

  const menuRows = shouldShowFullMenu
    ? hallMenuItems
    : hallMenuItems.slice(0, maxMenuRows);

  return (
    <article
      className={[
        "hall-card",
        standoutHallId === hall.id ? "hall-card--top" : "",
        !hasPersonalizedRankings ? "hall-card--featured" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="hall-card__header">
        <div>
          <p className="eyebrow">{hall.area}</p>
          <h3>{hall.name}</h3>
        </div>

        <div
          className={`match-chip ${
            standoutHallId === hall.id ? "match-chip--primary" : ""
          }`}
        >
          {hasPersonalizedRankings
            ? `${matchPercent}% match`
            : "Campus favorite"}
        </div>
      </div>

      <p className="hall-desc">{hall.description}</p>

      <div className="hall-meta">
        <div>
          <span className="meta-label">Best for</span>
          <strong>
            {hall.goalFocus.map((code) => goalLabelMap[code]).join(" · ")}
          </strong>
        </div>

        <div>
          <span className="meta-label">Diet ready</span>
          <strong>
            {hall.dietOptions.map((code) => dietLabelMap[code]).join(" · ")}
          </strong>
        </div>
      </div>

      <ul className="highlight-list">
        {hall.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>

      <MenuSection
        hallMenu={hallMenu}
        menuRows={menuRows}
        hallMenuItems={hallMenuItems}
        shouldShowFullMenu={shouldShowFullMenu}
      />

      {hasPersonalizedRankings && (
        <PersonalNote
          matchesGoal={matchesGoal}
          matchesDiet={matchesDiet}
          userProfile={userProfile}
          goalLabelMap={goalLabelMap}
          dietLabelMap={dietLabelMap}
        />
      )}
    </article>
  );
}
