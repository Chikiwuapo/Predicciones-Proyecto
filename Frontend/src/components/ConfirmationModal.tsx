import { FaSignOutAlt, FaTimes } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import type { FC } from 'react';
import styles from '../styles/Modal.module.css';

type ConfirmationModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
};


const ConfirmationModal: FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  icon = <FaSignOutAlt />
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  if (!isOpen) return null;

  // Cerrar al hacer clic fuera del modal
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div 
      className={styles.modalOverlay} 
      onClick={handleOverlayClick}
      data-theme={theme}
    >
      <div 
        className={`${styles.modal} ${isDark ? styles.dark : styles.light}`}
      >
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <span className={styles.iconContainer}>
              {icon}
            </span>
            <h3>{title}</h3>
          </div>
          <button 
            className={styles.closeButton}
            onClick={onCancel}
            aria-label="Cerrar"
          >
            <FaTimes />
          </button>
        </div>
        <div className={styles.modalBody}>
          <p>{message}</p>
        </div>
        <div className={styles.modalFooter}>
          <button 
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`${styles.button} ${styles.confirmButton}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
