export default function PersonalNote({
  matchesGoal,
  matchesDiet,
  userProfile,
  goalLabelMap,
  dietLabelMap,
}) {
  return (
    <p className="personal-note">
      {[
        matchesGoal
          ? `${goalLabelMap[userProfile.goal]} dishes on rotation`
          : null,

        matchesDiet
          ? `${dietLabelMap[userProfile.diet]} stations ready`
          : "Good fallback option when your go-to is busy",
      ]
        .filter(Boolean)
        .join(" · ")}
    </p>
  );
}
