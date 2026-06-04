import { useState } from "react";

/* BUS LISTS */
const NW_BUSES = [301,302,303,304,305];
const SE_BUSES = [401,402,403,404];

export default function App() {

  const [tab, setTab] = useState("dashboard");
  const [area, setArea] = useState("Northwest");

  const buses = area === "Northwest" ? NW_BUSES : SE_BUSES;

  /* ================= BES ================= */
  const [besIndex, setBesIndex] = useState(0);
  const [besUser, setBesUser] = useState("");
  const [besChecks, setBesChecks] = useState([]);

  const nextBes = () => setBesIndex(i => (i + 1) % buses.length);

  const logBES = () => {
    if (!besUser) return alert("Enter name");

    setBesChecks([...besChecks, { bus: buses[besIndex], user: besUser }]);

    nextBes();
  };

  /* ================= FLEET ================= */
  const [fleetIndex, setFleetIndex] = useState(0);

  const [fleetForm, setFleetForm] = useState({
    registration: false,
    insurance: false,
    firstAid: false,
    bodyFluid: false,
    collisionKit: false,
    childCheckmate: false
  });

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

    setFleetIndex(i => (i + 1) % buses.length);
  };

  const nextFleet = () => setFleetIndex(i => (i + 1) % buses.length);

  const [fleetChecks, setFleetChecks] = useState([]);

  /* ================= CCM ================= */

  const [ccmChecks, setCcmChecks] = useState([]);
  const [ccmBus, setCcmBus] = useState("");

  // NEW: Sequential CCM Mode
  const [ccmIndex, setCcmIndex] = useState(0);

  const logCCMSequential = (result) => {
    setCcmChecks([...ccmChecks, { bus: buses[ccmIndex], result }]);
    setCcmIndex(i => (i + 1) % buses.length);
  };

  const logCCMManual = (result) => {
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

  /* ================= DASHBOARD ================= */

  const besComplete = besChecks.length;
  const fleetComplete = fleetChecks.length;

  const besPercent = Math.round((besComplete / buses.length) * 100) || 0;
  const fleetPercent = Math.round((fleetComplete / buses.length) * 100) || 0;

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

      {/* DASHBOARD */}

      {tab === "dashboard" && (
        <div>
          <h2>Dashboard</h2>

          <div>BES Compliance: {besPercent}%</div>
          <div>Fleet Compliance: {fleetPercent}%</div>
        </div>
      )}

      {/* BES */}

      {tab === "bes" && (
        <div>
          <h2>BES</h2>

          <div>Bus: {buses[besIndex]}</div>

          <input
            value={besUser}
            onChange={(e)=>setBesUser(e.target.value)}
            placeholder="Name"
          />

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
          <button onClick={nextFleet}>Next Bus</button>
        </div>
      )}

      {/* CCM */}

      {tab === "ccm" && (
        <div>
          <h2>CCM</h2>

          <h3>Sequential Mode</h3>
          <div>Bus: {buses[ccmIndex]}</div>

          <button onClick={()=>logCCMSequential("PASS")}>Pass</button>
          <button onClick={()=>logCCMSequential("FAIL")}>Fail</button>

          <h3>Manual Mode</h3>

          <select onChange={(e)=>setCcmBus(e.target.value)}>
            <option value="">Select Bus</option>
            {buses.map(b => <option key={b}>{b}</option>)}
          </select>

          <button onClick={()=>logCCMManual("PASS")}>Pass</button>
          <button onClick={()=>logCCMManual("FAIL")}>Fail</button>
        </div>
      )}

      {/* FACILITY */}

      {tab === "facility" && (
        <div>
          <h2>Facility</h2>

          <select onChange={(e)=>setFacilityType(e.target.value)}>
            <option>Extinguisher</option>
            <option>Eyewash</option>
            <option>CO Alarm</option>
          </select>

          <input
            value={facilityLocation}
            onChange={(e)=>setFacilityLocation(e.target.value)}
            placeholder="Location"
          />

          <label>
            <input type="radio" checked={facilityPass} onChange={()=>setFacilityPass(true)} />
            Pass
          </label>

          <label>
            <input type="radio" checked={!facilityPass} onChange={()=>setFacilityPass(false)} />
            Fail
          </label>

          <input
            value={facilityNotes}
            onChange={(e)=>setFacilityNotes(e.target.value)}
            placeholder="Notes"
          />

          <button onClick={saveFacility}>Save</button>
        </div>
      )}

    </div>
  );
}
