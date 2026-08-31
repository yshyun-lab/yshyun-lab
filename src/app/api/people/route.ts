import { NextResponse } from 'next/server';
import { prisma } from '@/app/api/prisma';
import { isDemoMode } from '@/lib/admin-demo-store';

export async function GET() {
  if (isDemoMode()) {
    return NextResponse.json({ postdoc: [], doctor: [], master: [], alumni: [], demo: true });
  }
  const commonSelect = {
    uid: true,
    image: true,
    name: true,
    alias: true,
    email: true,
    history: {
      select: {
        period: true,
        information: true,
      },
      orderBy: {
        period: 'desc' as const,
      },
    },
  };

  const [postdoc, doctor, master, alumni] = await Promise.all([
    prisma.people.findMany({ select: commonSelect, where: { degree: 1 } }),
    prisma.people.findMany({ select: commonSelect, where: { degree: 2 } }),
    prisma.people.findMany({ select: commonSelect, where: { degree: 3 } }),
    prisma.people.findMany({ select: commonSelect, where: { degree: 4 } }),
  ]);

  return NextResponse.json({
    postdoc,
    doctor,
    master,
    alumni,
  });
}
