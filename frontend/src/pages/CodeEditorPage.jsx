// frontend/src/pages/CodeEditorPage.jsx
import React, { useState, useCallback } from "react";
import MonacoEditorWrapper from "../components/MonacoEditorWrapper.jsx";
import LogPanel from "../components/LogPanel.jsx";
import axios from "axios";
import clsx from "clsx";

// Make sure this matches your FastAPI route exactly:
const API_URL = `http://127.0.0.1:8000/process_code`;

function CodeEditorPage() {
  const initialCode = `def add(a, b):\n  return a + b\n\n# Example usage\nprint(add(5, 3))`;

  const [code, setCode] = useState(initialCode);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const logMessage = useCallback((message) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  }, []);

  // Compile / run -> send to backend /process_code
  // const handleCompile = async () => {
  //   if (loading) return;
  //   logMessage("Starting processing...");
  //   logMessage(`Sending code to API: http://127.0.0.1:8000/process_code`);
  //   setLoading(true);
  //   console.log("code :", code);
  //   try {
  //     const response = await axios.post("http://127.0.0.1:8000/process_code", { "code": code });
      
  //     // Response status & body
  //     logMessage(`API Response Status: ${response.status}`);
  //     const data = response.data;
  //     console.log("Backend response:", data);

  //     if (data?.status === "success") {
  //       // Show interpreter output (stdout/stderr/return_code)
  //       const pyOut = data.python_output || {};
  //       logMessage("Python stdout:");
  //       if (pyOut.stdout) {
  //         // split long output into lines
  //         pyOut.stdout.split("\n").forEach((line) => {
  //           if (line.trim() !== "") logMessage(`  stdout: ${line}`);
  //         });
  //       } else {
  //         logMessage("  (no stdout)");
  //       }

  //       if (pyOut.stderr) {
  //         pyOut.stderr.split("\n").forEach((line) => {
  //           if (line.trim() !== "") logMessage(`  stderr: ${line}`);
  //         });
  //       }

  //       logMessage(`Python return code: ${pyOut.return_code ?? "(unknown)"}`);

  //       // Show AST info if present (short summary)
  //       if (data.ast_dump) {
  //         logMessage("AST dump (summary):");
  //         const astDump = String(data.ast_dump);
  //         // limit to first 10 lines to avoid flooding logs
  //         astDump.split("\n").slice(0, 10).forEach((l) => logMessage(`  ${l}`));
  //         if (astDump.split("\n").length > 10) logMessage("  ... (AST truncated in UI)");
  //       } else {
  //         logMessage("No AST dump returned.");
  //       }

  //       // Add success alert
  //       alert("Code processed successfully — check the logs for output & AST info.");
  //     } else {
  //       // backend returned an error-like payload
  //       logMessage(`Backend reported error: ${data?.message ?? "unknown error"}`);
  //       if (data?.details) {
  //         logMessage(`Details: ${JSON.stringify(data.details).slice(0, 1000)}`);
  //       }
  //       alert("Processing failed — check logs for details.");
  //     }
  //   } catch (error) {
  //     console.error("Axios error:", error);
  //     logMessage("ERROR: Failed to connect or process code.");

  //     // Distinguish network / connection refused errors vs server errors
  //     if (error.code === "ECONNREFUSED" || error.message?.includes("Network Error")) {
  //       logMessage("FATAL: Connection refused. Is the FastAPI server running on http://localhost:8000 ?");
  //       alert("Failed: Backend server is not running or unreachable.");
  //     } else if (error.response) {
  //       // server responded with error code
  //       logMessage(`Server returned ${error.response.status}: ${JSON.stringify(error.response.data)}`);
  //       if (error.response.status === 400) {
  //         logMessage(`Validation error: ${error.response.data.detail || "Invalid request format"}`);
  //         alert(`Bad Request (400): ${error.response.data.detail || "Code validation failed"}`);
  //       } else {
  //         alert(`Server error: ${error.response.status} — see logs.`);
  //       }
  //     } else {
  //       logMessage(`Unknown error: ${error.message}`);
  //       alert("An unknown error occurred. See console/logs.");
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  const handleCompile = async () => {
  setLoading(true);
  setLogs([]);

  try {
    logMessage("> Starting processing...");

    // 1) CALL /process_code
    logMessage("> Sending code to API: /process_code");
    await axios.post("http://127.0.0.1:8000/process_code", { code });

    logMessage("> Process Code completed.");

    // 2) NOW CALL /logs
    logMessage("> Fetching logs from /logs...");
    const logRes = await axios.get("http://127.0.0.1:8000/logs");

    logMessage("> Logs fetched.");

    // 3) DISPLAY ONLY /logs OUTPUT
    logMessage("> Final Log Output:");
    logMessage(JSON.stringify(logRes.data, null, 2));

  } catch (e) {
    logMessage("ERROR calling APIs: " + e);
  } finally {
    setLoading(false);
  }
};

 
  const handleFix = () => {
    // (your simulated fix logic — left mostly as-is)
    const simulatedError = "ERROR: Missing argument 'c' in function call on line 6.";
    const simulatedPatch = "def add(a, b):\n  return a + b";

    logMessage("Sending code to AI for fix (simulated)...");
    const alertMessage = `
--- AI FIX SUGGESTED ---

You have an error:
${simulatedError}

Suggested Patch Code (Simulated):
----------------------------------
${simulatedPatch}
----------------------------------

Do you wish to apply this patch? (Click OK to apply, Cancel to dismiss)
    `;
    const shouldApplyFix = window.confirm(alertMessage);

    if (shouldApplyFix) {
      const fixedCode = code.replace("add", "subtract");
      logMessage("Patch received and applied successfully.");
      setCode(fixedCode);
      alert("Patch Applied! Check the code editor for the change.");
    } else {
      logMessage("Patch application canceled by user.");
      alert("Fix operation canceled.");
    }
  };

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
            Fix Error (Simulated Patch)
          </button>
        </div>

        <LogPanel logs={logs} />
      </div>
    </div>
  );
}

export default CodeEditorPage;
