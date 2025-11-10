import { useState } from 'react'
import Counter from './Counter'
import './App.css'
function App() {
  const [count, setCount] = useState(0);
  const [count2, setCount2] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount2(count2 + 1)}>Increment {count2}</button>
      <Counter value={count} />
    </div>
  );
}

export default App
