import { useState } from "react";

const NW_BUSES = [301,428,371,434,413,226,227,440,382,430];
const SE_BUSES = [444,390,376,223,449,412,426,456];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [area, setArea] = useState("Northwest");

  const buses = area === "Northwest" ? NW_BUSES : SE_BUSES;

  const [besChecks, setBesChecks] = useState([]);
  const [fleetChecks, setFleetChecks] = useState([]);
  const [ccmChecks, setCcmChecks] = useState([]);
  const [facilityChecks, setFacilityChecks] = useState([]);

  const besCompleted = besChecks.length;
  const fleetCompleted = fleetChecks.length;

  const besPercent = Math.round((besCompleted / buses.length) * 100) || 0;
  const fleetPercent = Math.round((fleetCompleted / buses.length) * 100) || 0;

  const besMissing = buses.filter(
    (b) => !besChecks.map((x) => x.bus).includes(b)
  );

  const fleetMissing = buses.filter(
    (b) => !fleetChecks.map((x) => x.bus).includes(b)
  );

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

          <div>Missing BES: {besMissing.join(", ") || "None"}</div>
          <div>Missing Fleet: {fleetMissing.join(", ") || "None"}</div>

          <button
            onClick={() => {
              const csv = "Test Export\nBES," + besCompleted;
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "report.csv";
              a.click();
            }}
          >
            Export Report
          </button>
        </div>
      )}
    </div>
  );
}
``
