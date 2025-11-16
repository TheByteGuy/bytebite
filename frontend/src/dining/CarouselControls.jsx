export default function CarouselControls({
  spotlightHall,
  hallSpotlightIndex,
  hallCount,
  goToPreviousHall,
  goToNextHall,
}) {
  return (
    <div className="carousel-controls">
      <button className="carousel-button" onClick={goToPreviousHall}>
        Prev
      </button>

      <div className="carousel-status">
        <strong>{spotlightHall.name}</strong>
        <span>{spotlightHall.area}</span>
        <small>
          {hallSpotlightIndex + 1}/{hallCount}
        </small>
      </div>

      <button className="carousel-button" onClick={goToNextHall}>
        Next
      </button>
    </div>
  );
}
