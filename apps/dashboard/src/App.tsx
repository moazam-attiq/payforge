import './App.css'

const principles = [
  {
    label: 'Synthetic only',
    detail:
      'Test tokens and simulated funds. Real payment credentials are never accepted.',
  },
  {
    label: 'Ledger first',
    detail:
      'Every financial movement will be represented by balanced, append-only entries.',
  },
  {
    label: 'Built for failure',
    detail:
      'Retries, timeouts, duplicates, and delayed events are part of the learning model.',
  },
]

function App() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="PayForge home">
          <span className="brand-mark" aria-hidden="true">
            PF
          </span>
          <span>PayForge</span>
        </a>
        <span className="environment-badge">Test environment</span>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <div className="eyebrow">
          <span className="status-dot" aria-hidden="true" />
          M0 Foundation active
        </div>
        <h1 id="page-title">Understand every step of a payment.</h1>
        <p className="hero-copy">
          A security-conscious sandbox for exploring payment intents, accounting,
          idempotency, webhooks, and operational failure modes.
        </p>
        <div className="scope-note">
          <strong>Foundation status</strong>
          <span>
            The API shell, validated configuration, liveness checks, and request
            correlation are in place. Payment behavior has not been implemented.
          </span>
        </div>
      </section>

      <section className="principles" aria-label="Platform principles">
        {principles.map((principle, index) => (
          <article className="principle-card" key={principle.label}>
            <span className="principle-number" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h2>{principle.label}</h2>
            <p>{principle.detail}</p>
          </article>
        ))}
      </section>

      <footer>
        <span>PayForge sandbox</span>
        <span>No real cards. No real funds.</span>
      </footer>
    </main>
  )
}

export default App
