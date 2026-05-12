import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type Node,
  type Edge,
  type Connection,
  type ReactFlowInstance,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

type Lang = 'zh' | 'en';

interface WorkflowCanvasProps {
  zoom: number;
  panX: number;
  panY: number;
  refImage: string | null;
  onZoomChange: (z: number) => void;
  onPanChange: (x: number, y: number) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageGenerate: (prompt: string) => void;
  lang: Lang;
  isGenerating: boolean;
  apiUrl: string;
}

type NodeType = 'txt2img' | 'img2img' | 'upscale' | 'inpaint' | 'outpaint';

interface NodeDef {
  type: NodeType;
  label: string;
  labelZh: string;
  icon: string;
  color: string;
  description: string;
  descriptionZh: string;
}

const NODE_DEFS: NodeDef[] = [
  { type: 'txt2img', label: 'Text \u2192 Image', labelZh: '\u6587\u751f\u56fe', icon: '\ud83c\udfa8', color: '#8b5cf6', description: 'Generate image from text prompt', descriptionZh: '\u6839\u636e\u6587\u5b57\u63cf\u8ff0\u751f\u6210\u56fe\u7247' },
  { type: 'img2img', label: 'Image \u2192 Image', labelZh: '\u56fe\u751f\u56fe', icon: '\ud83d\uddbc', color: '#f59e0b', description: 'Edit and transform images', descriptionZh: '\u7f16\u8f91\u548c\u8f6c\u6362\u5df2\u6709\u56fe\u7247' },
  { type: 'upscale', label: 'Upscale', labelZh: '\u56fe\u7247\u653e\u5927', icon: '\ud83d\udcc8', color: '#10b981', description: 'Increase image resolution', descriptionZh: '\u63d0\u9ad8\u56fe\u7247\u5206\u8fa8\u7387' },
  { type: 'inpaint', label: 'Inpaint', labelZh: '\u5c40\u90e8\u91cd\u7ed8', icon: '\ud83c\udfaf', color: '#ec4899', description: 'Edit specific areas', descriptionZh: '\u7f16\u8f91\u56fe\u7247\u7279\u5b9a\u533a\u57df' },
  { type: 'outpaint', label: 'Outpaint', labelZh: '\u56fe\u7247\u6269\u5c55', icon: '\ud83c\udf05', color: '#06b6d4', description: 'Extend image boundaries', descriptionZh: '\u6269\u5c55\u56fe\u7247\u8fb9\u754c' },
];

interface WfNodeData extends Record<string, unknown> {
  nodeType: NodeType;
  status: '' | 'running' | 'done' | 'error';
  imageUrl: string;
  inputImageUrl: string;
  prompt: string;
  negative: string;
  size: string;
  strength: number;
  seed: string;
  scale: number;
  maskPrompt: string;
  expandDirection: string;
  lang: Lang;
}

const SIZES = [
  { label: '1024\u00d71024', value: '1024\u00d71024' },
  { label: '1920\u00d71080', value: '1920\u00d71080' },
  { label: '1080\u00d71920', value: '1080\u00d71920' },
  { label: '2048\u00d72048', value: '2048\u00d72048' },
  { label: '4096\u00d74096', value: '4096\u00d74096' },
];

interface ImageNodeProps {
  data: WfNodeData;
  selected?: boolean;
}

