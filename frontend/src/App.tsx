import { useState, useRef, useEffect } from 'react';

// ─── API Config ────────────────────────────────────────────
const DEFAULT_API_URL = 'https://chatgpt-images-api-production.up.railway.app';

// ─── i18n ──────────────────────────────────────────────────
type Lang = 'zh' | 'en';

const I18N = {
  zh: {
    appName: '盖可朋友圈 - AI图片生成',
    poweredBy: '多米API 驱动',
    selectModel: '选择大模型',
    mode: '模式',
    textToImage: '文生图',
    editImage: '图生图',
    prompt: '提示词',
    promptPlaceholderText: '描述你想要生成的图片...',
    promptPlaceholderEdit: '描述你对图片的期望修改...',
    promptPlaceholderMj: '描述你想要生成的图片 (英文效果更佳)...',
    refImage: '参考图片',
    refImageTip: '（上传参考图片进入图生图模式）',
    size: '图片尺寸',
    sizeCustom: '自定义尺寸',
    sizeCustomPlaceholder: '例如：1920×1080',
    quality: '生成质量',
    qualityStandard: '标准',
    qualityHigh: '高清',
    qualityUltra: '超高清',
    number: '数量',
    generate: '✨ 生成图片',
    generateVideo: '🎬 生成视频',
    cancel: '取消',
    submitting: '正在提交...',
    generating: '生成中...',
    generatedCount: '生成{n}张图片',
    generatedVideo: '视频生成成功',
    clickToView: '点击查看原图',
    download: '下载',
    copyPrompt: '复制提示词',
    regenerate: '重新生成',
    emptyTipTitle: '输入提示词开始创作',
    emptyTipSub: '支持文生图和图片编辑',
    generatingTitle: '图片生成中',
    generatingSub: '通常需要10-60秒，请耐心等待...',
    generatingVideoSub: '视频生成通常需要1-3分钟，请耐心等待...',
    taskId: '任务ID',
    errorTitle: '生成失败',
    retry: '重试',
    downloadTip: '💡 提示',
    downloadTipText: '图片已就绪，点击下载按钮可保存到本地',
    downloadTipRetry: '点击上方「生成图片」继续创作',
    error: '请输入提示词',
    errorImageRequired: '请上传参考图片',
    history: '历史记录',
    historyEmpty: '暂无历史记录',
    historyDelete: '删除',
    historyClear: '清空全部',
    historyConfirmClear: '确定清空全部历史记录？',
    // lightbox
    lightboxClose: '关闭',
    lightboxPrev: '上一张',
    lightboxNext: '下一张',
    // model names
    modelNanoBanana: 'Nano-Banana 模型',
    modelKlingAvatar: '可灵数字人',
    modelMidjourney: 'Midjourney',
    // kling
    klingMode: '模式',
    klingModeStd: '标准 (0.3元/秒)',
    klingModePro: '高清 (0.6元/秒)',
    klingText: '文字内容',
    klingTextPlaceholder: '输入数字人要说的文字...',
    klingAudioUrl: '音频URL (可选)',
    // sizes
    size_1k: '1K (1024×576)',
    size_2k: '2K (2048×1152)',
    size_4k: '4K (4096×2304)',
    size_1080p: '1080p (1920×1080)',
    size_720p: '720p (1280×720)',
    size_custom: '自定义',
    // Phase 2
    negativePrompt: '负向提示词',
    negativePromptPlaceholder: '输入不想要的元素（用逗号分隔）...',
    promptTags: '提示词标签',
    addTag: '添加标签',
    tagPlaceholder: '输入标签，按Enter添加...',
    charCount: '{n} 字符',
    examplePrompts: '示例提示词',
    fillExample: '填入示例',
    // Phase 3
    advancedSettings: '高级设置',
    advancedSettingsOpen: '展开',
    advancedSettingsClose: '收起',
    seed: '种子值',
    seedPlaceholder: '留空则随机',
    stylePreset: '风格预设',
    stylePresetNone: '无',
    stylePresetAnime: '动漫',
    stylePresetPhotographic: '摄影',
    stylePresetDigitalArt: '数字艺术',
    stylePresetCinematic: '电影感',
    resetDefaults: '恢复默认',
    // steps
    stepSubmitting: '提交任务',
    stepProcessing: 'AI生成中',
    stepFetching: '获取结果',
    stepComplete: '生成完成',
    // progress
    progressStep: '步骤 {n}/4：{step}',
  },
  en: {
    appName: 'Gaike Moments - AI Image Generator',
    poweredBy: 'Powered by DuomiAPI',
    selectModel: 'Select Model',
    mode: 'Mode',
    textToImage: 'Text to Image',
    editImage: 'Edit Image',
    prompt: 'Prompt',
    promptPlaceholderText: 'Describe the image you want to generate...',
    promptPlaceholderEdit: 'Describe how you want to edit the image...',
    promptPlaceholderMj: 'Describe the image (English works best)...',
    refImage: 'Reference Image',
    refImageTip: '(Upload to switch to Edit mode)',
    size: 'Image Size',
    sizeCustom: 'Custom Size',
    sizeCustomPlaceholder: 'e.g. 1920×1080',
    quality: 'Quality',
    qualityStandard: 'Standard',
    qualityHigh: 'HD',
    qualityUltra: 'Ultra HD',
    number: 'Count',
    generate: '✨ Generate Image',
    generateVideo: '🎬 Generate Video',
    cancel: 'Cancel',
    submitting: 'Submitting...',
    generating: 'Generating...',
    generatedCount: '{n} image(s) generated',
    generatedVideo: 'Video generated successfully',
    clickToView: 'Click to view full size',
    download: 'Download',
    copyPrompt: 'Copy Prompt',
    regenerate: 'Regenerate',
    emptyTipTitle: 'Enter a prompt to start',
    emptyTipSub: 'Supports Text-to-Image and Image Editing',
    generatingTitle: 'Generating image',
    generatingSub: 'Usually takes 10-60 seconds, please wait',
    generatingVideoSub: 'Video generation usually takes 1-3 minutes, please wait',
    taskId: 'Task ID',
    errorTitle: 'Generation Failed',
    retry: 'Retry',
    downloadTip: '💡 Tip',
    downloadTipText: 'Image is ready. Click the download button to save locally.',
    downloadTipRetry: 'Click "Generate Image" above to create more.',
    error: 'Please enter a prompt',
    errorImageRequired: 'Please upload a reference image',
    history: 'History',
    historyEmpty: 'No history yet',
    historyDelete: 'Delete',
    historyClear: 'Clear All',
    historyConfirmClear: 'Clear all history?',
    // lightbox
    lightboxClose: 'Close',
    lightboxPrev: 'Previous',
    lightboxNext: 'Next',
    // model names
    modelNanoBanana: 'Nano-Banana Model',
    modelKlingAvatar: 'Kling Avatar',
    modelMidjourney: 'Midjourney',
    // kling
    klingMode: 'Mode',
    klingModeStd: 'Standard (¥0.3/s)',
    klingModePro: 'HD (¥0.6/s)',
    klingText: 'Text Content',
    klingTextPlaceholder: 'Enter text for the avatar to speak...',
    klingAudioUrl: 'Audio URL (optional)',
    // sizes
    size_1k: '1K (1024×576)',
    size_2k: '2K (2048×1152)',
    size_4k: '4K (4096×2304)',
    size_1080p: '1080p (1920×1080)',
    size_720p: '720p (1280×720)',
    size_custom: 'Custom',
    // Phase 2
    negativePrompt: 'Negative Prompt',
    negativePromptPlaceholder: 'Elements to avoid (comma separated)...',
    promptTags: 'Prompt Tags',
    addTag: 'Add Tag',
    tagPlaceholder: 'Type tag, press Enter...',
    charCount: '{n} chars',
    examplePrompts: 'Example Prompts',
    fillExample: 'Fill Example',
    // Phase 3
    advancedSettings: 'Advanced Settings',
    advancedSettingsOpen: 'Expand',
    advancedSettingsClose: 'Collapse',
    seed: 'Seed',
    seedPlaceholder: 'Leave empty for random',
    stylePreset: 'Style Preset',
    stylePresetNone: 'None',
    stylePresetAnime: 'Anime',
    stylePresetPhotographic: 'Photographic',
    stylePresetDigitalArt: 'Digital Art',
    stylePresetCinematic: 'Cinematic',
    resetDefaults: 'Reset Defaults',
    // steps
    stepSubmitting: 'Submitting',
    stepProcessing: 'AI Generating',
    stepFetching: 'Fetching Results',
    stepComplete: 'Complete',
    // progress
    progressStep: 'Step {n}/4: {step}',
  },
} as const;

