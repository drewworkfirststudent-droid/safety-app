import { useState } from "react";
import { NW_BUSES, SE_BUSES } from "./buses";

export default function App = "green";export default function App() {

  if (ccmFails.length > 0) {
    status = "NOT READY";
    color = "red";
  } else if (besMissing.length > 0 || fleetMissing.length > 0) {
    status = "PARTIAL";
    color = "orange";
  }

  /* ================= EXPORT ================= */

  const exportCSV = () => {
    let rows = [];

    besChecks.forEach(b => rows.push(`BES,${b.bus}`));
    besMissing.forEach(b => rows.push(`BES_MISSED,${b}`));

    fleetChecks.forEach(f => rows.push(`FLEET,${f.bus}`));
    fleetMissing.forEach(b => rows.push(`FLEET_MISSED,${b}`));

    ccmChecks.forEach(c => rows.push(`CCM,${c.bus},${c.result}`));

    const csv = "Type,Unit,Result\n" + rows.join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "safety_report.csv";
    a.click();
  };

  return (
    <div style={{ padding: 20 }}>

      <h1>Safety Compliance System ✅</h1>

      <select value={area} onChange={(e)=>setArea(e.target.value)}>
        <option>Northwest</option>
        <option>Southeast</option>
      </select>

      <div>
        <button onClick={()=>setTab("dashboard")}>Dashboard</button>
        <button onClick={()=>setTab("bes")}>BES</button>
        <button onClick={()=>setTab("fleet")}>Fleet</button>
        <button onClick={()=>setTab("ccm")}>CCM</button>
      </div>

      {/* DASHBOARD */}
      {tab === "dashboard" && (
        <div>
          <h2>Dashboard</h2>

          <h2 style={{ color }}>{status}</h2>

          <div>BES Compliance: {besPercent}%</div>
          <div>Fleet Compliance: {fleetPercent}%</div>

          <div style={{ color: "red" }}>
            CCM Failures: {ccmFails.length}
          </div>

          <div style={{ color: "orange" }}>
            Missing BES: {besMissing.join(", ") || "None"}
          </div>

          <div style={{ color: "orange" }}>
            Missing Fleet: {fleetMissing.join(", ") || "None"}
          </div>

          <button onClick={exportCSV}>Export Report</button>
        </div>
      )}

      {/* BES */}
      {tab === "bes" && (
        <div>
          <h2>BES</h2>
          <div>Bus: {buses[besIndex]}</div>

          <button onClick={logBES}>Log</button>
          <button onClick={nextBes}>Next Bus</button>
        </div>
      )}

      {/* FLEET */}
      {tab === "fleet" && (
        <div>
          <h2>Fleet</h2>
          <div>Bus: {buses[fleetIndex]}</div>

          {Object.keys(fleetForm).map(key => (
            <label key={key} style={{ display: "block" }}>
              <input
                type="checkbox"
                checked={fleetForm[key]}
                onChange={() =>
                  setFleetForm({
                    ...fleetForm,
                    [key]: !fleetForm[key]
                  })
                }
              />
              {key}
            </label>
          ))}

          <button onClick={saveFleet}>Save</button>
          <button onClick={nextFleet}>Next Bus</button>
        </div>
      )}

      {/* CCM */}
      {tab === "ccm" && (
        <div>
          <h2>CCM</h2>
          <div>Bus: {buses[ccmIndex]}</div>

          <button onClick={()=>logCCM("PASS")}>Pass</button>
          <button onClick={()=>logCCM("FAIL")}>Fail</button>
        </div>
      )}

    </div>
  );
}
``

  const [tab, setTab] = useState("dashboard");
  const [area, setArea] = useState("Northwest");

  const buses = area === "Northwest" ? NW_BUSES : SE_BUSES;

  /* ================= BES ================= */
  const [besIndex, setBesIndex] = useState(0);
  const [besChecks, setBesChecks] = useState([]);

  const nextBes = () => setBesIndex(i => (i + 1) % buses.length);

  const logBES = () => {
    setBesChecks([...besChecks, { bus: buses[besIndex] }]);
    nextBes();
  };

  /* ================= FLEET ================= */
  const [fleetIndex, setFleetIndex] = useState(0);
  const [fleetChecks, setFleetChecks] = useState([]);

  const [fleetForm, setFleetForm] = useState({
    registration: false,
    insurance: false,
    firstAid: false,
    bodyFluid: false,
    collisionKit: false,
    childCheckmate: false
  });

  const nextFleet = () => setFleetIndex(i => (i + 1) % buses.length);

  const saveFleet = () => {
    setFleetChecks([...fleetChecks, { bus: buses[fleetIndex], ...fleetForm }]);

    setFleetForm({
      registration: false,
      insurance: false,
      firstAid: false,
      bodyFluid: false,
      collisionKit: false,
      childCheckmate: false
    });

    nextFleet();
  };

  /* ================= CCM ================= */
  const [ccmIndex, setCcmIndex] = useState(0);
  const [ccmChecks, setCcmChecks] = useState([]);

  const nextCCM = () => setCcmIndex(i => (i + 1) % buses.length);

  const logCCM = (result) => {
    setCcmChecks([...ccmChecks, { bus: buses[ccmIndex], result }]);
    nextCCM();
  };

  /* ================= CALCULATIONS ================= */

  const besCompleted = besChecks.map(b => b.bus);
  const fleetCompleted = fleetChecks.map(f => f.bus);

  const besMissing = buses.filter(b => !besCompleted.includes(b));
  const fleetMissing = buses.filter(b => !fleetCompleted.includes(b));

  const besPercent = Math.round((besCompleted.length / buses.length) * 100) || 0;
  const fleetPercent = Math.round((fleetCompleted.length / buses.length) * 100) || 0;

  const ccmFails = ccmChecks.filter(c => c.result === "FAIL");

  /* ================= STATUS ================= */

  let status = "READY";
