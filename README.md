# Mathematical Intelligence Lab.

인하대학교 Mathematical Intelligence Lab 홈페이지입니다. 공개 홈페이지와 관리자 화면이 하나의 Next.js 앱에 통합되어 있습니다.

## 관리자 화면

`/admin`에서 소식, 논문, 프로젝트, 구성원, 강의를 등록·수정·삭제할 수 있습니다. 다음 환경 변수를 반드시 설정하세요.

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_API_URL=https://홈페이지주소
ADMIN_PASSWORD=관리자비밀번호
ADMIN_AUTH_SECRET=충분히-긴-무작위-문자열
```

`ADMIN_PASSWORD`와 `ADMIN_AUTH_SECRET`은 저장소에 커밋하지 말고 배포 서비스의 환경 변수로 관리합니다. 관리자 로그인은 8시간 동안 유지됩니다.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
