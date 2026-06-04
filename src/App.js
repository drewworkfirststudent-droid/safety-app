import { useState } from "react";

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

  /* ================= BES ================= */
  const [besIndex, setBesIndex] = useState(0);
  const [besUser, setBesUser] = useState("");
  const [besChecks, setBesChecks] = useState([]);

  const logBES = () => {
    if (!besUser) return alert("Enter name");

    setBesChecks([...besChecks, { bus: buses[besIndex], user: besUser }]);
    setBesIndex((i) => (i + 1) % buses.length);
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

  const saveFleet = () => {
    setFleetChecks([
      ...fleetChecks,
      { bus: buses[fleetIndex], ...fleetForm }
    ]);

    setFleetForm({
      registration: false,
      insurance: false,
      firstAid: false,
      bodyFluid: false,
      collisionKit: false,
      childCheckmate: false
    });

    setFleetIndex((i) => (i + 1) % buses.length);
  };

  /* ================= CCM ================= */
  const [ccmBus, setCcmBus] = useState("");
  const [ccmChecks, setCcmChecks] = useState([]);

  const logCCM = (result) => {
    if (!ccmBus) return alert("Select bus");

    setCcmChecks([...ccmChecks, { bus: ccmBus, result }]);
  };

  /* ================= FACILITY ================= */
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

  /* ================= CALCULATIONS ================= */
  const besCompleted = besChecks.map(b => b.bus);
  const fleetCompleted = fleetChecks.map(f => f.bus);

  const besMissing = buses.filter(b => !besCompleted.includes(b));
  const fleetMissing = buses.filter(b => !fleetCompleted.includes(b));

  const besPercent = Math.round((besCompleted.length / buses.length) * 100) || 0;
  const fleetPercent = Math.round((fleetCompleted.length / buses.length) * 100) || 0;

  const ccmFails = ccmChecks.filter(c => c.result === "FAIL").length;
  const facilityFails = facilityChecks.filter(f => !f.pass).length;

  /* ================= EXPORT ================= */
  const exportCSV = () => {
    let rows = [];

    besChecks.forEach(b => rows.push(`BES,${b.bus},${b.user}`));
    besMissing.forEach(b => rows.push(`BES_MISSED,${b}`));

    fleetChecks.forEach(f => rows.push(`FLEET,${f.bus},COMPLETE`));
    fleetMissing.forEach(b => rows.push(`FLEET_MISSED,${b}`));

    ccmChecks.forEach(c => rows.push(`CCM,${c.bus},${c.result}`));

    facilityChecks.forEach(f =>
      rows.push(`FACILITY,${f.type},${f.location},${f.pass ? "PASS" : "FAIL"},${f.notes}`)
    );

    const csv = "Type,Unit,Details\n" + rows.join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "safety_report.csv";
    a.click();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Safety Compliance System</h1>

      <select value={area} onChange={(e) => setArea(e.target.value)}>
        <option>Northwest</option>
        <option>Southeast</option>
      </select>

      <div>
        <button onClick={() => setTab("dashboard")}>Dashboard</button>
        <button onClick={() => setTab("bes")}>BES</button>
        <button onClick={() => setTab("fleet")}>Fleet</button>
        <button onClick={() => setTab("ccm")}>CCM</button>
        <button onClick={() => setTab("facility")}>Facility</button>
      </div>

      {tab === "dashboard" && (
        <div>
          <h2>Dashboard</h2>

          <div>BES Compliance: {besPercent}%</div>
          <div>Fleet Compliance: {fleetPercent}%</div>
          <div>CCM Failures: {ccmFails}</div>
          <div>Facility Failures: {facilityFails}</div>

          <div>Missing BES: {besMissing.join(", ") || "None"}</div>
          <div>Missing Fleet: {fleetMissing.join(", ") || "None"}</div>

          <button onClick={exportCSV}>Export Report</button>
        </div>
      )}

      {tab === "bes" && (
        <div>
          <h2>BES</h2>
          <div>Bus: {buses[besIndex]}</div>

          <input value={besUser} onChange={(e) => setBesUser(e.target.value)} placeholder="Name" />

          <button onClick={logBES}>Log</button>
        </div>
      )}

      {tab === "fleet" && (
        <div>
          <h2>Fleet</h2>
          <div>Bus: {buses[fleetIndex]}</div>

          {Object.keys(fleetForm).map((key) => (
            <label key={key}>
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
        </div>
      )}

      {tab === "ccm" && (
        <div>
          <h2>CCM</h2>

          <select onChange={(e) => setCcmBus(e.target.value)}>
            <option value="">Select Bus</option>
            {buses.map(b => <option key={b}>{b}</option>)}
          </select>

          <button onClick={() => logCCM("PASS")}>Pass</button>
          <button onClick={() => logCCM("FAIL")}>Fail</button>
        </div>
      )}

      {tab === "facility" && (
        <div>
          <h2>Facility</h2>

          <select onChange={(e) => setFacilityType(e.target.value)}>
            <option>Extinguisher</option>
            <option>Eyewash</option>
            <option>CO Alarm</option>
          </select>

          <input value={facilityLocation} onChange={(e) => setFacilityLocation(e.target.value)} placeholder="Location" />

          <label>
            <input type="radio" checked={facilityPass === true} onChange={() => setFacilityPass(true)} />
            Pass
          </label>

          <label>
            <input type="radio" checked={facilityPass === false} onChange={() => setFacilityPass(false)} />
            Fail
          </label>

          <input value={facilityNotes} onChange={(e) => setFacilityNotes(e.target.value)} placeholder="Notes" />

          <button onClick={saveFacility}>Save</button>
        </div>
      )}
    </div>
  );
}
