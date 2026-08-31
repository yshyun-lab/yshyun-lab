/* eslint-disable @typescript-eslint/no-explicit-any */
import multer from 'multer';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { Readable } from 'stream';
import { prisma } from '@/app/api/prisma';
import { isAdminRequest } from '@/lib/admin-auth';

export const config = {
  api: { bodyParser: false },
};

const storage = multer.diskStorage({
  destination: './static',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

async function convertNextRequestToNodeRequest(request: NextRequest) {
  const buffer = Buffer.from(await request.arrayBuffer());
  const nodeReq = Readable.from(buffer) as any;
  nodeReq.headers = Object.fromEntries(request.headers);
  nodeReq.method = request.method;
  nodeReq.url = new URL(request.url).pathname;
  return nodeReq;
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  try {
    const nodeReq = await convertNextRequestToNodeRequest(request);

    await new Promise<void>((resolve, reject) => {
      upload.single('file')(nodeReq, {} as any, (err: any) => {
        if (err) return reject(err);
        resolve();
      });
    });
    const boardIdx = (nodeReq as any).body.boardIdx;

    const file = (nodeReq as any).file;
    if (!file) {
      throw new Error('upload fail');
    }

    const fileUrl = `/static/${file.filename}`;
    const isImage = file.mimetype.startsWith('image/') ? 1 : 0;

    await prisma.file.create({
      data: {
        board_idx: parseInt(boardIdx, 10),
        file: fileUrl,
        isImage: isImage,
      },
    });
    return NextResponse.json({ url: fileUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function DELETE(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { fileUrl } = body;
    const now = new Date();
    const updatedFile = await prisma.file.updateMany({
      where: { file: fileUrl },
      data: { isDeleted: now },
    });
    return NextResponse.json({
      message: 'File marked as deleted successfully',
      data: updatedFile,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
