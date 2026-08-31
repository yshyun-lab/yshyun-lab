import 'github-markdown-css/github-markdown-light.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Layout } from '@/components/layout';
import '../styles/globals.scss';

const pretendard = localFont({
  src: '../fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
});

export const metadata: Metadata = {
  title: 'Mathematical Intelligence Lab.',
  description: 'Mathematical Intelligence Laboratory at Inha University',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={pretendard.variable}>
      <body>
        <div id="overlay-root" />
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
