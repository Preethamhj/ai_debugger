import React from 'react';
import Editor from '@monaco-editor/react';

function MonacoEditorWrapper({ code, setCode, language = 'python' }) {
    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden shadow-lg">
            <Editor
                height="60vh"
                defaultLanguage={language}
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{ 
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                }}
            />
        </div>
    );
}

export default MonacoEditorWrapper;