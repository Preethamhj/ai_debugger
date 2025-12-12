import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom'; 

import HomePage from './pages/HomePage.jsx'; 
import CodeEditorPage from './pages/CodeEditorPage.jsx'; 

function App() {
  return (
    <Router>
        {/* Removed the theme-breaking header component */}
        {/* Set container to full screen height and width with no padding */}
        <div className="h-screen w-screen"> 
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/editor" element={<CodeEditorPage />} />
            </Routes>
        </div>
    </Router>
  );
}

export default App;