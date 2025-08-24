import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Webcam from 'react-webcam'
import './FacialLogin.css'

export type User = { name?: string }

type Props = {
  onLogin: (user: User) => void
  onShowRegister?: () => void
}

const FacialLogin = ({ onLogin }: Props) => {
  const webcamRef = useRef<Webcam>(null)

  const navigate = useNavigate()

  const handleGoWelcome = () => {
    onLogin({ name: 'Invitado' })
    // Redirigir al dashboard después de un pequeño retraso para asegurar que el estado se actualice
    setTimeout(() => {
      navigate('/')
    }, 100)
  }

  return (
    <main className="content" style={{ overflow: 'hidden', height: '100vh' }}>
      <div className="card page-card">
        <h2 className="page-title" style={{ textAlign: 'center' }}>Inicio de Sesión Facial</h2>
        <div className="card webcam-card">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
            className="webcam-video"
          />
          <div className="controls-row">
            <button onClick={handleGoWelcome} className="btn btn-primary">Iniciar reconocimiento</button>
          </div>
        </div>

        <div className="card instructions-card">
          <h3 style={{ marginTop: 0 }}>Instrucciones</h3>
          <ul className="list">
            <li>Asegúrate de tener buena iluminación.</li>
            <li>Colócate frente a la cámara.</li>
            <li>Mantén un fondo neutro.</li>
            <li>Evita accesorios que oculten tu rostro.</li>
          </ul>
        </div>
      </div>
    </main>
  )
}

export default FacialLogin
