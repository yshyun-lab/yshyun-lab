import { NextResponse } from 'next/server';
import { prisma } from '@/app/api/prisma';
import { demoStore, isDemoMode } from '@/lib/admin-demo-store';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ boardIdx: string }> }
) {
  const { boardIdx } = await params;
  const uid = parseInt(boardIdx, 10);
  if (isDemoMode()) {
    const data = demoStore.news.find((item) => item.uid === uid);
    return data
      ? NextResponse.json({ data, demo: true })
      : NextResponse.json({ error: 'no board data' }, { status: 404 });
  }
  const data = await prisma.board.findUnique({
    select: {
      uid: true,
      title: true,
      date: true,
      content: true,
    },
    where: {
      uid: uid,
      deletedAt: null,
    },
  });

  if (!data) {
    return NextResponse.json({ error: 'no board data' }, { status: 404 });
  }
  return NextResponse.json({
    data,
  });
}
