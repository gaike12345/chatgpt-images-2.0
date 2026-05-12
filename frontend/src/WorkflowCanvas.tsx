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
  { 
    type: 'txt2img', 
    label: 'Text → Image', 
    labelZh: '文生图', 
    icon: '🎨', 
    color: '#8b5cf6',
    description: 'Generate image from text prompt',
    descriptionZh: '根据文字描述生成图片'
  },
  { 
    type: 'img2img', 
    label: 'Image → Image', 
    labelZh: '图生图', 
    icon: '🖼️', 
    color: '#f59e0b',
    description: 'Edit and transform images',
    descriptionZh: '编辑和转换已有图片'
  },
  { 
    type: 'upscale', 
    label: 'Upscale', 
    labelZh: '图片放大', 
    icon: '📈', 
    color: '#10b981',
    description: 'Increase image resolution',
    descriptionZh: '提高图片分辨率'
  },
  { 
    type: 'inpaint', 
    label: 'Inpaint', 
    labelZh: '局部重绘', 
    icon: '🎯', 
    color: '#ec4899',
    description: 'Edit specific areas',
    descriptionZh: '编辑图片特定区域'
  },
  { 
    type: 'outpaint', 
    label: 'Outpaint', 
    labelZh: '图片扩展', 
    icon: '🌅', 
    color: '#06b6d4',
    description: 'Extend image boundaries',
    descriptionZh: '扩展图片边界'
  },
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
}

const SIZES = [
  { label: '1024×1024', value: '1024×1024' },
  { label: '1920×1080', value: '1920×1080' },
  { label: '1080×1920', value: '1080×1920' },
  { label: '2048×2048', value: '2048×2048' },
  { label: '4096×4096', value: '4096×4096' },
];

