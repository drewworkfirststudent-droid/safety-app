import { useState, useEffect } from "react";

function downloadCSV(filename, rows) {
  const csv = rows
    .map(r => r.map(cell => `"${cell ?? ""}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString();
}

function CCM({ buses, area, oosList = [], loggedBy = "" }) {
  const STORAGE_KEY = `ccm-progress-${area}`;

  const [index, setIndex] = useState(0);
  const [results, setResults] = useState({});

  const today = new Date().getDay();
  const isTuesday = today === 2;

  // ✅ LOAD
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setIndex(parsed.index || 0);
      setResults(parsed.results || {});
    } else {
      setIndex(0);
      setResults({});
    }
  }, [STORAGE_KEY]);

  // ✅ AUTO MARK OOS
  useEffect(() => {
    if (!oosList.length) return;

    setResults(prev => {
      const updated = { ...prev };

      oosList.forEach(bus => {
        if (!updated[bus]) {
          updated[bus] = {
            status: "NOT_REQUIRED",
            loggedBy: "system",
            timestamp: Date.now()
          };
        }
      });

      return updated;
    });
  }, [oosList]);

  // ✅ SAVE
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ index, results })
    );
  }, [index, results, STORAGE_KEY]);

  const currentBus = buses[index];

  const handleResult = (status) => {
    if (!loggedBy && status !== "NOT_REQUIRED") {
      alert("Select Logged By");
      return;
    }

    setResults(prev => ({
      ...prev,
      [currentBus]: {
        status,
        loggedBy: status === "NOT_REQUIRED" ? "system" : loggedBy,
        timestamp: Date.now()
      }
    }));

    if (index < buses.length - 1) {
      setIndex(index + 1);
    }
  };

  const handleReset = () => {
    if (window.confirm(`Reset CCM for ${area}?`)) {
      localStorage.removeItem(STORAGE_KEY);
      setIndex(0);
      setResults({});
    }
  };

  const exportCCM = () => {
    const headers = ["Bus", "Logged By", "Result", "Date/Time"];

    const rows = buses.map(bus => {
      const d = results[bus] || {};
      return [
        bus,
        d.loggedBy || "",
        d.status || "NOT_CHECKED",
        formatDate(d.timestamp)
      ];
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(`CCM-${area}-${dateStr}.csv`, [headers, ...rows]);
  };

  const getColor = (status) => {
    if (status === "WORKING") return "green";
    if (status === "NOT_WORKING") return "red";
    if (status === "NOT_REQUIRED") return "gray";
    return "#ccc";
  };

  const getStatus = (bus) => {
    return results[bus]?.status || null;
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>{area} Child Checkmate Verification</h2>
        <button onClick={exportCCM}>⬇ Export CSV</button>
      </div>

      <div style={{ marginBottom: "15px", fontWeight: "bold" }}>
        {isTuesday ? (
          <span style={{ color: "green" }}>Tuesday Compliance Mode ✅</span>
        ) : (
          <span style={{ color: "orange" }}>Not Tuesday — CCM optional</span>
        )}
      </div>

      {index > 0 && currentBus && (
        <div style={{ marginBottom: "15px", fontWeight: "bold" }}>
          Resuming at Bus {currentBus}
        </div>
      )}

      <button
        onClick={handleReset}
        style={{
          marginBottom: "15px",
          backgroundColor: "black",
          color: "white",
          padding: "6px 10px"
        }}
      >
        Reset {area}
      </button>

      {currentBus && (
        <div
          style={{
            border: "2px solid",
            borderColor: getColor(getStatus(currentBus)),
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "20px"
          }}
        >
          <h3>Bus: {currentBus}</h3>

          {results[currentBus]?.timestamp && (
            <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>
              Logged: {formatDate(results[currentBus].timestamp)}
              {results[currentBus].loggedBy && ` by ${results[currentBus].loggedBy}`}
            </div>
          )}

          <button onClick={() => handleResult("WORKING")}>Working</button>
          <button onClick={() => handleResult("NOT_WORKING")} style={{ marginLeft: "10px" }}>
            Not Working
          </button>
          <button onClick={() => handleResult("NOT_REQUIRED")} style={{ marginLeft: "10px" }}>
            Not Required
          </button>

          <p style={{ marginTop: "15px" }}>
            {index + 1} / {buses.length}
          </p>

          {isTuesday && index < buses.length - 1 && (
            <div style={{ color: "red", marginTop: "10px" }}>
              ⚠️ All in-service buses must be verified today
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {buses.map(bus => (
          <div
            key={bus}
            style={{
              width: "60px",
              padding: "8px",
              textAlign: "center",
              borderRadius: "6px",
              backgroundColor: getColor(getStatus(bus)),
              color: "white",
              fontSize: "12px"
            }}
          >
            {bus}
          </div>
        ))}
      </div>

      {isTuesday && Object.keys(results).length === buses.length && (
        <div style={{ color: "green", marginTop: "15px", fontWeight: "bold" }}>
          ✅ All buses verified for Tuesday
        </div>
      )}
    </div>
  );
}

export default CCM;
