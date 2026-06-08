import CCM from "./modules/ccm/CCM";
import { useState, useEffect } from "react";
import { NW_BUSES, SE_BUSES } from "./buses";

export default function App() {

  const [tab, setTab] = useState("dashboard");
  const [area, setArea] = useState("Northwest");

  const buses = area === "Northwest" ? NW_BUSES : SE_BUSES;

  /* BES */
  const [besIndex, setBesIndex] = useState(0);
  const [besChecks, setBesChecks] = useState([]);

  /* FLEET */
  const [fleetIndex, setFleetIndex] = useState(0);
  const [fleetChecks, setFleetChecks] = useState([]);

  /* ✅ RESET ON AREA CHANGE */
  useEffect(() => {
    setBesIndex(0);
    setBesChecks([]);

    setFleetIndex(0);
    setFleetChecks([]);
  }, [area]);

  const nextBes = () => setBesIndex(i => (i + 1) % buses.length);

  const logBES = () => {
    setBesChecks(prev => [...prev, buses[besIndex]]);
    nextBes();
  };

  const nextFleet = () => setFleetIndex(i => (i + 1) % buses.length);

  const logFleet = () => {
    setFleetChecks(prev => [...prev, buses[fleetIndex]]);
    nextFleet();
  };

  /* CCM DASHBOARD STATE */
  const [ccmPercent, setCcmPercent] = useState(0);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`ccm-progress-${area}`) || "{}");
    const count = Object.keys(saved.results || {}).length;
    const percent = Math.round((count / buses.length) * 100) || 0;
    setCcmPercent(percent);
  }, [tab, buses.length, area]);

  /* DASHBOARD */
  const besPercent = Math.round((besChecks.length / buses.length) * 100) || 0;
  const fleetPercent = Math.round((fleetChecks.length / buses.length) * 100) || 0;

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

      {tab === "dashboard" && (
        <div>
          <h2>Dashboard</h2>
          <div>BES: {besPercent}%</div>
          <div>Fleet: {fleetPercent}%</div>
          <div>CCM: {ccmPercent}%</div>
        </div>
      )}

      {tab === "bes" && (
        <div>
          <h2>{area} BES</h2>
          <div>Bus: {buses[besIndex]}</div>

          <button onClick={logBES}>Log</button>
          <button onClick={nextBes}>Next</button>
        </div>
      )}

      {tab === "fleet" && (
        <div>
          <h2>{area} Fleet</h2>
          <div>Bus: {buses[fleetIndex]}</div>

          <button onClick={logFleet}>Complete</button>
          <button onClick={nextFleet}>Next</button>
        </div>
      )}

      {tab === "ccm" && (
        <CCM buses={buses} area={area} />
      )}

    </div>
  );
}
