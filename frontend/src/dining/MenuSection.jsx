export default function MenuSection({
  hallMenu,
  menuRows,
  hallMenuItems,
  shouldShowFullMenu,
}) {
  return (
    <div className="menu-section">
      <span className="meta-label">Menu snapshot</span>

      {!hallMenu && <p className="menu-note">Menu loads when you open this view.</p>}
      {hallMenu?.status === "loading" && <p className="menu-note">Pulling today's feed...</p>}
      {hallMenu?.status === "error" && (
        <p className="menu-note error-text">Unable to load menu file.</p>
      )}
      {hallMenu?.status === "loaded" && menuRows.length === 0 && (
        <p className="menu-note">No menu items listed in the JSON yet.</p>
      )}

      {hallMenu?.status === "loaded" && menuRows.length > 0 && (
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
                  <td>{row.tags.length ? row.tags.join(" · ") : "—"}</td>
                  <td>{row.allergens || "None listed"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="menu-note">
            {shouldShowFullMenu
              ? `Showing all ${hallMenuItems.length} dishes from the sample feed.`
              : `Showing ${menuRows.length} of ${hallMenuItems.length} dishes.`}
          </p>
        </div>
      )}
    </div>
  );
}
