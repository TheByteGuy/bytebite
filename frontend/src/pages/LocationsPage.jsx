// src/pages/LocationsPage.jsx
export default function LocationsPage({ diningHalls }) {
  return (
    <section className="locations-page">
      <div className="locations-header">
        <p className="eyebrow">Campus Locations</p>
        <h2>Dining Hall Maps</h2>
        <p>Find every RPI dining hall quickly and easily.</p>
      </div>

      <div className="locations-grid">
        {diningHalls.map((hall) => (
          <div key={hall.id} className="location-card">
            <h3>{hall.name}</h3>
            <p className="location-area">{hall.area}</p>

            <iframe
              title={`${hall.name} Map`}
              width="100%"
              height="300"
              style={{ border: 0, borderRadius: "12px" }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                hall.area
              )}&output=embed`}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
