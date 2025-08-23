import { useState } from 'react'
import FacialLogin from './components/FacialLogin.tsx'
import Welcome from './components/Welcome.tsx'
import Register from './components/Register.tsx'
import './App.css'

export type User = { name?: string }

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)

  const handleLogin = (userData: User) => {
    setUser(userData)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
  }

  const handleRegistered = (userData: User) => {
    setUser(userData)
    setIsLoggedIn(true)
    setIsRegistering(false)
  }

  return (
    <div className="app">
      {isLoggedIn ? (
        <Welcome user={user ?? undefined} onLogout={handleLogout} />
      ) : isRegistering ? (
        <Register onRegister={handleRegistered} onCancel={() => setIsRegistering(false)} />
      ) : (
        <FacialLogin onLogin={handleLogin} onShowRegister={() => setIsRegistering(true)} />
      )}
    </div>
  )
}

export default App
