import styles from './App.module.css';
import Stories from './components/Stories';

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

export default App;
