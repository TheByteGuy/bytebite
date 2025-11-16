export default function ViewToggle({ hallViewMode, onChangeHallViewMode }) {
  return (
    <div className="view-toggle">
      <span>View style:</span>
      <div className="view-toggle__buttons">
        <button
          className={
            hallViewMode === "carousel"
              ? "toggle-btn toggle-btn--active"
              : "toggle-btn"
          }
          onClick={() => onChangeHallViewMode("carousel")}
        >
          Spotlight
        </button>

        <button
          className={
            hallViewMode === "grid"
              ? "toggle-btn toggle-btn--active"
              : "toggle-btn"
          }
          onClick={() => onChangeHallViewMode("grid")}
        >
          All halls
        </button>
      </div>
    </div>
  );
}
