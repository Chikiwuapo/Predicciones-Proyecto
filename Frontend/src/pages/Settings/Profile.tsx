import { useState } from 'react';
import styles from './Settings.module.css';

export default function Profile() {
  const [formData, setFormData] = useState({
    name: 'Usuario Demo',
    email: 'usuario@demo.com',
    role: 'Administrador',
    notifications: true,
    theme: 'dark',
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Abrir modal de confirmación
    setShowConfirm(true);
  };

  const doSave = async () => {
    try {
      setSaving(true);
      // TODO: Reemplazar por llamada real al backend
      await new Promise(resolve => setTimeout(resolve, 1200));
    } finally {
      setSaving(false);
      setShowConfirm(false);
      setShowToast('Cambios guardados correctamente');
      setTimeout(() => setShowToast(null), 2400);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Perfil de Usuario</h1>
        <p>Actualiza tu información personal y preferencias</p>
      </header>

      <div className={styles.card}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nombre completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              disabled
            />
            <p className={styles.helpText}>El correo no puede ser modificado</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="role">Rol</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={styles.select}
              disabled
            >
              <option value="Administrador">Administrador</option>
              <option value="Usuario">Usuario</option>
            </select>
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveButton}>
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
      {showConfirm && (
        <div
          className={styles.modalOverlay}
          onClick={() => { if (!saving) setShowConfirm(false); }}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Confirmar guardado</h3>
            </div>
            <div className={styles.modalBody}>
              <p>¿Deseas guardar los cambios realizados en tu perfil?</p>
              <ul>
                <li><strong>Nombre:</strong> {formData.name}</li>
                <li><strong>Correo:</strong> {formData.email}</li>
                <li><strong>Rol:</strong> {formData.role}</li>
              </ul>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowConfirm(false)}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                className={styles.saveButton}
                onClick={doSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className={styles.spinner} />
                    Guardando cambios...
                  </>
                ) : (
                  'Confirmar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {showToast && (
        <div className={`${styles.toast} ${styles.toastSuccess}`}>
          <span className={styles.toastIcon} />
          <span>{showToast}</span>
        </div>
      )}
    </div>
  );
}
