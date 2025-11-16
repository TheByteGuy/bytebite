import DiningHeader from "../dining/DiningHeader";
import ViewToggle from "../dining/ViewToggle";
import CarouselControls from "../dining/CarouselControls";
import HallGrid from "../dining/HallGrid";

export default function DiningPage({
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

      <DiningHeader
        isAuthenticated={isAuthenticated}
        hasPersonalizedRankings={hasPersonalizedRankings}
        userProfile={userProfile}
        goalLabelMap={goalLabelMap}
        dietLabelMap={dietLabelMap}
        onBackToPlanner={onBackToPlanner}
        onActivatePersonalization={onActivatePersonalization}
      />

      {hallCount > 0 && (
        <ViewToggle
          hallViewMode={hallViewMode}
          onChangeHallViewMode={onChangeHallViewMode}
        />
      )}

      {showCarousel && spotlightHall && (
        <CarouselControls
          spotlightHall={spotlightHall}
          hallSpotlightIndex={hallSpotlightIndex}
          hallCount={hallCount}
          goToPreviousHall={goToPreviousHall}
          goToNextHall={goToNextHall}
        />
      )}

      <HallGrid
        showCarousel={showCarousel}
        hallsToRender={hallsToRender}
        standoutHallId={standoutHallId}
        hasPersonalizedRankings={hasPersonalizedRankings}
        userProfile={userProfile}
        goalLabelMap={goalLabelMap}
        dietLabelMap={dietLabelMap}
        menuData={menuData}
        flattenMenuItems={flattenMenuItems}
        maxMenuRows={maxMenuRows}
        spotlightHall={spotlightHall}
      />

    </section>
  );
}
