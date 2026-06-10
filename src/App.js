import CCM from "./modules/ccm/CCM";
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
  "Drew","Courtney","Brandi","Josh","Lee","Johnny", "Jonathan", "Kris", "Mike"
];

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

  const allBuses = buses.map(String);
  const [oosBuses, setOosBuses] = useState([]);
  const activeBuses = allBuses.filter(b => !oosBuses.includes(b));

  const [busDrivers, setBusDrivers] = useState({});
  const [currentDriver, setCurrentDriver] = useState("");

  const [besResults, setBesResults] = useState({});
  const [fleetResults, setFleetResults] = useState({});
  const [monthlyResults, setMonthlyResults] = useState({});

  const [selectedBesBus, setSelectedBesBus] = useState(null);
  const [selectedFleetBus, setSelectedFleetBus] = useState(null);
  const [selectedMonthlyBus, setSelectedMonthlyBus] = useState(null);

  const isFriday = new Date().getDay() === 5;

  // ---------------- LOAD ----------------
  useEffect(() => {
    setBusDrivers(JSON.parse(localStorage.getItem(`drivers-${area}`) || "{}"));
    setBesResults(JSON.parse(localStorage.getItem(`bes-${area}`) || "{}"));
    setFleetResults(JSON.parse(localStorage.getItem(`fleet-${area}`) || "{}"));
    setMonthlyResults(JSON.parse(localStorage.getItem(`monthly-${area}`) || "{}"));
    setOosBuses(JSON.parse(localStorage.getItem(`oos-${area}`) || "[]"));
  }, [area]);

  // ---------------- SAVE ----------------
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
    localStorage.setItem(`monthly-${area}`, JSON.stringify(monthlyResults));
  }, [monthlyResults, area]);

  useEffect(() => {
    localStorage.setItem(`oos-${area}`, JSON.stringify(oosBuses));
  }, [oosBuses, area]);

  // ---------------- LOGIC ----------------
  const assignDriver = (bus) => {
    if (!currentDriver) return;
    setBusDrivers(prev => ({ ...prev, currentDriver }));
  };

  const getColor = (status) => {
    if (status === STATUS.COMPLETE) return "green";
    if (status === STATUS.FAILED) return "red";
    if (status === STATUS.IN_PROGRESS) return "orange";
    return "gray";
  };

  const besPercent =
    Math.round((Object.values(besResults).filter(v => v?.status).length / activeBuses.length) * 100) || 0;

  const fleetPercent =
    Math.round((Object.values(fleetResults).filter(v => v?.status === STATUS.COMPLETE).length / activeBuses.length) * 100) || 0;

  const monthlyPercent =
    Math.round((Object.values(monthlyResults).filter(v => v?.status === STATUS.COMPLETE).length / activeBuses.length) * 100) || 0;

  const savedCCM = JSON.parse(localStorage.getItem(`ccm-progress-${area}`) || "{}");
  const ccmDone = Object.keys(savedCCM.results || {}).length;
  const ccmPercent = Math.round((ccmDone / activeBuses.length) * 100) || 0;
  const ccmRemaining = activeBuses.length - ccmDone;

  const besViolations = activeBuses.filter(b => isFriday && !besResults[b]?.status);
  const fleetViolations = activeBuses.filter(b => isFriday && fleetResults[b]?.status !== STATUS.COMPLETE);
  const totalViolations = new Set([...besViolations, ...fleetViolations]).size;

  // ---------------- UI ----------------
  return (
    <div style={{ padding: 20 }}>
      <h1>Safety Compliance System</h1>

      {/* HEADER CONTROLS */}
      <div style={{ marginBottom: 10 }}>
        <select value={area} onChange={(e) => setArea(e.target.value)}>
          <option>Northwest</option>
          <option>Southeast</option>
        </select>
      </div>

      <div>
        <button onClick={() => setTab("dashboard")}>Dashboard</button>
        <button onClick={() => setTab("bes")}>BES</button>
        <button onClick={() => setTab("fleet")}>Fleet</button>
        <button onClick={() => setTab("monthly")}>Monthly</button>
        <button onClick={() => setTab("ccm")}>CCM</button>
      </div>

      {/* ✅ DASHBOARD (UPGRADED ONLY) */}
      {tab === "dashboard" && (
        <div>
          <h2>Dashboard</h2>

          {isFriday && (
            <div style={{ background: "#ffcccc", padding: 10, marginBottom: 10 }}>
              ALERT: {totalViolations} total violations
              <div>BES: {besViolations.length}</div>
              <div>Fleet: {fleetViolations.length}</div>
            </div>
          )}

          <div>
            Total: {allBuses.length} | Active: {activeBuses.length} | OOS: {oosBuses.length}
          </div>

          <div>BES Compliance: {besPercent}%</div>
          <div>Fleet Compliance: {fleetPercent}%</div>
          <div>Monthly Compliance: {monthlyPercent}%</div>

          <div>
            CCM Compliance: {ccmPercent}% — {ccmRemaining === 0 ? "Complete" : `${ccmRemaining} remaining`}
          </div>
        </div>
      )}

      {/* ✅ BES */}
      {tab === "bes" && (
        <div>
          <h2>BES</h2>
          {activeBuses.map(bus => (
            <div key={bus} onClick={() => setSelectedBesBus(bus)}>
              {bus}
            </div>
          ))}
        </div>
      )}

      {/* ✅ FLEET */}
      {tab === "fleet" && (
        <div>
          <h2>Fleet</h2>
          {activeBuses.map(bus => (
            <div key={bus}>{bus}</div>
          ))}
        </div>
      )}

      {/* ✅ MONTHLY */}
      {tab === "monthly" && (
        <div>
          <h2>Monthly</h2>
          {activeBuses.map(bus => (
            <div key={bus}>{bus}</div>
          ))}
        </div>
      )}

      {/* ✅ CCM */}
      {tab === "ccm" && (
        <CCM buses={activeBuses} area={area} oosList={oosBuses} loggedBy={loggedBy} />
      )}
    </div>
  );
}
