import { formatDuration, intervalToDuration } from 'date-fns';
import { forwardRef, Suspense, useEffect, useMemo, useRef } from 'react';
import createStore from 'zustand';
import * as api from './api';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Hacker News</h1>
      </header>
      <Suspense
        fallback={
          <div className={styles.info}>Fetching new stories&hellip;</div>
        }
      >
        <Stories endpoint="newstories" />
      </Suspense>
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
  const stories = api.stories.read(props.endpoint);

  const targets = useRef<HTMLDivElement[]>([]);
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

  useEffect(() => {
    targets.current.forEach((target) => {
      observer.observe(target);
    });
  }, [observer]);

  return (
    <div className={styles.stories}>
      {stories.map((id) => (
        <Story key={id} id={id} ref={(el) => targets.current.push(el!)} />
      ))}
    </div>
  );
}

type StoryProps = {
  id: api.Story['id'];
};

const Story = forwardRef<HTMLDivElement, StoryProps>((props, ref) => {
  const isVisible = useVisible((state) => state[props.id]);
  const content = isVisible ? <StoryContent id={props.id} /> : null;
  return (
    <div ref={ref} className={styles.story} id={`${props.id}`}>
      <Suspense fallback={<StoryPlaceholder />}>{content}</Suspense>
    </div>
  );
});

function StoryContent(props: StoryProps) {
  const story = api.item.read(props.id);
  return (
    <>
      <h3>
        <a href={story.url}>{story.title}</a>
      </h3>
      <div className={styles.storyMeta}>
        by {story.by}{' '}
        {formatDuration(
          intervalToDuration({
            start: new Date(),
            end: new Date(story.time * 1000),
          })
        )}
      </div>
    </>
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
