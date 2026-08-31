import { NextResponse } from 'next/server';
import { prisma } from '@/app/api/prisma';
import { isAdminRequest } from '@/lib/admin-auth';
import { demoCreate, demoDelete, demoStore, demoUpdate, isDemoMode } from '@/lib/admin-demo-store';

type Resource = 'publication' | 'project' | 'people' | 'lecture' | 'news';

const unauthorized = () => NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
const resourceFrom = (request: Request) => new URL(request.url).searchParams.get('resource') as Resource;
const numberOrNull = (value: unknown) => value === '' || value == null ? null : Number(value);

export async function GET(request: Request) {
  if (!(await isAdminRequest())) return unauthorized();
  const resource = resourceFrom(request);
  if (isDemoMode()) return NextResponse.json({ data: demoStore[resource] || [], demo: true });
  let data;
  switch (resource) {
    case 'publication':
      data = await prisma.publication.findMany({ orderBy: { publishedAt: 'desc' } }); break;
    case 'project':
      data = await prisma.project.findMany({ include: { article: true }, orderBy: { uid: 'desc' } }); break;
    case 'people':
      data = await prisma.people.findMany({ include: { history: { orderBy: { ordering: 'asc' } } }, orderBy: { uid: 'desc' } }); break;
    case 'lecture':
      data = await prisma.lecture.findMany({ orderBy: [{ year: 'desc' }, { semester: 'asc' }] }); break;
    case 'news':
      data = await prisma.board.findMany({ where: { deletedAt: null }, orderBy: { date: 'desc' } }); break;
    default:
      return NextResponse.json({ error: '지원하지 않는 항목입니다.' }, { status: 400 });
  }
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return unauthorized();
  const resource = resourceFrom(request);
  const body = await request.json();
  if (isDemoMode()) return NextResponse.json({ data: demoCreate(resource, body), demo: true });
  let data;
  switch (resource) {
    case 'publication':
      data = await prisma.publication.create({ data: {
        title: body.title, author: body.author, information: body.information,
        image: body.image || null, url: body.url || null, type: Number(body.type),
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
      }}); break;
    case 'project':
      data = await prisma.project.create({ data: {
        title: body.title, period: body.period, ongoing: numberOrNull(body.ongoing),
        information: body.information || null, organization: body.organization || null,
        article: { create: (body.article || []).map((item: { title: string; url: string }) => ({ title: item.title, url: item.url })) },
      }}); break;
    case 'people':
      data = await prisma.people.create({ data: {
        name: body.name, alias: body.alias || null, email: body.email, degree: Number(body.degree), image: body.image || null,
        history: { create: (body.history || []).map((item: { period: string; information: string }, ordering: number) => ({ ...item, ordering })) },
      }}); break;
    case 'lecture':
      data = await prisma.lecture.create({ data: { title: body.title, year: numberOrNull(body.year), postgraduate: Number(body.postgraduate), semester: Number(body.semester) } }); break;
    case 'news':
      data = await prisma.board.create({ data: { title: body.title, content: body.content, hasFile: numberOrNull(body.hasFile), isHeadline: numberOrNull(body.isHeadline) } }); break;
    default:
      return NextResponse.json({ error: '지원하지 않는 항목입니다.' }, { status: 400 });
  }
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  if (!(await isAdminRequest())) return unauthorized();
  const resource = resourceFrom(request);
  const body = await request.json();
  if (isDemoMode()) return NextResponse.json({ data: demoUpdate(resource, body), demo: true });
  const uid = Number(body.uid);
  let data;
  switch (resource) {
    case 'publication':
      data = await prisma.publication.update({ where: { uid }, data: { title: body.title, author: body.author, information: body.information, image: body.image || null, url: body.url || null, type: Number(body.type), publishedAt: body.publishedAt ? new Date(body.publishedAt) : null } }); break;
    case 'project':
      data = await prisma.$transaction(async (tx) => {
        await tx.article.deleteMany({ where: { project_idx: uid } });
        return tx.project.update({ where: { uid }, data: { title: body.title, period: body.period, ongoing: numberOrNull(body.ongoing), information: body.information || null, organization: body.organization || null, article: { create: (body.article || []).map((item: { title: string; url: string }) => ({ title: item.title, url: item.url })) } } });
      }); break;
    case 'people':
      data = await prisma.$transaction(async (tx) => {
        await tx.history.deleteMany({ where: { people_idx: uid } });
        return tx.people.update({ where: { uid }, data: { name: body.name, alias: body.alias || null, email: body.email, degree: Number(body.degree), image: body.image || null, history: { create: (body.history || []).map((item: { period: string; information: string }, ordering: number) => ({ ...item, ordering })) } } });
      }); break;
    case 'lecture':
      data = await prisma.lecture.update({ where: { uid }, data: { title: body.title, year: numberOrNull(body.year), postgraduate: Number(body.postgraduate), semester: Number(body.semester) } }); break;
    case 'news':
      data = await prisma.board.update({ where: { uid }, data: { title: body.title, content: body.content, hasFile: numberOrNull(body.hasFile), isHeadline: numberOrNull(body.isHeadline) } }); break;
    default:
      return NextResponse.json({ error: '지원하지 않는 항목입니다.' }, { status: 400 });
  }
  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequest())) return unauthorized();
  const resource = resourceFrom(request);
  const uid = Number(new URL(request.url).searchParams.get('uid'));
  if (isDemoMode()) {
    demoDelete(resource, uid);
    return NextResponse.json({ success: true, demo: true });
  }
  switch (resource) {
    case 'publication': await prisma.publication.delete({ where: { uid } }); break;
    case 'project':
      await prisma.$transaction(async (tx) => {
        await tx.article.deleteMany({ where: { project_idx: uid } });
        await tx.project.delete({ where: { uid } });
      }); break;
    case 'people':
      await prisma.$transaction(async (tx) => {
        await tx.history.deleteMany({ where: { people_idx: uid } });
        await tx.people.delete({ where: { uid } });
      }); break;
    case 'lecture': await prisma.lecture.delete({ where: { uid } }); break;
    case 'news': await prisma.board.update({ where: { uid }, data: { deletedAt: new Date() } }); break;
    default: return NextResponse.json({ error: '지원하지 않는 항목입니다.' }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
