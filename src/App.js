import { useState } from "react";

const NW_BUSES = [301, 302, 303, 304, 305];
const SE_BUSES = [401, 402, 403, 404];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [area, setArea] = useState("Northwest");

  const buses = area === "Northwest" ? NW_BUSES : SE_BUSES;

  /* BES */
  const [besIndex, setBesIndex] = useState(0);
  const [besUser, setBesUser] = useState("");
  const [besChecks, setBesChecks] = useState([]);

  const logBES = () => {
    if (!besUser) return alert("Enter name");

    const entry = { bus: buses[besIndex], user: besUser };
    setBesChecks([...besChecks, entry]);

    setBesIndex((i) => (i + 1) % buses.length);
  };

  /* FLEET */
  const [fleetIndex, setFleetIndex] = useState(0);
  const [fleetChecks, setFleetChecks] = useState([]);

  const saveFleet = () => {
    setFleetChecks([...fleetChecks, { bus: buses[fleetIndex] }]);
    setFleetIndex((i) => (i + 1) % buses.length);
  };

  /* CALCULATIONS */
  const besCompleted = besChecks.map(b => b.bus);
  const fleetCompleted = fleetChecks.map(f => f.bus);

  const besMissing = buses.filter(b => !besCompleted.includes(b));
  const fleetMissing = buses.filter(b => !fleetCompleted.includes(b));

  const besPercent = Math.round((besCompleted.length / buses.length) * 100) || 0;
  const fleetPercent = Math.round((fleetCompleted.length / buses.length) * 100) || 0;

  /* EXPORT */
  const exportCSV = () => {
    const rows = [];

    besChecks.forEach(b => rows.push(`BES,${b.bus},${b.user}`));
    besMissing.forEach(b => rows.push(`BES_MISSED,${b},NOT_DONE`));

    fleetChecks.forEach(f => rows.push(`FLEET,${f.bus},DONE`));
    fleetMissing.forEach(b => rows.push(`FLEET_MISSED,${b},NOT_DONE`));

    const csv = "Type,Unit,Status\n" + rows.join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "report.csv";
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
      </div>

      {/* DASHBOARD */}
      {tab === "dashboard" && (
        <div>
          <h2>Dashboard</h2>

          <div>BES Compliance: {besPercent}%</div>
          <div>Fleet Compliance: {fleetPercent}%</div>

          <div>Missing BES: {besMissing.join(", ") || "None"}</div>
          <div>Missing Fleet: {fleetMissing.join(", ") || "None"}</div>

          <br />
          <button onClick={exportCSV}>Export Report</button>
        </div>
      )}

      {/* BES */}
      {tab === "bes" && (
        <div>
          <h2>BES</h2>

          <div>Bus: {buses[besIndex]}</div>

          <input
            placeholder="Name"
            value={besUser}
            onChange={(e) => setBesUser(e.target.value)}
          />

          <button onClick={logBES}>Log Check</button>
        </div>
      )}

      {/* FLEET */}
      {tab === "fleet" && (
        <div>
          <h2>Fleet</h2>

          <div>Bus: {buses[fleetIndex]}</div>

          <button onClick={saveFleet}>Complete</button>
        </div>
      )}
    </div>
  );
}
