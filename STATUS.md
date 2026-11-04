# 七条命 — 状态

更新时间：2026-11-05 00:41（Asia/Shanghai）

## READY_FOR_LAUNCH=yes

### 上线清单

- [x] `npm run build` 通过（Vite SPA → `dist/`）
- [x] 品牌统一：**七条命**
- [x] 首页 `/`：产品简介 +「开始游戏」+ 页脚链到隐私 / 协议 / 投诉 / 工坊
- [x] 游戏：序章 + 卷一骨架可玩；清晰结局 ≥3（序章立案/废园/撕破 + 卷一缺页/并账/人归）
- [x] 命 / 账本 / 存档（localStorage）稳定；手机宽度可读
- [x] `/studio`：权利声明必勾、mock 生成、localStorage、试玩、申请发布（待审）；说明正式 LLM 后接
- [x] `/complaint` 版权投诉（本地记录 + mailto 占位）
- [x] `/privacy` `/terms` 简版法务（标明非正式律师稿）
- [x] 静态部署：`render.yaml`（runtime static + SPA rewrite）+ `public/_redirects`
- [x] 正文扫描无「毒」字；未整章粘贴原著
- [x] 体积远小于 1GB（无模型权重）
- [x] 收费文案：即将开放创作者计划（无真支付）

### 手动验收路径

1. **卷一 · 缺页/人归（推荐）**  
   新游戏 → 拒穿 → 拆夹层 → 烧衣 → 划腕 → 应验身 → 调包瓷瓶 → 裴玄立案谈话 → 出示瓷瓶 → **立案后继续追查缺页** → 缺页线（裴玄或吴婆或自翻箱）→ 递钥 → 收针 → 药铺取缺页 → 分岔选「人归」或「缺页之证」/「并账」。
2. **废园 → 卷一**  
   至废园取密册时选「密册到手，追查缺页」→ 同上卷一。
3. **序章早结局**  
   正式立案（结算）/ 废园密钥（结算）/ 当众撕破（结算）仍可用。
4. **死亡回流**  
   第3章「当众咬定」→「硬闯书房」；命 −1，回流检查点，已确认账本保留。
5. **工坊**  
   `/studio` 勾选声明 → 粘贴数行 → 生成 → 试玩 → 申请发布见「待审」。
6. **法务/投诉**  
   页脚进入隐私、协议、版权投诉，提交成功提示。

### 本地预览

```bash
cd /workspace/qitiao-ming
npm install && npm run dev
# http://localhost:5173
```

生产预览：`npm run build && npm run preview`

### 部署还差什么

- 将仓库推到 git remote（**当前目录尚未 `git init` / 无 remote，需自建后再连 Render**）
- 在 Render 使用 Blueprint `render.yaml` 创建 Static Site，或把 `dist/` 丢到 Netlify / Cloudflare Pages / 任意静态 CDN
- 自定义域名与正式隐私邮箱（现为 example 占位）
- 创作者计划：后端 LLM、审核队列、支付 —— **未做**（文案已预留）

## 已完成（摘要）

- Vite + React + TS；引擎与 schema 分离
- 序章 28+ 节点；卷一约 23 节点；合并主包 `qitiao-ming-mvp`
- UI：命数灯、公开度、账本/人情；结局屏
- 工坊 mock + 发布预审本地记录
- 静态站 SPA fallback 配置就绪

## 体积（约）

| 项 | 大小 |
|----|------|
| 源码 `src/` | ~204KB |
| 构建 `dist/` | ~360KB |
| 项目（不含 node_modules） | 远小于 1GB |

无模型权重。


## 已知限制

- `/studio` 未接真实后端 / LLM（仅 mock）
- 无音效、立绘；卷一为骨架非 215 章全量
- 投诉与发布仅 localStorage / mailto 占位
- 无自动化 E2E
- 法务文本为简版非正式律师稿

## 公网

- 站点：https://qitiao-ming.onrender.com
- 仓库：https://github.com/kidultlori-beep/qitiao-ming
- Render：https://dashboard.render.com/static/srv-dblm150n74is73c3nm4g
