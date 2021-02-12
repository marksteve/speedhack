import { forwardRef, Suspense, useEffect, useMemo, useRef } from 'react';
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

function NewStories() {
  const stories = api.newStories.read();

  const targets = useRef<HTMLDivElement[]>([]);

  const observer = useMemo<IntersectionObserver>(() => {
    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          console.log(entry.target.id, entry.isIntersecting);
        });
      },
      {
        threshold: 0.1,
      }
    );
  }, []);

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
  return <div ref={ref} className={styles.story} id={`${props.id}`}></div>;
});

export default App;
