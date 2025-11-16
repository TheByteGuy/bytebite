export default function HeroSection({ onStartPlanning, onSeeDining }) {
  return (
    <header className="hero">
      <div>
        <p className="eyebrow">Build a smarter dining routine</p>
        <h1>Save your goals and diet—get instant personalized rankings.</h1>
        <p className="hero-copy">
          ByteBite ranks every dining hall based on your goals and dietary style as soon as you save your preferences.
        </p>
        <div className="hero-cta">
          <button className="primary" onClick={onStartPlanning}>Start planning</button>
          <button className="secondary" onClick={onSeeDining}>See dining halls</button>
        </div>
      </div>

      {/* 👇 This empty div restores the right-grid column */}
      <div></div>
    </header>
  );
}
