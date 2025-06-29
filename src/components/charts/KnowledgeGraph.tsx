import React, { useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useTheme } from '../../contexts/ThemeContext';

interface GraphNode {
  id: string;
  name: string;
  type: 'person' | 'place' | 'organization' | 'topic' | 'event';
  size: number;
  color?: string;
}

interface GraphLink {
  source: string;
  target: string;
  relationship: string;
  strength: number;
}

interface KnowledgeGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  onNodeClick?: (node: GraphNode) => void;
  width?: number;
  height?: number;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ 
  nodes, 
  links, 
  onNodeClick,
  width = 800,
  height = 600 
}) => {
  const { isDark } = useTheme();
  const fgRef = useRef<any>();

  const getNodeColor = (type: string) => {
    const colors = {
      person: '#3b82f6',
      place: '#10b981',
      organization: '#f59e0b',
      topic: '#8b5cf6',
      event: '#ef4444'
    };
    return colors[type as keyof typeof colors] || '#6b7280';
  };

  const graphData = {
    nodes: nodes.map(node => ({
      ...node,
      color: node.color || getNodeColor(node.type)
    })),
    links: links.map(link => ({
      ...link,
      color: isDark ? '#4b5563' : '#9ca3af'
    }))
  };

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-300);
      fgRef.current.d3Force('link').distance(100);
    }
  }, []);

  return (
    <div className={`rounded-2xl border overflow-hidden ${
      isDark ? 'bg-black border-white/10' : 'bg-white border-slate-200'
    }`}>
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        width={width}
        height={height}
        backgroundColor={isDark ? '#000000' : '#ffffff'}
        nodeLabel="name"
        nodeColor="color"
        nodeRelSize={6}
        nodeVal="size"
        linkColor="color"
        linkWidth={2}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        onNodeClick={onNodeClick}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const label = node.name;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = isDark ? '#ffffff' : '#000000';
          ctx.fillText(label, node.x, node.y + node.size + 10);
        }}
        cooldownTicks={100}
        onEngineStop={() => fgRef.current?.zoomToFit(400)}
      />
    </div>
  );
};

export default KnowledgeGraph;