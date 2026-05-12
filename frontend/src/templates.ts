/**
 * 盖可朋友圈 - AI图片生成
 * 工作流模板
 */

export interface WorkflowTemplate {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  category: 'portrait' | 'landscape' | 'art' | 'photo' | 'creative';
  tags: string[];
  nodes: TemplateNode[];
  usageCount: number;
  rating: number;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateNode {
  type: 'txt2img' | 'img2img' | 'upscale' | 'inpaint' | 'outpaint';
  position: { x: number; y: number };
  parameters: Record<string, any>;
}

export const templates: WorkflowTemplate[] = [
  {
    id: 'portrait-enhance',
    name: '人像增强',
    nameEn: 'Portrait Enhancement',
    description: '提升人像照片的质量和细节，让人物更加出彩',
    descriptionEn: 'Enhance portrait photos with improved quality and details',
    icon: '👤',
    category: 'portrait',
    tags: ['人像', '增强', '美颜', '高清'],
    nodes: [
      {
        type: 'img2img',
        position: { x: 100, y: 100 },
        parameters: {
          prompt: 'portrait photo, high quality, detailed, sharp focus',
          strength: 0.6,
          size: '1024×1024',
          seed: '',
        },
      },
      {
        type: 'upscale',
        position: { x: 400, y: 100 },
        parameters: {
          scale: 2,
        },
      },
    ],
    usageCount: 1234,
    rating: 4.8,
    author: 'System',
    createdAt: '2025-01-01',
    updatedAt: '2025-05-12',
  },
  {
    id: 'landscape-hd',
    name: '风景高清',
    nameEn: 'Landscape HD',
    description: '将风景照片提升至超高清，细节更丰富',
    descriptionEn: 'Upscale landscape photos to ultra HD with rich details',
    icon: '🏔️',
    category: 'landscape',
    tags: ['风景', '高清', '自然', '细节'],
    nodes: [
      {
        type: 'img2img',
        position: { x: 100, y: 100 },
        parameters: {
          prompt: 'landscape, nature, mountains, high quality, detailed',
          strength: 0.5,
          size: '1920×1080',
          seed: '',
        },
      },
      {
        type: 'upscale',
        position: { x: 400, y: 100 },
        parameters: {
          scale: 4,
        },
      },
    ],
    usageCount: 987,
    rating: 4.7,
    author: 'System',
    createdAt: '2025-01-01',
    updatedAt: '2025-05-12',
  },
  {
    id: 'anime-style',
    name: '动漫风格',
    nameEn: 'Anime Style',
    description: '将照片转换为精美的动漫风格',
    descriptionEn: 'Transform photos into beautiful anime style',
    icon: '🎨',
    category: 'art',
    tags: ['动漫', '风格', '艺术', '二次元'],
    nodes: [
      {
        type: 'img2img',
        position: { x: 100, y: 100 },
        parameters: {
          prompt: 'anime style, vibrant colors, detailed, high quality',
          strength: 0.8,
          size: '1024×1024',
          seed: '',
        },
      },
    ],
    usageCount: 2345,
    rating: 4.9,
    author: 'System',
    createdAt: '2025-01-01',
    updatedAt: '2025-05-12',
  },
  {
    id: 'artistic-transfer',
    name: '艺术迁移',
    nameEn: 'Artistic Transfer',
    description: '将照片转换为著名艺术风格',
    descriptionEn: 'Transform photos into famous artistic styles',
    icon: '🎭',
    category: 'art',
    tags: ['艺术', '风格', '创作', '绘画'],
    nodes: [
      {
        type: 'img2img',
        position: { x: 100, y: 100 },
        parameters: {
          prompt: 'artistic painting, impressionist style, oil painting',
          strength: 0.75,
          size: '1920×1080',
          seed: '',
        },
      },
    ],
    usageCount: 1567,
    rating: 4.6,
    author: 'System',
    createdAt: '2025-01-01',
    updatedAt: '2025-05-12',
  },
  {
    id: 'photo-restore',
    name: '老照片修复',
    nameEn: 'Photo Restoration',
    description: '修复和增强老旧照片，去除噪点和划痕',
    descriptionEn: 'Restore and enhance old photos, remove noise and scratches',
    icon: '📷',
    category: 'photo',
    tags: ['修复', '老照片', '怀旧', '清晰'],
    nodes: [
      {
        type: 'img2img',
        position: { x: 100, y: 100 },
        parameters: {
          prompt: 'restored photo, clean, sharp, detailed, high quality',
          strength: 0.4,
          size: '1024×1024',
          seed: '',
        },
      },
      {
        type: 'upscale',
        position: { x: 400, y: 100 },
        parameters: {
          scale: 2,
        },
      },
    ],
    usageCount: 876,
    rating: 4.5,
    author: 'System',
    createdAt: '2025-01-01',
    updatedAt: '2025-05-12',
  },
  {
    id: 'creative-expand',
    name: '创意扩展',
    nameEn: 'Creative Expansion',
    description: '智能扩展图片边界，创造更大画幅',
    descriptionEn: 'Smartly expand image boundaries to create larger canvas',
    icon: '🌅',
    category: 'creative',
    tags: ['扩展', '创意', '画幅', 'AI'],
    nodes: [
      {
        type: 'img2img',
        position: { x: 100, y: 100 },
        parameters: {
          prompt: 'cohesive scene extension, seamless blend',
          strength: 0.6,
          size: '1920×1080',
          seed: '',
        },
      },
    ],
    usageCount: 654,
    rating: 4.4,
    author: 'System',
    createdAt: '2025-01-01',
    updatedAt: '2025-05-12',
  },
  {
    id: 'product-showcase',
    name: '产品展示',
    nameEn: 'Product Showcase',
    description: '为电商产品创建专业展示图',
    descriptionEn: 'Create professional showcase images for e-commerce products',
    icon: '🛍️',
    category: 'creative',
    tags: ['产品', '电商', '展示', '商业'],
    nodes: [
      {
        type: 'img2img',
        position: { x: 100, y: 100 },
        parameters: {
          prompt: 'professional product photography, clean background, studio lighting',
          strength: 0.5,
          size: '1024×1024',
          seed: '',
        },
      },
      {
        type: 'upscale',
        position: { x: 400, y: 100 },
        parameters: {
          scale: 2,
        },
      },
    ],
    usageCount: 543,
    rating: 4.3,
    author: 'System',
    createdAt: '2025-01-01',
    updatedAt: '2025-05-12',
  },
  {
    id: 'text-to-fantasy',
    name: '幻想世界',
    nameEn: 'Fantasy World',
    description: '从文字描述生成梦幻般的奇幻场景',
    descriptionEn: 'Generate dreamy fantasy scenes from text descriptions',
    icon: '✨',
    category: 'creative',
    tags: ['幻想', '奇幻', '创意', '魔法'],
    nodes: [
      {
        type: 'txt2img',
        position: { x: 100, y: 100 },
        parameters: {
          prompt: 'fantasy world, magical, ethereal, detailed, high quality',
          size: '1920×1080',
          seed: '',
        },
      },
      {
        type: 'upscale',
        position: { x: 400, y: 100 },
        parameters: {
          scale: 2,
        },
      },
    ],
    usageCount: 432,
    rating: 4.8,
    author: 'System',
    createdAt: '2025-01-01',
    updatedAt: '2025-05-12',
  },
];

export const categories = [
  {
    id: 'all',
    name: '全部',
    nameEn: 'All',
    icon: '📦',
  },
  {
    id: 'portrait',
    name: '人像',
    nameEn: 'Portrait',
    icon: '👤',
  },
  {
    id: 'landscape',
    name: '风景',
    nameEn: 'Landscape',
    icon: '🏔️',
  },
  {
    id: 'art',
    name: '艺术',
    nameEn: 'Art',
    icon: '🎨',
  },
  {
    id: 'photo',
    name: '照片',
    nameEn: 'Photo',
    icon: '📷',
  },
  {
    id: 'creative',
    name: '创意',
    nameEn: 'Creative',
    icon: '💡',
  },
];

export const getTemplateById = (id: string): WorkflowTemplate | undefined => {
  return templates.find((t) => t.id === id);
};

export const getTemplatesByCategory = (category: string): WorkflowTemplate[] => {
  if (category === 'all') return templates;
  return templates.filter((t) => t.category === category);
};

export const searchTemplates = (query: string): WorkflowTemplate[] => {
  const lowerQuery = query.toLowerCase();
  return templates.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.nameEn.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.descriptionEn.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
};

export const getPopularTemplates = (limit: number = 5): WorkflowTemplate[] => {
  return [...templates].sort((a, b) => b.usageCount - a.usageCount).slice(0, limit);
};

export const getTopRatedTemplates = (limit: number = 5): WorkflowTemplate[] => {
  return [...templates].sort((a, b) => b.rating - a.rating).slice(0, limit);
};
