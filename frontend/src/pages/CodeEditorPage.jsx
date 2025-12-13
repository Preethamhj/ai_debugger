// frontend/src/pages/CodeEditorPage.jsx
import React, { useState, useCallback } from "react";
import MonacoEditorWrapper from "../components/MonacoEditorWrapper.jsx";
import LogPanel from "../components/LogPanel.jsx";
import axios from "axios";

// Make sure this matches your FastAPI route exactly:
const API_URL = `http://127.0.0.1:8000/process_code`;

function CodeEditorPage() {
  const initialCode = `def add(a, b):\n  return a + b\n\n# Example usage\nprint(add(5, 3))`;

  const [code, setCode] = useState(initialCode);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // MODAL STATES
  const [showFixModal, setShowFixModal] = useState(false);
  const [userIntent, setUserIntent] = useState("");
  const [terminalOutput, setTerminalOutput] = useState("");
  const [intentLoading, setIntentLoading] = useState(false);

  const logMessage = useCallback((message) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  }, []);

  // -----------------------------------------
  // PROCESS CODE
  // -----------------------------------------
  const handleCompile = async () => {
    setLoading(true);
    setLogs([]);

    try {
      logMessage("> Starting processing...");

      // 1) CALL /process_code
      logMessage("> Sending code to API: /process_code");
      await axios.post("http://127.0.0.1:8000/process_code", { code });

      logMessage("> Process Code completed.");

      // 2) CALL /logs
      logMessage("> Fetching logs from /logs...");
      const logRes = await axios.get("http://127.0.0.1:8000/logs");

      logMessage("> Logs fetched.");

      // 3) DISPLAY /logs OUTPUT
      logMessage("> Final Log Output:");
      logMessage(JSON.stringify(logRes.data, null, 2));

    } catch (e) {
      logMessage("ERROR calling APIs: " + e);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // OPEN FIX ERROR MODAL
  // -----------------------------------------
  const handleFix = () => {
    setShowFixModal(true);
  };

  // -----------------------------------------
  // CALL /user-intent
  // -----------------------------------------
  const callUserIntent = async () => {
    try {
      setIntentLoading(true);
      setTerminalOutput("Running...");

      const res = await axios.post("http://127.0.0.1:8000/userIntent", {
        intent: userIntent,
        code: code,
      });

      setTerminalOutput(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setTerminalOutput("ERROR:\n" + err);
    } finally {
      setIntentLoading(false);
    }
  };

  // -----------------------------------------
  // UI
  // -----------------------------------------
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Code Editor</h2>

      <div className="flex flex-col gap-4">
        <MonacoEditorWrapper code={code} setCode={setCode} />

        <div className="flex gap-4">
          <button
            onClick={handleCompile}
            disabled={loading}
            className={`px-4 py-2 text-white font-semibold rounded-lg shadow-md transition duration-300 ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Processing..." : "Run / Process Code"}
          </button>

          <button
            onClick={handleFix}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300"
          >
            Fix Error
          </button>
        </div>

        <LogPanel logs={logs} />
      </div>

      {/* FIX ERROR MODAL */}
      {showFixModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[500px] p-6 rounded-lg shadow-lg">

            <h2 className="text-xl font-bold mb-3">Fix Error - Provide Your Intent</h2>

            {/* Input box */}
            <input
              type="text"
              value={userIntent}
              onChange={(e) => setUserIntent(e.target.value)}
              placeholder="Describe what you want to fix..."
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            />

            {/* Buttons */}
            <div className="flex justify-between mb-4">
              <button
                onClick={() => setShowFixModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>

              <button
                onClick={callUserIntent}
                disabled={intentLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {intentLoading ? "Processing..." : "Enter"}
              </button>
            </div>

            {/* Terminal output */}
            <div className="bg-black text-green-400 font-mono text-sm p-3 rounded h-40 overflow-auto">
              {terminalOutput || "Output will appear here..."}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default CodeEditorPage;
