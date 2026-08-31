import { NextResponse } from 'next/server';
import { prisma } from '@/app/api/prisma';
import { demoStore, isDemoMode } from '@/lib/admin-demo-store';

export async function GET() {
  if (isDemoMode()) return NextResponse.json({ data: demoStore.project, demo: true });
  const data = await prisma.project.findMany({
    select: {
      uid: true,
      title: true,
      ongoing: true,
      period: true,
      information: true,
      article: {
        select: {
          title: true,
          url: true,
        },
      },
    },
  });
  return NextResponse.json({
    data,
  });
}
