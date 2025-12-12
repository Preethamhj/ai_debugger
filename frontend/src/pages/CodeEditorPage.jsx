// frontend/src/pages/CodeEditorPage.jsx

import React, { useState, useCallback } from 'react';
import MonacoEditorWrapper from '../components/MonacoEditorWrapper.jsx';
import LogPanel from '../components/LogPanel.jsx';
import axios from 'axios'; // <-- 1. IMPORT AXIOS

// Define the API URL
const API_URL = "http://localhost:8000/upload-code";

function CodeEditorPage() {
    const initialCode = `def add(a, b):\n  return a + b\n\n# Example usage\nprint(add(5, 3))`;
    
    const [code, setCode] = useState(initialCode);
    const [logs, setLogs] = useState([]);
    
    const logMessage = useCallback((message) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
    }, []);

    // 2. MAKE FUNCTION ASYNCHRONOUS
    const handleCompile = async () => { 
        logMessage("Starting compilation...");
        logMessage(`Sending code to API: ${API_URL}`);
        
        // 3. USE AXIOS.POST TO SEND CODE CONTENT
        try {
            const response = await axios.post(API_URL, {
                // The key 'code' must match what your FastAPI backend expects in the request body.
                code: code 
            });

            logMessage(`API Response Status: ${response.status}`);
            
            // Log the data returned by the backend
            console.log("Backend response:", response.data);
            
            logMessage("Code compiled/uploaded successfully.");
            alert("Compilation Successful!");

        } catch (error) {
            logMessage(`ERROR: Failed to connect or upload code.`);
            
            // Check for connection refusal (backend not running)
            if (error.code === 'ERR_NETWORK' || error.message.includes('ECONNREFUSED')) {
                logMessage("FATAL ERROR: Connection refused. Is the FastAPI server running on http://localhost:8000?");
                alert("Compilation Failed: Backend server is not running or unreachable.");
            } else {
                logMessage(`API Error: ${error.message}`);
                alert("Compilation Failed: Check terminal log for API error.");
            }
        }
    };

    const handleFix = () => {
        // ... (handleFix logic remains the same for now)
        const simulatedError = "ERROR: Missing argument 'c' in function call on line 6.";
        const simulatedPatch = "def add(a, b):\n  return a + b";
        
        // 1. Log the action
        logMessage("Sending code to AI for fix...");
        
        // 2. Build the pop-up message with error and patch
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

        // 3. Display the confirmation dialog
        const shouldApplyFix = window.confirm(alertMessage); // window.confirm displays the OK/Cancel dialog

        if (shouldApplyFix) {
            // Simulate receiving a patched fix and applying it (e.g., replacing 'add' with 'subtract')
            // NOTE: In a real app, you would use a proper diff algorithm here.
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
                {/* 1. CODE EDITOR */}
                <MonacoEditorWrapper 
                    code={code} 
                    setCode={setCode} 
                />

                {/* 2. CONTROLS */}
                <div className="flex gap-4">
                    <button 
                        onClick={handleCompile}
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                    >
                        Compile Code (Simulated)
                    </button>
                    
                    <button 
                        onClick={handleFix}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300"
                    >
                        Fix Error (Simulated Patch)
                    </button>
                </div>

                {/* 3. LOG PANEL */}
                <LogPanel logs={logs} />
            </div>
        </div>
    );
}

export default CodeEditorPage;