import React, { useEffect, useRef } from 'react';

// Device type assignments for each node index
const DEVICE_TYPES = [
    { type: 'router',      label: 'Router',      color: '#ff4d00' },
    { type: 'switch',      label: 'Switch',      color: '#3b82f6' },
    { type: 'server',      label: 'Server',      color: '#8b5cf6' },
    { type: 'firewall',    label: 'Firewall',    color: '#ef4444' },
    { type: 'workstation', label: 'Endpoint',    color: '#10b981' },
];

// --- Draw device icon functions (all draw centered at 0,0) ---

function drawRouter(ctx, size) {
    const s = size;
    // Router: circle with 4 arrows (compass style)
    ctx.beginPath();
    ctx.arc(0, 0, s, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = DEVICE_TYPES[0].color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw crosshair arrows
    const arrowLen = s * 0.55;
    const headLen = s * 0.2;
    ctx.strokeStyle = DEVICE_TYPES[0].color;
    ctx.fillStyle = DEVICE_TYPES[0].color;
    ctx.lineWidth = 2;

    const directions = [
        [0, -1],  // up
        [0, 1],   // down
        [-1, 0],  // left
        [1, 0],   // right
    ];

    directions.forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(dx * arrowLen, dy * arrowLen);
        ctx.stroke();

        // Arrowhead
        ctx.beginPath();
        if (dx === 0) {
            ctx.moveTo(dx * arrowLen, dy * arrowLen);
            ctx.lineTo(dx * arrowLen - headLen * 0.5, dy * (arrowLen - headLen));
            ctx.lineTo(dx * arrowLen + headLen * 0.5, dy * (arrowLen - headLen));
        } else {
            ctx.moveTo(dx * arrowLen, dy * arrowLen);
            ctx.lineTo(dx * (arrowLen - headLen), dy * arrowLen - headLen * 0.5);
            ctx.lineTo(dx * (arrowLen - headLen), dy * arrowLen + headLen * 0.5);
        }
        ctx.closePath();
        ctx.fill();
    });
}

function drawSwitch(ctx, size) {
    const s = size;
    // Switch: rounded rectangle with connection ports
    const w = s * 2;
    const h = s * 1.2;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 6);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = DEVICE_TYPES[1].color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw port indicators
    const portCount = 4;
    const portWidth = (w - 16) / portCount;
    ctx.fillStyle = DEVICE_TYPES[1].color;
    for (let i = 0; i < portCount; i++) {
        const px = -w / 2 + 8 + i * portWidth + portWidth * 0.15;
        const py = -h / 2 + h * 0.55;
        ctx.fillRect(px, py, portWidth * 0.7, h * 0.2);
    }

    // Horizontal lines (bus bar)
    ctx.strokeStyle = DEVICE_TYPES[1].color + '60';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 6, 0);
    ctx.lineTo(w / 2 - 6, 0);
    ctx.stroke();
}

