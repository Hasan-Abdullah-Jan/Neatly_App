/**
 * TimeOfDayTint — subtle tint overlay based on time of day.
 * Morning: warm, Afternoon: neutral, Evening: soft amber, Night: deep cool.
 */



export function TimeOfDayTint() {
  const now = new Date();
  const hour = now.getHours();
  let tint = 'transparent';

  if (hour >= 5 && hour < 12) {
    tint = 'rgba(255, 200, 150, 0.06)'; // warm morning
  } else if (hour >= 12 && hour < 17) {
    tint = 'rgba(200, 220, 255, 0.04)'; // neutral afternoon
  } else if (hour >= 17 && hour < 21) {
    tint = 'rgba(255, 180, 120, 0.08)'; // amber evening
  } else {
    tint = 'rgba(120, 150, 220, 0.06)'; // cool night
  }

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ backgroundColor: tint }}
      aria-hidden="true"
    />
  );
}
