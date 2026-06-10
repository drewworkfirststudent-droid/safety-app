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
  "Josh",
  "Lee",
  "Johnny",
  "Mike",
  "Kris",
  "Jonathan"
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [area, setArea] = useState("Northwest");
  const [loggedBy, setLoggedBy] = useState("");

  const allBuses =
    area === "Northwest"
      ? NW_BUSES.map(String)
      : SE_BUSES.map(String);

  const [oosBuses, setOosBuses] = useState([]);
  const activeBuses = allBuses.filter(b => !oosBuses.includes(b));

  const [busDrivers, setBusDrivers] = useState({});
  const [currentDriver, setCurrentDriver] = useState("");

  const [besResults, setBesResults] = useState({});
  const [fleetResults, setFleetResults] = useState({});

  const [selectedBesBus, setSelectedBesBus] = useState(null);
  const [selectedFleetBus, setSelectedFleetBus] = useState(null);

  const isFriday = new Date().getDay() === 5;

  // LOAD
  useEffect(() => {
    setBusDrivers(JSON.parse(localStorage.getItem(`drivers-${area}`) || "{}"));
    setBesResults(JSON.parse(localStorage.getItem(`bes-${area}`) || "{}"));
    setFleetResults(JSON.parse(localStorage.getItem(`fleet-${area}`) || "{}"));
    setOosBuses(JSON.parse(localStorage.getItem(`oos-${area}`) || "[]"));
  }, [area]);

  const assignDriver = (bus) => {
    if (!currentDriver) return;
    setBusDrivers(prev => ({ ...prev, [bus]: currentDriver }));
  };

  const besViolations = activeBuses.filter(
    b => isFriday && !besResults[b]?.status
  );

  const fleetViolations = activeBuses.filter(
    b => isFriday && fleetResults[b]?.status !== STATUS.COMPLETE
  );

  const totalViolations = new Set([
    ...besViolations,
    ...fleetViolations
  ]).size;

  return (
    <div style={{ padding: 20 }}>
      <h1>Safety Compliance System</h1>

      {/* CONTROLS */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setTab("dashboard")}>Dashboard</button>
        <button onClick={() => setTab("bes")}>BES</button>
        <button onClick={() => setTab("fleet")}>Fleet</button>
        <button onClick={() => setTab("ccm")}>CCM</button>
      </div>

      {/* ✅ DASHBOARD */}
      {tab === "dashboard" && (
        <div>
          <h2>Dashboard</h2>

          <div>Total: {allBuses.length}</div>
          <div>Active: {activeBuses.length}</div>
          <div>OOS: {oosBuses.length}</div>

          <div>BES Violations: {besViolations.length}</div>
          <div>Fleet Violations: {fleetViolations.length}</div>

          <div style={{ marginTop: 10 }}>
            TOTAL VIOLATIONS: {totalViolations}
          </div>
        </div>
      )}

      {/* ✅ BES */}
      {tab === "bes" && (
        <div>
          <h2>BES</h2>
          {activeBuses.map(bus => (
            <div key={bus}>
              {bus}
              <button
                onClick={() => {
                  assignDriver(bus);
                  setBesResults(p => ({
                    ...p,
                    [bus]: { status: STATUS.COMPLETE }
                  }));
                }}
              >
                Tag
              </button>
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

      {/* ✅ CCM */}
      {tab === "ccm" && (
        <CCM buses={activeBuses} area={area} oosList={oosBuses} loggedBy={loggedBy} />
      )}
    </div>
  );
}