function ImageNode({ 
  data, 
  selected, 
  lang,
  onGenerate,
  onEdit,
  onDelete,
  onDownload,
  onCopyPrompt,
  onRemoveInput,
  onImageUpload,
  isGenerating 
}: { 
  data: WfNodeData; 
  selected?: boolean;
  lang: Lang;
  onGenerate: (nodeId: string) => void;
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onDownload: (nodeId: string) => void;
  onCopyPrompt: (nodeId: string) => void;
  onRemoveInput: (nodeId: string) => void;
  onImageUpload: (nodeId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  isGenerating: boolean;
}) {
  const nodeDef = NODE_DEFS.find(d => d.type === data.nodeType) ?? NODE_DEFS[0];
  const hasImage = !!data.imageUrl;
  const hasInputImage = !!data.inputImageUrl;
  const isZh = lang === 'zh';
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
      case 'txt2img': return '文生图';
      case 'img2img': return '图生图';
      case 'upscale': return '图片放大';
      case 'inpaint': return '局部重绘';
      case 'outpaint': return '图片扩展';
      default: return data.nodeType;
    }
  };

  const getActionLabel = () => {
    switch (data.nodeType) {
      case 'txt2img': return isZh ? '生成' : 'Generate';
      case 'img2img': return isZh ? '编辑' : 'Edit';
      case 'upscale': return isZh ? '放大' : 'Upscale';
      case 'inpaint': return isZh ? '重绘' : 'Inpaint';
      case 'outpaint': return isZh ? '扩展' : 'Outpaint';
      default: return isZh ? '执行' : 'Execute';
    }
  };

  return (
    <div
      style={{
        width: 360,
        background: '#1a1a2e',
        borderRadius: 12,
        border: selected ? `2px solid ${nodeDef.color}` : '1px solid #2a2a4a',
        boxShadow: selected ? `0 0 20px ${nodeDef.color}40` : '0 4px 20px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        transition: 'all 0.2s',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 14,
          height: 14,
          background: '#1a1a2e',
          border: `2px solid ${nodeDef.color}`,
          borderRadius: '50%',
          left: -7,
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'crosshair',
        }}
      />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        background: '#252542',
        borderBottom: '1px solid #2a2a4a',
      }}>
        <span style={{ fontSize: 14 }}>{nodeDef.icon}</span>
        <span style={{ fontSize: 13, color: nodeDef.color, fontWeight: 600 }}>
          {getTypeLabel()}
        </span>
        <div style={{ flex: 1 }} />
        {data.status && (
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: getStatusColor(),
            boxShadow: `0 0 8px ${getStatusColor()}`,
          }} />
        )}
        <button
          onClick={() => onDelete && onDelete((data as any).id || '')}
          style={{
            padding: '4px 8px',
            fontSize: 11,
            background: 'transparent',
            border: 'none',
            borderRadius: 4,
            color: '#ef4444',
            cursor: 'pointer',
          }}
          title={isZh ? '删除节点' : 'Delete Node'}
        >
          ✕
        </button>
      </div>

      <div style={{
        position: 'relative',
        height: 200,
        background: '#151528',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {hasImage ? (
          <>
            <img
              src={data.imageUrl as string}
              alt="generated"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
            <div style={{
              position: 'absolute',
              top: 4,
              right: 4,
              display: 'flex',
              gap: 4,
            }}>
              <button
                onClick={() => onDownload && onDownload((data as any).id || '')}
                style={{
                  padding: '4px 8px',
                  fontSize: 10,
                  background: 'rgba(0,0,0,0.7)',
                  border: 'none',
                  borderRadius: 4,
                  color: '#fff',
                  cursor: 'pointer',
                }}
                title={isZh ? '下载' : 'Download'}
              >
                ⬇
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#555' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>
              {data.nodeType === 'txt2img' ? '🎨' : data.nodeType === 'img2img' ? '🖼️' : '📈'}
            </div>
            <div style={{ fontSize: 12 }}>
              {isZh ? '等待生成图片...' : 'Waiting for image...'}
            </div>
          </div>
        )}
        
        <div style={{
          position: 'absolute',
          left: 4,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: nodeDef.color,
          opacity: 0.5,
        }} />
        <div style={{
          position: 'absolute',
          right: 4,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: nodeDef.color,
          opacity: 0.5,
        }} />
      </div>

      <div style={{ padding: 12 }}>
        {(data.nodeType === 'img2img' || data.nodeType === 'inpaint' || data.nodeType === 'outpaint') && (
          <div style={{ marginBottom: 10 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}>
              <span style={{ fontSize: 11, color: '#888' }}>
                {isZh ? '输入图片' : 'Input Image'}
              </span>
              {hasInputImage && (
                <button
                  onClick={() => onRemoveInput && onRemoveInput((data as any).id || '')}
                  style={{
                    padding: '2px 6px',
                    fontSize: 10,
                    background: '#ef4444',
                    border: 'none',
                    borderRadius: 4,
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  {isZh ? '移除' : 'Remove'}
                </button>
              )}
            </div>
            {hasInputImage ? (
              <div style={{
                position: 'relative',
                borderRadius: 8,
                overflow: 'hidden',
                border: '1px solid #3a3a5a',
              }}>
                <img
                  src={data.inputImageUrl as string}
                  alt="input"
                  style={{
                    width: '100%',
                    height: 80,
                    objectFit: 'cover',
                  }}
                />
              </div>
            ) : (
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={(e) => onImageUpload && onImageUpload((data as any).id || '', e)}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: 11,
                  background: '#252542',
                  border: '1px dashed #3a3a5a',
                  borderRadius: 8,
                  color: '#888',
                  cursor: 'pointer',
                }}
              />
            )}
          </div>
        )}

        <textarea
          placeholder={isZh ? '输入描述词...' : 'Enter prompt...'}
          value={data.prompt}
          onChange={(e) => {
            const event = { target: { value: e.target.value } } as any;
            if (onEdit) onEdit((data as any).id || '');
          }}
          style={{
            width: '100%',
            height: 60,
            padding: 10,
            fontSize: 12,
            background: '#252542',
            border: '1px solid #3a3a5a',
            borderRadius: 8,
            color: '#ddd',
            resize: 'none',
            outline: 'none',
            marginBottom: 10,
            fontFamily: 'inherit',
          }}
        />

        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <select
            value={data.size}
            onChange={(e) => {
              if (onEdit) onEdit((data as any).id || '');
            }}
            style={{
              flex: 1,
              padding: '6px',
              fontSize: 11,
              background: '#252542',
              border: '1px solid #3a3a5a',
              borderRadius: 6,
              color: '#aaa',
              cursor: 'pointer',
            }}
          >
            {SIZES.map(size => (
              <option key={size.value} value={size.value}>{size.label}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder={isZh ? '种子值' : 'Seed'}
            value={data.seed}
            onChange={() => {}}
            style={{
              width: 80,
              padding: '6px',
              fontSize: 11,
              background: '#252542',
              border: '1px solid #3a3a5a',
              borderRadius: 6,
              color: '#aaa',
            }}
          />
        </div>

        {data.nodeType === 'img2img' && (
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: '#888', marginBottom: 4, display: 'block' }}>
              {isZh ? '强度' : 'Strength'}: {data.strength}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={data.strength}
              onChange={() => {}}
              style={{ width: '100%', accentColor: nodeDef.color }}
            />
          </div>
        )}

        {data.nodeType === 'upscale' && (
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: '#888', marginBottom: 4, display: 'block' }}>
              {isZh ? '放大倍数' : 'Scale'}: {data.scale}x
            </label>
            <input
              type="range"
              min="2"
              max="4"
              step="1"
              value={data.scale}
              onChange={() => {}}
              style={{ width: '100%', accentColor: nodeDef.color }}
            />
          </div>
        )}

        <button
          onClick={() => onGenerate && onGenerate((data as any).id || '')}
          disabled={isGenerating}
          style={{
            width: '100%',
            padding: '8px',
            fontSize: 13,
            background: isGenerating ? '#4a4a6a' : nodeDef.color,
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          {isGenerating ? (isZh ? '生成中...' : 'Generating...') : getActionLabel()}
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 11,
          color: '#666',
          marginTop: 8,
        }}>
          <span>📝 1</span>
          <span>📐 1:1</span>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => onCopyPrompt && onCopyPrompt((data as any).id || '')}
            style={{
              padding: '2px 8px',
              fontSize: 10,
              background: 'transparent',
              border: '1px solid #3a3a5a',
              borderRadius: 4,
              color: '#888',
              cursor: 'pointer',
            }}
          >
            {isZh ? '复制' : 'Copy'}
          </button>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 14,
          height: 14,
          background: nodeDef.color,
          border: `2px solid ${nodeDef.color}`,
          borderRadius: '50%',
          right: -7,
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'crosshair',
        }}
      />
    </div>
  );
}

