import PushUpCounterForm from './components/PushUpCounterForm'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import ErrorPage from './pages/ErrorPage'
function App() {

  return (
    <div className='App'>
      <Routes>
        <Route path='/login' element={<Login />}/>
        <Route path='/home' element={<PushUpCounterForm />} />
        {/* Any other false route */}
        <Route path='*' element={<ErrorPage />} />
      </Routes>
    </div>
  )
}

export default App
