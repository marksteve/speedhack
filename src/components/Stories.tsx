import { useMemo } from 'react';
import { AlertCircle, Loader } from 'react-feather';
import * as api from '../api';
import { useVisible } from '../stores';
import styles from './Stories.module.css';
import Story from './Story';

type StoriesProps = {
  endpoint: string;
};

export default function Stories(props: StoriesProps) {
  const [stories, isLoading, error] = api.useStories(props.endpoint);

  const markVisible = useVisible((state) => state.markVisible);

  const observer = useMemo<IntersectionObserver>(() => {
    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            markVisible(parseInt(entry.target.id, 10));
          }
        });
      },
      {
        threshold: 0.1,
      }
    );
  }, [markVisible]);

  if (isLoading) {
    return (
      <div className={styles.info}>
        <Loader />
        <span>Fetching new stories&hellip;</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.info}>
        <AlertCircle />
        <span>Failed to fetch new stories</span>
      </div>
    );
  }

  return (
    <ol className={styles.stories}>
      {stories.map((id) => (
        <Story key={id} id={id} observer={observer} />
      ))}
    </ol>
  );
}
