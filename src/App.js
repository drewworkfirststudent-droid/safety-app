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
  const [besUser, setBesUser] = useState("");
  const [besIndex, setBesIndex] = useState(0);
  const [besChecks, setBesChecks] = useState([]);

  const nextBesBus = () => {
    setBesIndex((i) => (i + 1) % buses.length);
  };

  const logBES = () => {
    if (!besUser) return alert("Enter name");

    setBesChecks([
      ...besChecks,
      { bus: buses[besIndex], user: besUser }
    ]);

    nextBesBus();
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

  const fleetBus = buses[fleetIndex];

  const nextFleetBus = () => {
    setFleetIndex((i) => (i + 1) % buses.length);
  };

  const saveFleet = () => {
    setFleetChecks([
      ...fleetChecks,
      { bus: fleetBus, ...fleetForm }
    ]);

    setFleetForm({
      registration: false,
      insurance: false,
      firstAid: false,
      bodyFluid: false,
      collisionKit: false,
      childCheckmate: false
    });

    nextFleetBus();
  };

  /* ================= CCM ================= */
  const [ccmBus, setCcmBus] = useState("");
  const [ccmChecks, setCcmChecks] = useState([]);

  const logCCM = (result) => {
    if (!ccmBus) return alert("Select bus");

    setCcmChecks([
      ...ccmChecks,
      { bus: ccmBus, result }
    ]);
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

  return (
    <div style={{ padding: 20 }}>
      <h1>Safety Compliance System</h1>

      {/* AREA */}
      <select value={area} onChange={(e) => setArea(e.target.value)}>
        <option>Northwest</option>
        <option>Southeast</option>
      </select>

      {/* TABS */}
      <div>
        <button onClick={() => setTab("dashboard")}>Dashboard</button>
        <button onClick={() => setTab("bes")}>BES</button>
        <button onClick={() => setTab("fleet")}>Fleet</button>
        <button onClick={() => setTab("ccm")}>CCM</button>
        <button onClick={() => setTab("facility")}>Facility</button>
      </div>

      {/* DASHBOARD */}
      {tab === "dashboard" && (
        <div>
          <h2>Dashboard</h2>
          <div>Total Buses: {buses.length}</div>
          <div>BES Logs: {besChecks.length}</div>
          <div>Fleet Audits: {fleetChecks.length}</div>
          <div>CCM Checks: {ccmChecks.length}</div>
          <div>Facility Inspections: {facilityChecks.length}</div>
        </div>
      )}

      {/* BES */}
      {tab === "bes" && (
        <div>
          <h2>BES</h2>

          <div><b>Current Bus:</b> {buses[besIndex]}</div>
          <div>Progress: {besIndex + 1} / {buses.length}</div>

          <input
            placeholder="Name"
            value={besUser}
            onChange={(e) => setBesUser(e.target.value)}
          />

          <button onClick={logBES}>Log Check</button>
          <button onClick={nextBesBus}>Next Bus</button>
        </div>
      )}

      {/* FLEET */}
      {tab === "fleet" && (
        <div>
          <h2>Fleet Audit</h2>

          <div><b>Current Bus:</b> {fleetBus}</div>
          <div>Progress: {fleetIndex + 1} / {buses.length}</div>

          {Object.keys(fleetForm).map((key) => (
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

          <button onClick={saveFleet}>Save Audit</button>
          <button onClick={nextFleetBus}>Next Bus</button>
        </div>
      )}

      {/* CCM */}
      {tab === "ccm" && (
        <div>
          <h2>Child Checkmate</h2>

          <select onChange={(e) => setCcmBus(e.target.value)}>
            <option value="">Select Bus</option>
            {buses.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>

          <button onClick={() => logCCM("PASS")}>Pass</button>
          <button onClick={() => logCCM("FAIL")}>Fail</button>

          <h4>Results:</h4>
          {ccmChecks.map((c, i) => (
            <div key={i}>
              Bus {c.bus} - {c.result}
            </div>
          ))}
        </div>
      )}

      {/* FACILITY */}
      {tab === "facility" && (
        <div>
          <h2>Facility Inspection</h2>

          <select onChange={(e) => setFacilityType(e.target.value)}>
            <option>Extinguisher</option>
            <option>Eyewash</option>
            <option>CO Alarm</option>
          </select>

          <input
            placeholder="Location"
            value={facilityLocation}
            onChange={(e) => setFacilityLocation(e.target.value)}
          />

          <div>
            <label>
              <input
                type="radio"
                checked={facilityPass === true}
                onChange={() => setFacilityPass(true)}
              />
              Pass
            </label>

            <label>
              <input
                type="radio"
                checked={facilityPass === false}
                onChange={() => setFacilityPass(false)}
              />
              Fail
            </label>
          </div>

          <input
            placeholder="Notes / Action"
            value={facilityNotes}
            onChange={(e) => setFacilityNotes(e.target.value)}
          />

          <button onClick={saveFacility}>Save</button>
        </div>
      )}
    </div>
  );
}