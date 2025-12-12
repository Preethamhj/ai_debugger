// frontend/src/pages/CodeEditorPage.jsx
import React, { useState, useCallback } from "react";
import MonacoEditorWrapper from "../components/MonacoEditorWrapper.jsx";
import LogPanel from "../components/LogPanel.jsx";
import axios from "axios";

// Make sure this matches your FastAPI route exactly:
const API_COMPILE_URL = `http://127.0.0.1:8000/process_code`;
// NEW: Dedicated Fix Endpoint (You must set this up in your backend)
const API_FIX_URL = `http://127.0.0.1:8000/fix_code`; 

function CodeEditorPage() {
  const initialCode = `def add(a, b):\n  return a + b\n\n# Example usage\nprint(add(5, 3))`;

  const [code, setCode] = useState(initialCode);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State for interactive fix
  const [fixInstructions, setFixInstructions] = useState("");
  const [showFixInput, setShowFixInput] = useState(false);
  // End State

  const logMessage = useCallback((message) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  }, []);

  // Compile / run -> send to backend /process_code
  const handleCompile = async () => {
    if (loading) return;
    logMessage("Starting compilation/processing...");
    logMessage(`Sending code to API: ${API_COMPILE_URL}`);
    setLoading(true);
    
    // Hide fix input when compiling/running
    setShowFixInput(false); 

    try {
      // Using API_COMPILE_URL
      const response = await axios.post(API_COMPILE_URL, { "code": code });
      
      // Response status & body
      logMessage(`API Response Status: ${response.status}`);
      const data = response.data;

      if (data?.status === "success") {
        // --- Existing Log Logic for Compiler/Interpreter Output ---
        const pyOut = data.python_output || {};
        logMessage("Python stdout:");
        if (pyOut.stdout) {
          pyOut.stdout.split("\n").forEach((line) => {
            if (line.trim() !== "") logMessage(`  stdout: ${line}`);
          });
        } else {
          logMessage("  (no stdout)");
        }

        if (pyOut.stderr) {
          pyOut.stderr.split("\n").forEach((line) => {
            if (line.trim() !== "") logMessage(`  stderr: ${line}`);
          });
        }

        logMessage(`Python return code: ${pyOut.return_code ?? "(unknown)"}`);

        if (data.ast_dump) {
          logMessage("AST dump (summary):");
          const astDump = String(data.ast_dump);
          astDump.split("\n").slice(0, 10).forEach((l) => logMessage(`  ${l}`));
          if (astDump.split("\n").length > 10) logMessage("  ... (AST truncated in UI)");
        } else {
          logMessage("No AST dump returned.");
        }
        // --- End Existing Log Logic ---

        alert("Code processed successfully — check the logs for output & AST info.");
      } else {
        // backend returned an error-like payload
        logMessage(`Backend reported error: ${data?.message ?? "unknown error"}`);
        if (data?.details) {
          logMessage(`Details: ${JSON.stringify(data.details).slice(0, 1000)}`);
        }
        alert("Processing failed — check logs for details.");
      }
    } catch (error) {
      console.error("Axios error:", error);
      logMessage("ERROR: Failed to connect or process code.");

      if (error.code === "ECONNREFUSED" || error.message?.includes("Network Error")) {
        logMessage("FATAL: Connection refused. Is the FastAPI server running on http://localhost:8000 ?");
        alert("Failed: Backend server is not running or unreachable.");
      } else if (error.response) {
        logMessage(`Server returned ${error.response.status}: ${JSON.stringify(error.response.data)}`);
        if (error.response.status === 400) {
          logMessage(`Validation error: ${error.response.data.detail || "Invalid request format"}`);
          alert(`Bad Request (400): ${error.response.data.detail || "Code validation failed"}`);
        } else {
          alert(`Server error: ${error.response.status} — see logs.`);
        }
      } else {
        logMessage(`Unknown error: ${error.message}`);
        alert("An unknown error occurred. See console/logs.");
      }
    } finally {
      setLoading(false);
    }
  };

  // NEW: Separate function for handling the actual fix API call
  const handleConfirmFix = async () => {
    setLoading(true); // Start loading state for the fix process
    logMessage("Sending code and instructions to AI Fix Engine...");
    logMessage(`User instruction: "${fixInstructions.trim() || 'None provided.'}"`);
    logMessage(`Sending payload to API: ${API_FIX_URL}`);

    try {
      // THIS IS THE KEY API CALL YOU REQUESTED
      const response = await axios.post(API_FIX_URL, { 
        "code": code,
        "instructions": fixInstructions, // <<< USER INPUT GOES HERE
      });
      
      logMessage(`AI Fix API Response Status: ${response.status}`);
      const data = response.data;
      
      // --- START Simulation Logic for Patch Application (Replace with real logic later) ---
      const simulatedPatch = data.repaired_code || data.patch || "def add(a, b):\n  return a + b\n\n# Patch applied!";

      // In a real application, you would apply the patch/repaired_code here:
      // if (data.status === "success" && data.repaired_code) { setCode(data.repaired_code); }
      
      const alertMessage = `
--- AI FIX RECEIVED ---
(Instructions Sent: ${fixInstructions || 'None'})

AI Response (Simulated Patch Content):
----------------------------------
${simulatedPatch.slice(0, 100)}...
----------------------------------

Do you wish to apply this patch? (Click OK to apply, Cancel to dismiss)
    `;
      const shouldApplyFix = window.confirm(alertMessage);
    
      if (shouldApplyFix) {
        // Simulating code change based on response
        const fixedCode = `// AI Patch: ${fixInstructions || 'Autonomous'}\n${code.replace("add", "subtract")}`;
        logMessage("Patch applied successfully from backend response.");
        setCode(fixedCode);
        alert("Patch Applied! Check the code editor for the change.");
      } else {
        logMessage("Patch application canceled by user.");
        alert("Fix operation canceled.");
      }
      // --- END Simulation Logic ---

    } catch (error) {
      console.error("Fix Axios error:", error);
      logMessage("ERROR: Failed to connect or get fix from AI.");

      // IMPORTANT: Check if the /fix_code endpoint is running
      if (error.code === "ECONNREFUSED" || error.message?.includes("Network Error")) {
        logMessage(`FATAL: Connection refused. Is the FastAPI fix server running on ${API_FIX_URL}?`);
        alert("Failed: Backend fix server is not running or unreachable.");
      } else if (error.response) {
        logMessage(`Server returned ${error.response.status}: ${JSON.stringify(error.response.data)}`);
        alert(`Fix Server error: ${error.response.status} — see logs.`);
      } else {
        logMessage(`Unknown error: ${error.message}`);
        alert("An unknown error occurred during fix process.");
      }
    } finally {
      setLoading(false);
      setShowFixInput(false);
      setFixInstructions(""); // Clear instructions after attempt
    }
  };


  // Main handleFix function acts as a toggle/trigger
  const handleFix = () => {
    // 1. FIRST CLICK: Toggle the input field visibility
    if (!showFixInput) {
      setShowFixInput(true);
      logMessage("Fix mode activated. Enter optional instructions.");
      return;
    }
    
    // 2. SECOND CLICK: Run the asynchronous fix API call
    handleConfirmFix();
  };


  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Code Editor</h2>

      <div className="flex flex-col gap-4">
        <MonacoEditorWrapper code={code} setCode={setCode} />

        <div className="flex flex-col gap-3">
          
          {/* CONDITIONAL INPUT FIELD (The "Pop-up") */}
          {showFixInput && (
            <div className="flex flex-col gap-2 p-3 border border-gray-300 rounded-lg bg-yellow-50">
              <label htmlFor="fix-instruction" className="text-sm font-medium text-gray-700">
                AI Fix Instruction (Optional):
              </label>
              <input
                id="fix-instruction"
                type="text"
                value={fixInstructions}
                onChange={(e) => setFixInstructions(e.target.value)}
                placeholder="e.g., 'Make sure to use an f-string' or 'Change index to stop at n-1'"
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}
          {/* END CONDITIONAL INPUT FIELD */}

          <div className="flex gap-4">
            <button
              onClick={handleCompile}
              disabled={loading || showFixInput} // Disable compile if in fix mode
              className={`px-4 py-2 text-white font-semibold rounded-lg shadow-md transition duration-300 ${
                loading || showFixInput ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Processing..." : "Run / Process Code"}
            </button>

            <button
              onClick={handleFix}
              disabled={loading}
              className={`px-4 py-2 text-white font-semibold rounded-lg shadow-md transition duration-300 ${
                loading ? "bg-gray-400 cursor-not-allowed" : showFixInput ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {showFixInput ? "Confirm AI Fix" : "Fix Error (AI Context)"}
            </button>
          </div>
        </div>

        <LogPanel logs={logs} />
      </div>
    </div>
  );
}

export default CodeEditorPage;