import { ArrowRightIcon } from 'lucide-react';
import { Box, Button, Link, Spacer, Typography, Wrapper } from '@/components';
import {
  Hero,
  News,
  Publication,
  Topic,
  Topics,
} from '@/components/pages/home';
import { topics } from '@/components/pages/home/config';
import { api } from '@/core/api';
import { TNews } from './(board)/news/types';
import { TPublication } from './(research)/publication/types';
import styles from './page.module.scss';

export const dynamic = 'force-dynamic';
const Area = ({
  title,
  children,
}: React.PropsWithChildren<{ title: string }>) => (
  <Box direction="y" className={styles.area}>
    <Typography as="h3">{title}</Typography>
    <Box direction="y" className={styles.content}>
      {children}
    </Box>
  </Box>
);

export default async function Home() {
  const publicationRequest = api<{
    publications: TPublication[];
  }>({ url: 'publication?limit=4' }).catch(() => ({ publications: [] }));

  const newsRequest = api<{
    data: TNews[];
  }>({ url: 'board/news?limit=4' }).catch(() => ({ data: [] }));

  const [{ publications }, { data: news }] = await Promise.all([
    publicationRequest,
    newsRequest,
  ]);

  const maxLength = Math.min(publications.length, news.length, 3) + 1;

  return (
    <>
      <Hero />
      <Wrapper>
        <Topics>
          {topics.map(({ title, paragraph }, index) => (
            <Topic
              title={title}
              index={index + 1}
              key={`research-topic-${index + 1}`}
            >
              <Typography as="p">{paragraph}</Typography>
            </Topic>
          ))}
        </Topics>
        <Spacer size="xl" />
        <Spacer />
        <div className={styles.side}>
          <Area title="News">
            {news.slice(0, maxLength).map(({ uid, title, date }) => (
              <Link
                key={`news;uid:${uid}`}
                href={`/news/${uid}`}
                unstyled
                style={{ width: '100%' }}
              >
                <News title={title} date={date} />
              </Link>
            ))}
            <Link href="/news" icon={ArrowRightIcon}>
              find more
            </Link>
          </Area>
          <Area title="Recent Publications">
            {publications.slice(0, maxLength).map(({ uid, title, author }) => (
              <Publication
                key={`publication;uid:${uid}`}
                title={title}
                author={author}
              />
            ))}
            <Link href="/publication" icon={ArrowRightIcon}>
              find more
            </Link>
          </Area>
        </div>
        <Spacer size="xl" />
        <Spacer />
        <Area title="Apply">
          <Typography as="p">
            We are excited to welcome new undergraduate, M.S., and Ph.D.
            students to our lab! Feel free to contact us if you&apos;re
            interested in joining.
          </Typography>
          <Button asChild>
            <Link href="/contact">contact us</Link>
          </Button>
        </Area>
      </Wrapper>
    </>
  );
}
