import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: 20 }}>
      <h1>Safety Compliance System</h1>

      <h2>✅ Build Test Successful</h2>

      <button onClick={() => setCount(count + 1)}>
        Click Test ({count})
      </button>
    </div>
  );
}
