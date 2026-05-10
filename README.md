# ChatGPT Images 2.0

基于 OpenAI GPT Image 2 API 的图像生成应用。

## 架构

```
前端 (Vercel) → 后端 (Railway) → OpenAI API (gpt-image-2)
   React+TS      Express+TS       Images Generation
```

## 快速开始

### 后端

```bash
cd backend
cp .env.example .env
# 编辑 .env 填入你的 OPENAI_API_KEY
npm install
npm run dev
# 服务运行在 http://localhost:3001
```

### 前端

```bash
cd frontend
npm install
npm run dev
# 运行在 http://localhost:5173
```

## 部署

### Railway（后端）

1. 连接 GitHub 仓库
2. 设置环境变量：
   - `OPENAI_API_KEY` = 你的 OpenAI API Key
   - `PORT` = `3001`
3. Root Directory: `backend`
4. Deploy

### Vercel（前端）

1. 导入 GitHub 仓库
2. Root Directory: `frontend`
3. 环境变量：`VITE_API_URL` = 你的 Railway 后端地址
4. Deploy

## API 接口

### POST /api/images/generate

请求体：

```json
{
  "prompt": "一只可爱的猫咪",
  "size": "1024x1024",
  "n": 1,
  "quality": "medium"
}
```

参数说明：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| prompt | string | ✅ | 图像描述提示词 |
| size | string | ❌ | 尺寸，默认 `1024x1024` |
| n | number | ❌ | 数量 1-10，默认 1 |
| quality | string | ❌ | 质量 low/medium/high，默认 medium |

## 技术栈

- **前端**: React 19 + Vite + TypeScript + Tailwind CSS v4
- **后端**: Express + TypeScript + Node.js 20
- **API**: OpenAI Images API (gpt-image-2)
