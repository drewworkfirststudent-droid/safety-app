import { useState, useEffect } from "react";
import { NW_BUSES, SE_BUSES } from "./buses";

const DRIVERS = ["Smith", "Johnson", "Williams", "Brown", "Jones"];

const OOS_NW = ["301", "305"];
const OOS_SE = ["412", "515"];

const STATUS = {
NOT_STARTED: "NOT_STARTED",
IN_PROGRESS: "IN_PROGRESS",
COMPLETE: "COMPLETE",
FAILED: "FAILED"
};

const STAFF = [
  "Drew",
  "Courtney",
  "Brandi",
  "Tony",
  "Lee",
  "Johnny",
  "Mike"
];

function downloadCSV(filename, rows) {
  const csv = rows
    .map(r => r.map(cell => `"${cell ?? ""}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString();
}

export default function App() {
const [tab, setTab] = useState("dashboard");
const [area, setArea] = useState("Northwest");
  const [loggedBy, setLoggedBy] = useState("");

  const buses = area === "Northwest" ? NW_BUSES : SE_BUSES;
  const oosList = area === "Northwest" ? OOS_NW : OOS_SE;
  const allBuses =
    area === "Northwest"
      ? NW_BUSES.map(String)
      : SE_BUSES.map(String);

  const today = new Date().getDay();
  const isFriday = today === 5;
  const [oosBuses, setOosBuses] = useState([]);
  const activeBuses = allBuses.filter(b => !oosBuses.includes(b));

const [busDrivers, setBusDrivers] = useState({});
const [currentDriver, setCurrentDriver] = useState("");

  // ✅ SEPARATED SELECTION STATE
  const [selectedBesBus, setSelectedBesBus] = useState(null);
  const [selectedFleetBus, setSelectedFleetBus] = useState(null);
  const [selectedMonthlyBus, setSelectedMonthlyBus] = useState(null);
const [besResults, setBesResults] = useState({});
const [fleetResults, setFleetResults] = useState({});
  const [monthlyResults, setMonthlyResults] = useState({});

  const [selectedBesBus, setSelectedBesBus] = useState(null);
  const [selectedFleetBus, setSelectedFleetBus] = useState(null);

  const today = new Date().getDay();
  const isFriday = today === 5;

const fleetTemplate = {
extinguisher: false,
@@ -44,19 +72,15 @@ export default function App() {
collisionPacket: false
};

  const monthlyTemplate = {
    extinguisher: false,
    tagValid: false,
    coAlarm: false
  };

  // LOAD
useEffect(() => {
setBusDrivers(JSON.parse(localStorage.getItem(`drivers-${area}`) || "{}"));
setBesResults(JSON.parse(localStorage.getItem(`bes-${area}`) || "{}"));
setFleetResults(JSON.parse(localStorage.getItem(`fleet-${area}`) || "{}"));
    setMonthlyResults(JSON.parse(localStorage.getItem(`monthly-${area}`) || "{}"));
    setOosBuses(JSON.parse(localStorage.getItem(`oos-${area}`) || "[]"));
}, [area]);

  // SAVE
useEffect(() => {
localStorage.setItem(`drivers-${area}`, JSON.stringify(busDrivers));
}, [busDrivers, area]);
@@ -70,8 +94,8 @@ export default function App() {
}, [fleetResults, area]);

useEffect(() => {
    localStorage.setItem(`monthly-${area}`, JSON.stringify(monthlyResults));
  }, [monthlyResults, area]);
    localStorage.setItem(`oos-${area}`, JSON.stringify(oosBuses));
  }, [oosBuses, area]);

const assignDriver = (bus) => {
if (!currentDriver) return;
@@ -85,102 +109,169 @@ export default function App() {
return "gray";
};

  // ✅ FRIDAY VIOLATIONS
  const violations = buses.filter(b => {
    const besOk = besResults[b]?.status;
    const fleetOk = fleetResults[b]?.status === STATUS.COMPLETE;


    return isFriday && (!besOk || !fleetOk);
  });


  const besPercent = Math.round(
    (Object.values(besResults).filter(v => v?.status).length / buses.length) * 100
  ) || 0;
  const besViolations = activeBuses.filter(
    b => isFriday && !besResults[b]?.status
  );

  const fleetPercent = Math.round(
    (Object.values(fleetResults).filter(v => v?.status === STATUS.COMPLETE).length / buses.length) * 100
  ) || 0;
  const fleetViolations = activeBuses.filter(
    b => isFriday && fleetResults[b]?.status !== STATUS.COMPLETE
  );

  const monthlyPercent = Math.round(
    (Object.values(monthlyResults).filter(v => v?.status === STATUS.COMPLETE).length / buses.length) * 100
  ) || 0;
  const totalViolations = new Set([
    ...besViolations,
    ...fleetViolations
  ]).size;

  // CSV EXPORTS
  const exportBES = () => {
    const headers = ["Bus", "Assigned Driver", "Logged By", "Status", "Date/Time"];

    const rows = activeBuses.map(bus => {
      const d = besResults[bus] || {};
      return [
        bus,
        busDrivers[bus] || "",
        d.loggedBy || "",
        d.status || "NOT_STARTED",
        formatDate(d.timestamp)
      ];
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(`BES-${area}-${dateStr}.csv`, [headers, ...rows]);
  };

  const savedCCM = JSON.parse(localStorage.getItem(`ccm-progress-${area}`) || "{}");
  const ccmPercent = Math.round((Object.keys(savedCCM.results || {}).length / buses.length) * 100) || 0;
  const exportFleet = () => {
    const headers = [
      "Bus",
      "Assigned Driver",
      "Logged By",
      "Extinguisher",
      "Registration",
      "Insurance",
      "First Aid",
      "Body Fluid",
      "Collision Packet",
      "Status",
      "Date/Time"
    ];

    const rows = activeBuses.map(bus => {
      const d = fleetResults[bus] || {};

      return [
        bus,
        busDrivers[bus] || "",
        d.loggedBy || "",
        d.extinguisher ? "YES" : "NO",
        d.registration ? "YES" : "NO",
        d.insurance ? "YES" : "NO",
        d.firstAid ? "YES" : "NO",
        d.bodyFluid ? "YES" : "NO",
        d.collisionPacket ? "YES" : "NO",
        d.status || "NOT_STARTED",
        formatDate(d.timestamp)
      ];
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(`Fleet-${area}-${dateStr}.csv`, [headers, ...rows]);
  };

return (
<div style={{ padding: 20 }}>
<h1>Safety Compliance System ✅</h1>

      <select value={area} onChange={(e) => setArea(e.target.value)}>
        <option>Northwest</option>
        <option>Southeast</option>
      </select>
      {/* AREA + LOGGED BY */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
        <div>
          Area:&nbsp;
          <select value={area} onChange={(e) => setArea(e.target.value)}>
            <option>Northwest</option>
            <option>Southeast</option>
          </select>
        </div>

        <div>
          Logged By:&nbsp;
          <select value={loggedBy} onChange={(e) => setLoggedBy(e.target.value)}>
            <option value="">-- Select --</option>
            {STAFF.map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          Assigned Driver:&nbsp;
          <select value={currentDriver} onChange={(e) => setCurrentDriver(e.target.value)}>
            <option value="">-- Select --</option>
            {["Smith", "Johnson", "Williams", "Brown", "Jones"].map(d => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
      {/* TABS */}
      <div style={{ marginBottom: 10 }}>
<button onClick={() => setTab("dashboard")}>Dashboard</button>
<button onClick={() => setTab("bes")}>BES</button>
<button onClick={() => setTab("fleet")}>Fleet</button>
        <button onClick={() => setTab("monthly")}>Monthly</button>
<button onClick={() => setTab("ccm")}>CCM</button>
</div>

      <div style={{ marginTop: 10 }}>
        Driver:
        <select value={currentDriver} onChange={(e) => setCurrentDriver(e.target.value)}>
          <option value="">Select Driver</option>
          {DRIVERS.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      {/* DASHBOARD */}
{tab === "dashboard" && (
<div>
<h2>Dashboard</h2>

{isFriday && (
  <div style={{ background: "#ffcccc", padding: 10, marginBottom: 10 }}>
    ALERT: {totalViolations} TOTAL VIOLATIONS
    <div>BES: {besViolations.length}</div>
    <div>Fleet: {fleetViolations.length}</div>
  </div>
)}

<div style={{ marginBottom: 10 }}>
  <strong>Total Buses:</strong> {allBuses.length} |
  <strong> Active:</strong> {activeBuses.length} |
  <strong> OOS:</strong> {oosBuses.length}
</div>

<div>BES Compliance: {besPercent}%</div>
<div>Fleet Compliance: {fleetPercent}%</div>
<div>Monthly Compliance: {monthlyPercent}%</div>

<div>
  CCM Compliance: {ccmPercent}% — {Object.keys(savedCCM.results || {}).length === activeBuses.length
    ? "Complete"
    : `${activeBuses.length - Object.keys(savedCCM.results || {}).length} remaining`}
</div>

<h3>Violations</h3>
{violations.length === 0 ? (
  <div>None</div>
) : (
  violations.map(b => (
    <div key={b} style={{ color: "red" }}>
      Bus {b} — Driver: {busDrivers[b] || "UNKNOWN"}
    </div>
  ))
)}

<h3 style={{ marginTop: 10 }}>Export</h3>
<button onClick={exportBES} style={{ marginRight: 10 }}>
  Export BES CSV
</button>
<button onClick={exportFleet}>
  Export Fleet CSV
</button>

</div>
)}
          {violations.length === 0 ? (
            <div>✅ None</div>
          ) : (
            violations.map(b => (
              <div key={b} style={{ color: "red" }}>
                Bus {b} — Driver: {busDrivers[b] || "UNKNOWN"}
              </div>
            ))
          )}
          {isFriday && (
            <div style={{ background: "#ffcccc", padding: 10, marginBottom: 10 }}>
              🚨 {totalViolations} TOTAL VIOLATIONS
              <div>BES: {besViolations.length}</div>
              <div>Fleet: {fleetViolations.length}</div>
            </div>
          )}

          <div>Active Buses: {activeBuses.length}</div>
          <div>OOS Buses: {oosBuses.length}</div>

          <h3>Export All</h3>
          <button onClick={exportBES} style={{ marginRight: 10 }}>
            ⬇ BES CSV
          </button>
          <button onClick={exportFleet}>
            ⬇ Fleet CSV
          </button>
</div>
)}

      {/* BES GRID */}
{tab === "bes" && (
<div>
          <h2>BES Grid</h2>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>BES Grid</h2>
            <button onClick={exportBES}>⬇ Export CSV</button>
          </div>

<div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
            {buses.map(bus => {
            {activeBuses.map(bus => {
const data = besResults[bus];
              const violation = besViolations.includes(bus);

return (
<div
key={bus}
onClick={() => setSelectedBesBus(bus)}
style={{
padding: 10,
background: getColor(data?.status),
                    border: violation ? "3px solid red" : "1px solid #999",
color: "white",
                    textAlign: "center",
cursor: "pointer",
                    borderRadius: 6,
                    textAlign: "center"
                    borderRadius: 6
}}
>
{bus}
@@ -190,45 +281,75 @@ export default function App() {
</div>

{selectedBesBus && (
            <div>
            <div style={{ marginTop: 16 }}>
<h3>Bus {selectedBesBus}</h3>
              <button onClick={() => {
                assignDriver(selectedBesBus);
                setBesResults(p => ({
                  ...p,
                  [selectedBesBus]: { status: STATUS.COMPLETE }
                }));
              }}>Tag ✅</button>

              <button onClick={() => {
                assignDriver(selectedBesBus);
                setBesResults(p => ({
                  ...p,
                  [selectedBesBus]: { status: STATUS.FAILED }
                }));
              }}>Missing ❌</button>

              <button
                onClick={() => {
                  if (!loggedBy) return alert("Select Logged By");

                  assignDriver(selectedBesBus);
                  setBesResults(p => ({
                    ...p,
                    [selectedBesBus]: {
                      status: STATUS.COMPLETE,
                      loggedBy,
                      timestamp: Date.now()
                    }
                  }));
                }}
              >
                Tag ✅
              </button>

              <button
                style={{ marginLeft: 10 }}
                onClick={() => {
                  if (!loggedBy) return alert("Select Logged By");

                  assignDriver(selectedBesBus);
                  setBesResults(p => ({
                    ...p,
                    [selectedBesBus]: {
                      status: STATUS.FAILED,
                      loggedBy,
                      timestamp: Date.now()
                    }
                  }));
                }}
              >
                Missing ❌
              </button>
</div>
)}
</div>
)}

      {/* FLEET GRID */}
{tab === "fleet" && (
<div>
          <h2>Fleet Grid</h2>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>Fleet Grid</h2>
            <button onClick={exportFleet}>⬇ Export CSV</button>
          </div>

<div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
            {buses.map(bus => {
            {activeBuses.map(bus => {
const data = fleetResults[bus];
              const violation = fleetViolations.includes(bus);

return (
<div
key={bus}
onClick={() => setSelectedFleetBus(bus)}
style={{
padding: 10,
background: getColor(data?.status),
                    border: violation ? "3px solid red" : "1px solid #999",
color: "white",
                    textAlign: "center",
cursor: "pointer",
                    borderRadius: 6,
                    textAlign: "center"
                    borderRadius: 6
}}
>
{bus}
@@ -238,21 +359,26 @@ export default function App() {
</div>

{selectedFleetBus && (
            <div>
            <div style={{ marginTop: 16 }}>
<h3>Bus {selectedFleetBus}</h3>

{Object.keys(fleetTemplate).map(k => (
<div key={k}>
<label>
<input
type="checkbox"
checked={fleetResults[selectedFleetBus]?.[k] || false}
onChange={(e) => {
                        if (!loggedBy) return alert("Select Logged By");

assignDriver(selectedFleetBus);

setFleetResults(p => {
const existing = p[selectedFleetBus] || { ...fleetTemplate };
const updated = { ...existing, [k]: e.target.checked };
                          const allChecked = Object.values(updated).every(Boolean);
                          const anyChecked = Object.values(updated).some(Boolean);

                          const allChecked = Object.keys(fleetTemplate).every(key => updated[key]);
                          const anyChecked = Object.keys(fleetTemplate).some(key => updated[key]);

return {
...p,
@@ -262,66 +388,9 @@ export default function App() {
? STATUS.COMPLETE
: anyChecked
? STATUS.IN_PROGRESS
                                : STATUS.NOT_STARTED
                            }
                          };
                        });
                      }}
                    /> {k}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "monthly" && (
        <div>
          <h2>Monthly Audits</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
            {buses.map(bus => {
              const data = monthlyResults[bus];
              return (
                <div
                  key={bus}
                  onClick={() => setSelectedMonthlyBus(bus)}
                  style={{
                    padding: 10,
                    background: getColor(data?.status),
                    color: "white",
                    cursor: "pointer",
                    borderRadius: 6,
                    textAlign: "center"
                  }}
                >
                  {bus}
                </div>
              );
            })}
          </div>

          {selectedMonthlyBus && (
            <div>
              <h3>Bus {selectedMonthlyBus}</h3>
              {Object.keys(monthlyTemplate).map(k => (
                <div key={k}>
                  <label>
                    <input
                      type="checkbox"
                      checked={monthlyResults[selectedMonthlyBus]?.[k] || false}
                      onChange={(e) => {
                        assignDriver(selectedMonthlyBus);
                        setMonthlyResults(p => {
                          const existing = p[selectedMonthlyBus] || { ...monthlyTemplate };
                          const updated = { ...existing, [k]: e.target.checked };
                          const allChecked = Object.values(updated).every(Boolean);

                          return {
                            ...p,
                            [selectedMonthlyBus]: {
                              ...updated,
                              status: allChecked ? STATUS.COMPLETE : STATUS.IN_PROGRESS
                                : STATUS.NOT_STARTED,
                              loggedBy,
                              timestamp: Date.now()
}
};
});
@@ -335,10 +404,9 @@ export default function App() {
</div>
)}

      {/* CCM */}
{tab === "ccm" && (
        <div>
          <CCM buses={buses} area={area} oosList={oosList} />
        </div>
        <CCM buses={activeBuses} area={area} oosList={oosBuses} loggedBy={loggedBy} />
)}
</div>
);
