import React from 'react';
import { SparklesPreview } from '../components/SparklesPreview.jsx'; 

function HomePage() {
  return (
    // h-full will now fill the entire screen because App.jsx uses h-screen.
    // The complex calc() and negative margins are no longer needed.
    <div className="h-full w-full"> 
      <SparklesPreview />
    </div>
  );
}

export default HomePage;