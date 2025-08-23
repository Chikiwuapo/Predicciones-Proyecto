import { useRef, useState } from 'react'
import Webcam from 'react-webcam'

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: 'user' as const,
}

type Props = {
  onRegister: (user: { name?: string }) => void
  onCancel: () => void
}

const Register = ({ onRegister, onCancel }: Props) => {
  const webcamRef = useRef<Webcam>(null)
  const [name, setName] = useState('')
  const [preview, setPreview] = useState<string | null>(null)

  const handleCapture = () => {
    if (!webcamRef.current) return
    const img = webcamRef.current.getScreenshot()
    if (img) setPreview(img)
  }

  const handleRegister = () => {
    onRegister({ name: name.trim() || 'Invitado' })
  }

  return (
    <div className="facial-login-container" style={{ gap: 12 }}>
      <h1>Registro de Usuario</h1>

      <input
        type="text"
        placeholder="Tu nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: '0.6rem 0.8rem', borderRadius: 8, border: '1px solid #334155', background: '#111827', color: '#e5e7eb' }}
      />

      <div className="webcam-container" style={{ display: 'flex', gap: 16 }}>
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <button className="btn-secondary" onClick={handleCapture}>Capturar rostro</button>
          {preview && (
            <img src={preview} alt="preview" style={{ width: 240, height: 180, objectFit: 'cover', borderRadius: 8, border: '1px solid #334155' }} />
          )}
        </div>
      </div>

      <div className="controls" style={{ display: 'flex', gap: 8 }}>
        <button className="btn-primary" onClick={handleRegister}>Registrar usuario</button>
        <button className="btn-secondary" onClick={onCancel}>Regresar</button>
      </div>
    </div>
  )
}

export default Register
