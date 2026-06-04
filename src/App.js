import { useState } from "react";

/ === "Northwest" ? NW_BUSES : SE_BUSES;/* FULL BUS LISTS */

  /* BES */
  const [besUser, setBesUser] = useState("");
  const [besIndex, setBesIndex] = useState(0);
  const [besChecks, setBesChecks] = useState([]);

  const nextBes = () => setBesIndex((i) => (i + 1) % buses.length);

  const logBES = () => {
    if (!besUser) return alert("Enter name");
    setBesChecks([...besChecks, { bus: buses[besIndex], user: besUser }]);
    nextBes();
  };

  /* FLEET */
  const [fleetIndex, setFleetIndex] = useState(0);
  const [fleetChecks, setFleetChecks] = useState([]);

  const fleetBus = buses[fleetIndex];

  const nextFleet = () => setFleetIndex((i) => (i + 1) % buses.length);

  const saveFleet = () => {
    setFleetChecks([...fleetChecks, { bus: fleetBus }]);
    nextFleet();
  };

  /* CCM */
  const [ccmBus, setCcmBus] = useState("");
  const [ccmChecks, setCcmChecks] = useState([]);

  const logCCM = (result) => {
    if (!ccmBus) return alert("Select bus");
    setCcmChecks([...ccmChecks, { bus: ccmBus, result }]);
  };

  /* FACILITY */
  const [facilityType, setFacilityType] = useState("Extinguisher");
  const [facilityLocation, setFacilityLocation] = useState("");
  const [facilityPass, setFacilityPass] = useState(true);
  const [facilityNotes, setFacilityNotes] = useState("");
  const [facilityChecks, setFacilityChecks] = useState([]);

  const saveFacility = () => {
    if (!facilityLocation) return alert("Enter location");

    setFacilityChecks([
      ...facilityChecks,
      {
        type: facilityType,
        location: facilityLocation,
        pass: facilityPass,
        notes: facilityNotes
      }
    ]);

    setFacilityLocation("");
    setFacilityNotes("");
  };

  /* COMPLIANCE CALCULATIONS */

  const besCompleted = besChecks.map(b => b.bus);
  const besMissing = buses.filter(b => !besCompleted.includes(b));

  const fleetCompleted = fleetChecks.map(f => f.bus);
  const fleetMissing = buses.filter(b => !fleetCompleted.includes(b));

  const besPercent = Math.round((besCompleted.length / buses.length) * 100);
  const fleetPercent = Math.round((fleetCompleted.length / buses.length) * 100);

  const ccmFails = ccmChecks.filter(c => c.result === "FAIL");
  const facilityFails = facilityChecks.filter(f => !f.pass);

  /* EXPORT */
  const exportCSV = () => {
    let data = [];

    besChecks.forEach(b => {
      data.push(`BES,${area},${b.bus},${b.user}`);
    });

    besMissing.forEach(b => {
      data.push(`BES_MISSED,${area},${b},NOT_COMPLETED`);
    });

    fleetChecks.forEach(f => {
      data.push(`FLEET,${area},${f.bus},COMPLETE`);
    });

    fleetMissing.forEach(b => {
      data.push(`FLEET_MISSED,${area},${b},NOT_COMPLETED`);
    });

    ccmChecks.forEach(c => {
      data.push(`CCM,${area},${c.bus},${c.result}`);
    });

    facilityChecks.forEach(f => {
      data.push(`FACILITY,${f.type},${f.location},${f.pass ? "PASS" : "FAIL"},${f.notes}`);
    });

    const csv = "Type,Area/Category,Bus/Location,Result/Notes\n" + data.join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", "safety_report.csv");
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
        <button onClick={()=>setTab("facility")}>Facility</button>
      </div>

      {tab === "dashboard" && (
        <div>
          <h2>Dashboard</h2>

          <div><b>BES Compliance:</b> {besPercent}% ({besCompleted.length}/{buses.length})</div>
          <div><b>Fleet Compliance:</b> {fleetPercent}% ({fleetCompleted.length}/{buses.length})</div>

          <div><b>CCM Failures:</b> {ccmFails.length}</div>
          <div><b>Facility Failures:</b> {facilityFails.length}</div>

          <br />
          <div><b>Missing BES:</b> {besMissing.join(", ") || "None"}</div>
          <div><b>Missing Fleet:</b> {fleetMissing.join(", ") || "None"}</div>

          <br />
          <button onClick={exportCSV}>📤 Export Report</button>
        </div>
      )}

      {tab === "bes" && (
        <div>
          <h2>BES</h2>
          <div>Bus: {buses[besIndex]}</div>

          <input value={besUser} onChange={(e)=>setBesUser(e.target.value)} placeholder="Name" />

          <button onClick={logBES}>Log</button>
          <button onClick={nextBes}>Next</button>
        </div>
      )}

      {tab === "fleet" && (
        <div>
          <h2>Fleet</h2>

          <div>Bus: {fleetBus}</div>

          <button onClick={saveFleet}>Complete</button>
          <button onClick={nextFleet}>Next</button>
        </div>
      )}

      {tab === "ccm" && (
        <div>
          <h2>CCM</h2>

          <select onChange={(e)=>setCcmBus(e.target.value)}>
            <option value="">Select Bus</option>
            {buses.map(b=> <option key={b}>{b}</option>)}
          </select>

          <button onClick={()=>logCCM("PASS")}>Pass</button>
          <button onClick={()=>logCCM("FAIL")}>Fail</button>
        </div>
      )}

      {tab === "facility" && (
        <div>
          <h2>Facility</h2>

          <select onChange={(e)=>setFacilityType(e.target.value)}>
            <option>Extinguisher</option>
            <option>Eyewash</option>
            <option>CO Alarm</option>
          </select>

          <input value={facilityLocation} onChange={(e)=>setFacilityLocation(e.target.value)} placeholder="Location" />

          <div>
            <label><input type="radio" checked={facilityPass===true} onChange={()=>setFacilityPass(true)} />Pass</label>
            <label><input type="radio" checked={facilityPass===false} onChange={()=>setFacilityPass(false)} />Fail</label>
          </div>

          <input value={facilityNotes} onChange={(e)=>setFacilityNotes(e.target.value)} placeholder="Notes" />

          <button onClick={saveFacility}>Save</button>
        </div>
      )}
    </div>
  );
}
const NW_BUSES = [301,428,371,434,413,226,227,440,382,430];
const SE_BUSES = [444,390,376,223,449,412,426,456];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [area, setArea] = useState("Northwest");

