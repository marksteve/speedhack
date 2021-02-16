import styles from './App.module.css';
import Stories from './components/Stories';
import { ReactComponent as Logo } from './logo.svg';

function App() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>
          <Logo className={styles.logo} />
          Speedhack
        </h1>
      </header>
      <Stories endpoint="newstories" />
    </div>
  );
}

export default App;
