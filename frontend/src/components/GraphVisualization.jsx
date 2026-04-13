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
    ctx.beginPath();
    ctx.arc(0, 0, s, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = DEVICE_TYPES[0].color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    const arrowLen = s * 0.55;
    const headLen = s * 0.2;
    ctx.strokeStyle = DEVICE_TYPES[0].color;
    ctx.fillStyle = DEVICE_TYPES[0].color;
    ctx.lineWidth = 2;

    const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    directions.forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(dx * arrowLen, dy * arrowLen);
        ctx.stroke();
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
    const w = s * 2;
    const h = s * 1.2;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 6);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = DEVICE_TYPES[1].color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    const portCount = 4;
    const portWidth = (w - 16) / portCount;
    ctx.fillStyle = DEVICE_TYPES[1].color;
    for (let i = 0; i < portCount; i++) {
        const px = -w / 2 + 8 + i * portWidth + portWidth * 0.15;
        const py = -h / 2 + h * 0.55;
        ctx.fillRect(px, py, portWidth * 0.7, h * 0.2);
    }
    ctx.strokeStyle = DEVICE_TYPES[1].color + '60';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 6, 0);
    ctx.lineTo(w / 2 - 6, 0);
    ctx.stroke();
}

function drawServer(ctx, size) {
    const s = size;
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
        ctx.beginPath();
        ctx.arc(-w / 2 + 10, sy + slotH / 2, 3, 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? '#10b981' : DEVICE_TYPES[2].color + '50';
        ctx.fill();
        ctx.fillStyle = DEVICE_TYPES[2].color + '30';
        ctx.fillRect(-w / 2 + 18, sy + slotH / 2 - 2, w * 0.5, 4);
    }
}

function drawFirewall(ctx, size) {
    const s = size;
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

    ctx.strokeStyle = DEVICE_TYPES[3].color + '40';
    ctx.lineWidth = 1;
    [[-0.6, -0.3, 0.6, -0.3], [-0.7, 0.1, 0.7, 0.1], [-0.5, 0.5, 0.5, 0.5]].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath(); ctx.moveTo(s * x1, s * y1); ctx.lineTo(s * x2, s * y2); ctx.stroke();
    });
    [[0, -0.65, 0, -0.3], [-0.35, -0.3, -0.35, 0.1], [0.35, -0.3, 0.35, 0.1], [0, 0.1, 0, 0.5]].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath(); ctx.moveTo(s * x1, s * y1); ctx.lineTo(s * x2, s * y2); ctx.stroke();
    });
}

function drawWorkstation(ctx, size) {
    const s = size;
    const monW = s * 1.8;
    const monH = s * 1.2;
    const monY = -s * 0.4;

    ctx.beginPath();
    ctx.roundRect(-monW / 2, monY - monH / 2, monW, monH, 4);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = DEVICE_TYPES[4].color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(-monW / 2 + 4, monY - monH / 2 + 4, monW - 8, monH - 8, 2);
    ctx.fillStyle = DEVICE_TYPES[4].color + '15';
    ctx.fill();

    ctx.strokeStyle = DEVICE_TYPES[4].color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, monY + monH / 2);
    ctx.lineTo(0, monY + monH / 2 + s * 0.35);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-s * 0.45, monY + monH / 2 + s * 0.35);
    ctx.lineTo(s * 0.45, monY + monH / 2 + s * 0.35);
    ctx.strokeStyle = DEVICE_TYPES[4].color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(monW / 2 - 8, monY + monH / 2 - 6, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();
}

const DRAW_FUNCTIONS = [drawRouter, drawSwitch, drawServer, drawFirewall, drawWorkstation];

// --- Packet animation helpers ---
function computePathSegments(optimalPath, nodePositions) {
    const segments = [];
    let totalLength = 0;
    for (let i = 0; i < optimalPath.length - 1; i++) {
        const from = nodePositions[optimalPath[i]];
        const to = nodePositions[optimalPath[i + 1]];
        if (!from || !to) continue;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        segments.push({ from, to, length: len, startDist: totalLength });
        totalLength += len;
    }
    return { segments, totalLength };
}

