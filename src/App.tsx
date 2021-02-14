import { Suspense, useEffect, useMemo, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AlertCircle, CloudOff, Loader } from 'react-feather';
import { format as formatDuration } from 'timeago.js';
import createStore from 'zustand';
import * as api from './api';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Speedhack</h1>
      </header>
      <Stories endpoint="newstories" />
    </div>
  );
}

type VisibleStore = Record<number, boolean> & {
  markVisible: (id: number) => void;
};

const useVisible = createStore<VisibleStore>((set) => ({
  markVisible: (id: number) => set({ [id]: true }),
}));

type StoriesProps = {
  endpoint: string;
};

function Stories(props: StoriesProps) {
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
    <div className={styles.stories}>
      {stories.map((id) => (
        <Story key={id} id={id} observer={observer} />
      ))}
    </div>
  );
}

type StoryProps = {
  id: api.Story['id'];
  observer: IntersectionObserver;
};

function Story(props: StoryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useVisible((state) => state[props.id]);
  const content = isVisible ? <StoryContent id={props.id} /> : null;

  useEffect(() => {
    const el = ref.current;
    if (el) {
      props.observer.observe(el);
    }
    return () => {
      if (el) {
        props.observer.unobserve(el);
      }
    };
  }, [props.observer, ref]);

  return (
    <div ref={ref} className={styles.story} id={`${props.id}`}>
      <ErrorBoundary fallback={<StoryError />}>
        <Suspense fallback={<StoryPlaceholder />}>{content}</Suspense>
      </ErrorBoundary>
    </div>
  );
}

type StoryContentProps = {
  id: api.Story['id'];
};

function StoryContent(props: StoryContentProps) {
  const story = api.item.read(props.id);
  const url = story.url || `https://news.ycombinator.com/item?id=${story.id}`;
  const datetime = new Date(story.time * 1000);
  return (
    <>
      <h3>
        <a href={url}>{story.title}</a>
      </h3>
      <div className={styles.storyMeta}>
        by {story.by}{' '}
        <time dateTime={datetime.toISOString()}>
          {formatDuration(datetime)}
        </time>
      </div>
    </>
  );
}

function StoryError() {
  return (
    <div className={styles.storyError}>
      <CloudOff />
      <span>Failed to fetch story</span>
    </div>
  );
}

function StoryPlaceholder() {
  return (
    <svg
      className={styles.storyPlaceholder}
      height="2.5rem"
      fill="currentColor"
      opacity="0.5"
    >
      <rect width={`${Math.random() * 20 + 80}%`} height="1rem" rx="3" />
      <rect
        width={`${Math.random() * 20 + 30}%`}
        height="0.8rem"
        y="1.5rem"
        rx="3"
      />
    </svg>
  );
}

export default App;
