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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para guardar cambios
    alert('Cambios guardados correctamente');
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

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="notifications"
                checked={formData.notifications}
                onChange={handleChange}
                className={styles.checkbox}
              />
              <span>Recibir notificaciones por correo</span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label>Tema de la aplicación</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={formData.theme === 'light'}
                  onChange={handleChange}
                  className={styles.radio}
                />
                <span>Claro</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={formData.theme === 'dark'}
                  onChange={handleChange}
                  className={styles.radio}
                />
                <span>Oscuro</span>
              </label>
            </div>
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
    </div>
  );
}
