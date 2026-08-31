'use client';

import { FormEvent, useEffect, useState } from 'react';
import styles from './page.module.scss';

type Resource = 'publication' | 'project' | 'people' | 'lecture' | 'news';
type Item = Record<string, unknown> & { uid: number };

const resources: { key: Resource; label: string }[] = [
  { key: 'news', label: '소식' },
  { key: 'publication', label: '논문' },
  { key: 'project', label: '프로젝트' },
  { key: 'people', label: '구성원' },
  { key: 'lecture', label: '강의' },
];

const fields: Record<Resource, { key: string; label: string; type?: string; required?: boolean; options?: [string, string][]; help?: string }[]> = {
  news: [
    { key: 'title', label: '제목', required: true },
    { key: 'content', label: '내용', type: 'textarea', required: true, help: '마크다운 문법을 사용할 수 있습니다.' },
    { key: 'isHeadline', label: '메인 화면에 표시', type: 'select', options: [['0', '표시 안 함'], ['1', '표시']] },
  ],
  publication: [
    { key: 'type', label: '유형', type: 'select', options: [['1', '출판 논문'], ['0', '프리프린트']] },
    { key: 'title', label: '논문 제목', required: true },
    { key: 'author', label: '저자', required: true },
    { key: 'information', label: '학술지·학회', required: true },
    { key: 'publishedAt', label: '게재일', type: 'date' },
    { key: 'url', label: '논문 링크', type: 'url' },
    { key: 'image', label: '대표 이미지 주소', type: 'url' },
  ],
  project: [
    { key: 'title', label: '프로젝트명', required: true },
    { key: 'period', label: '기간', required: true, help: '예: 2025.03 – 2027.02' },
    { key: 'ongoing', label: '진행 상태', type: 'select', options: [['1', '진행 중'], ['0', '종료']] },
    { key: 'organization', label: '지원 기관' },
    { key: 'information', label: '설명', type: 'textarea' },
    { key: 'article', label: '관련 자료', type: 'lines', help: '한 줄에 하나씩 “자료명 | https://주소” 형식으로 입력하세요.' },
  ],
  people: [
    { key: 'degree', label: '구분', type: 'select', options: [['1', '박사후연구원'], ['2', '박사과정'], ['3', '석사과정'], ['4', '졸업생']] },
    { key: 'name', label: '이름', required: true },
    { key: 'alias', label: '영문명' },
    { key: 'email', label: '이메일', type: 'email', required: true },
    { key: 'image', label: '사진 주소', type: 'url' },
    { key: 'history', label: '약력', type: 'lines', help: '한 줄에 하나씩 “기간 | 내용” 형식으로 입력하세요.' },
  ],
  lecture: [
    { key: 'title', label: '강의명', required: true },
    { key: 'year', label: '연도', type: 'number', required: true },
    { key: 'semester', label: '학기', type: 'select', options: [['1', '1학기'], ['2', '2학기']] },
    { key: 'postgraduate', label: '과정', type: 'select', options: [['0', '학부'], ['1', '대학원']] },
  ],
};

const emptyForm = (resource: Resource) => Object.fromEntries(fields[resource].map((field) => [field.key, field.options?.[0][0] || '']));
const displayName = (item: Item) => String(item.title || item.name || `#${item.uid}`);

const toForm = (resource: Resource, item: Item) => {
  const form: Record<string, string> = { uid: String(item.uid) };
  for (const field of fields[resource]) {
    const value = item[field.key];
    if (field.type === 'date') form[field.key] = value ? String(value).slice(0, 10) : '';
    else if (field.type === 'lines' && Array.isArray(value)) {
      form[field.key] = value.map((entry: Record<string, unknown>) => resource === 'project' ? `${entry.title} | ${entry.url}` : `${entry.period} | ${entry.information}`).join('\n');
    } else form[field.key] = value == null ? '' : String(value);
  }
  return form;
};

