import { useState, useMemo } from "react";
import "../components/modernMenu.css"; 

// ---------------- HELPERS ----------------
function groupByStation(items) {
  const groups = {};
  for (const item of items) {
    if (!groups[item.station]) groups[item.station] = [];
    groups[item.station].push(item);
  }
  return groups;
}

function rankImportantMeals(items, userProfile) {
  if (!userProfile) return items;

  return [...items].sort((a, b) => {
    const calsA = Number(a.calories) || 0;
    const calsB = Number(b.calories) || 0;

    const protA = parseInt(a.protein || "0") || 0;
    const protB = parseInt(b.protein || "0") || 0;

    let scoreA = 0, scoreB = 0;

    if (userProfile.goal === "gain") {
      scoreA += protA * 2 + calsA;
      scoreB += protB * 2 + calsB;
    }
    if (userProfile.goal === "lose") {
      scoreA += protA * 2 - calsA;
      scoreB += protB * 2 - calsB;
    }
    if (userProfile.goal === "maintain") {
      scoreA += protA - Math.abs(calsA - 500);
      scoreB += protB - Math.abs(calsB - 500);
    }

    return scoreB - scoreA;
  });
}


// ---------------- MAIN COMPONENT ----------------
export default function MenuSection({
  hallMenu,
  hallMenuItems,
  shouldShowFullMenu,
  userProfile,
}) {
  if (!hallMenu)
    return <p className="menu-note">Menu loads when you open this view.</p>;
  if (hallMenu.status === "loading")
    return <p className="menu-note">Pulling today's feed...</p>;
  if (hallMenu.status === "error")
    return <p className="menu-note error-text">Unable to load menu file.</p>;

  // ---------------- FILTERS: bakery, bliss, low-cal ----------------
  const cleaned = hallMenuItems.filter((item) => {
    const station = item.station?.toLowerCase() || "";
    const cals = Number(item.calories) || 0;

    return (
      station !== "bakery" &&
      station !== "bliss" &&
      cals >= 100 // remove low-cal sides / snacks
    );
  });

  if (cleaned.length === 0)
    return <p className="menu-note">No qualifying menu items listed yet.</p>;

  // ---------------- TOP PICKS ----------------
  const ranked = useMemo(
    () => rankImportantMeals(cleaned, userProfile).slice(0, 3),
    [cleaned, userProfile]
  );

  // ---------------- GROUPED MENU ----------------
  const grouped = useMemo(() => groupByStation(cleaned), [cleaned]);

  return (
    <div className="menu-section modern-menu">

      {/* TOP PICKS */}
      <h4 className="menu-subtitle">Top Picks For You</h4>

      <div className="menu-grid">
        {ranked.map((item) => (
          <div key={item.id} className="menu-item pop-card">
            <div className="menu-item-title">{item.name}</div>
            <div className="menu-item-meta">
              {item.calories} cal
              {item.tags?.length > 0 && <> · {item.tags.join(" · ")}</>}
            </div>
          </div>
        ))}
      </div>

      <div className="menu-divider"></div>

      {/* FULL MENU */}
      <h4 className="menu-subtitle">Full Menu</h4>

      {Object.entries(grouped).map(([station, items]) => (
        <StationGroup
          key={station}
          station={station}
          items={items}
          expanded={shouldShowFullMenu}
        />
      ))}
    </div>
  );
}


// ---------------- STATION GROUP DROPDOWN ----------------
function StationGroup({ station, items, expanded }) {
  const [open, setOpen] = useState(expanded);

  return (
    <div className="station-group">
      <button
        onClick={() => setOpen((o) => !o)}
        className="station-header"
      >
        <span>{station}</span>
        <span className="chevron">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="station-items">
          {items.map((item) => (
            <div key={item.id} className="menu-item pop-card">
              <div className="menu-item-title">{item.name}</div>
              <div className="menu-item-meta">
                {item.calories} cal
                {item.tags?.length > 0 && <> · {item.tags.join(" · ")}</>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
