import { Suspense } from 'react';
import styles from './App.module.css';

import * as api from './api';

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
  return (
    <>
      {stories.map((id) => (
        <Story id={id} />
      ))}
    </>
  );
}

type StoryProps = {
  id: api.Story['id'];
};

function Story(props: StoryProps) {
  return <div>{props.id}</div>;
}

export default App;
