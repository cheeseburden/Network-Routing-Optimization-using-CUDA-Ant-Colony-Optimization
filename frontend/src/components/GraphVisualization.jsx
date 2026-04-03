import React, { useEffect, useRef } from 'react';

const GraphVisualization = ({ nodes, edges }) => {
    const canvasRef = useRef(null);
    const prevEdgesRef = useRef([]);
    const animationRef = useRef(null);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Dynamically resize internal resolution to match container for crisp rendering
        const updateCanvasSize = () => {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };
        updateCanvasSize();
        
        const width = canvas.width;
        const height = canvas.height;

        const prevEdges = prevEdgesRef.current.length > 0 ? prevEdgesRef.current : edges;
        let startTime;
        const duration = 600;

        const nodePositions = {};
        const numNodes = nodes.length;
        const radius = Math.min(width, height) / 2 - 80;
        const centerX = width / 2;
        const centerY = height / 2;

        nodes.forEach((node, i) => {
            const angle = (i / numNodes) * 2 * Math.PI - Math.PI / 2;
            nodePositions[node.id] = {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });

        const drawFrame = (timestamp) => {
            if (!startTime) startTime = timestamp;
            let progress = (timestamp - startTime) / duration;
            if (progress > 1) progress = 1;

            ctx.clearRect(0, 0, width, height);

            // Find max pheromone across both current and previous frames to accurately normalize thickness
            const maxPheromone = Math.max(
                0.001, 
                ...edges.map(e => e.pheromone),
                ...prevEdges.map(e => e.pheromone)
            );

            // 1. Draw edges
            edges.forEach((targetEdge) => {
                const start = nodePositions[targetEdge.from];
                const end = nodePositions[targetEdge.to];
                if (start && end) {
                    const prevEdge = prevEdges.find(e => e.from === targetEdge.from && e.to === targetEdge.to) || targetEdge;
                    const currentPheromone = prevEdge.pheromone + (targetEdge.pheromone - prevEdge.pheromone) * progress;

                    const baseWidth = 1.5;
                    // Normalize to max 12 pixels wide
                    const extraWidth = (currentPheromone / maxPheromone) * 12; 
                    
                    ctx.beginPath();
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(end.x, end.y);
                    
                    // Uses vibrant Orange/Red for the active aesthetic
                    const opacity = Math.min((currentPheromone / maxPheromone) + 0.1, 1.0);
                    ctx.strokeStyle = `rgba(255, 77, 0, ${opacity})`;
                    ctx.lineWidth = baseWidth + extraWidth;
                    ctx.stroke();
                }
            });

            // 2. Draw edge weights (with solid background pills for legibility)
            edges.forEach((targetEdge) => {
                const start = nodePositions[targetEdge.from];
                const end = nodePositions[targetEdge.to];
                if (start && end) {
                    const midX = (start.x + end.x) / 2;
                    const midY = (start.y + end.y) / 2;
                    const text = `C: ${targetEdge.weight}`;
                    
                    ctx.font = '600 12px "JetBrains Mono", monospace';
                    const textMetrics = ctx.measureText(text);
                    const paddingX = 8;
                    const paddingY = 4;
                    const textHeight = 12; // approximate
                    
                    // Draw Pill
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.roundRect(midX - (textMetrics.width/2) - paddingX, midY - (textHeight/2) - paddingY, textMetrics.width + (paddingX*2), textHeight + (paddingY*2), 6);
                    ctx.fill();
                    ctx.strokeStyle = '#e0e0de';
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    // Draw Text
                    ctx.fillStyle = '#666666';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(text, midX, midY);
                }
            });

            // 3. Draw nodes
            nodes.forEach((node) => {
                const pos = nodePositions[node.id];
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 24, 0, 2 * Math.PI);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                ctx.strokeStyle = '#141414';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = '#141414';
                ctx.font = '600 15px "JetBrains Mono", monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`N${node.id}`, pos.x, pos.y);
            });

            if (progress < 1) {
                 animationRef.current = requestAnimationFrame(drawFrame);
            } else {
                 prevEdgesRef.current = edges;
            }
        };

        if(animationRef.current) cancelAnimationFrame(animationRef.current);
        animationRef.current = requestAnimationFrame(drawFrame);

        return () => {
            if(animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [nodes, edges]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }}></canvas>
        </div>
    );
};

export default GraphVisualization;
