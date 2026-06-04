import { useState } from "react";import { useState);

  /* CCM */
  const [ccmIndex, setCcmIndex] = useState(0);
  const [ccmChecks, setCcmChecks] = useState([]);

  const logCCM = (result) => {
    setCcmChecks([...ccmChecks, { bus: buses[ccmIndex], result }]);
    setCcmIndex(i => (i + 1) % buses.length);
  };

  /* CALCULATIONS */
  const besPercent = Math.round((besChecks.length / buses.length) * 100) || 0;
  const fleetPercent = Math.round((fleetChecks.length / buses.length) * 100) || 0;

  const besMissing = buses.length - besChecks.length;
  const fleetMissing = buses.length - fleetChecks.length;

  const ccmFails = ccmChecks.filter(c => c.result === "FAIL").length;

  /* STATUS */
  let status = "READY";
  let color = "green";

  if (ccmFails > 0) {
    status = "NOT READY";
    color = "red";
  } else if (besMissing > 0 || fleetMissing > 0) {
    status = "PARTIAL";
    color = "orange";
  }

  /* EXPORT */
  const exportCSV = () => {
    let rows = [];

    besChecks.forEach(b => rows.push(`BES,${b.bus}`));
    fleetChecks.forEach(f => rows.push(`FLEET,${f.bus}`));
    ccmChecks.forEach(c => rows.push(`CCM,${c.bus},${c.result}`));

    const csv = "Type,Unit,Result\n" + rows.join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "report.csv";
    a.click();
  };

  return (
    <div style={{ padding: 20 }}>

      <h1>Safety Compliance System</h1>

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

      {tab === "dashboard" && (
        <div>
          <h2>Dashboard</h2>

          <h2 style={{ color }}>{status}</h2>

          <div>BES: {besPercent}%</div>
          <div>Fleet: {fleetPercent}%</div>

          <div style={{ color: "red" }}>
            CCM Failures: {ccmFails}
          </div>

          <div>Missing BES: {besMissing}</div>
          <div>Missing Fleet: {fleetMissing}</div>

          <button onClick={exportCSV}>Export</button>
        </div>
      )}

      {tab === "bes" && (
        <div>
          <h2>BES</h2>
          <div>Bus: {buses[besIndex]}</div>

          <button onClick={logBES}>Log</button>
          <button onClick={nextBes}>Next</button>
        </div>
      )}

      {tab === "fleet" && (
        <div>
          <h2>Fleet</h2>
          <div>Bus: {buses[fleetIndex]}</div>

          <button onClick={saveFleet}>Complete</button>
          <button onClick={nextFleet}>Next</button>
        </div>
      )}

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

/* FULL BUS LISTS */
const NW_BUSES = [
301,428,371,434,413,226,227,440,382,430,369,450,448,415,423,421,446,
392,385,807,366,372,221,451,438,401,313,402,425,433,422,300,365,445,
416,395,805,410,443,417,364,447,386,420,432,411,308,418,419,307,437,
384,373,435,393,424,404,388,394,398,431,306,370,222,397,458,515,601,
1,4,18,26,454,218,603,517,30,607,31,20,664,7,210,5,28,665,14,25,516,
29,24,644
];

const SE_BUSES = [
444,390,376,223,449,412,426,456,407,314,374,457,436,226,439,389,
380,381,406,377,391,405,619,27,215,22,217,643,3,2
];

export default function App() {

  const [tab, setTab] = useState("dashboard");
  const [area, setArea] = useState("Northwest");

  const buses = area === "Northwest" ? NW_BUSES : SE_BUSES;

  /* BES */
  const [besIndex, setBesIndex] = useState(0);
  const [besChecks, setBesChecks] = useState([]);

  const logBES = () => {
    setBesChecks([...besChecks, { bus: buses[besIndex] }]);
    setBesIndex(i => (i + 1) % buses.length);
  };

  const nextBes = () => setBesIndex(i => (i + 1) % buses.length);

  /* FLEET */
  const [fleetIndex, setFleetIndex] = useState(0);
  const [fleetChecks, setFleetChecks] = useState([]);

  const saveFleet = () => {
    setFleetChecks([...fleetChecks, { bus: buses[fleetIndex] }]);
    setFleetIndex(i => (i + 1) % buses.length);
  };

