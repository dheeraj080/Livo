import React, { useCallback } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import EditableNode from "../components/EditableNode";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const nodeTypes = {
  editable: EditableNode,
};

const FlowInner = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { api } = useAuth();
  const { screenToFlowPosition, fitView } = useReactFlow();

  // 1. Update node text logic
  const onNodeLabelChange = useCallback(
    (nodeId, newLabel) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, label: newLabel } };
          }
          return node;
        }),
      );
    },
    [setNodes],
  );

  // 2. Add node via button or double-click
  const addNode = useCallback(
    (event) => {
      const id = `node_${Date.now()}`;
      const position = event
        ? screenToFlowPosition({ x: event.clientX, y: event.clientY })
        : { x: 250, y: 250 };

      const newNode = {
        id,
        type: "editable",
        position,
        data: { label: "", onChange: onNodeLabelChange },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, onNodeLabelChange, setNodes],
  );

  // 3. Create New Palace (Reset)
  const createNewMap = useCallback(async () => {
    if (!window.confirm("Create a new Mind Map? Unsaved changes will be lost."))
      return;

    const initialNode = {
      id: "root",
      type: "editable",
      position: { x: 0, y: 0 },
      data: { label: "Central Idea", onChange: onNodeLabelChange },
    };

    setNodes([initialNode]);
    setEdges([]);
    setTimeout(() => fitView(), 100);
  }, [onNodeLabelChange, setNodes, setEdges, fitView]);

  // 4. Save to Database
  const savePalace = useCallback(async () => {
    try {
      await api.post("/mindmaps/save", { nodes, edges });
      toast.success("Palace synced to cloud");
    } catch (err) {
      toast.error("Cloud sync failed");
      console.error(err);
    }
  }, [api, nodes, edges]);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          { ...params, animated: true, style: { stroke: "#d4a017" } },
          eds,
        ),
      ),
    [setEdges],
  );

  return (
    <div className="w-full h-full relative group">
      {/* Miro-Style Floating Dock */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex gap-4 p-2 bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-xl rounded-2xl border border-zinc-200 dark:border-white/10 shadow-2xl transition-all hover:scale-[1.02]">
        <button
          onClick={createNewMap}
          className="px-4 py-2 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-red-500 transition-colors"
        >
          Reset Palace
        </button>
        <button
          onClick={savePalace}
          className="px-6 py-2 text-sm font-bold bg-[#d4a017] text-black rounded-xl transition-all active:scale-95 shadow-lg shadow-[#d4a017]/20"
        >
          Save Changes
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneDoubleClick={addNode}
        nodeTypes={nodeTypes}
        fitView
        panOnScroll
        selectionOnDrag
      >
        <Background
          variant="dots"
          gap={25}
          size={1}
          color={
            document.documentElement.classList.contains("dark")
              ? "#333"
              : "#cbd5e1"
          }
        />
      </ReactFlow>
    </div>
  );
};

const MindMap = () => (
  <ReactFlowProvider>
    <FlowInner />
  </ReactFlowProvider>
);

export default MindMap;
