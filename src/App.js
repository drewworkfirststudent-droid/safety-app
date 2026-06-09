// ✅ SAFE WORKING VERSION (NO SHAREPOINT — VERCEL COMPATIBLE)// ✅ SAFE WORKING VERSION (NO SHAREPOINT — VERCEL COMPATIBLEM";
import { useState, useEffect } from "react";

const STATUS = {
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETE: "COMPLETE",
  FAILED: "FAILED"
};

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [area, setArea] = useState("Northwest");

  const [allBuses, setAllBuses] = useState(["301","302","303","304","305","306"]);
  const [inServiceBuses, setInServiceBuses] = useState([]);
  const [oosBuses, setOosBuses] = useState([]);

  const activeBuses = inServiceBuses.length > 0 ? inServiceBuses : allBuses;

  const [busDrivers, setBusDrivers] = useState({});
  const [currentDriver, setCurrentDriver] = useState("");

  const [besResults, setBesResults] = useState({});
  const [fleetResults, setFleetResults] = useState({});

  const [selectedBesBus, setSelectedBesBus] = useState(null);
  const [selectedFleetBus, setSelectedFleetBus] = useState(null);

  const today = new Date().getDay();
  const isFriday = today === 5;

  const fleetTemplate = {
    extinguisher: false,
    registration: false,
    insurance: false,
    firstAid: false,
    bodyFluid: false,
    collisionPacket: false
  };

  // ✅ LOAD / SAVE LOCAL
  useEffect(() => {
    setBusDrivers(JSON.parse(localStorage.getItem(`drivers-${area}`) || "{}"));
    setBesResults(JSON.parse(localStorage.getItem(`bes-${area}`) || "{}"));
    setFleetResults(JSON.parse(localStorage.getItem(`fleet-${area}`) || "{}"));
  }, [area]);

  useEffect(() => {
    localStorage.setItem(`drivers-${area}`, JSON.stringify(busDrivers));
  }, [busDrivers, area]);

  useEffect(() => {
    localStorage.setItem(`bes-${area}`, JSON.stringify(besResults));
  }, [besResults, area]);

  useEffect(() => {
    localStorage.setItem(`fleet-${area}`, JSON.stringify(fleetResults));
  }, [fleetResults, area]);

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

  // ✅ VIOLATIONS (ACTIVE FLEET ONLY)
  const besViolations = activeBuses.filter(b => {
    if (oosBuses.includes(b)) return false;
    return isFriday && !besResults[b]?.status;
  });

  const fleetViolations = activeBuses.filter(b => {
    if (oosBuses.includes(b)) return false;
    return isFriday && fleetResults[b]?.status !== STATUS.COMPLETE;
  });

  const totalViolations = new Set([...besViolations, ...fleetViolations]).size;

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

      {/* DASHBOARD */}
      {tab === "dashboard" && (
        <div>
          <h2>Dashboard</h2>

          {isFriday && (
            <div style={{ background: "#ffcccc", padding: 10 }}>
              🚨 {totalViolations} TOTAL VIOLATIONS
              <div>BES: {besViolations.length}</div>
              <div>Fleet: {fleetViolations.length}</div>
            </div>
          )}

          <div>Active Buses: {activeBuses.length}</div>
          <div>OOS Buses: {oosBuses.length}</div>
        </div>
      )}

      {/* BES GRID */}
      {tab === "bes" && (
        <div>
          <h2>BES Grid</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
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
                    cursor: "pointer"
                  }}
                >
                  {bus}
                </div>
              );
            })}
          </div>

          {selectedBesBus && (
            <div>
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
            </div>
          )}
        </div>
      )}

      {/* FLEET GRID */}
      {tab === "fleet" && (
        <div>
          <h2>Fleet Grid</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
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
                    cursor: "pointer"
                  }}
                >
                  {bus}
                </div>
              );
            })}
          </div>

          {selectedFleetBus && (
            <div>
              <h3>Bus {selectedFleetBus}</h3>
              {Object.keys(fleetTemplate).map(k => (
                <div key={k}>
                  <label>
                    <input
                      type="checkbox"
                      checked={fleetResults[selectedFleetBus]?.[k] || false}
                      onChange={(e) => {
                        assignDriver(selectedFleetBus);
                        setFleetResults(p => {
                          const existing = p[selectedFleetBus] || { ...fleetTemplate };
                          const updated = { ...existing, [k]: e.target.checked };
                          const allChecked = Object.values(updated).every(Boolean);
                          const anyChecked = Object.values(updated).some(Boolean);

                          return {
                            ...p,
                            [selectedFleetBus]: {
                              ...updated,
                              status: allChecked
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

      {/* CCM */}
      {tab === "ccm" && (
        <CCM buses={activeBuses} area={area} oosList={oosBuses} />
      )}
    </div>
  );
}

