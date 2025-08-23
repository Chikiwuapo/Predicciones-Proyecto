import styles from './Settings.module.css';

export default function Users() {
  // Datos de ejemplo para la tabla de usuarios
  const users = [
    { id: 1, name: 'Admin', email: 'admin@example.com', role: 'Administrador', status: 'Activo' },
    { id: 2, name: 'Usuario', email: 'usuario@example.com', role: 'Usuario', status: 'Activo' },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>Administra los usuarios del sistema</p>
        </div>
        <button className={styles.primaryButton}>
          + Nuevo Usuario
        </button>
      </header>

      <div className={styles.card}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`${styles.badge} ${user.role === 'Administrador' ? styles.badgePrimary : styles.badgeSecondary}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${user.status === 'Activo' ? styles.badgeSuccess : styles.badgeDanger}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button className={styles.iconButton} title="Editar">
                      <span>✏️</span>
                    </button>
                    <button className={styles.iconButton} title="Eliminar">
                      <span>🗑️</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className={styles.pagination}>
          <span>Mostrando 1-2 de 2 resultados</span>
          <div className={styles.paginationControls}>
            <button disabled>Anterior</button>
            <button className={styles.active}>1</button>
            <button disabled>Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}
