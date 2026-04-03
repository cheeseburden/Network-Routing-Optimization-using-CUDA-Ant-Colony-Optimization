import React, { useState, useEffect } from 'react';
import GraphVisualization from './components/GraphVisualization';
import Controls from './components/Controls';
import AlgorithmExplanation from './components/AlgorithmExplanation';
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
  const [status, setStatus] = useState("Awaiting optimization initialization.");
  const [iteration, setIteration] = useState(0);
  const [optimalPath, setOptimalPath] = useState([]);

  // Dynamically trace the path with highest pheromones from start to end
  useEffect(() => {
    let current = 0;
    const dest = 4;
    const path = [0];
    const visited = new Set([0]);

    while (current !== dest && path.length < nodes.length) {
       // get all outgoing edges from current
       const outgoing = edges.filter(e => e.from === current && !visited.has(e.to));
       if (outgoing.length === 0) break;
       
       // pick the edge with max pheromone
       const bestEdge = outgoing.reduce((max, e) => (e.pheromone > max.pheromone ? e : max), outgoing[0]);
       
       current = bestEdge.to;
       path.push(current);
       visited.add(current);
    }
    setOptimalPath(path);
  }, [edges, nodes.length]);

  const animateSnapshots = (snapshots) => {
      let currentFrame = 0;
      
      const interval = setInterval(() => {
          if (currentFrame < snapshots.length) {
              setEdges(snapshots[currentFrame]);
              setIteration(Math.floor((currentFrame / (snapshots.length - 1)) * 100));
              currentFrame++;
          } else {
              clearInterval(interval);
              setLoading(false);
          }
      }, 700); 
  };

  const handleOptimize = async () => {
      setLoading(true);
      setIteration(0);
      setStatus("Computing algorithmic iterations in native Engine...");
      try {
          const response = await fetch('http://localhost:8000/optimize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
          });
          const data = await response.json();
          
          if(data.data.snapshots && data.data.snapshots.length > 0) {
             setStatus(data.data.message);
             animateSnapshots(data.data.snapshots);
          } else {
             setStatus("Error: No snapshots received.");
             setLoading(false);
          }
          
      } catch (error) {
          console.error("Error running optimization:", error);
          setStatus("Error connecting to backend kernel.");
          setLoading(false);
      }
  };

  return (
    <div className="bento-dashboard">
      <nav className="bento-nav">
        <h1 className="logo">NET<span className="weight-light">OPTIMA</span></h1>
        <div className="nav-subtitle">CUDA / Numba ACO Rendering Engine</div>
      </nav>

      <main className="bento-grid">
        
        {/* Graph Main Card */}
        <div className="bento-card bento-graph-card">
            <div className="card-header">
                <h2>Network Topography</h2>
                <span className="iteration-badge">{iteration}% Iterated</span>
            </div>
            <div className="graph-container">
                <GraphVisualization nodes={nodes} edges={edges} />
            </div>
            <div className="path-display-bar">
                <h3>Dominant Route Traversal</h3>
                <div className="path-sequence">
                    {optimalPath.map((n, i) => (
                        <React.Fragment key={i}>
                            <span className="path-node">N{n}</span>
                            {i < optimalPath.length - 1 && <span className="path-arrow">→</span>}
                        </React.Fragment>
                    ))}
                    {optimalPath[optimalPath.length-1] !== 4 && <span className="path-status path-failed"> (Search Diverged)</span>}
                    {optimalPath[optimalPath.length-1] === 4 && <span className="path-status path-success"> (Destination Reached)</span>}
                </div>
            </div>
        </div>

        {/* Right Sidebar Elements */}
        <div className="bento-sidebar">
            <div className="bento-card bento-control-card">
                <Controls onOptimize={handleOptimize} loading={loading} />
                <div className="status-indicator">
                    <span className={`status-dot ${loading ? 'pulsing' : 'idle'}`}></span>
                    <p>{status}</p>
                </div>
            </div>

            <div className="bento-card bento-explanation-card">
                <AlgorithmExplanation />
            </div>
        </div>

      </main>
    </div>
  );
}

export default App;
