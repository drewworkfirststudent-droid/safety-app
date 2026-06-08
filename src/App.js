import CCM from "./modules/ccm/CCM";
import { useState } from "react";
import { NW_BUSES, SE_BUSES } from "./buses";

export default function App() {

  const [tab, setTab] = useState("dashboard");
  const [area, setArea] = useState("Northwest");

  const buses = area === "Northwest" ? NW_BUSES : SE_BUSES;

  /* BES */
  const [besIndex, setBesIndex] = useState(0);
  const [besChecks, setBesChecks] = useState([]);

  const nextBes = () => setBesIndex(i => (i + 1) % buses.length);

  const logBES = () => {
    setBesChecks([...besChecks, buses[besIndex]]);
    nextBes();
  };

  /* FLEET */
  const [fleetIndex, setFleetIndex] = useState(0);
  const [fleetChecks, setFleetChecks] = useState([]);

  const nextFleet = () => setFleetIndex(i => (i + 1) % buses.length);

  const logFleet = () => {
    setFleetChecks([...fleetChecks, buses[fleetIndex]]);
    nextFleet();
  };

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

          <button onClick={logFleet}>Complete</button>
          <button onClick={nextFleet}>Next</button>
        </div>
      )}

      {tab === "ccm" && (
        <CCM />
      )}

    </div>
  );
}
