import { useRef, useState } from 'react'
import Webcam from 'react-webcam'
import './FacialLogin.css'

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
    <main className="content" style={{ overflow: 'hidden', height: '100vh' }}>
      <div className="card page-card" style={{ minHeight: '700px', display: 'flex', flexDirection: 'column' }}>
        <h2 className="page-title" style={{ textAlign: 'center' }}>Registro de Usuario</h2>


        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '24px' }}>
          <div className="card" style={{ marginBottom: '0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '420px', margin: '0 auto' }}>
              <label style={{ alignSelf: 'flex-start', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Nombre</label>
              <input
                className="input input-sm"
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="card" style={{ padding: '20px', marginBottom: '0' }}>
            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ flex: 1, maxWidth: '480px' }}>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="webcam-video"
                  style={{ width: '100%', borderRadius: '8px' }}
                />
              </div>
              
              <div style={{ 
                width: '240px', 
                height: '180px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9fafb'
              }}>
                {preview ? (
                  <img 
                    src={preview} 
                    alt="preview" 
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <span style={{ color: '#9ca3af', fontSize: '14px' }}>Vista previa</span>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                className="btn btn-secondary" 
                onClick={handleCapture}
                style={{ minWidth: '180px' }}
              >
                Capturar rostro
              </button>
            </div>
          </div>
        </div>

        <div className="actions-center" style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <button className="btn btn-primary" onClick={handleRegister}>Registrar usuario</button>
          <button className="btn btn-secondary" onClick={onCancel}>Regresar</button>
        </div>
      </div>
    </main>
  )
}

export default Register

