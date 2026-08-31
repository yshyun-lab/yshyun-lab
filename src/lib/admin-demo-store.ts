type DemoItem = Record<string, unknown> & { uid: number };
type DemoResource = 'publication' | 'project' | 'people' | 'lecture' | 'news';

const initial: Record<DemoResource, DemoItem[]> = {
  news: [{ uid: 1, title: '관리자 화면 테스트 소식', content: '이 항목은 로컬 테스트 데이터입니다.', isHeadline: 1, hasFile: 0, date: new Date().toISOString() }],
  publication: [{ uid: 1, type: 1, title: 'Sample publication', author: 'Yoonsuk Hyun', information: 'Sample Journal', publishedAt: new Date().toISOString(), image: null, url: null }],
  project: [], people: [], lecture: [],
};

const globalStore = globalThis as typeof globalThis & { yshyunDemoStore?: Record<DemoResource, DemoItem[]> };
export const demoStore = globalStore.yshyunDemoStore ??= structuredClone(initial);
export const isDemoMode = () => process.env.NODE_ENV !== 'production' && !process.env.DATABASE_URL;

export const demoCreate = (resource: DemoResource, body: Record<string, unknown>) => {
  const uid = Math.max(0, ...demoStore[resource].map((item) => item.uid)) + 1;
  const item = { ...body, uid } as DemoItem;
  demoStore[resource].unshift(item);
  return item;
};

export const demoUpdate = (resource: DemoResource, body: Record<string, unknown>) => {
  const uid = Number(body.uid);
  const index = demoStore[resource].findIndex((item) => item.uid === uid);
  const item = { ...demoStore[resource][index], ...body, uid } as DemoItem;
  if (index >= 0) demoStore[resource][index] = item;
  return item;
};

export const demoDelete = (resource: DemoResource, uid: number) => {
  demoStore[resource] = demoStore[resource].filter((item) => item.uid !== uid);
};
