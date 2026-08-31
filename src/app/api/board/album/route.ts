import { NextResponse } from 'next/server';
import { prisma } from '@/app/api/prisma';
import { isDemoMode } from '@/lib/admin-demo-store';

export async function GET() {
  if (isDemoMode()) return NextResponse.json({ data: [], demo: true });
  const data = await prisma.board.findMany({
    select: {
      uid: true,
      title: true,
      date: true,
      file: {
        take: 1,
        where: {
          isDeleted: null,
          isImage: 1,
        },
        select: {
          file: true,
        },
        orderBy: {
          idx: 'asc',
        },
      },
      hasFile: true,
    },
    where: {
      hasFile: { gte: 1 },
      deletedAt: null,
    },
    orderBy: { date: 'desc' },
  });

  const transformed = data.map((item) => ({
    uid: item.uid,
    title: item.title,
    date: item.date,
    image: item.file && item.file.length > 0 ? item.file[0].file : '',
    count: item.hasFile,
  }));

  return NextResponse.json({ data: transformed });
}
