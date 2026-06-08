import CCM from "./modules/ccm/CCM";
import { useState, useEffect } from "react";
import { NW_BUSES, SE_BUSES } from "./buses";

// ✅ OOS lists
const OOS_NW = ["301", "305"];
const OOS_SE = ["412", "515"];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [area, setArea] = useState("Northwest");

  const buses = area === "Northwest" ? NW_BUSES : SE_BUSES;
  const oosList = area === "Northwest" ? OOS_NW : OOS_SE;

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

  /* ✅ LOAD */
  useEffect(() => {
    const savedBES = JSON.parse(localStorage.getItem(`bes-${area}`) || "{}");
    const savedFleet = JSON.parse(localStorage.getItem(`fleet-${area}`) || "{}");

    setBesResults(savedBES);
    setFleetResults(savedFleet);
    setBesIndex(0);
    setFleetIndex(0);
  }, [area]);

  /* ✅ SAVE */
  useEffect(() => {
    localStorage.setItem(`bes-${area}`, JSON.stringify(besResults));
  }, [besResults, area]);

  useEffect(() => {
    localStorage.setItem(`fleet-${area}`, JSON.stringify(fleetResults));
  }, [fleetResults, area]);

  const nextBes = () => setBesIndex(i => (i + 1) % buses.length);
  const nextFleet = () => setFleetIndex(i => (i + 1) % buses.length);

  /* CCM % */
  const [ccmPercent, setCcmPercent] = useState(0);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`ccm-progress-${area}`) || "{}");
    const count = Object.keys(saved.results || {}).length;
    setCcmPercent(Math.round((count / buses.length) * 100) || 0);
  }, [tab, buses.length, area]);

  const besPercent = Math.round((Object.keys(besResults).length / buses.length) * 100) || 0;

  const fleetPercent =
    Math.round(
      (Object.keys(fleetResults).filter(
        b => Object.values(fleetResults[b] || {}).every(v => v)
      ).length / buses.length) * 100
    ) || 0;

  /* ✅ DOWNLOAD */
  const downloadLog = () => {
    const log = [
      ["Type", "Bus", "Area", "Date"],
      ...Object.entries(besResults).map(([bus, status]) => ["BES", bus, status, area]),
      ...Object.entries(fleetResults).map(([bus, items]) => ["Fleet", bus, JSON.stringify(items), area])
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

  /* ✅ HELPERS */
  const getBesColor = (status) =>
    status === "OK" ? "green" : status === "MISSING" ? "red" : "#ccc";

  const getFleetColor = (items) => {
    if (!items) return "#ccc";
    return Object.values(items).every(v => v) ? "green" : "red";
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

      {tab === "dashboard" && (
        <div>
          <h2>Dashboard</h2>
          <div>BES: {besPercent}%</div>
          <div>Fleet: {fleetPercent}%</div>
          <div>CCM: {ccmPercent}%</div>
        </div>
      )}

      {/* ✅ BES */}
      {tab === "bes" && (
        <div>
          <h2>{area} BES</h2>
          <div>Bus: {buses[besIndex]}</div>

          <button
            onClick={() => {
              setBesResults(p => ({ ...p, [buses[besIndex]]: "OK" }));
              nextBes();
            }}
          >
            Tag ✅
          </button>

          <button
            onClick={() => {
              setBesResults(p => ({ ...p, [buses[besIndex]]: "MISSING" }));
              nextBes();
            }}
            style={{ marginLeft: 10 }}
          >
            Missing ❌
          </button>

          <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {buses.map(b => (
              <div key={b} style={{
                width: 60,
                backgroundColor: getBesColor(besResults[b]),
                color: "white",
                textAlign: "center",
                borderRadius: 6
              }}>{b}</div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ FLEET */}
      {tab === "fleet" && (
        <div>
          <h2>{area} Fleet</h2>
          <div>Bus: {buses[fleetIndex]}</div>

          {Object.keys(fleetTemplate).map(key => (
            <div key={key}>
              <label>
                <input
                  type="checkbox"
                  checked={fleetResults[buses[fleetIndex]]?.[key] || false}
                  onChange={(e) => {
                    setFleetResults(prev => ({
                      ...prev,
                      [buses[fleetIndex]]: {
                        ...(prev[buses[fleetIndex]] || fleetTemplate),
                        [key]: e.target.checked
                      }
                    }));
                  }}
                />
                {key}
              </label>
            </div>
          ))}

          <button onClick={nextFleet}>Next Bus</button>

          <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {buses.map(b => (
              <div key={b} style={{
                width: 60,
                backgroundColor: getFleetColor(fleetResults[b]),
                color: "white",
                textAlign: "center",
                borderRadius: 6
              }}>{b}</div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ CCM */}
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
