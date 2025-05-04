import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';

interface CustomNode extends Node {
  id: string;
  type?: string;
  data: {
    label: string;
    head: string;
    onLabelChange: (id: string, newLabel: string) => void;
  };
  position: { x: number; y: number };
  draggable: boolean;
}

interface CustomEdge extends Edge {
  id: string;
  source: string;
  target: string;
  type?: string;
  style: { stroke: string; strokeWidth: number };
}

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: CustomNode[], edges: CustomEdge[]): { nodes: CustomNode[]; edges: CustomEdge[] } => {
  dagreGraph.setGraph({ rankdir: 'TB' });

  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: 200, height: 70 });
  });

  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map(node => ({
      ...node,
      position: {
        x: dagreGraph.node(node.id).x - 100,
        y: dagreGraph.node(node.id).y - 35,
      },
    })),
    edges,
  };
};

export default getLayoutedElements;