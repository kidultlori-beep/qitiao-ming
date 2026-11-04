import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { SiteFooter } from '../components/SiteFooter';

const STORAGE_KEY = 'qitiao-ming-complaints-v1';

type ComplaintRecord = {
  id: string;
  name: string;
  contact: string;
  workTitle: string;
  urlOrId: string;
  detail: string;
  createdAt: string;
};

export function Complaint() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [workTitle, setWorkTitle] = useState('');
  const [urlOrId, setUrlOrId] = useState('');
  const [detail, setDetail] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !contact.trim() || !detail.trim()) {
      setError('请至少填写姓名/称呼、联系方式与投诉说明。');
      return;
    }
    const record: ComplaintRecord = {
      id: `c_${Date.now()}`,
      name: name.trim(),
      contact: contact.trim(),
      workTitle: workTitle.trim(),
      urlOrId: urlOrId.trim(),
      detail: detail.trim(),
      createdAt: new Date().toISOString(),
    };
    try {
      const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as ComplaintRecord[];
      localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...prev].slice(0, 50)));
    } catch {
      // ignore quota
    }
    setDone(true);
  };

  const mailto = () => {
    const subject = encodeURIComponent(`[七条命版权投诉] ${workTitle || '未命名作品'}`);
    const body = encodeURIComponent(
      `称呼：${name}\n联系：${contact}\n作品：${workTitle}\n链接/标识：${urlOrId}\n说明：\n${detail}\n`,
    );
    window.location.href = `mailto:dmca@qitiaoming.example?subject=${subject}&body=${body}`;
  };

  return (
    <div className="legal-page">
      <p>
        <Link to="/" style={{ color: 'var(--accent)' }}>
          ← 返回首页
        </Link>
      </p>
      <h1>版权投诉 / 下架申请</h1>
      <p className="note">
        若您认为站内内容或创作工坊用户包侵犯您的合法权利，请填写本表。当前 MVP
        将记录保存在本机 localStorage，并提供 mailto 占位；正式受理后端接入后会迁移。
      </p>

      {done ? (
        <div className="success-box">
          <p>已记录投诉草稿（本地）。感谢反馈。我们会在正式通道启用后优先处理。</p>
          <div className="row">
            <button type="button" className="btn" onClick={mailto}>
              同时打开邮件客户端（占位）
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                setDone(false);
                setName('');
                setContact('');
                setWorkTitle('');
                setUrlOrId('');
                setDetail('');
              }}
            >
              再填一份
            </button>
          </div>
        </div>
      ) : (
        <form className="complaint-form" onSubmit={onSubmit}>
          <label>
            姓名 / 称呼 *
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            联系方式（邮箱或手机）*
            <input value={contact} onChange={(e) => setContact(e.target.value)} required />
          </label>
          <label>
            主张权利的作品名称
            <input value={workTitle} onChange={(e) => setWorkTitle(e.target.value)} />
          </label>
          <label>
            涉嫌侵权链接或内容标识
            <input value={urlOrId} onChange={(e) => setUrlOrId(e.target.value)} />
          </label>
          <label>
            投诉说明 *
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              required
              rows={6}
              placeholder="请简述权属证明与希望的处理方式（下架 / 修改标注等）"
            />
          </label>
          {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
          <div className="row">
            <button type="submit" className="btn primary">
              提交（本地记录）
            </button>
            <button type="button" className="btn" onClick={mailto}>
              改用邮件占位
            </button>
          </div>
        </form>
      )}
      <SiteFooter />
    </div>
  );
}
