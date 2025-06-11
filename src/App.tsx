import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Layout from './Layouts/default'

function App() {
  return (
    <Routes>
      <Route path="/github-repos" element={<Layout />}>
        <Route index element={<Home />} />
      </Route>
    </Routes>
  )
}

export default App
