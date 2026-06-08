import { useState, useEffect } from "react";

<CCM buses={buses} area={area} oosList={oosList} />
  const STORAGE_KEY = `ccm-progress-${area}`;

  const [index, setIndex] = useState(0);
  const [results, setResults] = useState({});

  // ✅ Day logic
  const today = new Date().getDay();
  const isTuesday = today === 2;

  // ✅ Load saved data (per yard)
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

  // ✅ Save data
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        index,
        results,
      })
    );
  }, [index, results, STORAGE_KEY]);

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

  const handleReset = () => {
    if (window.confirm(`Reset CCM for ${area}?`)) {
      localStorage.removeItem(STORAGE_KEY);
      setIndex(0);
      setResults({});
    }
  };

  const getColor = (status) => {
    if (status === "WORKING") return "green";
    if (status === "NOT_WORKING") return "red";
    if (status === "NOT_REQUIRED") return "gray";
    return "#ccc";
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>{area} Child Checkmate Verification</h2>

      {/* ✅ Tuesday Mode Banner */}
      <div style={{ marginBottom: "15px", fontWeight: "bold" }}>
        {isTuesday ? (
          <span style={{ color: "green" }}>
            Tuesday Compliance Mode ✅
          </span>
        ) : (
          <span style={{ color: "orange" }}>
            Not Tuesday — CCM optional
          </span>
        )}
      </div>

      {/* ✅ Resume banner */}
      {index > 0 && currentBus && (
        <div style={{ marginBottom: "15px", fontWeight: "bold" }}>
          Resuming at Bus {currentBus}
        </div>
      )}

      {/* ✅ Reset */}
      <button
        onClick={handleReset}
        style={{
          marginBottom: "15px",
          backgroundColor: "black",
          color: "white",
          padding: "6px 10px",
        }}
      >
        Reset {area}
      </button>

      {/* ✅ Current Bus */}
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

        {/* ✅ Tuesday requirement warning */}
        {isTuesday && index < buses.length - 1 && (
          <div style={{ color: "red", marginTop: "10px" }}>
            ⚠️ All in-service buses must be verified today
          </div>
        )}
      </div>

      {/* ✅ Fleet Grid */}
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

      {/* ✅ Completion confirmation */}
      {isTuesday && Object.keys(results).length === buses.length && (
        <div style={{ color: "green", marginTop: "15px", fontWeight: "bold" }}>
          ✅ All buses verified for Tuesday
        </div>
      )}
    </div>
  );
}

export default CCM;
