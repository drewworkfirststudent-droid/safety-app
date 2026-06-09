import CCM from "./modules/ccm/CCM";
import { useState, useEffect } from "react";
import { NW_BUSES, SE_BUSES } from "./buses";

// ✅ Sample drivers (replace later with roster import)
const DRIVERS = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones"
];

// ✅ OOS lists
const OOS_NW = ["301", "305"];
const OOS_SE = ["412", "515"];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [area, setArea] = useState("Northwest");

  const buses = area === "Northwest" ? NW_BUSES : SE_BUSES;
  const oosList = area === "Northwest" ? OOS_NW : OOS_SE;

  const today = new Date().getDay();
  const isFriday = today === 5;

  /* DRIVER TRACKING */
  const [busDrivers, setBusDrivers] = useState({});
  const [currentDriver, setCurrentDriver] = useState("");

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

  /* LOAD */
  useEffect(() => {
    setBusDrivers(JSON.parse(localStorage.getItem(`drivers-${area}`) || "{}"));
    setBesResults(JSON.parse(localStorage.getItem(`bes-${area}`) || "{}"));
    setFleetResults(JSON.parse(localStorage.getItem(`fleet-${area}`) || "{}"));
  }, [area]);

  /* SAVE */
  useEffect(() => {
    localStorage.setItem(`drivers-${area}`, JSON.stringify(busDrivers));
  }, [busDrivers, area]);

  useEffect(() => {
    localStorage.setItem(`bes-${area}`, JSON.stringify(besResults));
  }, [besResults, area]);

  useEffect(() => {
    localStorage.setItem(`fleet-${area}`, JSON.stringify(fleetResults));
  }, [fleetResults, area]);

  const nextBes = () => setBesIndex(i => (i + 1) % buses.length);
  const nextFleet = () => setFleetIndex(i => (i + 1) % buses.length);

  // ✅ CSV EXPORT RESTORE
const downloadCSV = (type) => {
  let rows = [["Bus", "Data"]];

  if (type === "BES") {
    rows = [
      ["Bus", "Status"],
      ...Object.entries(besResults)
    ];
  }

  if (type === "Fleet") {
    rows = [
      ["Bus", "Checklist"],
      ...Object.entries(fleetResults).map(([bus, data]) => [
        bus,
        JSON.stringify(data)
      ])
    ];
  }

  if (type === "CCM") {
    const saved = JSON.parse(
      localStorage.getItem(`ccm-progress-${area}`) || "{}"
    );

    rows = [
      ["Bus", "Status"],
      ...Object.entries(saved.results || {})
    ];
  }

  const csv = rows.map(r => r.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${type}-${area}.csv`;
  a.click();
};
  
  const assignDriver = (bus) => {
    if (!currentDriver) return;
    setBusDrivers(prev => ({ ...prev, [bus]: currentDriver }));
  };

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

  /* MISSED */
  const missedBES = buses.filter(b => !besResults[b]);
  const missedFleet = buses.filter(b => !fleetResults[b]);

  const missedCombined = [...new Set([...missedBES, ...missedFleet])];

  // ✅ PERCENT CALCULATIONS (RESTORED)
const besCompleted = Object.keys(besResults).length;

const fleetCompleted = Object.keys(fleetResults).filter(
  bus => Object.values(fleetResults[bus] || {}).length > 0
).length;

const besPercent = Math.round((besCompleted / buses.length) * 100) || 0;
const fleetPercent = Math.round((fleetCompleted / buses.length) * 100) || 0;

const savedCCM = JSON.parse(localStorage.getItem(`ccm-progress-${area}`) || "{}");
const ccmPercent = Math.round(
  (Object.keys(savedCCM.results || {}).length / buses.length) * 100
) || 0;

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

    Download BES
  </button>

  <button
    onClick={() => downloadCSV("Fleet")}
    style={{ marginLeft: 10 }}
  >
    Download Fleet
  </button>

  <button
    onClick={() => downloadCSV("CCM")}
    style={{ marginLeft: 10 }}
  >
    Download CCM
  </button>
</div>
      
      </div>
      
      {/* ✅ DRIVER SELECT */}
      <div style={{ marginTop: 10 }}>
        Driver:
        <select value={currentDriver} onChange={(e) => setCurrentDriver(e.target.value)}>
          <option value="">Select Driver</option>
          {DRIVERS.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      {/* ✅ DASHBOARD */}
{tab === "dashboard" && (
  <div>
    <h2>Dashboard</h2>

          {isFriday && (
            <div style={{ color: "red", fontWeight: "bold" }}>
              🚨 FINAL COMPLIANCE REVIEW
            </div>
          )}

          <h3>Missed Buses</h3>
          {missedCombined.length === 0 ? (
            <div>✅ None</div>
          ) : (
            missedCombined.map(bus => (
              <div key={bus}>
                Bus {bus} — Driver: {busDrivers[bus] || "UNKNOWN"}
              </div>
            ))
          )}
        </div>
      )}

      {/* ✅ BES */}
      {tab === "bes" && (
        <div>
          <h2>{area} BES</h2>
          <div>Bus: {buses[besIndex]}</div>

          <button onClick={() => {
            assignDriver(buses[besIndex]);
            setBesResults(p => ({ ...p, [buses[besIndex]]: "OK" }));
            nextBes();
          }}>
            Tag ✅
          </button>

          <button onClick={() => {
            assignDriver(buses[besIndex]);
            setBesResults(p => ({ ...p, [buses[besIndex]]: "MISSING" }));
            nextBes();
          }} style={{ marginLeft: 10 }}>
            Missing ❌
          </button>

          <div style={{ display: "flex", flexWrap: "wrap", marginTop: 10 }}>
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

      {/* ✅ FLEET */}
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
                    assignDriver(buses[fleetIndex]);
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

          <div style={{ display: "flex", flexWrap: "wrap", marginTop: 10 }}>
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
        <hr style={{ marginTop: 20 }} />

<div>
  <button onClick={() => downloadCSV("BES")}>Download BES
      )}
    </div>
  );
}
