import { useState } from "react";
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
  const [showHighlights, setShowHighlights] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const matchesGoal =
    hasPersonalizedRankings && hall.goalFocus.includes(userProfile.goal);

  const matchesDiet =
    hasPersonalizedRankings && hall.dietOptions.includes(userProfile.diet);

  const matchPercent = hasPersonalizedRankings ? hall.matchPercent ?? 0 : null;

  const hallMenu = menuData[hall.id];
  const hallMenuItems = flattenMenuItems(hallMenu?.data);

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
      {/* Header */}
      <div className="hall-card__header">
        <div>
          <p className="eyebrow">{hall.area}</p>
          <h3>{hall.name}</h3>
        </div>

        <div className={`match-chip ${standoutHallId === hall.id ? "match-chip--primary" : ""}`}>
          {hasPersonalizedRankings ? `${matchPercent}% match` : "Campus favorite"}
        </div>
      </div>

      {/* META */}
      <p className="hall-desc">{hall.description}</p>

      <div className="hall-meta">
        <div>
          <span className="meta-label">Best for</span>
          <strong>{hall.goalFocus.map(code => goalLabelMap[code]).join(" · ")}</strong>
        </div>

        <div>
          <span className="meta-label">Diet ready</span>
          <strong>{hall.dietOptions.map(code => dietLabelMap[code]).join(" · ")}</strong>
        </div>
      </div>

      {/* HIGHLIGHTS DROPDOWN */}
      <button
        className="collapse-btn"
        onClick={() => setShowHighlights(v => !v)}
      >
        {showHighlights ? "▲ Hide highlights" : "▼ Show highlights"}
      </button>

      {showHighlights && (
        <ul className="highlight-list">
          {hall.highlights.map(h => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}

      {/* MENU DROPDOWN */}
      <button
        className="collapse-btn"
        onClick={() => setShowMenu(v => !v)}
      >
        {showMenu ? "▲ Hide menu" : "▼ Show menu"}
      </button>

      {showMenu && (
        <MenuSection
          hallMenu={hallMenu}
          hallMenuItems={hallMenuItems}
          userProfile={userProfile}
        />
      )}

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
