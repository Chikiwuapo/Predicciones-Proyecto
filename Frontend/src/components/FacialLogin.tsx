import { useRef } from 'react'
import Webcam from 'react-webcam'
import './FacialLogin.css'

export type User = { name?: string }

type Props = {
  onLogin: (user: User) => void
  onShowRegister?: () => void
}

const FacialLogin = ({ onLogin, onShowRegister = () => {} }: Props) => {
  const webcamRef = useRef<Webcam>(null)

  const handleGoWelcome = () => {
    onLogin({ name: 'Invitado' })
  }

  return (
    <div className="facial-login-container">
      <h1>Inicio de Sesión Facial</h1>
      <p>Por favor, permite el acceso a tu cámara.</p>

      <div className="webcam-container">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
        />

        <div className="controls">
          <button onClick={handleGoWelcome} className="btn-primary">
            Iniciar Reconocimiento
          </button>
          <button onClick={onShowRegister} className="btn-secondary" style={{ marginLeft: 8 }}>
            Registrar usuario
          </button>
        </div>
      </div>

      <div className="instructions">
        <h3>Instrucciones:</h3>
        <ul>
          <li>Asegúrate de tener buena iluminación</li>
          <li>Colócate frente a la cámara</li>
          <li>Mantén un fondo neutro</li>
          <li>Elimina cualquier accesorio que oculte tu rostro</li>
        </ul>
      </div>
    </div>
  )
}

export default FacialLogin
