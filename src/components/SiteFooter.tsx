import { Link } from 'react-router-dom';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <nav className="site-footer-nav" aria-label="页脚">
        <Link to="/">首页</Link>
        <Link to="/studio">创作工坊</Link>
        <Link to="/privacy">隐私政策</Link>
        <Link to="/terms">用户协议</Link>
        <Link to="/complaint">版权投诉</Link>
      </nav>
      <p className="site-footer-note">
        七条命 · 单机中文对话游戏 MVP · 即将开放创作者计划
      </p>
    </footer>
  );
}
