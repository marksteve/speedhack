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
      <Suspense fallback={'Loading...'}>
        <NewStories />
      </Suspense>
    </div>
  );
}

type VisibleStore = Record<number, boolean> & {
  markVisible: (id: number) => void;
};

const useVisible = createStore<VisibleStore>((set) => ({
  markVisible: (id: number) => set((state) => ({ [id]: true })),
}));

function NewStories() {
  const stories = api.newStories.read();

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
    <>
      {stories.map((id) => (
        <Story key={id} id={id} ref={(el) => targets.current.push(el!)} />
      ))}
    </>
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
      <Suspense fallback={'Loading...'}>{content}</Suspense>
    </div>
  );
});

function StoryContent(props: StoryProps) {
  const story = api.item.read(props.id);
  return (
    <>
      <h3><a href={story.url}>{story.title}</a></h3>
    </>
  );
}

export default App;
