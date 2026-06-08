import { useState } from "react";
import { NW_BUSES } from "../../buses";
const buses = NW_BUSES;

function CCM() {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState({});

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

  return (
    <div style={{ padding: "20px" }}>
      <h2>Child Checkmate Verification</h2>

      <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "10px" }}>
        <h3>Bus: {currentBus}</h3>

        <button onClick={() => handleResult("WORKING")}>
          Working
        </button>

        <button onClick={() => handleResult("NOT_WORKING")} style={{ marginLeft: "10px" }}>
          Not Working
        </button>

        <button onClick={() => handleResult("NOT_REQUIRED")} style={{ marginLeft: "10px" }}>
          Not Required
        </button>

        <p style={{ marginTop: "15px" }}>
          {index + 1} / {buses.length}
        </p>
      </div>
    </div>
  );
}

export default CCM;
