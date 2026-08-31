import { NextResponse } from 'next/server';
import { prisma } from '../prisma';
import { isAdminRequest } from '@/lib/admin-auth';

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
