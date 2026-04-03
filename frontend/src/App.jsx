import React, { useState } from 'react';
import GraphVisualization from './components/GraphVisualization';
import Controls from './components/Controls';
import './App.css';

function App() {
  const [nodes, setNodes] = useState([
      { id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }
  ]);
  
  const [edges, setEdges] = useState([
      { from: 0, to: 1, pheromone: 0.1, weight: 10 },
      { from: 0, to: 2, pheromone: 0.1, weight: 5 },
      { from: 1, to: 3, pheromone: 0.1, weight: 10 },
      { from: 2, to: 3, pheromone: 0.1, weight: 20 },
      { from: 2, to: 1, pheromone: 0.1, weight: 2 },
      { from: 3, to: 4, pheromone: 0.1, weight: 5 }
  ]);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Ready to optimize");

  const handleOptimize = async () => {
      setLoading(true);
      setStatus("Invoking Backend API...");
      try {
          const response = await fetch('http://localhost:8000/optimize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
          });
          const data = await response.json();
          
          if(data.data.mocked) {
             setStatus(`Success (Using Mocked Data - ${data.data.message || 'CUDA backend not found'})`);
             setEdges(data.data.edges);
          } else {
             setStatus(`Success! Numba CUDA results received.`);
             setEdges(data.data.edges);
          }
      } catch (error) {
          console.error("Error running optimization:", error);
          setStatus("Error connecting to backend.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="dashboard">
      <header className="header">
        <div className="logo">NetOptima</div>
        <h1>CUDA ACO Routing Dashboard</h1>
      </header>
      <main className="content">
        <div className="left-panel">
            <Controls onOptimize={handleOptimize} loading={loading} />
            <div className={`status ${loading ? 'status-loading' : 'status-ready'}`}>
                Status: {status}
            </div>
        </div>
        <div className="right-panel">
            <GraphVisualization nodes={nodes} edges={edges} />
        </div>
      </main>
    </div>
  );
}

export default App;
