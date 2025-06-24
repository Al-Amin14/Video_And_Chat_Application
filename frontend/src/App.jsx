import { useState } from 'react'
import { Route , Routes } from 'react-router-dom'
import Lobby from './screen/lobby'
import Room from './screen/room'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Routes>
      <Route path='/' element={<Lobby/>} ></Route>
      <Route path='/room/:roomId' element={<Room/>} ></Route>
    </Routes>
    </>
  )
}

export default App