function drawPackets(ctx, timestamp, segments, totalLength) {
    if (totalLength <= 0 || segments.length === 0) return;

    const numPackets = 4;
    const speed = 0.07; // pixels per ms

    for (let p = 0; p < numPackets; p++) {
        const offset = (p / numPackets) * totalLength;
        const dist = ((timestamp * speed) + offset) % totalLength;

        // Find which segment this packet is on
        let seg = segments[segments.length - 1];
        for (const s of segments) {
            if (dist >= s.startDist && dist < s.startDist + s.length) {
                seg = s;
                break;
            }
        }

        const localDist = dist - seg.startDist;
        const t = Math.min(localDist / seg.length, 1);
        const x = seg.from.x + (seg.to.x - seg.from.x) * t;
        const y = seg.from.y + (seg.to.y - seg.from.y) * t;

        // Draw trail (3 fading dots behind)
        const trailCount = 3;
        const trailSpacing = 12;
        for (let tr = trailCount; tr >= 1; tr--) {
            const trailDist = ((dist - tr * trailSpacing) + totalLength) % totalLength;
            let trSeg = segments[segments.length - 1];
            for (const s of segments) {
                if (trailDist >= s.startDist && trailDist < s.startDist + s.length) {
                    trSeg = s;
                    break;
                }
            }
            const trLocalDist = trailDist - trSeg.startDist;
            const trT = Math.min(trLocalDist / trSeg.length, 1);
            const trX = trSeg.from.x + (trSeg.to.x - trSeg.from.x) * trT;
            const trY = trSeg.from.y + (trSeg.to.y - trSeg.from.y) * trT;

            const trailAlpha = 0.15 * (1 - tr / (trailCount + 1));
            ctx.beginPath();
            ctx.arc(trX, trY, 3.5 - tr * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 77, 0, ${trailAlpha})`;
            ctx.fill();
        }

        // Outer glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 18);
        gradient.addColorStop(0, 'rgba(255, 77, 0, 0.35)');
        gradient.addColorStop(0.5, 'rgba(255, 77, 0, 0.08)');
        gradient.addColorStop(1, 'rgba(255, 77, 0, 0)');
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Inner solid dot
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ff4d00';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}


const GraphVisualization = ({ nodes, edges, optimalPath, animatePackets, layout = 'circular' }) => {
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
        let edgeTransitionStart = null;
        const edgeDuration = 600;

        const nodePositions = {};
        const numNodes = nodes.length;
        const centerX = width / 2;
        const centerY = height / 2;

        if (layout === 'horizontal') {
            // Horizontal line layout for bus/linear topologies
            const padding = 90;
            const usableWidth = width - padding * 2;
            nodes.forEach((node, i) => {
                nodePositions[node.id] = {
                    x: padding + (i / Math.max(numNodes - 1, 1)) * usableWidth,
                    y: centerY
                };
            });
        } else {
            // Default circular layout
            const graphRadius = Math.min(width, height) / 2 - 90;
            nodes.forEach((node, i) => {
                const angle = (i / numNodes) * 2 * Math.PI - Math.PI / 2;
                nodePositions[node.id] = {
                    x: centerX + graphRadius * Math.cos(angle),
                    y: centerY + graphRadius * Math.sin(angle)
                };
            });
        }

        // Precompute path segments for packet animation
        let pathData = { segments: [], totalLength: 0 };
        if (optimalPath && optimalPath.length > 1) {
            pathData = computePathSegments(optimalPath, nodePositions);
        }

        const drawFrame = (timestamp) => {
            if (!edgeTransitionStart) edgeTransitionStart = timestamp;
            let edgeProgress = (timestamp - edgeTransitionStart) / edgeDuration;
            if (edgeProgress > 1) edgeProgress = 1;

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
                    const currentPheromone = prevEdge.pheromone + (targetEdge.pheromone - prevEdge.pheromone) * edgeProgress;

                    const baseWidth = 1.5;
                    const extraWidth = (currentPheromone / maxPheromone) * 10; 
                    const opacity = Math.min((currentPheromone / maxPheromone) + 0.1, 1.0);
                    
                    // Glow for high pheromone
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

            // 3. Draw packet animation (behind nodes, in front of edges)
            if (animatePackets && pathData.totalLength > 0) {
                drawPackets(ctx, timestamp, pathData.segments, pathData.totalLength);
            }

            // 4. Draw device nodes
            nodes.forEach((node) => {
                const pos = nodePositions[node.id];
                const deviceIndex = node.id % DEVICE_TYPES.length;
                const device = DEVICE_TYPES[deviceIndex];
                const drawFn = DRAW_FUNCTIONS[deviceIndex];
                const nodeSize = 22;

                ctx.save();
                
                ctx.save();
                ctx.shadowColor = 'rgba(0,0,0,0.08)';
                ctx.shadowBlur = 12;
                ctx.shadowOffsetY = 4;
                
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, nodeSize + 10, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                ctx.strokeStyle = device.color + '30';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();

                ctx.save();
                ctx.translate(pos.x, pos.y);
                drawFn(ctx, nodeSize);
                ctx.restore();

                ctx.fillStyle = device.color;
                ctx.font = '700 11px "Inter", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(`N${node.id}`, pos.x, pos.y + nodeSize + 14);

                ctx.fillStyle = '#999999';
                ctx.font = '500 9px "Inter", sans-serif';
                ctx.fillText(device.label, pos.x, pos.y + nodeSize + 27);

                ctx.restore();
            });

            // Keep animating if edge transition isn't done OR packets are active
            if (edgeProgress < 1 || animatePackets) {
                if (edgeProgress >= 1) {
                    prevEdgesRef.current = edges;
                }
                animationRef.current = requestAnimationFrame(drawFrame);
            } else {
                prevEdgesRef.current = edges;
            }
        };

        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        animationRef.current = requestAnimationFrame(drawFrame);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [nodes, edges, optimalPath, animatePackets, layout]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }}></canvas>
        </div>
    );
};

export default GraphVisualization;
