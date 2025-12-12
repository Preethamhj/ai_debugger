// frontend/src/components/SparklesPreview.jsx
"use client";
import React from "react";
import { SparklesCore } from "./ui/sparkles";
import { Link } from 'react-router-dom';

export function SparklesPreview() {
  return (
    // Main container is full screen and centers the content
    <div className="h-full w-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Sparkles and Gradients Container (Expanded Focus in the Center)
        - Size increased to w-[95%] h-[95%] to almost cover the whole screen
        - Positioning remains perfectly centered
      */}
      <div className="w-[95%] h-[95%] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"> 
        
        {/* Gradients (The blue line animation effect)
            We've kept these gradients spanning the new, larger container (w-full/inset-x-0)
            to ensure the line effect is also widespread.
        */}
        <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-full blur-sm" />
        <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-full" />

        {/* Core component: Sparkles background */}
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1.2}
          // Particle density remains at 1000, which is high for the new large area
          particleDensity={1000} 
          className="w-full h-full absolute inset-0"
          particleColor="#FFFFFF"
        />

        {/* Radial Gradient mask (Now only fading out near the very edges) */}
        <div className="absolute inset-0 w-full h-full bg-slate-950 [mask-image:radial-gradient(400px_300px_at_center,transparent_0%,#0f172a_80%)]"></div>
      </div>
      
      {/* Content over sparkles - Centered for alignment */}
      <div className="flex flex-col items-center justify-center relative z-20 text-center w-full h-full pt-12 pb-12"> 
        
        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 mb-6 leading-tight">
          Autonomous<br />Debugging
        </h1>

        {/* Descriptive Text */}
        <p className="text-lg md:text-xl text-neutral-300 max-w-3xl mt-4 mb-16 px-4">
          The Local AI-Supervised Sandbox: Automatically detect, analyze, and repair errors in your code, all running offline.
        </p>
        
        {/* Button */}
        <Link to="/editor">
          <button 
            className="px-8 py-3 bg-indigo-600 text-lg font-semibold text-white rounded-lg shadow-xl hover:bg-indigo-500 transition duration-300 transform hover:scale-105"
          >
            Start Debugging Now
          </button>
        </Link>
      </div>
    </div>
  );
}