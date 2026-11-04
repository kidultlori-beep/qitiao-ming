import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ChapterPack } from '../types/schema';
import { SiteFooter } from '../components/SiteFooter';

type Phase = 'idle' | 'uploading' | 'parsing' | 'done' | 'error';

const STUDIO_PACK_KEY = 'qitiao-ming-studio-pack-v1';
const STUDIO_PUBLISH_KEY = 'qitiao-ming-studio-publish-v1';

/** Mock：把粘贴文本切成简易对话关骨架，不接真 LLM */
function mockGenerate(raw: string): ChapterPack {
  const lines = raw
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);

  const nodes = lines.map((line, i) => {
    const id = `gen_${i + 1}`;
    const next = i < lines.length - 1 ? `gen_${i + 2}` : 'gen_end';
    return {
      id,
      title: i === 0 ? '生成章 · 起' : undefined,
      narration: line.slice(0, 120),
      speakers: [
        {
          speaker: i % 2 === 0 ? '旁白' : '角色',
          text: line.length > 40 ? `${line.slice(0, 40)}……` : line,
        },
      ],
      choices: [
        {
          id: `c_${id}`,
          text: i < lines.length - 1 ? '继续' : '走向结局',
          effects: i < lines.length - 1 ? { goto: next } : { ending: 'gen_clear' },
        },
      ],
      onEnter: i === 0 ? { checkpoint: true } : undefined,
    };
  });

  nodes.push({
    id: 'gen_end',
    title: '生成章 · 终',
    narration: '（Mock 生成结束。正式环境将由后端 LLM 产出完整分支。）',
    speakers: [{ speaker: '系统', text: '可试玩本包，或导出 JSON。正式 LLM 后接。' }],
    choices: [
      {
        id: 'c_end',
        text: '结束',
        effects: { ending: 'gen_clear' },
      },
    ],
    onEnter: undefined,
  });

  return {
    id: `mock_${Date.now()}`,
    title: 'Mock 生成关卡',
    description: '由粘贴小说文本 mock 生成，非正式 LLM 结果。',
    startNode: nodes[0]?.id ?? 'gen_end',
    nodes,
    endings: [
      {
        id: 'gen_clear',
        title: 'Mock 通关',
        summary: '这是创作工坊的示意结局。正式生成需接后端 LLM。',
        kind: 'clear',
      },
    ],
    npcs: [{ id: 'role', name: '角色' }],
  };
}

type PublishForm = {
  title: string;
  author: string;
  contact: string;
  note: string;
};

