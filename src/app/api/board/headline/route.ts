import { NextResponse } from 'next/server';
import { prisma } from '@/app/api/prisma';
import { demoStore, isDemoMode } from '@/lib/admin-demo-store';

export async function GET() {
  if (isDemoMode()) {
    return NextResponse.json({ data: demoStore.news.filter((item) => Number(item.isHeadline) === 1), demo: true });
  }
  const data = await prisma.board.findMany({
    select: {
      uid: true,
      hasFile: true,
      title: true,
      date: true,
    },
    where: {
      deletedAt: null,
      isHeadline: 1,
    },
    orderBy: {
      date: 'asc',
    },
  });
  return NextResponse.json({
    data,
  });
}
