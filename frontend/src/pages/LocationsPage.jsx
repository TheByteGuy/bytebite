import React from "react";

export default function LocationsPage({ diningHalls }) {
  return (
    <section className="dining-page">
      <div className="dining-header">
        <p className="eyebrow">Dining Hall Locations</p>
        <h2>Dining Hall Maps</h2>
        <p className="eyebrow">Find Nearest Residential Cafe</p>
      </div>

      <div className="locations-grid">
        {diningHalls.map((hall) => (
          <div key={hall.id} className="location-card">
            <h3>{hall.name}</h3>
            <p className="location-area">{hall.area}</p>

            <div className="menu-section menu-section--full">
              <div className="menu-table-wrapper menu-table-wrapper--full">
                <div style={{ padding: "0.5rem" }}>
                  <iframe
                    style={{
                      width: "100%",
                      height: "300px",
                      border: 0,
                      borderRadius: "12px",
                      display: "block",
                    }}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      hall.area
                    )}&output=embed`}
                    loading="lazy"
                    allowFullScreen
                    title={hall.name}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