function drawServer(ctx, size) {
    const s = size;
    // Server: stacked rectangles (rack server look)
    const w = s * 1.6;
    const h = s * 2;
    const slotH = h / 3;

    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 5);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = DEVICE_TYPES[2].color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Three horizontal slots
    for (let i = 0; i < 3; i++) {
        const sy = -h / 2 + i * slotH;
        if (i > 0) {
            ctx.beginPath();
            ctx.moveTo(-w / 2 + 4, sy);
            ctx.lineTo(w / 2 - 4, sy);
            ctx.strokeStyle = DEVICE_TYPES[2].color + '40';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Status LED
        ctx.beginPath();
        ctx.arc(-w / 2 + 10, sy + slotH / 2, 3, 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? '#10b981' : DEVICE_TYPES[2].color + '50';
        ctx.fill();

        // Drive lines
        ctx.fillStyle = DEVICE_TYPES[2].color + '30';
        ctx.fillRect(-w / 2 + 18, sy + slotH / 2 - 2, w * 0.5, 4);
    }
}

function drawFirewall(ctx, size) {
    const s = size;
    // Firewall: shield shape
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.8, -s * 0.8, s, -s * 0.3, s, 0);
    ctx.bezierCurveTo(s, s * 0.5, s * 0.5, s * 0.9, 0, s * 1.1);
    ctx.bezierCurveTo(-s * 0.5, s * 0.9, -s, s * 0.5, -s, 0);
    ctx.bezierCurveTo(-s, -s * 0.3, -s * 0.8, -s * 0.8, 0, -s);
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = DEVICE_TYPES[3].color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Brick pattern inside
    ctx.strokeStyle = DEVICE_TYPES[3].color + '40';
    ctx.lineWidth = 1;
    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(-s * 0.6, -s * 0.3);
    ctx.lineTo(s * 0.6, -s * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.7, s * 0.1);
    ctx.lineTo(s * 0.7, s * 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, s * 0.5);
    ctx.lineTo(s * 0.5, s * 0.5);
    ctx.stroke();

    // Vertical brick offsets
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.65);
    ctx.lineTo(0, -s * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.35, -s * 0.3);
    ctx.lineTo(-s * 0.35, s * 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s * 0.35, -s * 0.3);
    ctx.lineTo(s * 0.35, s * 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, s * 0.1);
    ctx.lineTo(0, s * 0.5);
    ctx.stroke();
}

function drawWorkstation(ctx, size) {
    const s = size;
    // Workstation: monitor + stand
    const monW = s * 1.8;
    const monH = s * 1.2;
    const monY = -s * 0.4;

    // Monitor
    ctx.beginPath();
    ctx.roundRect(-monW / 2, monY - monH / 2, monW, monH, 4);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = DEVICE_TYPES[4].color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Screen (inset)
    ctx.beginPath();
    ctx.roundRect(-monW / 2 + 4, monY - monH / 2 + 4, monW - 8, monH - 8, 2);
    ctx.fillStyle = DEVICE_TYPES[4].color + '15';
    ctx.fill();

    // Stand
    ctx.strokeStyle = DEVICE_TYPES[4].color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, monY + monH / 2);
    ctx.lineTo(0, monY + monH / 2 + s * 0.35);
    ctx.stroke();

    // Base
    ctx.beginPath();
    ctx.moveTo(-s * 0.45, monY + monH / 2 + s * 0.35);
    ctx.lineTo(s * 0.45, monY + monH / 2 + s * 0.35);
    ctx.strokeStyle = DEVICE_TYPES[4].color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Power LED
    ctx.beginPath();
    ctx.arc(monW / 2 - 8, monY + monH / 2 - 6, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();
}

const DRAW_FUNCTIONS = [drawRouter, drawSwitch, drawServer, drawFirewall, drawWorkstation];

