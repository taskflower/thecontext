/* eslint-disable */
/* tslint-ignore */
/* @ts-nocheck */
import { useState, useEffect, useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
  ReactFlowProvider,
  Panel,
  Handle
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Facebook, 
  Instagram, 
  Youtube, 
  Search, 
  MessageSquare,
  RefreshCw
} from 'lucide-react';

// Channel Icon Component
const ChannelIcon = ({ channel }) => {
  switch(channel) {
    case 'facebook': return <Facebook size={16} className="text-blue-600" />;
    case 'instagram': return <Instagram size={16} className="text-pink-600" />;
    case 'youtube': return <Youtube size={16} className="text-red-600" />;
    case 'email': return <MessageSquare size={16} className="text-purple-600" />;
    case 'google': return <Search size={16} className="text-yellow-600" />;
    default: return null;
  }
};

// Custom Node Component for React Flow
const ScenarioNode = ({ data }) => {
  return (
    <div className={`p-3 rounded-lg shadow-lg bg-white border-2 w-64 ${
      data.isActive ? 'border-indigo-500' : 
      data.status === 'completed' ? 'border-green-500' : 
      data.progress > 60 ? 'border-indigo-500' : 
      data.progress > 30 ? 'border-blue-500' : 'border-amber-500'
    }`}>
      <Handle type="source" position="right" style={{ background: '#4f46e5' }} />
      <Handle type="target" position="left" style={{ background: '#4f46e5' }} />
      
      <div className="text-sm font-bold mb-2">{data.label}</div>
      <div className="w-full bg-gray-200 h-1.5 rounded-full mb-2">
        <div 
          className={`h-1.5 rounded-full ${
            data.status === 'completed' ? 'bg-green-500' : 
            data.progress > 60 ? 'bg-indigo-600' : 
            data.progress > 30 ? 'bg-blue-500' : 'bg-amber-500'
          }`}
          style={{ width: `${data.progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex space-x-1">
          {data.channels.map((channel, idx) => (
            <div key={idx} className="p-1">
              <ChannelIcon channel={channel} />
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-600">
          {data.completedTasks}/{data.tasks} tasks
        </div>
      </div>
    </div>
  );
};

// Define node types
const nodeTypes = {
  scenarioNode: ScenarioNode,
};

// Main Flow Component
const MarketingFlowGraph = () => {
  const { fitView } = useReactFlow();
  
  // Predefined node positions
  const nodePositions = {
    '1': { x: 50, y: 100 },
    '2': { x: 350, y: 100 },
    '3': { x: 650, y: 100 },
    '4': { x: 350, y: 300 },
    '5': { x: 950, y: 100 }
  };
  
  // Sample data
  const scenarios = [
    { 
      id: 1, 
      title: 'Summer Campaign 2025', 
      progress: 65, 
      tasks: 12, 
      completedTasks: 8, 
      status: 'in-progress',
      channels: ['facebook', 'instagram', 'email'],
      connections: [2]
    },
    { 
      id: 2, 
      title: 'Product Launch - SmartHome', 
      progress: 30, 
      tasks: 15, 
      completedTasks: 5, 
      status: 'in-progress',
      channels: ['facebook', 'youtube', 'google'],
      connections: [3]
    },
    { 
      id: 3, 
      title: 'Holiday Season Planning', 
      progress: 10, 
      tasks: 20, 
      completedTasks: 2, 
      status: 'todo',
      channels: ['facebook', 'email', 'instagram'],
      connections: [5]
    },
    { 
      id: 4, 
      title: 'Email Automation Workflow', 
      progress: 100, 
      tasks: 6, 
      completedTasks: 6, 
      status: 'completed',
      channels: ['email'],
      connections: []
    },
    { 
      id: 5, 
      title: 'Corporate Rebrand Campaign', 
      progress: 45, 
      tasks: 24, 
      completedTasks: 11, 
      status: 'in-progress',
      channels: ['facebook', 'youtube', 'instagram', 'google', 'email'],
      connections: []
    }
  ];
  
  // Generate nodes and edges for React Flow
  const generateNodesAndEdges = useCallback(() => {
    // Generate nodes with fixed positions
    const nodes = scenarios.map((scenario) => ({
      id: scenario.id.toString(),
      type: 'scenarioNode',
      position: nodePositions[scenario.id.toString()],
      data: { 
        id: scenario.id.toString(),
        label: scenario.title,
        progress: scenario.progress,
        status: scenario.status,
        channels: scenario.channels,
        tasks: scenario.tasks,
        completedTasks: scenario.completedTasks
      }
    }));
    
    // Generate edges
    const edges = [];
    scenarios.forEach(scenario => {
      scenario.connections.forEach(connId => {
        edges.push({
          id: `e${scenario.id}-${connId}`,
          source: scenario.id.toString(),
          target: connId.toString(),
          style: { stroke: '#4f46e5', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#4f46e5',
          },
        });
      });
    });
    
    return { nodes, edges };
  }, []);
  
  const { nodes: initialNodes, edges: initialEdges } = generateNodesAndEdges();
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Center the view on initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.5 });
    }, 100);
    return () => clearTimeout(timer);
  }, [fitView]);

  return (
    <div className="h-screen bg-gray-50">
      <div className="bg-white p-4 flex justify-between items-center mb-4 shadow">
        <h2 className="text-xl font-bold">Marketing Campaign Connections</h2>
        <div className="flex items-center">
          <button 
            onClick={() => fitView({ padding: 0.5 })}
            className="p-2 rounded hover:bg-gray-100 text-indigo-600"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>
      
      <div className="h-5/6 bg-gray-50 rounded-lg border overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.5 }}
        >
          <Panel position="bottom-right">
            <div className="p-3 bg-white rounded-lg shadow">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                  <span className="text-sm">Early Stage</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm">In Progress</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></div>
                  <span className="text-sm">Advanced</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">Completed</span>
                </div>
              </div>
            </div>
          </Panel>
          <Background color="#f1f5f9" variant="dots" />
          <Controls />
          <MiniMap 
            nodeColor={(n) => {
              if (n.data?.status === 'completed') return '#10b981';
              if (n.data?.progress > 60) return '#4f46e5';
              if (n.data?.progress > 30) return '#3b82f6';
              return '#f59e0b';
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
};

// Wrapper with ReactFlowProvider
const MarketingFlowGraphWithProvider = () => {
  return (
    <ReactFlowProvider>
      <MarketingFlowGraph />
    </ReactFlowProvider>
  );
};

export default MarketingFlowGraphWithProvider;