import { Link } from 'react-router-dom';
import { SiteFooter } from '../components/SiteFooter';

type Kind = 'privacy' | 'terms';

const COPY: Record<Kind, { title: string; body: string[] }> = {
  privacy: {
    title: '隐私政策（简版）',
    body: [
      '本页为产品上线所需的简版说明，非正式律师稿，仅供参考。正式法务文本上线前以后续更新为准。',
      '「七条命」当前为纯前端静态站点。游戏进度与创作工坊草稿默认保存在您本机浏览器的 localStorage，不会自动上传到服务器。',
      '若您自愿通过「申请发布」或「版权投诉」等表单留下联系方式，该信息在当前 MVP 仅作本地记录或 mailto 占位，待后端接入后才会按明示用途处理。',
      '我们不主动收集精确地理位置、通讯录或设备通讯内容。部署平台（如 Render / Netlify）可能产生常规访问日志（IP、User-Agent 等），遵循其各自隐私政策。',
      '如您清除浏览器数据，本地存档与草稿将一并删除且无法恢复。',
      '联系占位：privacy@qitiaoming.example（尚未启用，请优先使用站内「版权投诉」页）。',
    ],
  },
  terms: {
    title: '用户协议（简版）',
    body: [
      '本页为产品上线所需的简版说明，非正式律师稿，仅供参考。',
      '您可免费游玩本站内置的「七条命」序章与卷一骨架。创作者计划与付费能力即将开放，支付尚未真实接入。',
      '游戏正文为原创改写的旁白与对白，气质参考公开网络文学题材，但非整章粘贴原著。请勿将本站内容再包装为原著或其官方衍生。',
      '创作工坊允许您粘贴自有或已获授权文本并生成关卡骨架（当前为本地 mock）。您须勾选权利声明，并自行确保不侵犯第三方著作权。',
      '禁止利用本站上传、传播违法违规内容，或对服务进行攻击、滥用与批量抓取。',
      '本站按「现状」提供，不对存档永久可用、生成质量或上线审核结果作保证。命尽、坏结局与分支损失均属游戏机制的一部分。',
      '我们保留对违规 UGC 下架、拒审与封禁发布资格的权利；版权投诉入口见站内页面。',
    ],
  },
};

export function Legal({ kind }: { kind: Kind }) {
  const doc = COPY[kind];
  return (
    <div className="legal-page">
      <p>
        <Link to="/" style={{ color: 'var(--accent)' }}>
          ← 返回首页
        </Link>
      </p>
      <h1>{doc.title}</h1>
      <p className="legal-banner">非正式律师稿 · 简版 · 以产品可上线为目的</p>
      {doc.body.map((p) => (
        <p key={p.slice(0, 24)} className="legal-p">
          {p}
        </p>
      ))}
      <SiteFooter />
    </div>
  );
}