const toPayload = (resource: Resource, form: Record<string, string>) => {
  const payload: Record<string, unknown> = { ...form };
  for (const field of fields[resource]) {
    if (field.type !== 'lines') continue;
    payload[field.key] = (form[field.key] || '').split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
      const [first, ...rest] = line.split('|');
      return resource === 'project'
        ? { title: first.trim(), url: rest.join('|').trim() }
        : { period: first.trim(), information: rest.join('|').trim() };
    });
  }
  return payload;
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [resource, setResource] = useState<Resource>('news');
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState<Record<string, string>>(emptyForm('news'));
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async (nextResource = resource) => {
    const response = await fetch(`/api/admin/content?resource=${nextResource}`);
    if (response.status === 401) return setAuthenticated(false);
    const result = await response.json();
    setItems(result.data || []);
  };

  useEffect(() => {
    fetch('/api/admin/session').then((response) => response.json()).then(({ authenticated: value }) => {
      setAuthenticated(value);
      if (value) load('news');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage('');
    const response = await fetch('/api/admin/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    const result = await response.json(); setBusy(false);
    if (!response.ok) return setMessage(result.error);
    setAuthenticated(true); setPassword(''); await load('news');
  };

  const changeResource = async (next: Resource) => {
    setResource(next); setForm(emptyForm(next)); setMessage(''); await load(next);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage('');
    const response = await fetch(`/api/admin/content?resource=${resource}`, {
      method: form.uid ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(toPayload(resource, form)),
    });
    const result = await response.json(); setBusy(false);
    if (!response.ok) return setMessage(result.error || '저장하지 못했습니다.');
    setMessage('저장했습니다.'); setForm(emptyForm(resource)); await load();
  };

  const remove = async (item: Item) => {
    if (!window.confirm(`“${displayName(item)}” 항목을 삭제할까요?`)) return;
    const response = await fetch(`/api/admin/content?resource=${resource}&uid=${item.uid}`, { method: 'DELETE' });
    if (!response.ok) return setMessage('삭제하지 못했습니다.');
    setForm(emptyForm(resource)); setMessage('삭제했습니다.'); await load();
  };

  if (authenticated === null) return <main className={styles.center}>확인 중…</main>;
  if (!authenticated) return (
    <main className={styles.center}>
      <form className={styles.login} onSubmit={login}>
        <span className={styles.eyebrow}>MATHEMATICAL INTELLIGENCE LAB.</span>
        <h1>홈페이지 관리</h1>
        <p>관리자 비밀번호를 입력해 주세요.</p>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus required />
        {message && <p className={styles.error}>{message}</p>}
        <button disabled={busy}>{busy ? '로그인 중…' : '로그인'}</button>
      </form>
    </main>
  );

  return (
    <main className={styles.admin}>
      <header><div><span className={styles.eyebrow}>MATHEMATICAL INTELLIGENCE LAB.</span><h1>홈페이지 관리</h1></div><button className={styles.secondary} onClick={async () => { await fetch('/api/admin/session', { method: 'DELETE' }); setAuthenticated(false); }}>로그아웃</button></header>
      <nav>{resources.map((item) => <button key={item.key} className={resource === item.key ? styles.active : ''} onClick={() => changeResource(item.key)}>{item.label}</button>)}</nav>
      <div className={styles.grid}>
        <section className={styles.list}>
          <div className={styles.sectionTitle}><h2>등록된 {resources.find((item) => item.key === resource)?.label}</h2><button onClick={() => setForm(emptyForm(resource))}>새로 등록</button></div>
          {items.length === 0 ? <p className={styles.empty}>등록된 항목이 없습니다.</p> : items.map((item) => <article key={item.uid}><button className={styles.itemName} onClick={() => setForm(toForm(resource, item))}>{displayName(item)}</button><button className={styles.delete} onClick={() => remove(item)}>삭제</button></article>)}
        </section>
        <form className={styles.editor} onSubmit={save}>
          <div className={styles.sectionTitle}><h2>{form.uid ? '수정' : '새 항목 등록'}</h2>{form.uid && <span>번호 {form.uid}</span>}</div>
          {fields[resource].map((field) => <label key={field.key}><span>{field.label}{field.required && ' *'}</span>{field.type === 'textarea' || field.type === 'lines' ? <textarea rows={field.type === 'lines' ? 5 : 10} value={form[field.key] || ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} required={field.required} /> : field.type === 'select' ? <select value={form[field.key] || ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}>{field.options?.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select> : <input type={field.type || 'text'} value={form[field.key] || ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} required={field.required} />}{field.help && <small>{field.help}</small>}</label>)}
          {message && <p className={message.includes('못') ? styles.error : styles.success}>{message}</p>}
          <div className={styles.actions}><button type="button" className={styles.secondary} onClick={() => setForm(emptyForm(resource))}>취소</button><button disabled={busy}>{busy ? '저장 중…' : '저장하기'}</button></div>
        </form>
      </div>
    </main>
  );
}