// ─── Types ─────────────────────────────────────────────────
type ModelId = 'nano-banana' | 'kling-avatar' | 'midjourney';
type GenerateState = 'idle' | 'submitting' | 'polling' | 'completed' | 'error';

interface SizeOption { label: string; labelEn: string; value: string; displayW: number; displayH: number; }

const SIZES: SizeOption[] = [
  { label: '1K (1024×576)', labelEn: '1K (1024×576)', value: '1K', displayW: 1024, displayH: 576 },
  { label: '2K (2048×1152)', labelEn: '2K (2048×1152)', value: '2K', displayW: 2048, displayH: 1152 },
  { label: '4K (4096×2304)', labelEn: '4K (4096×2304)', value: '4K', displayW: 4096, displayH: 2304 },
  { label: '1080p (1920×1080)', labelEn: '1080p (1920×1080)', value: '1080p', displayW: 1920, displayH: 1080 },
  { label: '720p (1280×720)', labelEn: '720p (1280×720)', value: '720p', displayW: 1280, displayH: 720 },
  { label: '自定义 / Custom', labelEn: 'Custom', value: 'custom', displayW: 1920, displayH: 1080 },
];

const QUALITIES = ['standard', 'high', 'ultra'] as const;

const MODELS: { id: ModelId; icon: string }[] = [
  { id: 'nano-banana', icon: '🎨' },
  { id: 'kling-avatar', icon: '🎬' },
  { id: 'midjourney', icon: '✨' },
];

interface HistoryItem {
  id: string;
  prompt: string;
  model: ModelId;
  mode: 'text' | 'edit';
  size: string;
  customSize: string;
  quality: string;
  n: number;
  images: string[];
  videos: string[];
  timestamp: number;
  sizeW: number;
  sizeH: number;
}

interface AppState {
  lang: Lang;
  model: ModelId;
  prompt: string;
  size: string;
  customSize: string;
  n: number;
  quality: typeof QUALITIES[number];
  genState: GenerateState;
  images: string[];
  videos: string[];
  errorMsg: string;
  progress: string;
  taskId: string;
  mode: 'text' | 'edit';
  refImage: string | null;
  showHistory: boolean;
  history: HistoryItem[];
  currentSizeW: number;
  currentSizeH: number;
  apiUrl: string;
  // kling-specific
  klingMode: 'std' | 'pro';
  klingText: string;
  klingAudioUrl: string;
  // lightbox
  lightboxIndex: number | null;
  lightboxUrls: string[];
  // Phase 2
  negativePrompt: string;
  promptTags: string[];
  newTag: string;
  // Phase 3
  showAdvanced: boolean;
  seed: string;
  stylePreset: string;
}

// ─── Helpers ───────────────────────────────────────────────
const parseCustomSize = (s: string): [number, number] | null => {
  const m = s.match(/(\d+)\s*[xX×]\s*(\d+)/);
  if (m) return [parseInt(m[1]), parseInt(m[2])];
  const w = parseInt(s.trim());
  if (w > 0 && w <= 4096) return [w, Math.round(w * 9 / 16)];
  return null;
};

const getAspect = (w: number, h: number) => `${w}/${h}`;

const downloadImage = async (url: string, filename: string) => {
  try {
    const resp = await fetch(url);
    const blob = await resp.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  } catch {
    window.open(url, '_blank');
  }
};

const loadHistory = (): HistoryItem[] => {
  try { return JSON.parse(localStorage.getItem('gaike_img_history') || '[]'); }
  catch { return []; }
};

const saveHistory = (items: HistoryItem[]) => {
  localStorage.setItem('gaike_img_history', JSON.stringify(items.slice(0, 100)));
};

