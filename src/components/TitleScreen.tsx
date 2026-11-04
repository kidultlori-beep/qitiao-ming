import { SiteFooter } from './SiteFooter';

type Props = {
  hasSave: boolean;
  onNew: () => void;
  onContinue: () => void;
  onStudio: () => void;
};

export function TitleScreen({ hasSave, onNew, onContinue, onStudio }: Props) {
  return (
    <div className="title-screen">
      <p className="brand-tag">单机 · 中文 · 对话权谋</p>
      <h1>七条命</h1>
      <p className="subtitle">
        被逼自刎之后，她只剩七条命。
        <br />
        账本、人情、公开度——每一刀都要算清楚。
      </p>
      <div className="intro-card">
        <p>
          <strong>七条命</strong>是一款可在手机上游玩的单机中文对话游戏。女主沈昭宁以命数回流、账本取证推进分支；本 MVP
          含序章与卷一骨架，至少三条清晰结局。正文为原创改写，非整章粘贴原著。
        </p>
        <p>
          创作工坊可粘贴文本 mock 生成关卡并申请发布（预审：待审）。创作者计划即将开放，支付尚未接入。
        </p>
      </div>
      <div className="title-actions">
        <button type="button" className="btn primary" onClick={onNew}>
          开始游戏
        </button>
        <button type="button" className="btn" onClick={onContinue} disabled={!hasSave}>
          继续游戏
        </button>
        <button type="button" className="btn ghost" onClick={onStudio}>
          创作工坊
        </button>
      </div>
      <SiteFooter />
    </div>
  );
}