function ImageNode({ data, selected }: ImageNodeProps) {
  const nodeDef = NODE_DEFS.find(d => d.type === data.nodeType) ?? NODE_DEFS[0];
  const hasImage = !!data.imageUrl;
  const hasInputImage = !!data.inputImageUrl;
  const isZh = data.lang === 'zh';
  const inputRef = useRef<HTMLInputElement>(null);

  const getStatusColor = () => {
    switch (data.status) {
      case 'running': return '#f59e0b';
      case 'done': return '#10b981';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTypeLabel = () => {
    switch (data.nodeType) {
      case 'txt2img': return isZh ? '\u6587\u751f\u56fe' : 'Text\u2192Image';
      case 'img2img': return isZh ? '\u56fe\u751f\u56fe' : 'Image\u2192Image';
      case 'upscale': return isZh ? '\u56fe\u7247\u653e\u5927' : 'Upscale';
      case 'inpaint': return isZh ? '\u5c40\u90e8\u91cd\u7ed8' : 'Inpaint';
      case 'outpaint': return isZh ? '\u56fe\u7247\u6269\u5c55' : 'Outpaint';
      default: return data.nodeType;
    }
  };

  return (
    <div style={{ width: 360, background: '#1a1a2e', borderRadius: 12, border: selected ? `2px solid ${nodeDef.color}` : '1px solid #2a2a4a', boxShadow: selected ? `0 0 20px ${nodeDef.color}40` : '0 4px 20px rgba(0,0,0,0.3)', overflow: 'hidden', transition: 'all 0.2s' }}>
      <Handle type="target" position={Position.Left} style={{ width: 14, height: 14, background: '#1a1a2e', border: `2px solid ${nodeDef.color}`, borderRadius: '50%', left: -7, top: '50%', transform: 'translateY(-50%)', cursor: 'crosshair' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#252542', borderBottom: '1px solid #2a2a4a' }}>
        <span style={{ fontSize: 14 }}>{nodeDef.icon}</span>
        <span style={{ fontSize: 13, color: nodeDef.color, fontWeight: 600 }}>{getTypeLabel()}</span>
        <div style={{ flex: 1 }} />
        {data.status && <div style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(), boxShadow: `0 0 8px ${getStatusColor()}` }} />}
      </div>

      <div style={{ position: 'relative', height: 200, background: '#151528', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {hasImage ? (
          <img src={data.imageUrl as string} alt="generated" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
          <div style={{ textAlign: 'center', color: '#555' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>{data.nodeType === 'txt2img' ? '\ud83c\udfa8' : data.nodeType === 'img2img' ? '\ud83d\uddbc' : '\ud83d\udcc8'}</div>
            <div style={{ fontSize: 12 }}>{isZh ? '\u7b49\u5f85\u751f\u6210\u56fe\u7247...' : 'Waiting for image...'}</div>
          </div>
        )}
        <div style={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: nodeDef.color, opacity: 0.5 }} />
        <div style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: nodeDef.color, opacity: 0.5 }} />
      </div>

      <div style={{ padding: 12 }}>
        {(data.nodeType === 'img2img' || data.nodeType === 'inpaint' || data.nodeType === 'outpaint') && (
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: '#888' }}>{isZh ? '\u8f93\u5165\u56fe\u7247' : 'Input Image'}</span>
            {hasInputImage ? (
              <img src={data.inputImageUrl as string} alt="input" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #3a3a5a', marginTop: 6 }} />
            ) : (
              <input ref={inputRef} type="file" accept="image/*" style={{ width: '100%', padding: '8px', fontSize: 11, background: '#252542', border: '1px dashed #3a3a5a', borderRadius: 8, color: '#888', cursor: 'pointer', marginTop: 6 }} />
            )}
          </div>
        )}

        <textarea
          placeholder={isZh ? '\u8f93\u5165\u63cf\u8ff0\u8bcd...' : 'Enter prompt...'}
          value={data.prompt}
          onChange={() => {}}
          style={{ width: '100%', height: 60, padding: 10, fontSize: 12, background: '#252542', border: '1px solid #3a3a5a', borderRadius: 8, color: '#ddd', resize: 'none', outline: 'none', marginBottom: 10, fontFamily: 'inherit' }}
        />

        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <select value={data.size} onChange={() => {}} style={{ flex: 1, padding: '6px', fontSize: 11, background: '#252542', border: '1px solid #3a3a5a', borderRadius: 6, color: '#aaa', cursor: 'pointer' }}>
            {SIZES.map(size => <option key={size.value} value={size.value}>{size.label}</option>)}
          </select>
          <input type="number" placeholder={isZh ? '\u79cd\u5b50\u503c' : 'Seed'} value={data.seed} onChange={() => {}} style={{ width: 80, padding: '6px', fontSize: 11, background: '#252542', border: '1px solid #3a3a5a', borderRadius: 6, color: '#aaa' }} />
        </div>

        {data.nodeType === 'img2img' && (
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: '#888', marginBottom: 4, display: 'block' }}>{isZh ? '\u5f3a\u5ea6' : 'Strength'}: {data.strength}</label>
            <input type="range" min="0" max="1" step="0.1" value={data.strength} onChange={() => {}} style={{ width: '100%', accentColor: nodeDef.color }} />
          </div>
        )}

        {data.nodeType === 'upscale' && (
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: '#888', marginBottom: 4, display: 'block' }}>{isZh ? '\u653e\u5927\u500d\u6570' : 'Scale'}: {data.scale}x</label>
            <input type="range" min="2" max="4" step="1" value={data.scale} onChange={() => {}} style={{ width: '100%', accentColor: nodeDef.color }} />
          </div>
        )}

        <button disabled style={{ width: '100%', padding: '8px', fontSize: 13, background: '#4a4a6a', border: 'none', borderRadius: 8, color: '#fff', cursor: 'not-allowed', fontWeight: 600 }}>
          {isZh ? '\uff08\u7b49\u63a5\u5165 API\uff09' : '(API pending)'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#666', marginTop: 8 }}>
          <span>\ud83d\udcdd 1</span>
          <span>\ud83d\udcd0 1:1</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} style={{ width: 14, height: 14, background: nodeDef.color, border: `2px solid ${nodeDef.color}`, borderRadius: '50%', right: -7, top: '50%', transform: 'translateY(-50%)', cursor: 'crosshair' }} />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: Record<string, any> = { workflow: ImageNode };

