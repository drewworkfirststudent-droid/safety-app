// ✅ SHAREPOINT + CSV HYBRID DATA MODEL (FINAL ARCHITECTURE READY)
// This version PREPS for CSV integration (drivers, in-service, OOS, routes)
import CCM from "./modules/ccm/CCM";
import { useState, useEffect } from "react";
import { sp } from "@pnp/sp/presets/all";

sp.setup({
  sp: {
    baseUrl: "https://fga.sharepoint.com/sites/20753SafetyAutomation"
  }
});

const LISTS = {
  BES: "BES_Inspections",
  FLEET: "Fleet_Inspections",
  BUILDING: "Building_Checks"
};

// ✅ DATE HELPER
const getTodayRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [area, setArea] = useState("Northwest");

  // ✅ SHAREPOINT DATA
  const [besResults, setBesResults] = useState([]);
  const [fleetResults, setFleetResults] = useState([]);
  const [buildingResults, setBuildingResults] = useState({});

  // ✅ CSV-DERIVED STATE (COMING NEXT PHASE)
  const [allBuses, setAllBuses] = useState([]);
  const [inServiceBuses, setInServiceBuses] = useState([]);
  const [oosBuses, setOosBuses] = useState([]);
  const [routeBuses, setRouteBuses] = useState([]);


  const [currentDriver, setCurrentDriver] = useState("");


  const today = new Date().getDay();
  const isFriday = today === 5;

  // ✅ ACTIVE BUSES LOGIC (CORE CHANGE)
  const activeBuses = inServiceBuses.length > 0
    ? inServiceBuses
    : allBuses;


  useEffect(() => {
    loadSharePointData();
  }, [area]);

  const loadSharePointData = async () => {
    const besData = await sp.web.lists.getByTitle(LISTS.BES).items.get();
    const fleetData = await sp.web.lists.getByTitle(LISTS.FLEET).items.get();
    const buildingData = await sp.web.lists.getByTitle(LISTS.BUILDING).items.top(1).get();

    setBesResults(besData);
    setFleetResults(fleetData);
    setBuildingResults(buildingData[0] || {});
  };

  // ✅ UPSERT
  const upsertRecord = async (listName, bus) => {
    const { start, end } = getTodayRange();

    const existing = await sp.web.lists
      .getByTitle(listName)
      .items
      .filter(
        `Title eq '${bus}' and Area eq '${area}' and Date ge datetime'${start.toISOString()}' and Date lt datetime'${end.toISOString()}'`
      )
      .top(1)
      .get();

    if (existing.length > 0) {
      await sp.web.lists.getByTitle(listName)
        .items.getById(existing[0].Id)
        .update({
          Status: "COMPLETE",
          Driver: currentDriver,
          Date: new Date()
        });
    } else {
      await sp.web.lists.getByTitle(listName).items.add({
        Title: bus,
        Area: area,
        Status: "COMPLETE",
        Driver: currentDriver,
        Date: new Date()
      });
    }

    loadSharePointData();
  };

  const saveBES = (bus) => upsertRecord(LISTS.BES, bus);
  const saveFleet = (bus) => upsertRecord(LISTS.FLEET, bus);

  const saveBuilding = async (field, value) => {
    if (buildingResults.Id) {
      await sp.web.lists.getByTitle(LISTS.BUILDING)
        .items.getById(buildingResults.Id)
        .update({
          [field]: value,
          Area: area,
          Updated: new Date()
        });
    }
    loadSharePointData();
  };

  // ✅ HELPERS
  const getColor = (status) => {
    if (status === "COMPLETE") return "green";
    return "gray";
  };

  const getBesStatus = (bus) => besResults.find(b => b.Title === bus && b.Area === area)?.Status;
  const getFleetStatus = (bus) => fleetResults.find(b => b.Title === bus && b.Area === area)?.Status;

  // ✅ ENFORCEMENT FILTERED TO ACTIVE ONLY
  const besViolations = activeBuses.filter(b => {
    if (oosBuses.includes(b)) return false;
    return isFriday && !getBesStatus(b);
  });
  const fleetViolations = activeBuses.filter(b => {
    if (oosBuses.includes(b)) return false;
    return isFriday && getFleetStatus(b) !== "COMPLETE";
  });
  const totalViolations = new Set([...besViolations, ...fleetViolations]).size;

  return (
    <div style={{ padding: 20 }}>
      <h1>Safety Compliance System (LIVE) ✅</h1>

      <select value={area} onChange={(e) => setArea(e.target.value)}>
        <option>Northwest</option>
        <option>Southeast</option>
      </select>

      <div>
        <button onClick={() => setTab("dashboard")}>Dashboard</button>
        <button onClick={() => setTab("bes")}>BES</button>
        <button onClick={() => setTab("fleet")}>Fleet</button>
        <button onClick={() => setTab("building")}>Building</button>
        <button onClick={() => setTab("ccm")}>CCM</button>
      </div>

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


          <div style={{ marginTop: 10 }}>
            Active Buses: {activeBuses.length}
          </div>
          <div>OOS Buses: {oosBuses.length}</div>
        </div>
      )}

      {tab === "bes" && (
        <div>
          <h2>BES (Active Fleet Only)</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
            {activeBuses.map(bus => {
              const status = getBesStatus(bus);
              const violation = besViolations.includes(bus);

              return (
                <div
                  key={bus}
                  onClick={() => saveBES(bus)}
                  style={{
                    padding: 10,
                    background: getColor(status),
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
        </div>
      )}

      {tab === "fleet" && (
        <div>
          <h2>Fleet (Active Fleet Only)</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
            {activeBuses.map(bus => {
              const status = getFleetStatus(bus);
              const violation = fleetViolations.includes(bus);

              return (
                <div
                  key={bus}
                  onClick={() => saveFleet(bus)}
                  style={{
                    padding: 10,
                    background: getColor(status),
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
        </div>
      )}

      {tab === "building" && (
        <div>
          <h2>Building Compliance</h2>

          {["extinguisherPresent", "extinguisherCharged", "extinguisherTagged"].map(k => (
            <div key={k}>
              <label>
                <input
                  type="checkbox"
                  checked={buildingResults[k] || false}
                  onChange={(e) => saveBuilding(k, e.target.checked)}
                /> {k}
              </label>
            </div>
          ))}
        </div>
      )}

      {tab === "ccm" && (
        <CCM buses={activeBuses} area={area} oosList={oosBuses} />
      )}
    </div>
  );
}
