import { useState, useEffect } from "react";

const STORAGE_KEY = "ccm-progress";

function CCM({ buses }) {

function CCM() {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState({});

  // ✅ Load saved data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setIndex(parsed.index || 0);
      setResults(parsed.results || {});
    }
  }, []);

  // ✅ Save data
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        index,
        results,
      })
    );
  }, [index, results]);

  const currentBus = buses[index];

  const handleResult = (status) => {
    setResults((prev) => ({
      ...prev,
      [currentBus]: status,
    }));

    if (index < buses.length - 1) {
      setIndex(index + 1);
    }
  };

  // ✅ Reset function
  const handleReset = () => {
    if (window.confirm("Reset all CCM progress?")) {
      localStorage.removeItem(STORAGE_KEY);
      setIndex(0);
      setResults({});
    }
  };

  // ✅ Color helper
  const getColor = (status) => {
    if (status === "WORKING") return "green";
    if (status === "NOT_WORKING") return "red";
    if (status === "NOT_REQUIRED") return "gray";
    return "#ccc";
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Child Checkmate Verification</h2>

      {/* ✅ Resume banner */}
      {index > 0 && (
        <div style={{ marginBottom: "15px", fontWeight: "bold" }}>
          Resuming at Bus {currentBus}
        </div>
      )}

      {/* ✅ Reset button */}
      <button
        onClick={handleReset}
        style={{
          marginBottom: "15px",
          backgroundColor: "black",
          color: "white",
          padding: "6px 10px",
        }}
      >
        Reset Week
      </button>

      {/* ✅ Current Bus Card */}
      <div
        style={{
          border: "2px solid",
          borderColor: getColor(results[currentBus]),
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <h3>Bus: {currentBus}</h3>

        <button onClick={() => handleResult("WORKING")}>
          Working
        </button>

        <button
          onClick={() => handleResult("NOT_WORKING")}
          style={{ marginLeft: "10px" }}
        >
          Not Working
        </button>

        <button
          onClick={() => handleResult("NOT_REQUIRED")}
          style={{ marginLeft: "10px" }}
        >
          Not Required
        </button>

        <p style={{ marginTop: "15px" }}>
          {index + 1} / {buses.length}
        </p>
      </div>

      {/* ✅ Fleet Status Grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {buses.map((bus) => (
          <div
            key={bus}
            style={{
              width: "60px",
              padding: "8px",
              textAlign: "center",
              borderRadius: "6px",
              backgroundColor: getColor(results[bus]),
              color: "white",
              fontSize: "12px",
            }}
          >
            {bus}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CCM;
