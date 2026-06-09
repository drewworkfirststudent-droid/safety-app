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

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [area, setArea] = useState("Northwest");

  const buses = area === "Northwest" ? NW_BUSES : SE_BUSES;
  const oosList = area === "Northwest" ? OOS_NW : OOS_SE;

  const today = new Date().getDay();
  const isFriday = today === 5;

  const [busDrivers, setBusDrivers] = useState({});
  const [currentDriver, setCurrentDriver] = useState("");

  // ✅ SEPARATED SELECTION STATE
  const [selectedBesBus, setSelectedBesBus] = useState(null);
  const [selectedFleetBus, setSelectedFleetBus] = useState(null);
  const [selectedMonthlyBus, setSelectedMonthlyBus] = useState(null);
  const [besResults, setBesResults] = useState({});
  const [fleetResults, setFleetResults] = useState({});
  const [monthlyResults, setMonthlyResults] = useState({});

  const fleetTemplate = {
    extinguisher: false,
    registration: false,
    insurance: false,
    firstAid: false,
    bodyFluid: false,
    collisionPacket: false
  };

  const monthlyTemplate = {
    extinguisher: false,
    tagValid: false,
    coAlarm: false
  };

  useEffect(() => {
    setBusDrivers(JSON.parse(localStorage.getItem(`drivers-${area}`) || "{}"));
    setBesResults(JSON.parse(localStorage.getItem(`bes-${area}`) || "{}"));
    setFleetResults(JSON.parse(localStorage.getItem(`fleet-${area}`) || "{}"));
    setMonthlyResults(JSON.parse(localStorage.getItem(`monthly-${area}`) || "{}"));
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

  useEffect(() => {
    localStorage.setItem(`monthly-${area}`, JSON.stringify(monthlyResults));
  }, [monthlyResults, area]);

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

  // ✅ FRIDAY VIOLATIONS
  const violations = buses.filter(b => {
    const besOk = besResults[b]?.status;
    const fleetOk = fleetResults[b]?.status === STATUS.COMPLETE;


    return isFriday && (!besOk || !fleetOk);
  });


  const besPercent = Math.round(
    (Object.values(besResults).filter(v => v?.status).length / buses.length) * 100
  ) || 0;

  const fleetPercent = Math.round(
    (Object.values(fleetResults).filter(v => v?.status === STATUS.COMPLETE).length / buses.length) * 100
  ) || 0;

  const monthlyPercent = Math.round(
    (Object.values(monthlyResults).filter(v => v?.status === STATUS.COMPLETE).length / buses.length) * 100
  ) || 0;

  const savedCCM = JSON.parse(localStorage.getItem(`ccm-progress-${area}`) || "{}");
  const ccmPercent = Math.round((Object.keys(savedCCM.results || {}).length / buses.length) * 100) || 0;

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

      {tab === "dashboard" && (
        <div>
          <h2>Dashboard</h2>

          {isFriday && (
            <div style={{ color: "red", fontWeight: "bold" }}>
              🚨 FINAL COMPLIANCE REVIEW
            </div>
          )}


          <div>BES: {besPercent}%</div>
          <div>Fleet: {fleetPercent}%</div>
          <div>Monthly: {monthlyPercent}%</div>
          <div>CCM: {ccmPercent}%</div>

          <h3>🚨 Violations</h3>
          {violations.length === 0 ? (
            <div>✅ None</div>
          ) : (
            violations.map(b => (
              <div key={b} style={{ color: "red" }}>
                Bus {b} — Driver: {busDrivers[b] || "UNKNOWN"}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "bes" && (
        <div>
          <h2>BES Grid</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
            {buses.map(bus => {
              const data = besResults[bus];
              return (
                <div
                  key={bus}
                  onClick={() => setSelectedBesBus(bus)}
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

      {tab === "fleet" && (
        <div>
          <h2>Fleet Grid</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
            {buses.map(bus => {
              const data = fleetResults[bus];
              return (
                <div
                  key={bus}
                  onClick={() => setSelectedFleetBus(bus)}
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

      {tab === "ccm" && (
        <div>
          <CCM buses={buses} area={area} oosList={oosList} />
        </div>
      )}
    </div>
  );
}
