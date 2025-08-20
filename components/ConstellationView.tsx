import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { DiaryEntry } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface ConstellationViewProps {
    entries: DiaryEntry[];
    onLoadEntry: (entry: DiaryEntry) => void;
}

export const ConstellationView = ({ entries, onLoadEntry }: ConstellationViewProps) => {
    const fgRef = useRef(null);
    const { theme } = useTheme();
    const [graphDimensions, setGraphDimensions] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setGraphDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const graphData = useMemo(() => {
        const nodes: any[] = [];
        const links: any[] = [];

        entries.forEach(entry => {
            if (!entry) return;
            // Entry node
            nodes.push({
                id: `entry-${entry.id}`,
                name: entry.title,
                val: 12 + (entry.echoes?.length || 0) * 1.5,
                color: theme === 'dark' ? '#f59e0b' : '#d97706', // amber-500, amber-600
                isEntry: true,
                data: entry,
            });

            if (entry.echoes) {
                entry.echoes.forEach(echo => {
                    if (!echo) return;
                    // Echo node
                    nodes.push({
                        id: `echo-${echo.id}`,
                        name: echo.author,
                        val: 5,
                        color: theme === 'dark' ? '#a78bfa' : '#8b5cf6', // violet-400, violet-500
                        isEntry: false,
                        data: echo,
                    });
                    // Link from echo to entry
                    links.push({
                        source: `echo-${echo.id}`,
                        target: `entry-${entry.id}`,
                    });
                });
            }
        });

        return { nodes, links };
    }, [entries, theme]);

    const handleNodeClick = useCallback((node: any) => {
        if (node.isEntry && node.data) {
            onLoadEntry(node.data);
        } else if (node.data) {
            alert(`Echo: ${node.data.author}\n"${node.data.text}"`);
        }
        // Center on clicked node
        if (fgRef.current) {
            const fg = fgRef.current as any;
            fg.centerAt(node.x, node.y, 1000);
            fg.zoom(2.5, 1000);
        }
    }, [onLoadEntry]);

    const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const label = node.name;
        const fontSize = (node.isEntry ? 12 : 8) / globalScale;
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        
        const r = node.val / 2;

        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
        ctx.fillStyle = node.color;
        ctx.fill();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.9)';
        
        // Simple text wrapping
        const lineheight = fontSize * 1.2;
        const words = label.split(' ');
        let line = '';
        const y = node.y - (words.length > 2 ? lineheight / 2 : 0);

        for(let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > r * 3 && n > 0) {
                ctx.fillText(line, node.x, y);
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, node.x, y);


    }, [theme]);

    return (
        <div ref={containerRef} className="w-full h-[40rem] bg-stone-50/50 dark:bg-stone-900/50 rounded-lg border-2 border-dashed border-amber-300 dark:border-stone-600 overflow-hidden">
             {graphDimensions.width > 0 && (
                <ForceGraph2D
                    ref={fgRef}
                    width={graphDimensions.width}
                    height={graphDimensions.height}
                    graphData={graphData}
                    nodeRelSize={2}
                    nodeCanvasObject={nodeCanvasObject}
                    onNodeClick={handleNodeClick}
                    linkWidth={1}
                    linkColor={() => theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                    linkDirectionalParticles={1}
                    linkDirectionalParticleWidth={1.5}
                    linkDirectionalParticleColor={() => theme === 'dark' ? '#f59e0b' : '#d97706'}
                    cooldownTicks={100}
                    onEngineStop={() => (fgRef.current as any)?.zoomToFit(400, 100)}
                />
            )}
        </div>
    );
};