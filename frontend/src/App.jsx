import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthenticated } from './store/slices/appSlice'
import PinLogin from './components/auth/PinLogin'
import AppShell from './components/layout/AppShell'

function App() {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state) => state.app.isAuthenticated)

  useEffect(() => {
    // Check localStorage for today's session
    const today = new Date().toISOString().split('T')[0]
    const sessionDate = localStorage.getItem('clinicPinDate')
    const sessionValid = localStorage.getItem('clinicPinValid')

    if (sessionDate === today && sessionValid === 'true') {
      dispatch(setAuthenticated(true))
    }
  }, [dispatch])

  if (!isAuthenticated) {
    return <PinLogin />
  }

  return <AppShell />
}

export default App