export function Studio() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [rightsOk, setRightsOk] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [pack, setPack] = useState<ChapterPack | null>(() => {
    try {
      const raw = localStorage.getItem(STUDIO_PACK_KEY);
      return raw ? (JSON.parse(raw) as ChapterPack) : null;
    } catch {
      return null;
    }
  });
  const [status, setStatus] = useState('等待粘贴小说文本……');
  const [publish, setPublish] = useState<PublishForm>({
    title: '',
    author: '',
    contact: '',
    note: '',
  });
  const [publishMsg, setPublishMsg] = useState('');

  const jsonPreview = useMemo(
    () => (pack ? JSON.stringify(pack, null, 2) : ''),
    [pack],
  );

  const persistPack = (p: ChapterPack) => {
    setPack(p);
    try {
      localStorage.setItem(STUDIO_PACK_KEY, JSON.stringify(p));
    } catch {
      // ignore
    }
  };

  const runMock = async () => {
    if (!text.trim()) {
      setPhase('error');
      setStatus('请先粘贴至少一段文本。');
      return;
    }
    if (!rightsOk) {
      setPhase('error');
      setStatus('请先勾选作者权利声明。');
      return;
    }
    setPhase('uploading');
    setStatus('上传文本（本地 mock）……');
    setProgress(15);
    await wait(400);
    setPhase('parsing');
    setStatus('解析章节结构（mock 进度）……');
    setProgress(45);
    await wait(500);
    setStatus('生成对话节点与选项骨架……');
    setProgress(75);
    await wait(500);
    const generated = mockGenerate(text);
    persistPack(generated);
    setProgress(100);
    setPhase('done');
    setStatus('完成。结果已写入 localStorage。可试玩、导出，或申请发布（预审：待审）。正式 LLM 后接。');
    setPublish((prev) => ({ ...prev, title: prev.title || generated.title }));
  };

  const download = () => {
    if (!pack) return;
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pack.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tryPlay = () => {
    if (!pack) return;
    persistPack(pack);
    navigate('/play-studio');
  };

  const submitPublish = () => {
    if (!pack) {
      setPublishMsg('请先生成关卡包。');
      return;
    }
    if (!rightsOk) {
      setPublishMsg('申请发布前须勾选作者权利声明。');
      return;
    }
    if (!publish.title.trim() || !publish.author.trim() || !publish.contact.trim()) {
      setPublishMsg('请填写作品标题、作者名与联系方式。');
      return;
    }
    const record = {
      id: `pub_${Date.now()}`,
      status: '待审' as const,
      submittedAt: new Date().toISOString(),
      packId: pack.id,
      ...publish,
    };
    try {
      const prev = JSON.parse(localStorage.getItem(STUDIO_PUBLISH_KEY) ?? '[]') as unknown[];
      localStorage.setItem(STUDIO_PUBLISH_KEY, JSON.stringify([record, ...prev].slice(0, 30)));
    } catch {
      // ignore
    }
    setPublishMsg(`已提交「${publish.title}」，预审状态：待审。正式审核与 LLM 生成后接。`);
  };

  return (
    <div className="studio">
      <p>
        <Link to="/" style={{ color: 'var(--accent)' }}>
          ← 返回游戏
        </Link>
      </p>
      <h1>
        创作工坊
        <span className="badge">即将开放创作者计划</span>
      </h1>
      <p className="note">
        流程：粘贴小说 → 勾选权利声明 → mock/规则化生成对话关 → 试玩导入包 →
        申请发布（预审：待审）。当前为前端 mock，不消耗模型、不上传外网；正式 LLM 后接后端。
      </p>

      <label className="rights-check">
        <input
          type="checkbox"
          checked={rightsOk}
          onChange={(e) => setRightsOk(e.target.checked)}
        />
        <span>
          我声明对粘贴文本拥有著作权或已获合法授权，并同意平台对违规内容下架。未勾选无法生成或申请发布。
        </span>
      </label>

      <label htmlFor="novel" style={{ display: 'block', marginTop: 16, marginBottom: 8 }}>
        粘贴小说片段
      </label>
      <textarea
        id="novel"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="在此粘贴自有章节或大纲……请勿粘贴整本未授权长文"
      />

      <div className="row">
        <button
          type="button"
          className="btn primary"
          onClick={runMock}
          disabled={phase === 'parsing' || phase === 'uploading'}
        >
          生成关卡（Mock）
        </button>
        <button type="button" className="btn" onClick={download} disabled={!pack}>
          导出 JSON
        </button>
        <button type="button" className="btn" onClick={tryPlay} disabled={!pack}>
          试玩本包
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            setText('');
            setPack(null);
            setPhase('idle');
            setProgress(0);
            setStatus('已清空。');
            setPublishMsg('');
            localStorage.removeItem(STUDIO_PACK_KEY);
          }}
        >
          清空
        </button>
      </div>

      <div className="progress" aria-hidden>
        <span style={{ width: `${progress}%` }} />
      </div>
      <p style={{ color: phase === 'error' ? 'var(--danger)' : 'var(--ink-dim)', fontSize: '0.9rem' }}>
        {status}
      </p>

      <h2 className="studio-h2">申请发布</h2>
      <p className="note">提交后预审状态固定为「待审」。支付与正式上架通道即将开放创作者计划，当前不做真支付接入。</p>
      <div className="publish-grid">
        <label>
          作品标题
          <input
            value={publish.title}
            onChange={(e) => setPublish({ ...publish, title: e.target.value })}
          />
        </label>
        <label>
          作者名
          <input
            value={publish.author}
            onChange={(e) => setPublish({ ...publish, author: e.target.value })}
          />
        </label>
        <label>
          联系方式
          <input
            value={publish.contact}
            onChange={(e) => setPublish({ ...publish, contact: e.target.value })}
          />
        </label>
        <label>
          备注
          <input
            value={publish.note}
            onChange={(e) => setPublish({ ...publish, note: e.target.value })}
          />
        </label>
      </div>
      <div className="row">
        <button type="button" className="btn primary" onClick={submitPublish} disabled={!pack}>
          申请发布
        </button>
        {publishMsg && <span className="publish-msg">{publishMsg}</span>}
      </div>

      <h2 className="studio-h2">API 骨架（示意 · 正式 LLM 后接）</h2>
      <pre>{`POST /api/generate-chapter
Content-Type: application/json
Authorization: Bearer <创作者凭证>

{
  "title": "自定义章名",
  "sourceText": "...",
  "options": { "maxNodes": 40, "language": "zh-CN" }
}

→ 202 { "jobId": "..." }
GET  /api/generate-chapter/:jobId → { "status": "done", "pack": ChapterPack }`}</pre>

      {pack && (
        <>
          <h2 className="studio-h2">导出预览（已存 localStorage）</h2>
          <pre>{jsonPreview}</pre>
        </>
      )}

      <SiteFooter />
    </div>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export { STUDIO_PACK_KEY };
