// frontend/src/components/LogPanel.jsx

import React, { useRef, useEffect } from 'react';

function LogPanel({ logs }) {
    const logEndRef = useRef(null);

    // Scroll to the bottom whenever logs change
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
        <div className="bg-gray-900 text-green-400 p-4 font-mono text-xs h-64 overflow-y-scroll rounded-lg shadow-inner border border-gray-700">
            <div className="mb-1 text-white font-bold">
                Terminal Output ({logs.length} lines)
            </div>
            {logs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap">
                    &gt; {log}
                </div>
            ))}
            <div ref={logEndRef} />
        </div>
    );
}

export default LogPanel;