import CCM from "./modules/ccm/CCM";
import { useState, useEffect } from "react";
import { NW_BUSES, SE_BUSES } from "./buses";

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
  "Lee",
  "Johnny",
  "Mike",
  "Kris",
  "Josh",
  "Jonathan"
];

function downloadCSV(filename, rows) {
  const csv = rows.map(r => r.map(c => `"${c ?? ""}"`).join(",")).join("\n");
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
  const [oosBuses, setOosBuses] = useState([]);

  const allBuses =
    area === "Northwest"
      ? NW_BUSES.map(String)
      : SE_BUSES.map(String);

  const activeBuses = allBuses.filter(b => !oosBuses.includes(b));

  const [busDrivers, setBusDrivers] = useState({});
  const [currentDriver, setCurrentDriver] = useState("");
  const [besResults, setBesResults] = useState({});
  const [fleetResults, setFleetResults] = useState({});
  const [selectedBesBus, setSelectedBesBus] = useState(null);
  const [selectedFleetBus, setSelectedFleetBus] = useState(null);

  const isFriday = new Date().getDay() === 5;

  const fleetTemplate = {
    extinguisher: false,
    registration: false,
    insurance: false,
    firstAid: false,
    bodyFluid: false,
    collisionPacket: false
  };

  // LOAD
  useEffect(() => {
    setBusDrivers(JSON.parse(localStorage.getItem(`drivers-${area}`) || "{}"));
    setBesResults(JSON.parse(localStorage.getItem(`bes-${area}`) || "{}"));
    setFleetResults(JSON.parse(localStorage.getItem(`fleet-${area}`) || "{}"));
    setOosBuses(JSON.parse(localStorage.getItem(`oos-${area}`) || "[]"));
  }, [area]);

  // SAVE
  useEffect(() => {
    localStorage.setItem(`drivers-${area}`, JSON.stringify(busDrivers));
  }, [busDrivers, area]);

  useEffect(() => {
    localStorage.setItem(`bes-${area}`, JSON.stringify(besResults));
  }, [besResults, area]);

  useEffect(() => {
    localStorage.setItem(`fleet-${area}`, JSON.stringify(fleetResults));
  }, [fleetResults, area]);

  useEffect(() => {
    localStorage.setItem(`oos-${area}`, JSON.stringify(oosBuses));
  }, [oosBuses, area]);

  const assignDriver = (bus) => {
    if (!currentDriver) return;
    setBusDrivers(prev => ({ ...prev, [bus]: currentDriver }));
  };

  const getColor = (status) => {
    if (status === STATUS.COMPLETE) return "green";
    if (status === STATUS.FAILED) return "red";
    if (status === STATUS.IN_PROGRESS) return "orange";
    return "gray";
  };

  const besViolations = activeBuses.filter(
    b => isFriday && !besResults[b]?.status
  );

  const fleetViolations = activeBuses.filter(
    b => isFriday && fleetResults[b]?.status !== STATUS.COMPLETE
  );

  const totalViolations = new Set([...besViolations, ...fleetViolations]).size;

  const besPercent =
    Math.round((Object.values(besResults).filter(v => v?.status).length / activeBuses.length) * 100) || 0;

  const fleetPercent =
    Math.round((Object.values(fleetResults).filter(v => v?.status === STATUS.COMPLETE).length / activeBuses.length) * 100) || 0;

  const savedCCM = JSON.parse(localStorage.getItem(`ccm-progress-${area}`) || "{}");
  const ccmDone = Object.keys(savedCCM.results || {}).length;

  const exportBES = () => {
    const rows = activeBuses.map(bus => [
      bus,
      busDrivers[bus] || "",
      besResults[bus]?.status || "NOT_STARTED"
    ]);
    downloadCSV(`BES-${area}.csv`, [["Bus","Driver","Status"], ...rows]);
  };

  const exportFleet = () => {
    const rows = activeBuses.map(bus => [
      bus,
      busDrivers[bus] || "",
      fleetResults[bus]?.status || "NOT_STARTED"
    ]);
    downloadCSV(`Fleet-${area}.csv`, [["Bus","Driver","Status"], ...rows]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Safety Compliance System</h1>

      {/* HEADER */}
      <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
        <select value={area} onChange={(e) => setArea(e.target.value)}>
          <option>Northwest</option>
          <option>Southeast</option>
        </select>

        <select value={loggedBy} onChange={(e) => setLoggedBy(e.target.value)}>
          <option value="">-- Select --</option>
          {STAFF.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* TABS */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setTab("dashboard")}>Dashboard</button>
        <button onClick={() => setTab("bes")}>BES</button>
        <button onClick={() => setTab("fleet")}>Fleet</button>
        <button onClick={() => setTab("ccm")}>CCM</button>
      </div>

      {/* DASHBOARD */}
      {tab === "dashboard" && (
        <div>
          <h2>Dashboard</h2>

          {isFriday && (
            <div style={{ background: "#ffcccc", padding: 10 }}>
              ALERT: {totalViolations} violations
              <div>BES: {besViolations.length}</div>
              <div>Fleet: {fleetViolations.length}</div>
            </div>
          )}

          <div>Total: {allBuses.length}</div>
          <div>Active: {activeBuses.length}</div>
          <div>OOS: {oosBuses.length}</div>

          <div>BES: {besPercent}%</div>
          <div>Fleet: {fleetPercent}%</div>

          <div>
            CCM: {Math.round((ccmDone / activeBuses.length) * 100) || 0}% —
            {ccmDone === activeBuses.length
              ? "Complete"
              : `${activeBuses.length - ccmDone} remaining`}
          </div>

          <button onClick={exportBES}>Export BES</button>
          <button onClick={exportFleet}>Export Fleet</button>
        </div>
      )}

      {/* BES */}
      {tab === "bes" && (
        <div>
          <h2>BES</h2>
          {activeBuses.map(b => (
            <div key={b}>{b}</div>
          ))}
        </div>
      )}

      {/* FLEET */}
      {tab === "fleet" && (
        <div>
          <h2>Fleet</h2>
          {activeBuses.map(b => (
            <div key={b}>{b}</div>
          ))}
        </div>
      )}

      {/* CCM */}
      {tab === "ccm" && (
        <CCM buses={activeBuses} area={area} oosList={oosBuses} loggedBy={loggedBy} />
      )}
    </div>
  );
}
