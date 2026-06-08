import CCM from "./modules/ccm/CCM";
import { useState, useEffect } from "react";
import { NW_BUSES, SE_BUSES } from "./buses";

const OOS_NW = ["301", "305"];
const OOS_SE = ["412", "515"];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [area, setArea] = useState("Northwest");

  const buses = area === "Northwest" ? NW_BUSES : SE_BUSES;
  const oosList = area === "Northwest" ? OOS_NW : OOS_SE;

  const today = new Date().getDay(); // 0=Sun
  const isTueToFri = today >= 2 && today <= 5;
  const isFriday = today === 5;

  /* BES */
  const [besIndex, setBesIndex] = useState(0);
  const [besResults, setBesResults] = useState({});

  /* FLEET */
  const [fleetIndex, setFleetIndex] = useState(0);
  const [fleetResults, setFleetResults] = useState({});

  const fleetTemplate = {
    extinguisher: false,
    registration: false,
    insurance: false,
    firstAid: false,
    bodyFluid: false,
    collisionPacket: false
  };

  useEffect(() => {
    const savedBES = JSON.parse(localStorage.getItem(`bes-${area}`) || "{}");
    const savedFleet = JSON.parse(localStorage.getItem(`fleet-${area}`) || "{}");

    setBesResults(savedBES);
    setFleetResults(savedFleet);
    setBesIndex(0);
    setFleetIndex(0);
  }, [area]);

  useEffect(() => {
    localStorage.setItem(`bes-${area}`, JSON.stringify(besResults));
  }, [besResults, area]);

  useEffect(() => {
    localStorage.setItem(`fleet-${area}`, JSON.stringify(fleetResults));
  }, [fleetResults, area]);

  const nextBes = () => setBesIndex(i => (i + 1) % buses.length);
  const nextFleet = () => setFleetIndex(i => (i + 1) % buses.length);

  /* CCM */
  const [ccmPercent, setCcmPercent] = useState(0);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`ccm-progress-${area}`) || "{}");
    const count = Object.keys(saved.results || {}).length;
    setCcmPercent(Math.round((count / buses.length) * 100) || 0);
  }, [tab, buses.length, area]);

  /* STATUS */
  const getBesStatus = (bus) => {
    if (besResults[bus] === "OK") return "green";
    if (besResults[bus] === "MISSING") return "red";
    if (Object.keys(besResults).length > 0) return "orange";
    return "#ccc";
  };

  const getFleetStatus = (bus) => {
    const items = fleetResults[bus];
    if (!items) return Object.keys(fleetResults).length > 0 ? "orange" : "#ccc";
    return Object.values(items).every(v => v) ? "green" : "red";
  };

  /* METRICS */
  const besMissed = buses.filter(b => !besResults[b]).length;
  const fleetMissed = buses.filter(b => !fleetResults[b]).length;

  const systemCompliant =
    besMissed === 0 &&
    fleetMissed === 0 &&
    ccmPercent === 100;

  const downloadLog = () => {
    const log = [
      ["Type", "Bus", "Area"],
      ...Object.entries(besResults).map(([bus, status]) => ["BES", bus, status]),
      ...Object.entries(fleetResults).map(([bus, data]) => ["Fleet", bus, JSON.stringify(data)])
    ];

    const csv = log.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `log-${area}-${Date.now()}.csv`;
    a.click();
  };

  const resetDaily = () => {
    if (window.confirm("Reset ALL data for this yard?")) {
      localStorage.removeItem(`bes-${area}`);
      localStorage.removeItem(`fleet-${area}`);

      setBesResults({});
      setFleetResults({});
      setBesIndex(0);
      setFleetIndex(0);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Safety Compliance System ✅</h1>

      <select value={area} onChange={(e) => setArea(e.target.value)}>
        <option>Northwest</option>
        <option>Southeast</option>
      </select>

      <div>
        <button onClick={() => setTab("dashboard")}>Dashboard</button>
        <button onClick={() => setTab("bes")}>BES</button>
        <button onClick={() => setTab("fleet")}>Fleet</button>
        <button onClick={() => setTab("ccm")}>CCM</button>
      </div>

      {/* ✅ DASHBOARD */}
      {tab === "dashboard" && (
        <div>
          <h2>Dashboard</h2>

          {isTueToFri && !isFriday && (
            <div style={{ color: "orange", fontWeight: "bold" }}>
              ⚠️ IN PROGRESS — Completion window open (Tue–Fri)
            </div>
          )}

          {isFriday && (
            <div style={{ fontWeight: "bold" }}>
              {systemCompliant ? (
                <span style={{ color: "green" }}>
                  ✅ COMPLIANT — All buses verified
                </span>
              ) : (
                <span style={{ color: "red" }}>
                  🚨 FINAL NON-COMPLIANCE — Missed buses will be cited
                </span>
              )}
            </div>
          )}

          <div>BES Missed: {besMissed}</div>
          <div>Fleet Missed: {fleetMissed}</div>
          <div>CCM: {ccmPercent}%</div>
        </div>
      )}

      {/* BES */}
      {tab === "bes" && (
        <div>
          <h2>{area} BES</h2>
          <div>Bus: {buses[besIndex]}</div>

          <button onClick={() => {
            setBesResults(p => ({ ...p, [buses[besIndex]]: "OK" }));
            nextBes();
          }}>Tag ✅</button>

          <button onClick={() => {
            setBesResults(p => ({ ...p, [buses[besIndex]]: "MISSING" }));
            nextBes();
          }} style={{ marginLeft: 10 }}>
            Missing ❌
          </button>

          <div style={{ display: "flex", flexWrap: "wrap", marginTop: 20 }}>
            {buses.map(b => (
              <div key={b} style={{
                width: 60,
                backgroundColor: getBesStatus(b),
                color: "white",
                margin: 4,
                textAlign: "center"
              }}>{b}</div>
            ))}
          </div>
        </div>
      )}

      {/* FLEET */}
      {tab === "fleet" && (
        <div>
          <h2>{area} Fleet</h2>
          <div>Bus: {buses[fleetIndex]}</div>

          {Object.keys(fleetTemplate).map(k => (
            <div key={k}>
              <label>
                <input
                  type="checkbox"
                  checked={fleetResults[buses[fleetIndex]]?.[k] || false}
                  onChange={(e) => {
                    setFleetResults(p => ({
                      ...p,
                      [buses[fleetIndex]]: {
                        ...(p[buses[fleetIndex]] || fleetTemplate),
                        [k]: e.target.checked
                      }
                    }));
                  }}
                />
                {k}
              </label>
            </div>
          ))}

          <button onClick={nextFleet}>Next Bus</button>

          <div style={{ display: "flex", flexWrap: "wrap", marginTop: 20 }}>
            {buses.map(b => (
              <div key={b} style={{
                width: 60,
                backgroundColor: getFleetStatus(b),
                color: "white",
                margin: 4,
                textAlign: "center"
              }}>{b}</div>
            ))}
          </div>
        </div>
      )}

      {tab === "ccm" && (
        <CCM buses={buses} area={area} oosList={oosList} />
      )}

      <hr />

      <button onClick={resetDaily}>Reset {area}</button>
      <button onClick={downloadLog} style={{ marginLeft: 10 }}>
        Download Log
      </button>
    </div>
  );
}
