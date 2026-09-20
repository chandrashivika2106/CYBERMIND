import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, CheckCircle2, Clock3, Database,
  FileCheck2, FileText, Fingerprint, LayoutDashboard, Menu,
  Network, RefreshCw, Search, ShieldCheck, UploadCloud, X
} from "lucide-react";
import {
  getAnomalies, getHealth, getTimeline, uploadEvidence, verifyEvidence
} from "./api";

const NAV = [
  { id: "dashboard", label: "Command Center", icon: LayoutDashboard },
  { id: "evidence", label: "Evidence Vault", icon: Database },
  { id: "timeline", label: "Forensic Timeline", icon: Clock3 },
  { id: "behavior", label: "Behavior Analysis", icon: Activity },
  { id: "integrity", label: "Integrity Check", icon: ShieldCheck }
];

function App() {
  const [page, setPage] = useState("dashboard");
  const [timeline, setTimeline] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const [h, t, a] = await Promise.all([
        getHealth(), getTimeline(), getAnomalies()
      ]);
      setHealth(h);
      setTimeline(t.events || []);
      setAnomalies(a.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const anomalous = anomalies.filter(x => x.status === "ANOMALOUS");
  const normal = anomalies.filter(x => x.status === "NORMAL");

  return (
    <div className="app-shell">
      <button className="mobile-menu" onClick={() => setMobileOpen(v => !v)}>
        <Menu size={20} />
      </button>

      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Fingerprint size={23} /></div>
          <div>
            <strong>CYBERMIND</strong>
            <span>DIGITAL FORENSICS</span>
          </div>
        </div>

        <div className="nav-label">INVESTIGATION</div>
        <nav>
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${page === id ? "active" : ""}`}
              onClick={() => { setPage(id); setMobileOpen(false); }}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="engine-row"><span className="dot online" /> API ENGINE <b>ONLINE</b></div>
          <div className="engine-row"><span className="dot online" /> ML ENGINE <b>READY</b></div>
          <div className="version">CYBERMIND v1.0 • LOCAL</div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <div className="eyebrow">FORENSIC OPERATIONS / {page.toUpperCase()}</div>
            <h1>{NAV.find(n => n.id === page)?.label}</h1>
          </div>
          <div className="top-actions">
            <div className="system-status">
              <span className={`dot ${health ? "online" : "offline"}`} />
              {health ? "SYSTEM OPERATIONAL" : "BACKEND OFFLINE"}
            </div>
            <button className="icon-btn" onClick={refresh} title="Refresh">
              <RefreshCw size={17} className={loading ? "spin" : ""} />
            </button>
          </div>
        </header>

        {page === "dashboard" && (
          <Dashboard
            timeline={timeline}
            anomalies={anomalies}
            anomalous={anomalous}
            normal={normal}
            onNavigate={setPage}
          />
        )}

        {page === "evidence" && <EvidencePage />}
        {page === "timeline" && <TimelinePage events={timeline} />}
        {page === "behavior" && <BehaviorPage anomalies={anomalies} />}
        {page === "integrity" && <IntegrityPage />}
      </main>
    </div>
  );
}

function Dashboard({ timeline, anomalous, normal, onNavigate }) {
  const recent = [...timeline].slice(-6).reverse();

  return (
    <section className="page">
      <div className="hero">
        <div>
          <span className="hero-kicker">DIGITAL FORENSICS PLATFORM</span>
          <h2>Evidence. Context. Intelligence.</h2>
          <p>Centralized forensic evidence handling, timeline reconstruction and behavioral anomaly analysis.</p>
        </div>
        <div className="hero-badge"><ShieldCheck size={18} /> FORENSIC CORE ACTIVE</div>
      </div>

      <div className="stats-grid">
        <Stat icon={Database} label="Evidence Events" value={timeline.length || "—"} />
        <Stat icon={Clock3} label="Timeline Events" value={timeline.length || "—"} />
        <Stat icon={AlertTriangle} label="Anomalies" value={anomalous.length} danger={anomalous.length > 0} />
        <Stat icon={CheckCircle2} label="Normal Patterns" value={normal.length} />
      </div>

      <div className="content-grid">
        <Panel title="Recent Activity" subtitle="Unified forensic event stream" action="VIEW TIMELINE" onAction={() => onNavigate("timeline")}>
          <div className="event-list">
            {recent.length ? recent.map((e, i) => <EventRow key={i} event={e} />) : <Empty text="No timeline events available." />}
          </div>
        </Panel>

        <Panel title="Behavioral Signal" subtitle="Isolation Forest analysis" action="OPEN ANALYSIS" onAction={() => onNavigate("behavior")}>
          {anomalous.length ? (
            <div className="alert-card">
              <div className="alert-icon"><AlertTriangle size={22} /></div>
              <div>
                <strong>{anomalous.length} anomalous pattern{anomalous.length > 1 ? "s" : ""} detected</strong>
                <p>Review behavioral indicators and detection factors.</p>
              </div>
            </div>
          ) : (
            <div className="success-card"><CheckCircle2 size={21} /><span>No anomalous patterns detected.</span></div>
          )}
          <div className="signal-bars">
            <SignalBar label="Normal observations" value={normal.length} max={Math.max(anomalous.length + normal.length, 1)} />
            <SignalBar label="Anomalous observations" value={anomalous.length} max={Math.max(anomalous.length + normal.length, 1)} danger />
          </div>
        </Panel>
      </div>

      <div className="process-strip">
        {["COLLECT", "HASH", "RECONSTRUCT", "BASELINE", "DETECT"].map((x, i) => (
          <div className="process-step" key={x}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <b>{x}</b>
            {i < 4 && <i />}
          </div>
        ))}
      </div>
    </section>
  );
}

function EvidencePage() {
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (file) => {
    if (!file) return;
    setBusy(true); setError(""); setResult(null);
    try { setResult(await uploadEvidence(file)); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <section className="page">
      <div className="section-intro">
        <div><h2>Evidence Vault</h2><p>Securely submit forensic artifacts and capture their cryptographic fingerprint.</p></div>
      </div>

      <div className="upload-card">
        <UploadCloud size={36} />
        <h3>Upload forensic evidence</h3>
        <p>Any file supported by the backend can be submitted for SHA-256 hashing and storage.</p>
        <label className="primary-btn">
          {busy ? "PROCESSING..." : "SELECT EVIDENCE"}
          <input type="file" hidden disabled={busy} onChange={e => handleUpload(e.target.files[0])} />
        </label>
        {error && <div className="error-box">{error}</div>}
      </div>

      {result && (
        <div className="result-card">
          <div className="result-head"><CheckCircle2 /><span>Evidence stored successfully</span></div>
          <div className="hash-row"><span>FILENAME</span><b>{result.filename}</b></div>
          <div className="hash-row"><span>SHA-256</span><code>{result.sha256}</code></div>
          <div className="hash-row"><span>STATUS</span><strong className="verified">VERIFIED FOR STORAGE</strong></div>
        </div>
      )}
    </section>
  );
}

function TimelinePage({ events }) {
  const [query, setQuery] = useState("");
  const filtered = events.filter(e =>
    JSON.stringify(e).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="page">
      <div className="section-intro">
        <div><h2>Forensic Timeline</h2><p>Chronological reconstruction of authentication, file access and network activity.</p></div>
        <div className="search"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search events..." /></div>
      </div>

      <div className="timeline-card">
        {filtered.length ? filtered.map((event, i) => (
          <EventRow key={i} event={event} detailed />
        )) : <Empty text="No matching events." />}
      </div>
    </section>
  );
}

function BehaviorPage({ anomalies }) {
  return (
    <section className="page">
      <div className="section-intro">
        <div><h2>Behavior Analysis</h2><p>Isolation Forest classification with human-readable detection factors.</p></div>
      </div>
      <div className="analysis-grid">
        {anomalies.map((a, i) => (
          <div className={`analysis-card ${a.status === "ANOMALOUS" ? "threat" : ""}`} key={i}>
            <div className="analysis-head">
              <div>
                <span className="micro-label">OBSERVATION {String(i + 1).padStart(2, "0")}</span>
                <h3>{a.status}</h3>
              </div>
              {a.status === "ANOMALOUS" ? <AlertTriangle /> : <CheckCircle2 />}
            </div>
            <div className="feature-grid">
              <Feature label="LOGIN HOUR" value={`${a.login_hour}:00`} />
              <Feature label="FILES ACCESSED" value={a.files_accessed} />
              <Feature label="BYTES TRANSFERRED" value={Number(a.bytes_transferred).toLocaleString()} />
              <Feature label="NEW IP" value={a.new_ip ? "DETECTED" : "NO"} />
            </div>
            {a.reasons && (
              <div className="reasons">
                <span>DETECTION FACTORS</span>
                {a.reasons.split(", ").map((r, j) => <div key={j}>⚠ {r}</div>)}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function IntegrityPage() {
  const [filename, setFilename] = useState("");
  const [hash, setHash] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const verify = async (e) => {
    e.preventDefault();
    setBusy(true); setResult(null);
    try { setResult(await verifyEvidence(filename, hash)); }
    catch (err) { setResult({ status: "ERROR", message: err.message }); }
    finally { setBusy(false); }
  };

  return (
    <section className="page">
      <div className="section-intro">
        <div><h2>Integrity Check</h2><p>Compare an evidence artifact against its recorded SHA-256 hash.</p></div>
      </div>
      <form className="verify-card" onSubmit={verify}>
        <label>Evidence filename<input value={filename} onChange={e => setFilename(e.target.value)} placeholder="example.log" required /></label>
        <label>Original SHA-256 hash<input value={hash} onChange={e => setHash(e.target.value)} placeholder="Paste original hash..." required /></label>
        <button className="primary-btn" disabled={busy}>{busy ? "VERIFYING..." : "VERIFY INTEGRITY"}</button>
        {result && (
          <div className={`verification-result ${result.status === "VERIFIED" ? "ok" : "bad"}`}>
            {result.status === "VERIFIED" ? <CheckCircle2 /> : <X />}
            <div><strong>{result.status}</strong><span>{result.message || "Integrity check completed."}</span></div>
          </div>
        )}
      </form>
    </section>
  );
}

function Stat({ icon: Icon, label, value, danger }) {
  return <div className={`stat-card ${danger ? "danger" : ""}`}><Icon size={18} /><span>{label}</span><strong>{value}</strong></div>;
}

function Panel({ title, subtitle, action, onAction, children }) {
  return <div className="panel"><div className="panel-head"><div><h3>{title}</h3><p>{subtitle}</p></div>{action && <button className="text-btn" onClick={onAction}>{action} →</button>}</div>{children}</div>;
}

function EventRow({ event, detailed }) {
  const type = event.event_type || "EVENT";
  return <div className={`event-row ${detailed ? "detailed" : ""}`}>
    <div className={`event-icon ${type.toLowerCase()}`}><Network size={16} /></div>
    <div className="event-main"><strong>{event.action || type}</strong><span>{event.details || event.user || "Forensic event"}</span></div>
    <div className="event-meta"><b>{type}</b><span>{event.timestamp || "—"}</span></div>
  </div>;
}

function SignalBar({ label, value, max, danger }) {
  return <div className="signal-row"><div><span>{label}</span><b>{value}</b></div><div className="bar"><i className={danger ? "danger-fill" : ""} style={{ width: `${(value / max) * 100}%` }} /></div></div>;
}

function Feature({ label, value }) {
  return <div className="feature"><span>{label}</span><b>{value}</b></div>;
}

function Empty({ text }) { return <div className="empty"><FileText size={20} /><span>{text}</span></div>; }

export default App;