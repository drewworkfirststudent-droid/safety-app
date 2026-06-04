import { useState } from "react";
import { NW_BUSES, SE_BUSES } from "./buses";

export default function App() {

  const [tab, setTab] = useState("dashboard");
  const [area, setArea] = useState("Northwest");

  const buses = area === "Northwest" ? NW_BUSES : SE_BUSES;

  const [index, setIndex] = useState(0);
  const [checks, setChecks] = useState([]);

  const nextBus = () => setIndex(i => (i + 1) % buses.length);

  const logCheck = () => {
    setChecks([...checks, buses[index]]);
    nextBus();
  };

  const percent = Math.round((checks.length / buses.length) * 100) || 0;

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
      </div>

      {tab === "dashboard" && (
        <div>
          <h2>Dashboard</h2>
          <div>Completion: {percent}%</div>
        </div>
      )}

      {tab === "bes" && (
        <div>
          <h2>BES</h2>
          <div>Bus: {buses[index]}</div>

          <button onClick={logCheck}>Log</button>
          <button onClick={nextBus}>Next</button>
        </div>
      )}
    </div>
  );
}