const GraphVisualization = ({ nodes, edges }) => {
    const canvasRef = useRef(null);
    const prevEdgesRef = useRef([]);
    const animationRef = useRef(null);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const updateCanvasSize = () => {
            const rect = canvas.parentElement.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
        };
        updateCanvasSize();
        
        const rect = canvas.parentElement.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const prevEdges = prevEdgesRef.current.length > 0 ? prevEdgesRef.current : edges;
        let startTime;
        const duration = 600;

        const nodePositions = {};
        const numNodes = nodes.length;
        const graphRadius = Math.min(width, height) / 2 - 90;
        const centerX = width / 2;
        const centerY = height / 2;

        nodes.forEach((node, i) => {
            const angle = (i / numNodes) * 2 * Math.PI - Math.PI / 2;
            nodePositions[node.id] = {
                x: centerX + graphRadius * Math.cos(angle),
                y: centerY + graphRadius * Math.sin(angle)
            };
        });

        const drawFrame = (timestamp) => {
            if (!startTime) startTime = timestamp;
            let progress = (timestamp - startTime) / duration;
            if (progress > 1) progress = 1;

            ctx.clearRect(0, 0, width, height);

            const maxPheromone = Math.max(
                0.001, 
                ...edges.map(e => e.pheromone),
                ...prevEdges.map(e => e.pheromone)
            );

            // 1. Draw edges with gradient effect
            edges.forEach((targetEdge) => {
                const start = nodePositions[targetEdge.from];
                const end = nodePositions[targetEdge.to];
                if (start && end) {
                    const prevEdge = prevEdges.find(e => e.from === targetEdge.from && e.to === targetEdge.to) || targetEdge;
                    const currentPheromone = prevEdge.pheromone + (targetEdge.pheromone - prevEdge.pheromone) * progress;

                    const baseWidth = 1.5;
                    const extraWidth = (currentPheromone / maxPheromone) * 10; 
                    const opacity = Math.min((currentPheromone / maxPheromone) + 0.1, 1.0);
                    
                    // Glow effect for high-pheromone edges
                    if (opacity > 0.5) {
                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(start.x, start.y);
                        ctx.lineTo(end.x, end.y);
                        ctx.strokeStyle = `rgba(255, 77, 0, ${opacity * 0.15})`;
                        ctx.lineWidth = baseWidth + extraWidth + 8;
                        ctx.stroke();
                        ctx.restore();
                    }

                    ctx.beginPath();
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(end.x, end.y);
                    ctx.strokeStyle = `rgba(255, 77, 0, ${opacity})`;
                    ctx.lineWidth = baseWidth + extraWidth;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                }
            });

            // 2. Draw edge weight labels
            edges.forEach((targetEdge) => {
                const start = nodePositions[targetEdge.from];
                const end = nodePositions[targetEdge.to];
                if (start && end) {
                    const midX = (start.x + end.x) / 2;
                    const midY = (start.y + end.y) / 2;
                    const text = `${targetEdge.weight}`;
                    
                    ctx.font = '600 11px "JetBrains Mono", monospace';
                    const textMetrics = ctx.measureText(text);
                    const paddingX = 6;
                    const paddingY = 4;
                    const textHeight = 11;

                    // Pill background
                    ctx.save();
                    ctx.shadowColor = 'rgba(0,0,0,0.06)';
                    ctx.shadowBlur = 4;
                    ctx.shadowOffsetY = 1;
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.roundRect(
                        midX - (textMetrics.width / 2) - paddingX,
                        midY - (textHeight / 2) - paddingY,
                        textMetrics.width + (paddingX * 2),
                        textHeight + (paddingY * 2),
                        10
                    );
                    ctx.fill();
                    ctx.strokeStyle = '#e0e0de';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    ctx.restore();

                    ctx.fillStyle = '#666666';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(text, midX, midY);
                }
            });

            // 3. Draw device nodes
            nodes.forEach((node) => {
                const pos = nodePositions[node.id];
                const deviceIndex = node.id % DEVICE_TYPES.length;
                const device = DEVICE_TYPES[deviceIndex];
                const drawFn = DRAW_FUNCTIONS[deviceIndex];
                const nodeSize = 22;

                ctx.save();
                
                // Drop shadow
                ctx.save();
                ctx.shadowColor = 'rgba(0,0,0,0.08)';
                ctx.shadowBlur = 12;
                ctx.shadowOffsetY = 4;
                
                // White background circle for device area
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, nodeSize + 10, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                ctx.strokeStyle = device.color + '30';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();

                // Draw the device icon
                ctx.save();
                ctx.translate(pos.x, pos.y);
                drawFn(ctx, nodeSize);
                ctx.restore();

                // Node ID label (below the device)
                ctx.fillStyle = device.color;
                ctx.font = '700 11px "Inter", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(`N${node.id}`, pos.x, pos.y + nodeSize + 14);

                // Device type label (below node ID)
                ctx.fillStyle = '#999999';
                ctx.font = '500 9px "Inter", sans-serif';
                ctx.fillText(device.label, pos.x, pos.y + nodeSize + 27);

                ctx.restore();
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
