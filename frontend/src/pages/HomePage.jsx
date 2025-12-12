// frontend/src/pages/HomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="max-w-xl mx-auto p-8 text-center mt-20">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Welcome to the Autonomous Debugger
      </h1>
      <p className="text-gray-600 mb-8">
        Home page content will go here. Click below to start debugging.
      </p>
      
      <Link to="/editor">
        <button 
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
        >
          Get Started
        </button>
      </Link>
    </div>
  );
}

export default HomePage;