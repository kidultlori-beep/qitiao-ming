# 七条命（qitiao-ming）

单机中文对话游戏 **MVP**。女主沈昭宁，七条命，账本 / 人情 / 公开度驱动权谋分支。

源故事气质参考公开网络文学题材；游戏正文为**原创改写**的旁白与对白，**非整章粘贴**原著。

品牌全站统一：**七条命**。创作者计划**即将开放**（支付未真接入）。

## 本地预览

```bash
cd /workspace/qitiao-ming
npm install
npm run dev      # http://localhost:5173
npm run build    # 产出 dist/
npm run preview  # 预览构建结果
```

手机宽度亦可游玩。主存档键：`localStorage` → `qitiao-ming-save-v1`。

| 路径 | 说明 |
|------|------|
| `/` | 首页介绍 + 开始游戏（序章→卷一） |
| `/studio` | 创作工坊（权利声明 / mock 生成 / 试玩 / 申请发布） |
| `/play-studio` | 试玩工坊包 |
| `/privacy` `/terms` | 隐私政策 / 用户协议（简版，非正式律师稿） |
| `/complaint` | 版权投诉 / 下架申请 |

## 玩法规则

| 资源 | 说明 |
|------|------|
| **命数 lives** | 初始 7。死亡 −1，回流最近检查点；**已确认**账本条目保留。 |
| **账本 ledger** | `{ id, kind: 人\|事\|物\|数, title, detail, confirmed }` |
| **人情 bonds** | NPC → 整数好感 |
| **公开度 publicity** | 0–100 |
| **场景 graph** | 节点含 narration / speakers / choices；选项可要求 flags/ledger/bonds |

正文约定：**不出现「毒」字**。

## 内容包

- `src/content/prologue.json` — 序章（拒嫁衣 / 反将验身 / 裴玄 / 城南废园）
- `src/content/volume1.json` — 卷一骨架（缺页 / 递钥 / 收针 / 讨债并账 / 人归）
- `src/content/index.ts` — 合并为 MVP 主包 `qitiao-ming-mvp`

序章结局节点可「结算离场」或「进入卷一」。卷一清晰结局示例：缺页之证、并账清场、人归。

## 如何添加章节

1. 在 `src/content/` 新建 JSON（参考 `schema.example.json`）。
2. 在 `src/content/index.ts` 的 `sourcePacks` 注册，并由 `mergePacks` 并入主包。
3. 保证节点 id 全局唯一；用 choice `effects.goto` / `ending` 衔接。

引擎：`src/engine/gameEngine.ts`。类型：`src/types/schema.ts`。

## 创作工坊

- 必勾作者权利声明 → mock 生成 → 存 `localStorage` → 试玩 / 导出 JSON → 申请发布（预审：**待审**）
- 正式 LLM 与支付后接；当前不调用模型、不下权重

## 静态部署

本仓库为 **Vite SPA**，适合静态托管。

- Render Blueprint：根目录 `render.yaml`（`runtime: static`，SPA rewrite → `/index.html`）
- Netlify / Cloudflare Pages：`public/_redirects`（`/* /index.html 200`）会随构建复制到 `dist/`

```bash
npm ci && npm run build
# 将 dist/ 发布为静态站点即可
```

若尚未配置 git remote，推送与 Render 自动部署需自行补远端后连接。

## 技术栈

Vite + React + TypeScript + React Router。纯前端，无服务端依赖。
