import React from "react";

// CanvasPage.jsx
const CanvasPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7] dark:bg-[#0d0d0d]">
      <Navbar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto h-[85vh]">
          <header className="mb-6">
            <h1 className="text-3xl font-black">Thought Canvas</h1>
            <p className="text-zinc-500">Connect your notes spatially.</p>
          </header>
          <MindMap />
        </div>
      </div>
    </div>
  );
};
export default CanvasPage;
