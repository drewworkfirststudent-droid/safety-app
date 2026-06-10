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
  const DashboardView = () => (
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
      Total: {allBuses.length} | Active: {activeBuses.length} | OOS: {oosBuses.length}
    </div>

    <div>BES Compliance: {besPercent}%</div>
    <div>Fleet Compliance: {fleetPercent}%</div>

    <div>
      CCM: {ccmPercent}% —{" "}
      {ccmDone === activeBuses.length
        ? "Complete"
        : `${activeBuses.length - ccmDone} remaining`}
    </div>

    <div style={{ marginTop: 10 }}>
      <button onClick={exportBES} style={{ marginRight: 10 }}>
        Export BES CSV
      </button>
      <button onClick={exportFleet}>
        Export Fleet CSV
      </button>
    </div>
  </div>
);

    <div>BES Compliance: {besPercent}%</div>
    <div>Fleet Compliance: {fleetPercent}%</div>

    <div>
      CCM: {ccmPercent}% —{" "}
      {ccmDone === activeBuses.length
        ? "Complete"
        : `${activeBuses.length - ccmDone} remaining`}
    </div>

    <div style={{ marginTop: 10 }}>
      <button onClick={exportBES} style={{ marginRight: 10 }}>
        Export BES CSV
      </button>
      <button onClick={exportFleet}>
        Export Fleet CSV
      </button>
    </div>
  </div>
);

  return (
    <div style={{ padding: 20 }}>
      <h1>Safety Compliance System ✅</h1>

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

      {/* TABS */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setTab("dashboard")}>Dashboard</button>
        <button onClick={() => setTab("bes")}>BES</button>
        <button onClick={() => setTab("fleet")}>Fleet</button>
        <button onClick={() => setTab("ccm")}>CCM</button>
      </div>

      {/* DASHBOARD */}
      {tab === "dashboard" && <DashboardView />}

      {/* BES GRID */}
      {tab === "bes" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>BES Grid</h2>
            <button onClick={exportBES}>⬇ Export CSV</button>
          </div>

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
                    cursor: "pointer",
                    borderRadius: 6
                  }}
                >
                  {bus}
                </div>
              );
            })}
          </div>

          {selectedBesBus && (
            <div style={{ marginTop: 16 }}>
              <h3>Bus {selectedBesBus}</h3>

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
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>Fleet Grid</h2>
            <button onClick={exportFleet}>⬇ Export CSV</button>
          </div>

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
                    cursor: "pointer",
                    borderRadius: 6
                  }}
                >
                  {bus}
                </div>
              );
            })}
          </div>

          {selectedFleetBus && (
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

                          const allChecked = Object.keys(fleetTemplate).every(key => updated[key]);
                          const anyChecked = Object.keys(fleetTemplate).some(key => updated[key]);

                          return {
                            ...p,
                            [selectedFleetBus]: {
                              ...updated,
                              status: allChecked
                                ? STATUS.COMPLETE
                                : anyChecked
                                ? STATUS.IN_PROGRESS
                                : STATUS.NOT_STARTED,
                              loggedBy,
                              timestamp: Date.now()
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
        <CCM buses={activeBuses} area={area} oosList={oosBuses} loggedBy={loggedBy} />
      )}
    </div>
  );
}
