import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 多米 API 基础配置
const DUOMI_API_BASE = 'https://duomiapi.com';
const DUOMI_API_KEY = process.env.DUOMI_API_KEY || '';

// ──────────────────────────────────────────────
// Helper: 调用多米 API (POST)
// ──────────────────────────────────────────────
async function duomiPost(path: string, body: Record<string, unknown>) {
  const url = `${DUOMI_API_BASE}${path}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'key': DUOMI_API_KEY,
    },
    body: JSON.stringify(body),
  });
  return await resp.json() as Record<string, unknown>;
}

// Helper: 调用多米 API (GET)
async function duomiGet(path: string) {
  const url = `${DUOMI_API_BASE}${path}`;
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'key': DUOMI_API_KEY,
    },
  });
  return await resp.json() as Record<string, unknown>;
}

// ──────────────────────────────────────────────
// Health check
// ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    provider: 'duomiapi.com',
    hasKey: !!DUOMI_API_KEY,
  });
});

// ──────────────────────────────────────────────
// GET /api/models
// 返回可用的模型列表
// ──────────────────────────────────────────────
app.get('/api/models', (_req, res) => {
  res.json({
    models: [
      {
        id: 'nano-banana',
        name: 'Nano-Banana',
        description: 'Gemini 图片生成模型',
        type: 'image',
        icon: '🎨',
      },
      {
        id: 'kling-avatar',
        name: '可灵数字人',
        description: '图片转数字人视频',
        type: 'video',
        icon: '🎬',
      },
      {
        id: 'midjourney',
        name: 'Midjourney',
        description: 'MJ 免费图片生成',
        type: 'image',
        icon: '✨',
      },
    ],
  });
});

// ──────────────────────────────────────────────
// POST /api/images/generate
// 提交图片生成任务（nano-banana），返回 taskId
// ──────────────────────────────────────────────
app.post('/api/images/generate', async (req, res) => {
  const {
    prompt,
    model = 'gemini-3.1-flash-image-preview',
    size,
    n = 1,
    quality = 'high',
    style,
  } = req.body as Record<string, unknown>;

  if (!prompt) {
    return res.status(400).json({
      error: { message: 'prompt is required', type: 'invalid_request_error' }
    });
  }

  if (!DUOMI_API_KEY) {
    return res.status(500).json({
      error: { message: 'DUOMI_API_KEY not configured', type: 'server_error' }
    });
  }

  try {
    const duomiBody: Record<string, unknown> = {
      prompt: String(prompt),
      model: String(model),
      n: Number(n) || 1,
      quality: String(quality),
    };

    if (size) duomiBody.size = String(size);
    if (style) duomiBody.style = String(style);

    const data = await duomiPost('/api/gemini/nano-banana', duomiBody);

    if (data.code !== 200) {
      return res.status(400).json({
        error: { message: data.msg || '提交失败', type: 'api_error' }
      });
    }

    const taskId = (data.data as Record<string, unknown>)?.task_id as string;
    res.json({ taskId, model: 'nano-banana' });
  } catch (err) {
    console.error('[/api/images/generate]', err);
    res.status(500).json({
      error: { message: 'Internal server error', type: 'server_error' }
    });
  }
});

// ──────────────────────────────────────────────
// GET /api/images/task/:taskId
// 轮询 nano-banana 任务状态
// ──────────────────────────────────────────────
app.get('/api/images/task/:taskId', async (req, res) => {
  const { taskId } = req.params;

  if (!taskId) {
    return res.status(400).json({ error: { message: 'taskId required' } });
  }

  if (!DUOMI_API_KEY) {
    return res.status(500).json({ error: { message: 'DUOMI_API_KEY not configured' } });
  }

  try {
    const data = await duomiPost('/api/gemini/nano-banana/status', { id: taskId });

    if (data.code !== 200) {
      return res.status(400).json({
        error: { message: data.msg || '查询失败' }
      });
    }

    const taskData = data.data as Record<string, unknown>;
    const status = String(taskData.status);
    const stateMap: Record<string, string> = {
      '0': 'pending',
      '1': 'running',
      '2': 'failed',
      '3': 'succeeded',
    };

    const state = stateMap[status] || 'pending';
    let images: string[] = [];

    if (state === 'succeeded') {
      const innerData = taskData.data as Record<string, unknown> | null;
      if (innerData?.images && Array.isArray(innerData.images)) {
        images = (innerData.images as Record<string, unknown>[]).map(img => String(img.url));
      }
    }

    res.json({
      state,
      taskId,
      images,
      model: 'nano-banana',
      msg: taskData.msg || '',
    });
  } catch (err) {
    console.error('[/api/images/task/:taskId]', err);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
});

// ──────────────────────────────────────────────
// POST /api/kling/avatar
// 提交可灵数字人视频生成任务
// ──────────────────────────────────────────────
app.post('/api/kling/avatar', async (req, res) => {
  const { image, text, audio_url, mode = 'std' } = req.body as Record<string, unknown>;

  if (!image) {
    return res.status(400).json({
      error: { message: 'image is required (base64 or URL)', type: 'invalid_request_error' }
    });
  }

  if (!DUOMI_API_KEY) {
    return res.status(500).json({
      error: { message: 'DUOMI_API_KEY not configured', type: 'server_error' }
    });
  }

  try {
    const duomiBody: Record<string, unknown> = {
      image: String(image),
      mode: String(mode), // std or pro
    };

    if (text) duomiBody.text = String(text);
    if (audio_url) duomiBody.audio_url = String(audio_url);

    const data = await duomiPost('/api/video/kling/v1/videos/avatar/image2video', duomiBody);

    if (data.code !== 200) {
      return res.status(400).json({
        error: { message: data.msg || '提交失败', type: 'api_error' }
      });
    }

    const taskId = (data.data as Record<string, unknown>)?.task_id as string;
    res.json({ taskId, model: 'kling-avatar' });
  } catch (err) {
    console.error('[/api/kling/avatar]', err);
    res.status(500).json({
      error: { message: 'Internal server error', type: 'server_error' }
    });
  }
});

// ──────────────────────────────────────────────
// GET /api/kling/task/:taskId
// 轮询可灵数字人任务状态
// ──────────────────────────────────────────────
app.get('/api/kling/task/:taskId', async (req, res) => {
  const { taskId } = req.params;

  if (!taskId) {
    return res.status(400).json({ error: { message: 'taskId required' } });
  }

  if (!DUOMI_API_KEY) {
    return res.status(500).json({ error: { message: 'DUOMI_API_KEY not configured' } });
  }

  try {
    const data = await duomiPost('/api/video/kling/v1/videos/avatar/image2video/status', { id: taskId });

    if (data.code !== 200) {
      return res.status(400).json({
        error: { message: data.msg || '查询失败' }
      });
    }

    const taskData = data.data as Record<string, unknown>;
    const status = String(taskData.status);
    const stateMap: Record<string, string> = {
      '0': 'pending',
      '1': 'running',
      '2': 'failed',
      '3': 'succeeded',
    };

    const state = stateMap[status] || 'pending';
    let videos: string[] = [];
    let images: string[] = [];

    if (state === 'succeeded') {
      // 可灵返回视频URL
      if (taskData.video_url) videos = [String(taskData.video_url)];
      if (taskData.videos && Array.isArray(taskData.videos)) {
        videos = (taskData.videos as Record<string, unknown>[]).map(v => String(v.url || v));
      }
      // 也可能有封面图
      if (taskData.cover_url) images = [String(taskData.cover_url)];
    }

    res.json({
      state,
      taskId,
      videos,
      images,
      model: 'kling-avatar',
      msg: taskData.msg || '',
    });
  } catch (err) {
    console.error('[/api/kling/task/:taskId]', err);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
});

// ──────────────────────────────────────────────
// POST /api/mj/imagine
// 提交 Midjourney 绘图任务
// ──────────────────────────────────────────────
app.post('/api/mj/imagine', async (req, res) => {
  const { prompt, notify_hook, state: mjState } = req.body as Record<string, unknown>;

  if (!prompt) {
    return res.status(400).json({
      error: { message: 'prompt is required', type: 'invalid_request_error' }
    });
  }

  if (!DUOMI_API_KEY) {
    return res.status(500).json({
      error: { message: 'DUOMI_API_KEY not configured', type: 'server_error' }
    });
  }

  try {
    const duomiBody: Record<string, unknown> = {
      prompt: String(prompt),
    };

    if (notify_hook) duomiBody.notify_hook = String(notify_hook);
    if (mjState) duomiBody.state = String(mjState);

    const data = await duomiPost('/api/midjourney/submit/imagine', duomiBody);

    if (data.code !== 200) {
      return res.status(400).json({
        error: { message: data.msg || '提交失败', type: 'api_error' }
      });
    }

    const taskId = (data.data as Record<string, unknown>)?.task_id as string
      || (data.data as Record<string, unknown>)?.id as string;
    res.json({ taskId, model: 'midjourney' });
  } catch (err) {
    console.error('[/api/mj/imagine]', err);
    res.status(500).json({
      error: { message: 'Internal server error', type: 'server_error' }
    });
  }
});

// ──────────────────────────────────────────────
// GET /api/mj/task/:taskId
// 轮询 Midjourney 任务状态
// ──────────────────────────────────────────────
app.get('/api/mj/task/:taskId', async (req, res) => {
  const { taskId } = req.params;

  if (!taskId) {
    return res.status(400).json({ error: { message: 'taskId required' } });
  }

  if (!DUOMI_API_KEY) {
    return res.status(500).json({ error: { message: 'DUOMI_API_KEY not configured' } });
  }

  try {
    const data = await duomiGet(`/api/midjourney/feed?task_id=${encodeURIComponent(taskId)}`);

    if (data.code !== 200) {
      return res.status(400).json({
        error: { message: data.msg || '查询失败' }
      });
    }

    const taskData = data.data as Record<string, unknown>;
    const status = String(taskData.status);

    // MJ 状态: pending/running/succeeded/error
    let state = status;
    if (status === 'error' || status === 'failed') state = 'failed';

    let images: string[] = [];

    if (state === 'succeeded' && taskData.image_url) {
      images = [String(taskData.image_url)];
    }
    if (state === 'succeeded' && taskData.images && Array.isArray(taskData.images)) {
      images = (taskData.images as Record<string, unknown>[]).map(img => String(img.url || img));
    }

    res.json({
      state,
      taskId,
      images,
      model: 'midjourney',
      msg: taskData.msg || '',
    });
  } catch (err) {
    console.error('[/api/mj/task/:taskId]', err);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
});

// ──────────────────────────────────────────────
// POST /api/images/task/:taskId/refresh
// 兼容旧接口
// ──────────────────────────────────────────────
app.post('/api/images/task/:taskId/refresh', (req, res) => {
  req.url = `/api/images/task/${req.params.taskId}`;
  app._router!.handle(req, res);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API Provider: duomiapi.com`);
  console.log(`🔑 API Key configured: ${DUOMI_API_KEY ? 'YES' : 'NO ⚠️'}`);
  console.log(`📋 Models: nano-banana, kling-avatar, midjourney`);
});
