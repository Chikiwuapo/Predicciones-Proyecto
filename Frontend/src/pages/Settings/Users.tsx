import { useEffect, useState } from 'react';
import styles from './Settings.module.css';

export default function Users() {
  // Datos iniciales para la tabla de usuarios
  const [users, setUsers] = useState([
    { id: 1, name: 'Admin', email: 'admin@example.com', role: 'Administrador', status: 'Activo' },
    { id: 2, name: 'Usuario', email: 'usuario@example.com', role: 'Administrador', status: 'Activo' },
    { id: 3, name: 'Usuario', email: 'usuario@example.com', role: 'Administrador', status: 'Activo' },
    { id: 4, name: 'Usuario', email: 'usuario@example.com', role: 'Administrador', status: 'Activo' },
    { id: 5, name: 'Usuario', email: 'usuario@example.com', role: 'Administrador', status: 'Activo' },
    { id: 6, name: 'Usuario', email: 'usuario@example.com', role: 'Administrador', status: 'Activo' },
    { id: 7, name: 'Usuario', email: 'usuario@example.com', role: 'Administrador', status: 'Activo' },
    { id: 8, name: 'Usuario', email: 'usuario@example.com', role: 'Administrador', status: 'Activo' },
  ]);

  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));

  // Ajustar página si cambia el total (e.g., al eliminar)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [users.length, totalPages]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = users.slice(startIndex, endIndex);

  const onClickDelete = (id: number) => {
    if (deleting) return;
    setConfirmId(id);
  };

  const doDelete = async () => {
    if (confirmId == null) return;
    try {
      setDeleting(true);
      // TODO: Reemplazar con llamada real al backend
      await new Promise((r) => setTimeout(r, 900));
      setUsers(prev => prev.filter(u => u.id !== confirmId));
      setShowToast('Usuario eliminado correctamente');
    } finally {
      setDeleting(false);
      setConfirmId(null);
      setTimeout(() => setShowToast(null), 2400);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>Administra los usuarios del sistema</p>
        </div>
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
              {paginatedUsers.map((user, i) => (
                <tr key={`${user.id}-${startIndex + i}`}>
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
                    <button
                      className={styles.iconButton}
                      title="Eliminar"
                      onClick={() => onClickDelete(user.id)}
                      disabled={deleting}
                    >
                      <span>🗑️</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className={styles.pagination}>
          <span>
            {users.length === 0
              ? 'Mostrando 0 de 0 resultados'
              : `Mostrando ${startIndex + 1}-${Math.min(endIndex, users.length)} de ${users.length} resultados`}
          </span>
          <div className={styles.paginationControls}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={currentPage === p ? styles.active : ''}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
      {/* Modal de confirmación */}
      {confirmId !== null && (
        <div
          className={styles.modalOverlay}
          onClick={() => { if (!deleting) setConfirmId(null); }}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Confirmar eliminación</h3>
            </div>
            <div className={styles.modalBody}>
              <p>¿Seguro que deseas eliminar este usuario?</p>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setConfirmId(null)}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                className={styles.saveButton}
                onClick={doDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className={styles.spinner} /> Eliminando...
                  </>
                ) : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className={`${styles.toast} ${styles.toastSuccess}`}>
          <span className={styles.toastIcon} />
          <span>{showToast}</span>
        </div>
      )}
    </div>
  );
}