// ─── Component ─────────────────────────────────────────────
export default function App() {
  const [s, setS] = useState<AppState>({
    lang: 'zh',
    model: 'nano-banana',
    prompt: '',
    size: '1080p',
    customSize: '',
    n: 1,
    quality: 'high',
    genState: 'idle',
    images: [],
    videos: [],
    errorMsg: '',
    progress: '',
    taskId: '',
    mode: 'text',
    refImage: null,
    showHistory: false,
    history: loadHistory(),
    currentSizeW: 1920,
    currentSizeH: 1080,
    apiUrl: (() => { const raw = localStorage.getItem('gaike_api_url') || ''; const trimmed = raw.trim(); if (raw !== trimmed) localStorage.removeItem('gaike_api_url'); return trimmed || (import.meta.env.VITE_API_URL as string) || DEFAULT_API_URL; })(),
    klingMode: 'std',
    klingText: '',
    klingAudioUrl: '',
    // lightbox
    lightboxIndex: null,
    lightboxUrls: [],
    // Phase 2
    negativePrompt: '',
    promptTags: [],
    newTag: '',
    // Phase 3
    showAdvanced: false,
    seed: '',
    stylePreset: '',
  });

  const t = I18N[s.lang];
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCount = useRef(0);

  // Update aspect when size changes
  useEffect(() => {
    if (s.size === 'custom') {
      const parsed = parseCustomSize(s.customSize);
      if (parsed) {
        setS(st => ({ ...st, currentSizeW: parsed[0], currentSizeH: parsed[1] }));
      }
    } else {
      const opt = SIZES.find(o => o.value === s.size);
      if (opt) setS(st => ({ ...st, currentSizeW: opt.displayW, currentSizeH: opt.displayH }));
    }
  }, [s.size, s.customSize]);

  // ─── Reset defaults (Phase 3) ─────────────────────────────────
  // const handleResetDefaults = () => {
  //   setS(st => ({
  //     ...st,
  //     size: '1080p',
  //     customSize: '',
  //     n: 1,
  //     quality: 'high',
  //     seed: '',
  //     stylePreset: '',
  //     currentSizeW: 1920,
  //     currentSizeH: 1080,
  //   }));
  // };

  const clearPoll = () => {
    if (pollTimer.current) { clearTimeout(pollTimer.current); pollTimer.current = null; }
  };

  const addHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = { ...item, id: Date.now().toString(), timestamp: Date.now() };
    const updated = [newItem, ...s.history].slice(0, 100);
    setS(st => ({ ...st, history: updated }));
    saveHistory(updated);
  };

  const deleteHistory = (id: string) => {
    const updated = s.history.filter(h => h.id !== id);
    setS(st => ({ ...st, history: updated }));
    saveHistory(updated);
  };

  const clearAllHistory = () => {
    if (!window.confirm(t.historyConfirmClear)) return;
    setS(st => ({ ...st, history: [] }));
    saveHistory([]);
  };

  const restoreFromHistory = (item: HistoryItem) => {
    setS(st => ({
      ...st,
      prompt: item.prompt,
      model: item.model,
      mode: item.mode,
      size: item.size,
      customSize: item.customSize,
      quality: item.quality as typeof QUALITIES[number],
      n: item.n,
      images: item.images,
      videos: item.videos,
      genState: 'completed',
      showHistory: false,
      currentSizeW: item.sizeW,
      currentSizeH: item.sizeH,
      // open lightbox if has images
      lightboxUrls: item.images,
      lightboxIndex: item.images.length > 0 ? 0 : null,
    }));
  };

  // ─── Lightbox ────────────────────────────────────────────
  const openLightbox = (urls: string[], index: number) => {
    setS(st => ({ ...st, lightboxUrls: urls, lightboxIndex: index }));
  };

  const closeLightbox = () => {
    setS(st => ({ ...st, lightboxIndex: null, lightboxUrls: [] }));
  };

  const lightboxPrev = () => {
    if (s.lightboxIndex === null || s.lightboxUrls.length === 0) return;
    setS(st => ({ ...st, lightboxIndex: (st.lightboxIndex! - 1 + st.lightboxUrls.length) % st.lightboxUrls.length }));
  };

  const lightboxNext = () => {
    if (s.lightboxIndex === null || s.lightboxUrls.length === 0) return;
    setS(st => ({ ...st, lightboxIndex: (st.lightboxIndex! + 1) % st.lightboxUrls.length }));
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (s.lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lightboxPrev();
      if (e.key === 'ArrowRight') lightboxNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [s.lightboxIndex, s.lightboxUrls]);

  // ─── Polling logic per model ───
  const pollNanoBanana = async (taskId: string) => {
    try {
      const resp = await fetch(`${s.apiUrl}/api/images/task/${taskId}`);
      const data = await resp.json() as Record<string, unknown>;
      if (!resp.ok) throw new Error((data as any)?.error?.message || 'Query failed');

      const state = data.state as string;
      if (state === 'succeeded') {
        const imgs = (data.images as string[]) || [];
        const sizeOpt = SIZES.find(o => o.value === s.size);
        const [sw, sh] = s.size === 'custom' ? (parseCustomSize(s.customSize) || [s.currentSizeW, s.currentSizeH]) : [sizeOpt?.displayW || 1920, sizeOpt?.displayH || 1080];
        addHistory({ prompt: s.prompt, model: s.model, mode: s.mode, size: s.size, customSize: s.customSize, quality: s.quality, n: s.n, images: imgs, videos: [], sizeW: sw, sizeH: sh });
        setS(st => ({ ...st, genState: 'completed', images: imgs, progress: '' }));
        clearPoll();
      } else if (state === 'failed') {
        throw new Error((data as any)?.error?.message || 'Generation failed');
      } else {
        pollCount.current += 1;
        if (pollCount.current >= 60) throw new Error('Generation timeout, please try again');
        setS(st => ({ ...st, progress: `${t.generating} (${pollCount.current * 3}s)` }));
        pollTimer.current = setTimeout(() => pollNanoBanana(taskId), 3000);
      }
    } catch (err) {
      setS(st => ({ ...st, genState: 'error', errorMsg: err instanceof Error ? err.message : String(err), progress: '' }));
      clearPoll();
    }
  };

  const pollKlingAvatar = async (taskId: string) => {
    try {
      const resp = await fetch(`${s.apiUrl}/api/kling/task/${taskId}`);
      const data = await resp.json() as Record<string, unknown>;
      if (!resp.ok) throw new Error((data as any)?.error?.message || 'Query failed');

      const state = data.state as string;
      if (state === 'succeeded') {
        const vids = (data.videos as string[]) || [];
        const imgs = (data.images as string[]) || [];
        addHistory({ prompt: s.klingText || s.prompt, model: s.model, mode: 'edit', size: '', customSize: '', quality: '', n: 1, images: imgs, videos: vids, sizeW: 1920, sizeH: 1080 });
        setS(st => ({ ...st, genState: 'completed', videos: vids, images: imgs, progress: '' }));
        clearPoll();
      } else if (state === 'failed') {
        throw new Error((data as any)?.msg || 'Generation failed');
      } else {
        pollCount.current += 1;
        if (pollCount.current >= 120) throw new Error('Generation timeout, please try again');
        setS(st => ({ ...st, progress: `${t.generating} (${pollCount.current * 5}s)` }));
        pollTimer.current = setTimeout(() => pollKlingAvatar(taskId), 5000);
      }
    } catch (err) {
      setS(st => ({ ...st, genState: 'error', errorMsg: err instanceof Error ? err.message : String(err), progress: '' }));
      clearPoll();
    }
  };

  const pollMidjourney = async (taskId: string) => {
    try {
      const resp = await fetch(`${s.apiUrl}/api/mj/task/${taskId}`);
      const data = await resp.json() as Record<string, unknown>;
      if (!resp.ok) throw new Error((data as any)?.error?.message || 'Query failed');

      const state = data.state as string;
      if (state === 'succeeded') {
        const imgs = (data.images as string[]) || [];
        addHistory({ prompt: s.prompt, model: s.model, mode: 'text', size: '', customSize: '', quality: '', n: 1, images: imgs, videos: [], sizeW: 1024, sizeH: 1024 });
        setS(st => ({ ...st, genState: 'completed', images: imgs, progress: '' }));
        clearPoll();
      } else if (state === 'failed' || state === 'error') {
        throw new Error((data as any)?.msg || 'Generation failed');
      } else {
        pollCount.current += 1;
        if (pollCount.current >= 80) throw new Error('Generation timeout, please try again');
        setS(st => ({ ...st, progress: `${t.generating} (${pollCount.current * 5}s)` }));
        pollTimer.current = setTimeout(() => pollMidjourney(taskId), 5000);
      }
    } catch (err) {
      setS(st => ({ ...st, genState: 'error', errorMsg: err instanceof Error ? err.message : String(err), progress: '' }));
      clearPoll();
    }
  };

  // ─── Generate ────────────────────────────────────────────
  // Build full prompt with tags and negative prompt
  const buildFullPrompt = () => {
    let full = s.prompt.trim();
    if (s.promptTags.length > 0) full += ', ' + s.promptTags.join(', ');
    if (s.negativePrompt.trim()) full += ', --negative ' + s.negativePrompt.trim();
    return full;
  };

  const handleGenerate = async () => {
    // Validation
    if (s.model === 'kling-avatar') {
      if (!s.refImage) {
        setS(st => ({ ...st, errorMsg: t.errorImageRequired, genState: 'error' }));
        return;
      }
    } else {
      if (!s.prompt.trim()) {
        setS(st => ({ ...st, errorMsg: t.error, genState: 'error' }));
        return;
      }
    }

    pollCount.current = 0;
    setS(st => ({ ...st, genState: 'submitting', images: [], videos: [], errorMsg: '', progress: t.submitting, taskId: '' }));

    try {
      let taskId = '';
      let model: string = s.model;

      if (s.model === 'nano-banana') {
        // Build size param - convert label to actual pixels
        let sizeVal = s.size;
        if (s.size === 'custom') {
          const parsed = parseCustomSize(s.customSize);
          if (!parsed) throw new Error(s.lang === 'zh' ? '自定义尺寸格式不正确，示例：1920×1080' : 'Invalid custom size format, e.g. 1920×1080');
          sizeVal = `${parsed[0]}×${parsed[1]}`;
        } else {
          // Convert size label to actual pixels (e.g., "4K" -> "4096×2304")
          const sizeMap: Record<string, string> = {
            '1K': '1024×576',
            '2K': '2048×1152',
            '4K': '4096×2304',
            '1080p': '1920×1080',
            '720p': '1280×720',
          };
          if (sizeMap[s.size]) sizeVal = sizeMap[s.size];
        }

        const body: Record<string, unknown> = {
          model: 'gemini-3.1-flash-image-preview',
          prompt: buildFullPrompt(),
          size: sizeVal,
          n: s.n,
          quality: s.quality,
        };
        if (s.mode === 'edit' && s.refImage) body.image = s.refImage;

        const resp = await fetch(`${s.apiUrl}/api/images/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await resp.json() as Record<string, unknown>;
        if (!resp.ok) throw new Error((data as any)?.error?.message || 'Submit failed');
        taskId = (data as any).taskId as string;
        model = 'nano-banana';
      } else if (s.model === 'kling-avatar') {
        const body: Record<string, unknown> = {
          image: s.refImage,
          mode: s.klingMode,
        };
        if (s.klingText.trim()) body.text = s.klingText.trim();
        if (s.klingAudioUrl.trim()) body.audio_url = s.klingAudioUrl.trim();

        const resp = await fetch(`${s.apiUrl}/api/kling/avatar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await resp.json() as Record<string, unknown>;
        if (!resp.ok) throw new Error((data as any)?.error?.message || 'Submit failed');
        taskId = (data as any).taskId as string;
        model = 'kling-avatar';
      } else if (s.model === 'midjourney') {
        const body: Record<string, unknown> = {
          prompt: buildFullPrompt(),
        };

        const resp = await fetch(`${s.apiUrl}/api/mj/imagine`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await resp.json() as Record<string, unknown>;
        if (!resp.ok) throw new Error((data as any)?.error?.message || 'Submit failed');
        taskId = (data as any).taskId as string;
        model = 'midjourney';
      }

      if (!taskId) throw new Error('No task ID returned');
      setS(st => ({ ...st, genState: 'polling', taskId, progress: t.generating }));

      // Start polling based on model
      if (model === 'nano-banana') {
        pollTimer.current = setTimeout(() => pollNanoBanana(taskId), 3000);
      } else if (model === 'kling-avatar') {
        pollTimer.current = setTimeout(() => pollKlingAvatar(taskId), 5000);
      } else if (model === 'midjourney') {
        pollTimer.current = setTimeout(() => pollMidjourney(taskId), 5000);
      }
    } catch (err) {
      setS(st => ({ ...st, genState: 'error', errorMsg: err instanceof Error ? err.message : String(err), progress: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setS(st => ({ ...st, refImage: ev.target?.result as string, mode: 'edit' }));
    };
    reader.readAsDataURL(file);
  };

  const handleCancel = () => { clearPoll(); setS(st => ({ ...st, genState: 'idle', progress: '', taskId: '' })); };

  const isWorking = s.genState === 'submitting' || s.genState === 'polling';
  const aspect = getAspect(s.currentSizeW, s.currentSizeH);

  // Model display name
  const getModelName = (id: ModelId) => {
    if (id === 'nano-banana') return t.modelNanoBanana;
    if (id === 'kling-avatar') return t.modelKlingAvatar;
    return t.modelMidjourney;
  };

  // Generate button text
  const generateBtnText = s.model === 'kling-avatar' ? t.generateVideo : t.generate;

  // Generating subtitle
  const generatingSubText = s.model === 'kling-avatar' ? t.generatingVideoSub : t.generatingSub;

  // Copy prompt to clipboard
  const copyPrompt = () => {
    const text = s.model === 'kling-avatar' ? (s.klingText || s.prompt) : s.prompt;
    navigator.clipboard.writeText(text).then(() => {
      alert(s.lang === 'zh' ? '提示词已复制！' : 'Prompt copied!');
    }).catch(() => {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      alert(s.lang === 'zh' ? '提示词已复制！' : 'Prompt copied!');
    });
  };

  return (
    <div style={{ background: '#111214', color: '#e4e6eb', minHeight: '100vh', fontFamily: 'Inter, PingFang SC, Microsoft YaHei, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{ height: 52, background: '#1c1e22', borderBottom: '1px solid #33373f', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 10, flexShrink: 0 }}>
        <span style={{ fontSize: 17, fontWeight: 800, background: 'linear-gradient(135deg,#7b68ee,#5b8cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {t.appName}
        </span>
        <span style={{ fontSize: 12, color: '#8b909e' }}>{t.poweredBy}</span>

        {/* History toggle */}
        <button
          onClick={() => setS(st => ({ ...st, showHistory: !st.showHistory }))}
          style={{ marginLeft: 8, padding: '4px 12px', borderRadius: 6, border: '1px solid', cursor: 'pointer', fontSize: 12, transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 4,
            background: s.showHistory ? '#2a2760' : 'transparent',
            borderColor: s.showHistory ? '#7b68ee' : '#33373f',
            color: s.showHistory ? '#b8afe0' : '#8b909e' }}>
          <span>📁</span>
          <span>{t.history}</span>
          {s.history.length > 0 && (
            <span style={{ background: '#7b68ee', color: '#fff', borderRadius: 10, padding: '0 6px', fontSize: 10, minWidth: 18, textAlign: 'center' }}>{s.history.length}</span>
          )}
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button onClick={() => setS(st => ({ ...st, lang: 'zh' }))}
            style={{ padding: '3px 10px', borderRadius: 6, border: '1px solid', cursor: 'pointer', fontSize: 12, transition: 'all .15s',
              background: s.lang === 'zh' ? '#2a2760' : 'transparent',
              borderColor: s.lang === 'zh' ? '#7b68ee' : '#33373f',
              color: s.lang === 'zh' ? '#b8afe0' : '#8b909e' }}>中文</button>
          <button onClick={() => setS(st => ({ ...st, lang: 'en' }))}
            style={{ padding: '3px 10px', borderRadius: 6, border: '1px solid', cursor: 'pointer', fontSize: 12, transition: 'all .15s',
              background: s.lang === 'en' ? '#2a2760' : 'transparent',
              borderColor: s.lang === 'en' ? '#7b68ee' : '#33373f',
              color: s.lang === 'en' ? '#b8afe0' : '#8b909e' }}>English</button>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left panel */}
        <div style={{ width: 360, borderRight: '1px solid #33373f', padding: 24, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', flexShrink: 0 }}>

          {/* Model Selector */}
          <div>
            <label style={{ fontSize: 12, color: '#8b909e', marginBottom: 8, display: 'block' }}>{t.selectModel}</label>
            <select
              value={s.model}
              onChange={e => {
                const newModel = e.target.value as ModelId;
                // Example prompts per model
                const examples: Record<ModelId, string> = {
                  'nano-banana': s.lang === 'zh'
                    ? '一只穿着宇航服的橘猫在月球表面玩耍，背景是地球'
                    : 'An orange cat in astronaut suit playing on the moon surface, Earth in background',
                  'kling-avatar': s.lang === 'zh'
                    ? '欢迎来到盖可朋友圈，分享你的精彩瞬间'
                    : 'Welcome to Gaike Moments, share your wonderful moments',
                  'midjourney': s.lang === 'zh'
                    ? 'A majestic lion in golden savanna at sunset, photorealistic style'
                    : 'A majestic lion in golden savanna at sunset, photorealistic style',
                };
                setS(st => ({ ...st, model: newModel, mode: newModel === 'kling-avatar' ? 'edit' : 'text', genState: 'idle', images: [], videos: [], errorMsg: '', progress: '', prompt: examples[newModel] || '' }));
                clearPoll();
              }}
              disabled={isWorking}
              style={{ width: '100%', background: '#26292f', border: '1px solid #33373f', borderRadius: 8, color: '#e4e6eb', padding: '9px 12px', fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'inherit', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238b909e' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 36, boxSizing: 'border-box' }}
            >
              {MODELS.map(m => (
                <option key={m.id} value={m.id}>{m.icon} {getModelName(m.id)}</option>
              ))}
            </select>
          </div>

          {/* Mode selector (only for nano-banana) */}
          {s.model === 'nano-banana' && (
            <div>
              <label style={{ fontSize: 12, color: '#8b909e', marginBottom: 8, display: 'block' }}>{t.mode}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['text', 'edit'] as const).map(m => (
                  <button key={m} onClick={() => setS(st => ({ ...st, mode: m }))}
                    style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid', cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all .15s',
                      background: s.mode === m ? '#7b68ee' : 'transparent',
                      borderColor: s.mode === m ? '#7b68ee' : '#33373f',
                      color: s.mode === m ? '#fff' : '#8b909e' }}>
                    {m === 'text' ? t.textToImage : t.editImage}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Prompt (not for kling-avatar main prompt, kling uses klingText instead) */}
          {s.model !== 'kling-avatar' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 12, color: '#8b909e' }}>{t.prompt}</label>
                <span style={{ fontSize: 11, color: '#4a4f5e' }}>{t.charCount.replace('{n}', String(s.prompt.length))}</span>
              </div>
              <textarea
                value={s.prompt}
                onChange={e => setS(st => ({ ...st, prompt: e.target.value }))}
                placeholder={s.model === 'midjourney' ? t.promptPlaceholderMj : (s.mode === 'text' ? t.promptPlaceholderText : t.promptPlaceholderEdit)}
                rows={3}
                disabled={isWorking}
                style={{ width: '100%', background: '#26292f', border: '1px solid #33373f', borderRadius: 8, color: '#e4e6eb', padding: 10, fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' }}
              />

              {/* Negative prompt */}
              <div style={{ marginTop: 8 }}>
                <label style={{ fontSize: 12, color: '#8b909e', marginBottom: 6, display: 'block' }}>{t.negativePrompt}</label>
                <textarea
                  value={s.negativePrompt}
                  onChange={e => setS(st => ({ ...st, negativePrompt: e.target.value }))}
                  placeholder={t.negativePromptPlaceholder}
                  rows={2}
                  disabled={isWorking}
                  style={{ width: '100%', background: '#26292f', border: '1px solid #33373f', borderRadius: 8, color: '#e4e6eb', padding: 10, fontSize: 12, resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' }}
                />
              </div>

              {/* Prompt tags */}
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, color: '#8b909e' }}>{t.promptTags}</label>
                </div>
                {s.promptTags.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                    {s.promptTags.map((tag, i) => (
                      <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#2a2760', color: '#b8afe0', border: '1px solid #7b68ee', borderRadius: 14, padding: '3px 10px', fontSize: 12 }}>
                        {tag}
                        <button
                          onClick={() => setS(st => ({ ...st, promptTags: st.promptTags.filter((_, idx) => idx !== i) }))}
                          style={{ background: 'none', border: 'none', color: '#b8afe0', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}
                          disabled={isWorking}
                        >×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="text"
                    value={s.newTag}
                    onChange={e => setS(st => ({ ...st, newTag: e.target.value }))}
                    placeholder={t.tagPlaceholder}
                    disabled={isWorking}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && s.newTag.trim()) {
                        e.preventDefault();
                        setS(st => ({ ...st, promptTags: [...st.promptTags, st.newTag.trim()], newTag: '' }));
                      }
                    }}
                    style={{ flex: 1, background: '#26292f', border: '1px solid #33373f', borderRadius: 8, color: '#e4e6eb', padding: '7px 10px', fontSize: 12, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                  <button
                    onClick={() => {
                      if (s.newTag.trim()) {
                        setS(st => ({ ...st, promptTags: [...st.promptTags, st.newTag.trim()], newTag: '' }));
                      }
                    }}
                    disabled={isWorking || !s.newTag.trim()}
                    style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #7b68ee', background: '#2a2760', color: '#b8afe0', cursor: isWorking || !s.newTag.trim() ? 'not-allowed' : 'pointer', fontSize: 12, whiteSpace: 'nowrap' }}
                  >{t.addTag}</button>
                </div>
              </div>

              {/* Example prompts */}
              {s.model === 'nano-banana' && s.mode === 'text' && (
                <div style={{ marginTop: 10 }}>
                  <label style={{ fontSize: 12, color: '#8b909e', marginBottom: 6, display: 'block' }}>{t.examplePrompts}</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {(s.lang === 'zh' ? [
                      '一只穿着宇航服的橘猫在月球表面玩耍，背景是地球',
                      '赛博朋克风格的未来城市夜景，霓虹灯闪烁',
                      '水彩画风格的山间小屋，晨雾缭绕',
                    ] : [
                      'An orange cat in astronaut suit playing on the moon, Earth in background',
                      'Cyberpunk futuristic city nightscape with neon lights',
                      'Watercolor mountain cabin surrounded by morning mist',
                    ]).map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => setS(st => ({ ...st, prompt: ex }))}
                        disabled={isWorking}
                        style={{ textAlign: 'left', padding: '6px 10px', borderRadius: 6, border: '1px solid #33373f', background: 'transparent', color: '#8b909e', cursor: 'pointer', fontSize: 11, lineHeight: 1.4, transition: 'all .15s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#7b68ee'; e.currentTarget.style.color = '#b8afe0'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#33373f'; e.currentTarget.style.color = '#8b909e'; }}
                      >{ex}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reference image (for nano-banana edit mode & kling-avatar) */}
          {(s.model === 'nano-banana' && s.mode === 'edit') || s.model === 'kling-avatar' ? (
            <div>
              <label style={{ fontSize: 12, color: '#8b909e', marginBottom: 8, display: 'block' }}>
                {t.refImage} {s.model === 'kling-avatar' && <span style={{ color: '#e05c6a' }}>*</span>}
                {s.model === 'nano-banana' && <span style={{ fontSize: 11 }}>{t.refImageTip}</span>}
              </label>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isWorking} style={{ fontSize: 13, color: '#8b909e' }} />
              {s.refImage && (
                <div style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden', border: '1px solid #33373f' }}>
                  <img src={s.refImage} alt="ref" style={{ width: '100%', display: 'block', maxHeight: 120, objectFit: 'cover' }} />
                </div>
              )}
            </div>
          ) : null}

          {/* Kling-specific fields */}
          {s.model === 'kling-avatar' && (
            <>
              <div>
                <label style={{ fontSize: 12, color: '#8b909e', marginBottom: 8, display: 'block' }}>{t.klingMode}</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['std', 'pro'] as const).map(m => (
                    <button key={m} onClick={() => setS(st => ({ ...st, klingMode: m }))}
                      disabled={isWorking}
                      style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid', cursor: 'pointer', fontSize: 12, fontWeight: 500, transition: 'all .15s',
                        background: s.klingMode === m ? '#7b68ee' : 'transparent',
                        borderColor: s.klingMode === m ? '#7b68ee' : '#33373f',
                        color: s.klingMode === m ? '#fff' : '#8b909e' }}>
                      {m === 'std' ? t.klingModeStd : t.klingModePro}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#8b909e', marginBottom: 8, display: 'block' }}>{t.klingText}</label>
                <textarea
                  value={s.klingText}
                  onChange={e => setS(st => ({ ...st, klingText: e.target.value }))}
                  placeholder={t.klingTextPlaceholder}
                  rows={3}
                  disabled={isWorking}
                  style={{ width: '100%', background: '#26292f', border: '1px solid #33373f', borderRadius: 8, color: '#e4e6eb', padding: 10, fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#8b909e', marginBottom: 8, display: 'block' }}>{t.klingAudioUrl}</label>
                <input
                  type="text"
                  value={s.klingAudioUrl}
                  onChange={e => setS(st => ({ ...st, klingAudioUrl: e.target.value }))}
                  placeholder="https://..."
                  disabled={isWorking}
                  style={{ width: '100%', background: '#26292f', border: '1px solid #33373f', borderRadius: 8, color: '#e4e6eb', padding: '9px 12px', fontSize: 12, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
            </>
          )}

          {/* Size (only for nano-banana) */}
          {s.model === 'nano-banana' && (
            <div>
              <label style={{ fontSize: 12, color: '#8b909e', marginBottom: 8, display: 'block' }}>{t.size}</label>
              <select
                value={s.size}
                onChange={e => setS(st => ({ ...st, size: e.target.value }))}
                disabled={isWorking}
                style={{ width: '100%', background: '#26292f', border: '1px solid #33373f', borderRadius: 8, color: '#e4e6eb', padding: '9px 12px', fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'inherit', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238b909e' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 36, boxSizing: 'border-box' }}
              >
                {SIZES.filter(sz => sz.value !== 'custom').map(sz => (
                  <option key={sz.value} value={sz.value}>{s.lang === 'zh' ? sz.label : sz.labelEn}</option>
                ))}
                <option value="custom">{s.lang === 'zh' ? '自定义 / Custom' : 'Custom'}</option>
              </select>

              {s.size === 'custom' && (
                <div style={{ marginTop: 8 }}>
                  <input
                    type="text"
                    value={s.customSize}
                    onChange={e => setS(st => ({ ...st, customSize: e.target.value }))}
                    placeholder={t.sizeCustomPlaceholder}
                    disabled={isWorking}
                    style={{ width: '100%', background: '#26292f', border: '1px solid #33373f', borderRadius: 8, color: '#e4e6eb', padding: '9px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                  <div style={{ marginTop: 4, fontSize: 11, color: '#4a4f5e' }}>
                    {s.lang === 'zh' ? '支持格式：1920×1080 或 1920x1080，范围：1~4096' : 'Format: 1920×1080 or 1920x1080, range: 1~4096'}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 6, fontSize: 11, color: '#4a4f5e' }}>
                {s.lang === 'zh' ? '1K~4K 均为 16:9 比例' : '1K~4K are all 16:9 aspect ratio'}
              </div>
            </div>
          )}

          {/* Quality (only for nano-banana) */}
          {s.model === 'nano-banana' && (
            <div>
              <label style={{ fontSize: 12, color: '#8b909e', marginBottom: 8, display: 'block' }}>{t.quality}</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {QUALITIES.map(q => (
                  <button key={q} onClick={() => setS(st => ({ ...st, quality: q }))}
                    disabled={isWorking}
                    style={{ flex: 1, padding: '7px 0', borderRadius: 7, border: '1px solid', cursor: 'pointer', fontSize: 12, transition: 'all .15s',
                      background: s.quality === q ? '#2a2760' : 'transparent',
                      borderColor: s.quality === q ? '#7b68ee' : '#33373f',
                      color: s.quality === q ? '#b8afe0' : '#8b909e' }}>
                    {q === 'standard' ? t.qualityStandard : q === 'high' ? t.qualityHigh : t.qualityUltra}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Number (only for nano-banana) */}
          {s.model === 'nano-banana' && (
            <div>
              <label style={{ fontSize: 12, color: '#8b909e', marginBottom: 8, display: 'block' }}>{t.number}: {s.n}</label>
              <input type="range" min={1} max={10} value={s.n}
                onChange={e => setS(st => ({ ...st, n: Number(e.target.value) }))}
                disabled={isWorking}
                style={{ width: '100%', accentColor: '#7b68ee' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#4a4f5e', marginTop: 4 }}>
                <span>1</span><span>10</span>
              </div>
            </div>
          )}

          {/* Error */}
          {s.errorMsg && s.genState === 'error' && (
            <div style={{ background: '#2a1a1a', border: '1px solid #e05c6a', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#e05c6a', lineHeight: 1.5 }}>
              {s.errorMsg}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
            {!isWorking ? (
              <button onClick={handleGenerate}
                style={{ flex: 1, padding: '11px 0', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#7b68ee,#5b8cf8)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 12px rgba(123,104,238,.3)' }}>
                {generateBtnText}
              </button>
            ) : (
              <button onClick={handleCancel}
                style={{ flex: 1, padding: '11px 0', borderRadius: 9, border: '1px solid #e05c6a', background: 'transparent', color: '#e05c6a', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                {t.cancel}
              </button>
            )}
          </div>

          {/* Progress */}
          {s.progress && (
            <div style={{ fontSize: 12, color: '#7b68ee', textAlign: 'center', padding: '4px 0' }}>
              {s.progress}
              {s.taskId && <div style={{ fontSize: 11, color: '#4a4f5e', marginTop: 2, wordBreak: 'break-all' }}>{t.taskId}: {s.taskId.slice(0, 24)}...</div>}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ flex: 1, padding: 24, overflowY: 'auto', position: 'relative' }}>

          {/* History panel (sidebar drawer) */}
          {s.showHistory && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(17,18,20,.92)', backdropFilter: 'blur(8px)', zIndex: 50, padding: 24, overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#e4e6eb' }}>📁 {t.history}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {s.history.length > 0 && (
                    <button onClick={clearAllHistory}
                      style={{ fontSize: 12, color: '#e05c6a', background: 'transparent', border: '1px solid #e05c6a', borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}>
                      {t.historyClear}
                    </button>
                  )}
                  <button onClick={() => setS(st => ({ ...st, showHistory: false }))}
                    style={{ fontSize: 18, color: '#8b909e', background: 'transparent', border: 'none', cursor: 'pointer', lineHeight: 1 }}>
                    ✕
                  </button>
                </div>
              </div>
              {s.history.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#4a4f5e', padding: '60px 0', fontSize: 14 }}>{t.historyEmpty}</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {s.history.map(item => (
                    <div key={item.id} style={{ background: '#1c1e22', border: '1px solid #33373f', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: '#e4e6eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.prompt}</div>
                          <div style={{ fontSize: 11, color: '#4a4f5e', marginTop: 2 }}>
                            {getModelName(item.model)} · {item.size === 'custom' ? item.customSize : (SIZES.find(sz => sz.value === item.size)?.label || item.size)} · {new Date(item.timestamp).toLocaleString(s.lang === 'zh' ? 'zh-CN' : 'en-US')}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button onClick={() => restoreFromHistory(item)}
                            style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #33373f', background: 'transparent', color: '#8b909e', cursor: 'pointer', fontSize: 11 }}>
                            {s.lang === 'zh' ? '查看' : 'View'}
                          </button>
                          <button onClick={() => deleteHistory(item.id)}
                            style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #e05c6a', background: 'transparent', color: '#e05c6a', cursor: 'pointer', fontSize: 11 }}>
                            {t.historyDelete}
                          </button>
                        </div>
                      </div>
                      {(item.images.length > 0 || item.videos.length > 0) && (
                        <div style={{ display: 'flex', gap: 4, padding: '0 14px 10px', overflowX: 'auto' }}>
                          {item.images.map((url, i) => (
                            <a key={`img-${i}`} href={url} target="_blank" rel="noopener noreferrer"
                              style={{ flexShrink: 0, width: 80, height: 60, borderRadius: 6, overflow: 'hidden', border: '1px solid #33373f', display: 'block', cursor: 'pointer' }}
                              onClick={e => { e.preventDefault(); openLightbox(item.images, i); }}>
                              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </a>
                          ))}
                          {item.videos.map((url, i) => (
                            <a key={`vid-${i}`} href={url} target="_blank" rel="noopener noreferrer"
                              style={{ flexShrink: 0, width: 80, height: 60, borderRadius: 6, overflow: 'hidden', border: '1px solid #7b68ee', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2a2760', color: '#b8afe0', fontSize: 20, textDecoration: 'none' }}>
                              🎬
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content area (only show when not browsing history) */}
          {!s.showHistory && (
            <>
              {/* Idle */}
              {s.genState === 'idle' && s.images.length === 0 && s.videos.length === 0 && (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#4a4f5e', gap: 12 }}>
                  <div style={{ fontSize: 56 }}>🎨</div>
                  <div style={{ fontSize: 16 }}>{t.emptyTipTitle}</div>
                  <div style={{ fontSize: 13 }}>{t.emptyTipSub}</div>
                </div>
              )}

              {/* Images */}
              {s.images.length > 0 && (
                <div>
                  <div style={{ fontSize: 14, color: '#8b909e', marginBottom: 16 }}>
                    {t.generatedCount.replace('{n}', String(s.images.length))}
                  </div>
                  {/* Prompt used (collapsible) */}
                  <details style={{ marginBottom: 12, background: '#1c1e22', border: '1px solid #33373f', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#8b909e' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 500, color: '#b8afe0' }}>{s.lang === 'zh' ? '提示词原文' : 'Prompt Used'}</summary>
                    <div style={{ marginTop: 6, lineHeight: 1.6, color: '#e4e6eb', whiteSpace: 'pre-wrap' }}>{s.prompt}</div>
                  </details>
                  {/* Tags */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                    <span style={{ background: '#2a2760', color: '#b8afe0', border: '1px solid #7b68ee', borderRadius: 6, padding: '2px 8px', fontSize: 11 }}>{getModelName(s.model)}</span>
                    {s.model === 'nano-banana' && (
                      <span style={{ background: '#1c1e22', color: '#8b909e', border: '1px solid #33373f', borderRadius: 6, padding: '2px 8px', fontSize: 11 }}>{s.currentSizeW}×{s.currentSizeH}</span>
                    )}
                    <span style={{ background: '#1c1e22', color: '#8b909e', border: '1px solid #33373f', borderRadius: 6, padding: '2px 8px', fontSize: 11 }}>{s.lang === 'zh' ? '耗时' : 'Time'}: {s.lang === 'zh' ? (s.model === 'kling-avatar' ? '1-3分钟' : '10-60秒') : (s.model === 'kling-avatar' ? '1-3 min' : '10-60 sec')}</span>
                  </div>
                  {/* Image grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${s.images.length === 1 ? '100%' : '280px'}, 1fr))`, gap: 16 }}>
                    {s.images.map((url, i) => (
                      <div key={i} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #33373f', background: '#1c1e22', transition: 'transform .2s' }}>
                        <div
                          onClick={() => openLightbox(s.images, i)}
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.01)')}
                          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                          <img src={url} alt={`img-${i + 1}`} style={{ width: '100%', display: 'block', aspectRatio: aspect, objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ flex: 1, fontSize: 12, color: '#8b909e' }}>{s.lang === 'zh' ? `图片 ${i + 1}` : `Image ${i + 1}`} ({s.currentSizeW}×{s.currentSizeH})</span>
                          <button
                            onClick={() => downloadImage(url, `gaike-image-${Date.now()}-${i + 1}.png`)}
                            style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: '#7b68ee', color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                            ⬇ {t.download}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Action buttons */}
                  <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                    <button onClick={copyPrompt}
                      style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #33373f', background: 'transparent', color: '#8b909e', cursor: 'pointer', fontSize: 13 }}>
                      📋 {t.copyPrompt}
                    </button>
                    <button onClick={handleGenerate}
                      style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#7b68ee,#5b8cf8)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                      🔄 {t.regenerate}
                    </button>
                  </div>
                </div>
              )}

              {/* Videos */}
              {s.videos.length > 0 && (
                <div style={{ marginTop: s.images.length > 0 ? 24 : 0 }}>
                  <div style={{ fontSize: 14, color: '#8b909e', marginBottom: 16 }}>
                    {t.generatedVideo}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16 }}>
                    {s.videos.map((url, i) => (
                      <div key={`v-${i}`} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #7b68ee', background: '#1c1e22' }}>
                        <video src={url} controls style={{ width: '100%', display: 'block' }} />
                        <div style={{ padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ flex: 1, fontSize: 12, color: '#8b909e' }}>{s.lang === 'zh' ? `视频 ${i + 1}` : `Video ${i + 1}`}</span>
                          <a href={url} target="_blank" rel="noopener noreferrer"
                            style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: '#7b68ee', color: '#fff', cursor: 'pointer', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                            ⬇ {t.download}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(s.images.length > 0 || s.videos.length > 0) && (
                <div style={{ marginTop: 24, padding: '14px 16px', background: '#1c1e22', borderRadius: 10, border: '1px solid #33373f', fontSize: 13, color: '#8b909e', lineHeight: 1.8 }}>
                  <strong style={{ color: '#e4e6eb' }}>{t.downloadTip}</strong><br />
                  {t.downloadTipText}<br />
                  {t.downloadTipRetry}
                </div>
              )}

              {/* Working */}
              {isWorking && s.images.length === 0 && s.videos.length === 0 && (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#8b909e', gap: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid #33373f', borderTopColor: '#7b68ee', animation: 'spin 1s linear infinite' }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  <div style={{ fontSize: 16, color: '#e4e6eb' }}>{s.progress}</div>
                  <div style={{ fontSize: 13 }}>{generatingSubText}</div>
                  {s.taskId && <div style={{ fontSize: 12, color: '#4a4f5e', wordBreak: 'break-all', maxWidth: 400, textAlign: 'center' }}>{t.taskId}: {s.taskId}</div>}
                </div>
              )}

              {/* Error */}
              {s.genState === 'error' && !s.progress && (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#e05c6a', gap: 12 }}>
                  <div style={{ fontSize: 52 }}>✨</div>
                  <div style={{ fontSize: 16 }}>{t.errorTitle}</div>
                  <div style={{ fontSize: 13, color: '#8b909e', maxWidth: 420, textAlign: 'center', lineHeight: 1.7 }}>{s.errorMsg}</div>
                  <button onClick={() => setS(st => ({ ...st, genState: 'idle', errorMsg: '' }))}
                    style={{ marginTop: 8, padding: '8px 24px', borderRadius: 8, border: '1px solid #e05c6a', background: 'transparent', color: '#e05c6a', cursor: 'pointer', fontSize: 13 }}>
                    {t.retry}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Lightbox overlay */}
      {s.lightboxIndex !== null && s.lightboxUrls.length > 0 && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,.92)', backdropFilter: 'blur(12px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,.1)')}
          >
            ✕
          </button>

          {/* Prev button */}
          {s.lightboxUrls.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); lightboxPrev(); }}
              style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', fontSize: 32, cursor: 'pointer', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,.1)')}
            >
              ‹
            </button>
          )}

          {/* Next button */}
          {s.lightboxUrls.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); lightboxNext(); }}
              style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', fontSize: 32, cursor: 'pointer', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,.1)')}
            >
              ›
            </button>
          )}

          {/* Image */}
          <img
            src={s.lightboxUrls[s.lightboxIndex]}
            alt="lightbox"
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 8px 40px rgba(0,0,0,.5)' }}
            onClick={e => e.stopPropagation()}
          />

          {/* Caption */}
          <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,.6)', color: '#fff', padding: '6px 16px', borderRadius: 20, fontSize: 13 }}>
            {s.lightboxIndex + 1} / {s.lightboxUrls.length}
          </div>
        </div>
      )}
    </div>
  );
}
