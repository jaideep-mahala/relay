import { useState , useEffect } from 'react'
import './App.css'

function App() {
  const [ws, setws] = useState(new WebSocket("ws://localhost:5000"))

  useEffect(() => {
    ws.onopen = () => {
      if(ws){
        ws.send("hi");
      }
    }
  }, [ws])

  return (
    <>
      hello there
    </>
  )
}

export default App
