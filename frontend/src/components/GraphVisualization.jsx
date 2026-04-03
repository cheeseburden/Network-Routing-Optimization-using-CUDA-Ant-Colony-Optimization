import React, { useEffect, useRef } from 'react';

const GraphVisualization = ({ nodes, edges }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Compute positions (simple hardcoded circle for nodes)
        const nodePositions = {};
        const numNodes = nodes.length;
        const radius = Math.min(width, height) / 2 - 40;
        const centerX = width / 2;
        const centerY = height / 2;

        nodes.forEach((node, i) => {
            const angle = (i / numNodes) * 2 * Math.PI - Math.PI / 2;
            nodePositions[node.id] = {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });

        // Draw edges
        edges.forEach(edge => {
            const start = nodePositions[edge.from];
            const end = nodePositions[edge.to];
            if (start && end) {
                // Determine line width based on pheromone level (0 to 1)
                const baseWidth = 1;
                const extraWidth = edge.pheromone * 5;
                
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                
                // Color based on pheromone: more pheromone = more prominent blue
                ctx.strokeStyle = `rgba(30, 64, 175, ${edge.pheromone + 0.1})`;
                ctx.lineWidth = baseWidth + extraWidth;
                ctx.stroke();

                // Draw edge weight
                const midX = (start.x + end.x) / 2;
                const midY = (start.y + end.y) / 2;
                ctx.fillStyle = '#6b7280';
                ctx.font = '12px Inter, sans-serif';
                ctx.fillText(`C:${edge.weight}`, midX, midY);
            }
        });

        // Draw nodes
        nodes.forEach((node) => {
            const pos = nodePositions[node.id];
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 20, 0, 2 * Math.PI);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = '#1e3a8a';
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`N${node.id}`, pos.x, pos.y);
        });

    }, [nodes, edges]);

    return (
        <div className="canvas-container" style={{ width: '100%', height: '100%' }}>
            <canvas ref={canvasRef} width={800} height={600} className="graph-canvas"></canvas>
        </div>
    );
};

export default GraphVisualization;
