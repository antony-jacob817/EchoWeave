import { useEffect, useCallback, memo, useState, useRef } from 'react';
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState, MarkerType, Node, Edge, Position, Handle } from 'reactflow';
import dagre from '@dagrejs/dagre';
import 'reactflow/dist/style.css';
import { useIsMobile } from '@/hooks/use-mobile';
import { Lock, Unlock } from 'lucide-react';

export interface AiNode {
  id: string;
  label: string;
  parent: string | null;
  sourceId?: string;
}

const nodeWidth = 200;
const nodeHeight = 60;

// 1. Define the custom node
const CustomMindMapNode = memo(({ id, data }: any) => {
  const isRoot = data.isRoot;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const lastTap = useRef(0);

  const handleTap = (e: React.MouseEvent) => {
    if (isEditing) return;
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      setIsEditing(true);
    }
    lastTap.current = now;
  };

  const onBlur = () => {
    setIsEditing(false);
    // If the text changed, tell the parent component to save it!
    if (editValue.trim() !== data.label && data.onLabelChange) {
      data.onLabelChange(id, editValue.trim());
    } else {
      setEditValue(data.label); // Revert if empty
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onBlur();
  };

  return (
    <div 
      onClick={handleTap}
      className={`px-4 py-3 rounded-xl border backdrop-blur-md text-sm font-medium flex items-center justify-center text-center transition-all cursor-pointer
      ${isRoot 
        ? 'bg-indigo-600/30 border-indigo-400/50 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
        : 'bg-slate-800/80 border-slate-600/50 text-slate-200 hover:border-slate-400/50 hover:bg-slate-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
      }`} 
      style={{ width: nodeWidth, minHeight: nodeHeight }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      {isEditing ? (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="bg-transparent border-none outline-none text-center w-full text-white placeholder-slate-400 focus:ring-0"
        />
      ) : (
        <span className="truncate w-full">{data.label}</span>
      )}
 
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
});

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
};

const nodeTypes = { custom: CustomMindMapNode };

// 1. Update your props interface
export function MindMap({ 
  aiNodes, 
  onUpdateNode, 
  onDeleteNodes 
}: { 
  aiNodes: AiNode[];
  onUpdateNode?: (id: string, newLabel: string) => void;
  onDeleteNodes?: (ids: string[]) => void;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const isMobile = useIsMobile();
  const [isLocked, setIsLocked] = useState(isMobile);

  useEffect(() => {
    setIsLocked(isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (!aiNodes || aiNodes.length === 0) return;

    const initialNodes: Node[] = aiNodes.map((node) => ({
      id: node.id,
      type: 'custom',
      data: { 
        label: node.label,
        isRoot: !node.parent || node.parent === "",
        // 2. Pass the update function directly into the node's data!
        onLabelChange: onUpdateNode 
      },
      position: { x: 0, y: 0 }
    }));

    // Transform AI data into Edges (Lines)
    const initialEdges: Edge[] = aiNodes
      .filter(node => node.parent !== "" && node.parent !== null) 
      .map(node => ({
        id: `e-${node.parent}-${node.id}`,
        source: node.parent as string,
        target: node.id,
        animated: true, 
        style: { 
          stroke: '#818cf8', 
          strokeWidth: 2,
          // THE FIX: Overriding the muddy shadow with a clean, glowing drop-shadow
          filter: 'drop-shadow(0 0 5px rgba(129, 140, 248, 0.4))' 
        }, 
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#818cf8',
        },
      }));

    // Apply auto-layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
      'TB' 
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [aiNodes, setNodes, setEdges]);

  // Smooth zoom to fit all nodes on load
  const onInit = useCallback((reactFlowInstance: any) => {
    window.requestAnimationFrame(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
    });
  }, []);
  
  const handleNodesDelete = useCallback(
    (deleted: Node[]) => {
      const ids = deleted.map(n => n.id);
      if (onDeleteNodes) onDeleteNodes(ids);
    },
    [onDeleteNodes]
  );

  return (
    <div 
      id="react-flow-canvas-container" 
      style={{ width: '100%', height: '100%' }} 
      className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden glass border border-white/5 relative"
    >
      {(!aiNodes || aiNodes.length === 0) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-muted-foreground text-sm">
          Awaiting AI analysis...
        </div>
      )}

      {/* Lock Button (highly beneficial on mobile to prevent accidental node dragging) */}
      {isMobile && (
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`absolute top-4 right-4 z-20 px-3 py-2 rounded-xl border backdrop-blur-md transition-all shadow-lg flex items-center gap-1.5 text-xs font-semibold
            ${isLocked 
              ? 'bg-accent/20 border-accent/40 text-accent hover:bg-accent/30' 
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/80 hover:text-white'
            }`}
          title={isLocked ? "Unlock Nodes (Enable dragging)" : "Lock Nodes (Disable dragging)"}
        >
          {isLocked ? (
            <>
              <Lock className="h-3.5 w-3.5 text-accent animate-pulse" />
            </>
          ) : (
            <>
              <Unlock className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      )}
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodesDelete={handleNodesDelete}
        onInit={onInit}
        nodesDraggable={!isLocked}
        fitView
        attributionPosition="bottom-right"
        className="bg-slate-900/50"
        style={{ width: '100%', height: '100%' }}
      >
        <Background color="#ffffff" gap={24} size={1} style={{ opacity: 0.03 }} />
        <Controls style={{ fill: '#000' }} />
        {!isMobile && (
          <MiniMap 
            nodeColor={(n) => n.data?.isRoot ? '#6366f1' : '#475569'}
            maskColor="rgba(0,0,0,0.5)"
            style={{ backgroundColor: '#1e293b' }}
          />
        )}
      </ReactFlow>
    </div>
  );
}