export default function WorkflowCanvas({ lang }: WorkflowCanvasProps) {
  const [nodes, setNodes] = useNodesState<Node<WfNodeData>>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [connectionMenu, setConnectionMenu] = useState<{ x: number; y: number; sourceNodeId: string; sourceHandleId: string } | null>(null);
  const [connectionSource, setConnectionSource] = useState<{ nodeId: string; handleId: string } | null>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const isZh = lang === 'zh';

  const createNode = useCallback((type: NodeType, position: { x: number; y: number }) => {
    const newNode: Node<WfNodeData> = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'workflow',
      position,
      data: {
        nodeType: type, status: '', imageUrl: '', inputImageUrl: '', prompt: '', negative: '',
        size: '1024\u00d71024', strength: 0.7, seed: '', scale: 2, maskPrompt: '', expandDirection: '', lang,
      } as WfNodeData,
    };
    setNodes(nds => [...nds, newNode]);
    setSelectedNodeId(newNode.id);
    return newNode.id;
  }, [setNodes, lang]);

  const onPaneContextMenu = useCallback((event: MouseEvent | React.MouseEvent | TouchEvent) => {
    event.preventDefault();
    const e = event as unknown as MouseEvent;
    if (!e.clientX) return;
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
    setSelectedNodeId(null);
  }, []);

  const onConnectStart = useCallback((_: unknown, node: { nodeId: string | null; handleId: string | null; handleType: 'source' | 'target' | null }) => {
    if (node.handleType === 'source' && node.nodeId && node.handleId) setConnectionSource({ nodeId: node.nodeId, handleId: node.handleId });
  }, []);

  const onConnectEnd = useCallback((event: MouseEvent | React.MouseEvent | TouchEvent) => {
    const e = event as unknown as MouseEvent;
    if (!e.clientX) return;
    const target = e.target as HTMLElement;
    if (!target.closest('.react-flow__node') && !target.closest('.react-flow__handle')) {
      setConnectionMenu({ x: e.clientX, y: e.clientY, sourceNodeId: connectionSource?.nodeId || '', sourceHandleId: connectionSource?.handleId || '' });
    }
    setConnectionSource(null);
  }, [connectionSource]);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({ ...connection, animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } }, eds));
  }, [setEdges]);

  const onNodesChange = useCallback((changes: Parameters<typeof applyNodeChanges>[0]) => setNodes((nds) => applyNodeChanges(changes, nds) as Node<WfNodeData>[]), [setNodes]);
  const onEdgesChange = useCallback((changes: Parameters<typeof applyEdgeChanges>[0]) => setEdges((eds) => applyEdgeChanges(changes, eds) as Edge[]), [setEdges]);

  const onKeyDown = useCallback((e: globalThis.KeyboardEvent) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
      setNodes(nds => nds.filter(n => n.id !== selectedNodeId));
      setEdges(eds => eds.filter(ed => ed.source !== selectedNodeId && ed.target !== selectedNodeId));
      setSelectedNodeId(null);
    }
  }, [selectedNodeId, setNodes, setEdges]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const imageUrl = evt.target?.result as string;
        if (rfInstance) {
          const position = rfInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY });
          setNodes(nds => [...nds, {
            id: `node-${Date.now()}`, type: 'workflow',
            position: { x: position.x - 180, y: position.y - 150 },
            data: { nodeType: 'img2img', status: '', imageUrl: '', inputImageUrl: imageUrl, prompt: '', negative: '', size: '1024\u00d71024', strength: 0.7, seed: '', scale: 2, maskPrompt: '', expandDirection: '', lang } as WfNodeData,
          }]);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  }, [rfInstance, setNodes, lang]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onNodeClick = useCallback((_: unknown, node: any) => setSelectedNodeId(node.id), []);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0f0f1a' }} onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes.map(n => ({ ...n, data: { ...n.data, lang } }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onPaneContextMenu={onPaneContextMenu}
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        onInit={setRfInstance}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        minZoom={0.1}
        maxZoom={2}
        style={{ background: '#0f0f1a' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2a2a4a" />

        {nodes.length === 0 && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: '#4a4a6a', pointerEvents: 'none' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>\ud83c\udfa8</div>
            <div style={{ fontSize: 14 }}>{isZh ? '\u53f3\u952e\u70b9\u51fb\u521b\u5efa\u8282\u70b9' : 'Right-click to create node'}</div>
            <div style={{ fontSize: 12, marginTop: 8, opacity: 0.7 }}>{isZh ? '\u62d6\u62fd\u56fe\u7247\u81ea\u52a8\u521b\u5efa\u56fe\u751f\u56fe\u8282\u70b9' : 'Or drop an image to create img2img node'}</div>
          </div>
        )}

        <Panel position="top-right">
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => rfInstance?.fitView({ padding: 0.2 })} style={{ padding: '8px 16px', fontSize: 12, background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 8, color: '#aaa', cursor: 'pointer' }}>
              {isZh ? '\u9002\u5e94\u753b\u5e03' : 'Fit View'}
            </button>
            <button onClick={() => {
              if (rfInstance) {
                const center = rfInstance.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
                createNode('txt2img', { x: center.x - 180, y: center.y - 150 });
              }
            }} style={{ padding: '8px 16px', fontSize: 12, background: '#8b5cf6', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
              + {isZh ? '\u6587\u751f\u56fe' : 'Text\u2192Image'}
            </button>
          </div>
        </Panel>
      </ReactFlow>

      {contextMenu && (
        <div style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y, background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 10, padding: '8px 0', minWidth: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 1000 }} onClick={(e) => e.stopPropagation()}>
          <div style={{ padding: '6px 12px', fontSize: 11, color: '#666', borderBottom: '1px solid #2a2a4a', marginBottom: 4 }}>{isZh ? '\u521b\u5efa\u8282\u70b9' : 'Create Node'}</div>
          {NODE_DEFS.map(def => (
            <button key={def.type} onClick={() => {
              if (rfInstance) {
                const position = rfInstance.screenToFlowPosition({ x: contextMenu.x, y: contextMenu.y });
                createNode(def.type, { x: position.x - 180, y: position.y - 150 });
              }
              setContextMenu(null);
            }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: def.color, fontSize: 13, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#2a2a4a')}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}>
              <span style={{ fontSize: 16 }}>{def.icon}</span>
              <div>
                <div style={{ fontWeight: 500 }}>{isZh ? def.labelZh : def.label}</div>
                <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{isZh ? def.descriptionZh : def.description}</div>
              </div>
            </button>
          ))}
          {nodes.length > 0 && (
            <>
              <div style={{ margin: '6px 0', borderTop: '1px solid #2a2a4a' }} />
              <button onClick={() => { setNodes([]); setEdges([]); setContextMenu(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 14px', background: 'none', border: 'none', color: '#ef4444', fontSize: 13, cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#2a2a4a')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}>
                <span>\ud83d\uddd1\ufe0f</span>
                <span>{isZh ? '\u6e05\u7a7a\u753b\u5e03' : 'Clear All'}</span>
              </button>
            </>
          )}
        </div>
      )}

      {connectionMenu && (
        <div style={{ position: 'fixed', left: connectionMenu.x, top: connectionMenu.y, transform: 'translate(-50%, -50%)', background: '#1a1a2e', border: '1px solid #4a4a6a', borderRadius: 10, padding: '8px 0', minWidth: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 1001 }} onClick={(e) => e.stopPropagation()}>
          <div style={{ padding: '6px 12px', fontSize: 11, color: '#666', borderBottom: '1px solid #2a2a4a', marginBottom: 4 }}>{isZh ? '\u9009\u62e9\u8282\u70b9\u7c7b\u578b' : 'Select Node Type'}</div>
          {NODE_DEFS.map(def => (
            <button key={def.type} onClick={() => {
              if (!connectionMenu || !rfInstance) return;
              const position = rfInstance.screenToFlowPosition({ x: connectionMenu.x, y: connectionMenu.y });
              const newNodeId = `node-${Date.now()}`;
              setNodes(nds => [...nds, {
                id: newNodeId, type: 'workflow',
                position: { x: position.x - 180, y: position.y - 75 },
                data: { nodeType: def.type, status: '', imageUrl: '', inputImageUrl: '', prompt: '', negative: '', size: '1024\u00d71024', strength: 0.7, seed: '', scale: 2, maskPrompt: '', expandDirection: 'all', lang } as WfNodeData,
              }]);
              if (connectionMenu.sourceNodeId && connectionMenu.sourceHandleId) {
                setEdges(eds => addEdge({ source: connectionMenu.sourceNodeId, sourceHandle: connectionMenu.sourceHandleId, target: newNodeId, targetHandle: 'input', animated: true, style: { stroke: def.color, strokeWidth: 2 } }, eds));
              }
              setConnectionMenu(null);
            }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 14px', background: 'none', border: 'none', color: def.color, fontSize: 13, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#2a2a4a'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}>
              <span style={{ fontSize: 16 }}>{def.icon}</span>
              <span>{isZh ? def.labelZh : def.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
