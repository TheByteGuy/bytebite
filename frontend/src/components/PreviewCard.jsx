export default function PreviewCard({ heroPreview, onNavigateToDining }) {
  return (
    <section className="card preview-card">
      <p className="eyebrow">Campus snapshot</p>
      <h2>Here’s what’s cooking tonight</h2>

      <p className="preview-copy">
        ByteBite ranks every hall automatically once you save your preferences.
      </p>

      <ul className="mini-hall-list">
        {heroPreview.map((hall) => (
          <li key={hall.id}>
            <div id="mini-hall-info">
              <strong>{hall.name}</strong>
              <span>{hall.signature}</span>
            </div>
            <span className="mini-area">{hall.area}</span>
          </li>
        ))}
      </ul>

      <button className="secondary" type="button" onClick={onNavigateToDining}>
        Go to the dining explorer
      </button>
    </section>
  )
}
