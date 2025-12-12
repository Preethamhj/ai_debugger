// frontend/src/App.jsx

import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom'; 

import HomePage from './pages/HomePage.jsx'; 
import CodeEditorPage from './pages/CodeEditorPage.jsx'; 

function App() {
  return (
    <Router>
        <header className="bg-gray-100 p-4 shadow-sm border-b">
            <h1 className="text-xl font-bold text-indigo-700">AI Debugger UI</h1>
        </header>
        <div className="p-4">
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/editor" element={<CodeEditorPage />} />
            </Routes>
        </div>
    </Router>
  );
}

export default App;