import { useState } from "react";
import {
  runAllApiTests,
  runApiTestGroup,
  apiTestGroups,
} from "@/tests/apiTestSuite";

export default function TestDashboard() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runGroup = async (group) => {
    setLoading(true);
    const res = await runApiTestGroup(group);
    setResults({ [group]: res });
    setLoading(false);
  };

  const runAll = async () => {
    setLoading(true);
    const res = await runAllApiTests();
    setResults(res);
    setLoading(false);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>🔥 API Health Test Suite (PRO)</h1>
      <p>
        Test every API endpoint used in the frontend. Works with Codex
        refactors.
      </p>

      <button
        onClick={runAll}
        style={{
          padding: "12px 22px",
          marginBottom: 20,
          background: "#222",
          color: "#fff",
        }}
      >
        Run ALL Tests
      </button>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {Object.keys(apiTestGroups).map((group) => (
          <button
            key={group}
            onClick={() => runGroup(group)}
            style={{
              padding: "10px 18px",
              background: "#333",
              color: "#fff",
              borderRadius: 6,
            }}
          >
            Test {group}
          </button>
        ))}
      </div>

      <hr style={{ margin: "30px 0" }} />

      {loading && <h2>⏳ Running tests...</h2>}

      {results && (
        <pre
          style={{
            background: "#111",
            color: "#0f0",
            padding: "20px",
            borderRadius: 10,
            fontSize: "14px",
            overflow: "auto",
            maxHeight: "400px",
          }}
        >
          {JSON.stringify(results, null, 2)}
        </pre>
      )}
    </div>
  );
}
