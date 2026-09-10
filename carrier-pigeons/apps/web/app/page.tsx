import { MintPanel } from '../components/MintPanel';
import { RaceDashboard } from '../components/RaceDashboard';

export default function Home() {
  return (
    <main>
      <nav className="nav">
        <div className="brand"><span className="brand-mark">CP</span><span>Carrier Pigeons<small>Solana Race Network</small></span></div>
        <div className="nav-tags"><span>DEVNET READY</span><span>SEASON ZERO</span></div>
      </nav>

      <header className="hero">
        <div className="hero-copy">
          <div className="eyebrow">MINT · ENTER · FLY · TRACK · WIN</div>
          <h1>The courier network is becoming a <em>live racing world.</em></h1>
          <p>Mint a Carrier Pigeon on Solana, enter condition-driven races, then watch deterministic telemetry unfold checkpoint by checkpoint.</p>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-pigeon">🐦</div>
          <span className="ping p1">WIND 24</span>
          <span className="ping p2">ALT 420</span>
          <span className="ping p3">NAV 88</span>
        </div>
      </header>

      <section className="metric-grid">
        <div><span>RACE MODEL</span><strong>10</strong><small>core performance stats</small></div>
        <div><span>FIELD SIZE</span><strong>12</strong><small>default racers</small></div>
        <div><span>COURSES</span><strong>5</strong><small>starter environments</small></div>
        <div><span>LIVE DATA</span><strong>SSE</strong><small>checkpoint telemetry</small></div>
      </section>

      <MintPanel />
      <RaceDashboard />

      <footer>Carrier Pigeons · Solana rewrite · Testnet/Season Zero build</footer>
    </main>
  );
}
