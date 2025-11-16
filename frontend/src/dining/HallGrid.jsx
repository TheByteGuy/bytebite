import HallCard from "./HallCard";

export default function HallGrid({
  showCarousel,
  hallsToRender,
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
  return (
    <div className={showCarousel ? "hall-grid hall-grid--single" : "hall-grid"}>
      {hallsToRender.map((hall) => (
        <HallCard
          key={hall.id}
          hall={hall}
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
      ))}
    </div>
  );
}
