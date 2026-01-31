import React, { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';

const InsightGraph = ({ entries, models, secondBrain }) => {
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // 1. PROCESS DATA INTO GRAPH FORMAT
  const graphData = useMemo(() => {
    const nodes = [];
    const links = [];
    const keywords = ['focus', 'sleep', 'anxiety', 'energy', 'habit', 'decision', 'fear', 'goal', 'time'];

    // -- Create Nodes --

    // A. Central "ME" Node
    nodes.push({ id: 'me', group: 'core', radius: 30, label: 'Me' });

    // B. Mode Nodes (Clusters)
    const modes = ['observe', 'pattern', 'question', 'action'];
    modes.forEach(m => {
      nodes.push({ id: `mode-${m}`, group: 'mode', radius: 20, label: m });
      links.push({ source: 'me', target: `mode-${m}`, value: 2 });
    });

    // C. Entry Nodes
    entries.forEach(e => {
      const nodeId = `entry-${e.id}`;
      // Truncate text for label
      const label = e.text.length > 20 ? e.text.substring(0, 20) + '...' : e.text;
      
      nodes.push({ 
        id: nodeId, 
        group: 'entry', 
        radius: 8, 
        label, 
        fullText: e.text, 
        mode: e.mode,
        date: new Date(e.ts).toLocaleDateString()
      });

      // Link to Mode
      links.push({ source: `mode-${e.mode}`, target: nodeId, value: 1 });

      // Link to Model (if any)
      if (e.model) {
        // Check if model node exists, if not create it
        let modelNodeId = `model-${e.model}`;
        if (!nodes.find(n => n.id === modelNodeId)) {
          nodes.push({ id: modelNodeId, group: 'model', radius: 15, label: e.model });
          // Link model to ME lightly
          links.push({ source: 'me', target: modelNodeId, value: 1 }); 
        }
        links.push({ source: nodeId, target: modelNodeId, value: 3 }); // Strong link
      }

      // Link by Keywords (Simple NLP)
      keywords.forEach(kw => {
        if (e.text.toLowerCase().includes(kw)) {
          let kwNodeId = `kw-${kw}`;
          if (!nodes.find(n => n.id === kwNodeId)) {
             nodes.push({ id: kwNodeId, group: 'keyword', radius: 12, label: kw });
          }
          links.push({ source: nodeId, target: kwNodeId, value: 2 });
        }
      });
    });

    return { nodes, links };
  }, [entries]);

  // 2. D3 SIMULATION
  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = 400; // Fixed height for the widget

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height]);

    // Force Simulation
    const simulation = d3.forceSimulation(graphData.nodes)
      .force("link", d3.forceLink(graphData.links).id(d => d.id).distance(50))
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(d => d.radius + 5));

    // Draw Links
    const link = svg.append("g")
      .attr("stroke", "#27272a")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(graphData.links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));

    // Draw Nodes
    const node = svg.append("g")
      .selectAll("circle")
      .data(graphData.nodes)
      .join("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => getNodeColor(d.group, d.mode))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .call(drag(simulation));

    // Click Interaction
    node.on("click", (event, d) => {
      setSelectedNode(d);
      event.stopPropagation();
    });

    // Reset selection on BG click
    svg.on("click", () => setSelectedNode(null));

    // Simulation Tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    });

    return () => simulation.stop();
  }, [graphData]);

  // Helper: Colors
  const getNodeColor = (group, mode) => {
    switch (group) {
      case 'core': return '#fff';
      case 'mode': 
        if(mode === 'observe') return '#64ffda';
        if(mode === 'pattern') return '#bb86fc';
        if(mode === 'question') return '#ff79c6';
        if(mode === 'action') return '#f1fa8c';
        return '#8be9fd';
      case 'entry':
        if(mode === 'observe') return '#64ffda';
        if(mode === 'pattern') return '#bb86fc';
        if(mode === 'question') return '#ff79c6';
        if(mode === 'action') return '#f1fa8c';
        return '#50fa7b';
      case 'model': return '#bd93f9';
      case 'keyword': return '#ffb86c';
      default: return '#6272a4';
    }
  };

  // Helper: Dragging
  const drag = (simulation) => {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  };

  return (
    <div className="insight-graph-container">
      <svg ref={svgRef} width="100%" height="400" style={{background: '#111114', borderRadius: '12px', cursor: 'grab'}}></svg>
      
      {selectedNode && (
        <div className="node-tooltip">
          <strong>{selectedNode.label}</strong>
          {selectedNode.fullText && <p>{selectedNode.fullText}</p>}
          {selectedNode.date && <span className="date">{selectedNode.date}</span>}
        </div>
      )}
      
      <div className="graph-legend">
        <span style={{color: '#64ffda'}}>● Observe</span>
        <span style={{color: '#bb86fc'}}>● Pattern</span>
        <span style={{color: '#ff79c6'}}>● Question</span>
        <span style={{color: '#f1fa8c'}}>● Action</span>
        <span style={{color: '#bd93f9'}}>● Model</span>
        <span style={{color: '#ffb86c'}}>● Logic</span>
      </div>

      <style>{`
        .insight-graph-container { position: relative; margin-bottom: 20px; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; }
        .node-tooltip {
          position: absolute;
          bottom: 12px;
          left: 12px;
          right: 12px;
          background: rgba(16, 16, 20, 0.9);
          border: 1px solid #64ffda;
          padding: 12px;
          border-radius: 8px;
          pointer-events: none;
          backdrop-filter: blur(4px);
        }
        .node-tooltip strong { display: block; color: #fff; font-size: 13px; margin-bottom: 4px; }
        .node-tooltip p { color: #a1a1aa; font-size: 11px; margin: 0; line-height: 1.4; }
        .node-tooltip .date { display: block; margin-top: 6px; color: #52525b; font-size: 9px; }
        .graph-legend {
            display: flex;
            gap: 12px;
            padding: 8px 12px;
            background: #111114;
            border-top: 1px solid #27272a;
            font-size: 10px;
            justify-content: center;
            flex-wrap: wrap;
        }
        .graph-legend span { font-weight: 500; }
      `}</style>
    </div>
  );
};

export default InsightGraph;
