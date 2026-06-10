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
  "Drew",
  "Courtney",
  "Brandi",
  "Tony",
  "Lee",
  "Johnny",
  "Mike"
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

  const besViolations = activeBuses.filter(b => isFriday && !besResults[b]?.status);
  const fleetViolations = activeBuses.filter(b => isFriday && fleetResults[b]?.status !== STATUS.COMPLETE);

  const totalViolations = [...new Set([...besViolations, ...fleetViolations])].length;

  const besPercent = Math.round(
    (Object.values(besResults).filter(v => v?.status).length / activeBuses.length) * 100
  ) || 0;

  const fleetPercent = Math.round(
    (Object.values(fleetResults).filter(v => v?.status === STATUS.COMPLETE).length / activeBuses.length) * 100
  ) || 0;

  const monthlyPercent = Math.round(
    (Object.values(monthlyResults).filter(v => v?.status === STATUS.COMPLETE).length / activeBuses.length) * 100
  ) || 0;

  const savedCCM = JSON.parse(localStorage.getItem(`ccm-progress-${area}`) || "{}");
  const ccmDone = Object.keys(savedCCM.results || {}).length;
  const ccmPercent = Math.round((ccmDone / activeBuses.length) * 100) || 0;

  // ✅ UI
  return (
    <div style={{ padding: 20 }}>
      <h1>Safety Compliance System</h1>

      <button onClick={() => setTab("dashboard")}>Dashboard</button>
      <button onClick={() => setTab("bes")}>BES</button>
      <button onClick={() => setTab("fleet")}>Fleet</button>
      <button onClick={() => setTab("monthly")}>Monthly</button>
      <button onClick={() => setTab("ccm")}>CCM</button>

      {/* ✅ DASHBOARD (UPGRADED ONLY) */}
      {tab === "dashboard" && (
        <div>
          <h2>Dashboard</h2>

          {isFriday && (
            <div style={{ background: "#ffcccc", padding: 10 }}>
              ALERT: {totalViolations} TOTAL VIOLATIONS
            </div>
          )}

          <div>Total: {allBuses.length}</div>
          <div>Active: {activeBuses.length}</div>
          <div>OOS: {oosBuses.length}</div>

          <div>BES: {besPercent}%</div>
          <div>Fleet: {fleetPercent}%</div>
          <div>Monthly: {monthlyPercent}%</div>

          <div>
            CCM: {ccmPercent}% — {ccmDone === activeBuses.length ? "Complete" : `${activeBuses.length - ccmDone} remaining`}
          </div>
        </div>
      )}

      {/* KEEP YOUR OTHER TABS BELOW EXACTLY AS THEY WERE */}
    </div>
  );
}