const nodeTypes = {
  workflow: ImageNode,
};

export default function WorkflowCanvas({
  lang,
  apiUrl,
  isGenerating: parentIsGenerating,
}: WorkflowCanvasProps) {
  const [nodes, setNodes] = useNodesState<Node<WfNodeData>>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [connectionMenu, setConnectionMenu] = useState<{ x: number; y: number; sourceNodeId: string; sourceHandleId: string } | null>(null);
  const [connectionSource, setConnectionSource] = useState<{ nodeId: string; handleId: string } | null>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [generatingNodes, setGeneratingNodes] = useState<Set<string>>(new Set());
  const isZh = lang === 'zh';

  const createNode = useCallback((type: NodeType, position: { x: number; y: number }) => {
    const newNode: Node<WfNodeData> = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'workflow',
      position,
      data: {
        nodeType: type,
        status: '',
        imageUrl: '',
        inputImageUrl: '',
        prompt: '',
        negative: '',
        size: '1024×1024',
        strength: 0.7,
        seed: '',
        scale: 2,
        maskPrompt: '',
        expandDirection: 'all',
      } as WfNodeData,
    };
    setNodes(nds => [...nds, newNode]);
    setSelectedNodeId(newNode.id);
    return newNode.id;
  }, [setNodes]);

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

  const onConnectStart = useCallback(
    (_: any, node: { nodeId: string | null; handleId: string | null; handleType: 'source' | 'target' | null }) => {
      if (node.handleType === 'source' && node.nodeId && node.handleId) {
        setConnectionSource({ nodeId: node.nodeId, handleId: node.handleId });
      }
    },
    []
  );

  const onConnectEnd = useCallback((event: MouseEvent | React.MouseEvent | TouchEvent) => {
    const e = event as unknown as MouseEvent;
    if (!e.clientX) return;
    const target = e.target as HTMLElement;
    if (!target.closest('.react-flow__node') && !target.closest('.react-flow__handle')) {
      setConnectionMenu({
        x: e.clientX,
        y: e.clientY,
        sourceNodeId: connectionSource?.nodeId || '',
        sourceHandleId: connectionSource?.handleId || '',
      });
    }
    setConnectionSource(null);
  }, [connectionSource]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({
        ...connection,
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
      }, eds));
    },
    [setEdges]
  );

  const onNodesChange = useCallback(
    (changes: Parameters<typeof applyNodeChanges>[0]) =>
      setNodes((nds) => applyNodeChanges(changes, nds) as Node<WfNodeData>[]),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: Parameters<typeof applyEdgeChanges>[0]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds) as Edge[]),
    [setEdges]
  );

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

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleNodeImageUpload = useCallback((nodeId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const imageUrl = evt.target?.result as string;
      setNodes(nds => nds.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, inputImageUrl: imageUrl } as WfNodeData,
          };
        }
        return node;
      }));
    };
    reader.readAsDataURL(file);
  }, [setNodes]);

  const handleNodeGenerate = useCallback(async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (!node.data.prompt && node.data.nodeType === 'txt2img') {
      alert(isZh ? '请输入描述词' : 'Please enter a prompt');
      return;
    }

    setGeneratingNodes(prev => new Set(prev).add(nodeId));
    setNodes(nds => nds.map(n => {
      if (n.id === nodeId) {
        return { ...n, data: { ...n.data, status: 'running' } as WfNodeData };
      }
      return n;
    }));

    try {
      let endpoint = '/api/images/generate';
      let body: Record<string, unknown> = {
        model: 'gemini-3.1-flash-image-preview',
        prompt: node.data.prompt,
        size: node.data.size,
        n: 1,
        quality: 'high',
      };

      if (node.data.nodeType === 'img2img' && node.data.inputImageUrl) {
        body.image = node.data.inputImageUrl;
        body.strength = node.data.strength;
      }

      const resp = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await resp.json() as Record<string, unknown>;

      if (!resp.ok) throw new Error((data as any)?.error?.message || 'Generation failed');

      const taskId = (data as any).taskId as string;

      for (let attempt = 0; attempt < 60; attempt++) {
        await new Promise(r => setTimeout(r, 3000));
        const pollResp = await fetch(`${apiUrl}/api/images/task/${taskId}`);
        const pollData = await pollResp.json() as Record<string, unknown>;
        const state = (pollData as any).state as string;

        if (state === 'succeeded') {
          const images = (pollData as any).images as string[];
          if (images && images.length > 0) {
            setNodes(nds => nds.map(n => {
              if (n.id === nodeId) {
                return { 
                  ...n, 
                  data: { 
                    ...n.data, 
                    imageUrl: images[0],
                    status: 'done' 
                  } as WfNodeData 
                };
              }
              return n;
            }));
          }
          break;
        } else if (state === 'failed' || state === 'error') {
          throw new Error('Generation failed');
        }
      }
    } catch (err) {
      setNodes(nds => nds.map(n => {
        if (n.id === nodeId) {
          return { ...n, data: { ...n.data, status: 'error' } as WfNodeData };
        }
        return n;
      }));
      console.error('Generation error:', err);
    } finally {
      setGeneratingNodes(prev => {
        const next = new Set(prev);
        next.delete(nodeId);
        return next;
      });
    }
  }, [nodes, apiUrl, isZh, setNodes]);

  const handleNodeDownload = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !node.data.imageUrl) return;

    const link = document.createElement('a');
    link.href = node.data.imageUrl;
    link.download = `workflow-${node.data.nodeType}-${Date.now()}.png`;
    link.click();
  }, [nodes]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes(nds => nds.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(ed => ed.source !== nodeId && ed.target !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  }, [selectedNodeId, setNodes, setEdges]);

  const handleNodeCopyPrompt = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    navigator.clipboard.writeText(node.data.prompt || '');
  }, [nodes]);

  const handleRemoveInput = useCallback((nodeId: string) => {
    setNodes(nds => nds.map(n => {
      if (n.id === nodeId) {
        return { ...n, data: { ...n.data, inputImageUrl: '' } as WfNodeData };
      }
      return n;
    }));
  }, [setNodes]);

  const handleEditNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const imageUrl = evt.target?.result as string;
        
        if (rfInstance) {
          const position = rfInstance.screenToFlowPosition({
            x: e.clientX,
            y: e.clientY,
          });
          
          const newNode: Node<WfNodeData> = {
            id: `node-${Date.now()}`,
            type: 'workflow',
            position: { x: position.x - 180, y: position.y - 150 },
            data: {
              nodeType: 'img2img',
              status: '',
              imageUrl: '',
              inputImageUrl: imageUrl,
              prompt: '',
              negative: '',
              size: '1024×1024',
              strength: 0.7,
              seed: '',
              scale: 2,
              maskPrompt: '',
              expandDirection: 'all',
            } as WfNodeData,
          };
          setNodes(nds => [...nds, newNode]);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  }, [rfInstance, setNodes]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: '#0f0f1a',
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onPaneContextMenu={onPaneContextMenu}
        onPaneClick={onPaneClick}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onInit={setRfInstance}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        minZoom={0.1}
        maxZoom={2}
        style={{ background: '#0f0f1a' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#2a2a4a"
        />

        {nodes.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#4a4a6a',
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎨</div>
            <div style={{ fontSize: 14 }}>{isZh ? '右键点击创建节点' : 'Right-click to create node'}</div>
            <div style={{ fontSize: 12, marginTop: 8, opacity: 0.7 }}>
              {isZh ? '拖拽图片自动创建图生图节点' : 'Or drop an image to create img2img node'}
            </div>
          </div>
        )}

        <Panel position="top-right">
          <div style={{
            display: 'flex',
            gap: 8,
          }}>
            <button
              onClick={() => rfInstance?.fitView({ padding: 0.2 })}
              style={{
                padding: '8px 16px',
                fontSize: 12,
                background: '#1a1a2e',
                border: '1px solid #2a2a4a',
                borderRadius: 8,
                color: '#aaa',
                cursor: 'pointer',
              }}
            >
              {isZh ? '适应画布' : 'Fit View'}
            </button>
            <button
              onClick={() => {
                if (rfInstance) {
                  const center = rfInstance.screenToFlowPosition({
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2,
                  });
                  createNode('txt2img', { x: center.x - 180, y: center.y - 150 });
                }
              }}
              style={{
                padding: '8px 16px',
                fontSize: 12,
                background: '#8b5cf6',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              + {isZh ? '文生图' : 'Text→Image'}
            </button>
          </div>
        </Panel>
      </ReactFlow>

      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            background: '#1a1a2e',
            border: '1px solid #2a2a4a',
            borderRadius: 10,
            padding: '8px 0',
            minWidth: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{
            padding: '6px 12px',
            fontSize: 11,
            color: '#666',
            borderBottom: '1px solid #2a2a4a',
            marginBottom: 4,
          }}>
            {isZh ? '创建节点' : 'Create Node'}
          </div>
          {NODE_DEFS.map(def => (
            <button
              key={def.type}
              onClick={() => {
                if (rfInstance) {
                  const position = rfInstance.screenToFlowPosition({
                    x: contextMenu.x,
                    y: contextMenu.y,
                  });
                  createNode(def.type, { x: position.x - 180, y: position.y - 150 });
                }
                setContextMenu(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '10px 14px',
                background: 'none',
                border: 'none',
                color: def.color,
                fontSize: 13,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#2a2a4a')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ fontSize: 16 }}>{def.icon}</span>
              <div>
                <div style={{ fontWeight: 500 }}>
                  {isZh ? def.labelZh : def.label}
                </div>
                <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>
                  {isZh ? def.descriptionZh : def.description}
                </div>
              </div>
            </button>
          ))}
          {nodes.length > 0 && (
            <>
              <div style={{ margin: '6px 0', borderTop: '1px solid #2a2a4a' }} />
              <button
                onClick={() => { 
                  setNodes([]); 
                  setEdges([]); 
                  setContextMenu(null); 
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '8px 14px',
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: 13,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#2a2a4a')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <span>🗑️</span>
                <span>{isZh ? '清空画布' : 'Clear All'}</span>
              </button>
            </>
          )}
        </div>
      )}

      {connectionMenu && (
        <div
          style={{
            position: 'fixed',
            left: connectionMenu.x,
            top: connectionMenu.y,
            transform: 'translate(-50%, -50%)',
            background: '#1a1a2e',
            border: '1px solid #4a4a6a',
            borderRadius: 10,
            padding: '8px 0',
            minWidth: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            zIndex: 1001,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{
            padding: '6px 12px',
            fontSize: 11,
            color: '#666',
            borderBottom: '1px solid #2a2a4a',
            marginBottom: 4,
          }}>
            {isZh ? '选择节点类型' : 'Select Node Type'}
          </div>
          {NODE_DEFS.map(def => (
            <button
              key={def.type}
              onClick={() => {
                if (!connectionMenu || !rfInstance) return;
                const position = rfInstance.screenToFlowPosition({ x: connectionMenu.x, y: connectionMenu.y });
                const newNodeId = `node-${Date.now()}`;
                
                setNodes(nds => [...nds, {
                  id: newNodeId,
                  type: 'workflow',
                  position: { x: position.x - 180, y: position.y - 75 },
                  data: {
                    nodeType: def.type,
                    status: '',
                    imageUrl: '',
                    inputImageUrl: '',
                    prompt: '',
                    negative: '',
                    size: '1024×1024',
                    strength: 0.7,
                    seed: '',
                    scale: 2,
                    maskPrompt: '',
                    expandDirection: 'all',
                  } as WfNodeData,
                }]);
                
                if (connectionMenu.sourceNodeId && connectionMenu.sourceHandleId) {
                  setEdges(eds => addEdge({
                    source: connectionMenu.sourceNodeId,
                    sourceHandle: connectionMenu.sourceHandleId,
                    target: newNodeId,
                    targetHandle: 'input',
                    animated: true,
                    style: { stroke: def.color, strokeWidth: 2 },
                  }, eds));
                }
                
                setConnectionMenu(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '8px 14px',
                background: 'none',
                border: 'none',
                color: def.color,
                fontSize: 13,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#2a2a4a')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ fontSize: 16 }}>{def.icon}</span>
              <span>{isZh ? def.labelZh : def.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
