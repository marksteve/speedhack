import { Suspense, useEffect, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { CloudOff } from 'react-feather';
import { format as formatDuration } from 'timeago.js';
import * as api from '../api';
import { useVisible } from '../stores';
import styles from './Story.module.css';

type StoryProps = {
  id: api.Story['id'];
  observer: IntersectionObserver;
};

export default function Story(props: StoryProps) {
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
    <div className={styles.storyContent}>
      <h3>
        <a href={url}>{story.title}</a>
      </h3>
      <div className={styles.storyMeta}>
        by {story.by}{' '}
        <time dateTime={datetime.toISOString()} data-testid="story-time">
          {formatDuration(datetime)}
        </time>
      </div>
    </div>
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
      data-testid="story-placeholder"
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
