import { NextResponse } from 'next/server';
import { prisma } from '@/app/api/prisma';
import { isAdminRequest } from '@/lib/admin-auth';
import { demoStore, isDemoMode } from '@/lib/admin-demo-store';

export async function GET() {
  if (isDemoMode()) return NextResponse.json({ data: demoStore.news, demo: true });
  const data = await prisma.board.findMany({
    select: {
      uid: true,
      hasFile: true,
      title: true,
      date: true,
    },
    where: {
      deletedAt: null,
    },
    orderBy: {
      uid: 'desc',
    },
  });
  return NextResponse.json({
    data,
  });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  const body = await request.json();
  const { title, hasFile, content, isHeadline } = body;

  await prisma.board.create({
    data: {
      title: title,
      content: content,
      hasFile: hasFile,
      isHeadline: isHeadline,
    },
  });
  return NextResponse.json({
    message: 'success',
  });
}
