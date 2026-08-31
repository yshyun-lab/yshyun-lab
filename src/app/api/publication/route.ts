import { NextResponse } from 'next/server';
import { prisma } from '@/app/api/prisma';
import { demoStore, isDemoMode } from '@/lib/admin-demo-store';

export async function GET(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json({
      preprints: demoStore.publication.filter((item) => Number(item.type) === 0),
      publications: demoStore.publication.filter((item) => Number(item.type) === 1),
      demo: true,
    });
  }
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  let limit: number | undefined;

  if (limitParam) {
    limit = parseInt(limitParam, 10);
    if (isNaN(limit)) {
      return NextResponse.json({ error: 'limit param error' }, { status: 400 });
    }
  }
  const [preprintList, publicationList] = await Promise.all([
    prisma.publication.findMany({
      select: {
        uid: true,
        title: true,
        author: true,
        information: true,
        image: true,
        url: true,
      },
      where: {
        type: 0,
      },
      take: limit ? 0 : undefined,
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.publication.findMany({
      select: {
        uid: true,
        title: true,
        author: true,
        information: true,
        image: true,
        url: true,
      },
      where: {
        type: 1,
      },
      take: limit ? limit : undefined,
      orderBy: { publishedAt: 'desc' },
    }),
  ]);

  return NextResponse.json({
    preprints: preprintList,
    publications: publicationList,
  });
}
