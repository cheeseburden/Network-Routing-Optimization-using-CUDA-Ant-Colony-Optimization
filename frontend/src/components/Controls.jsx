import React from 'react';

const Controls = ({ onOptimize, loading }) => {
    return (
        <div className="controls-panel">
            <h2>Optimization Controls</h2>
            <p className="description">
                Click below to invoke the Ant Colony Optimization algorithm. 
                The system will simulate the paths traversing the network graph, updating pheromones over time.
            </p>
            <div className="button-group">
                <button 
                    onClick={onOptimize} 
                    disabled={loading}
                    className="btn btn-primary"
                >
                    {loading ? 'Running Optimization...' : 'Run CUDA Optimization'}
                </button>
            </div>
        </div>
    );
};

export default Controls;
