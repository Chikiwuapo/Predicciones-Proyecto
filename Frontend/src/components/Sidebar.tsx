import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaWineBottle, FaSchool, FaChartLine, FaCog, FaUser, FaUsers, FaSignOutAlt, FaChevronDown, FaChevronUp } from "react-icons/fa";
import styles from "../styles/Sidebar.module.css";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  return (
    <aside className={styles.container}>
      <header className={styles.header}>
        <div className={styles.avatar}>aqui va fotito</div>
        <h2 className={styles.title}>Proyecto Predicciones</h2>
      </header>

      <div className={styles.separator} />

      <section className={styles.profile}>
        <div className={styles.profileInfo}>
          <div className={styles.profileName}>aqui va nombre de usuario</div>
          <div className={styles.profileRole}>aqui va rol</div>
        </div>
      </section>

      <div className={styles.separator} />

      <nav className={styles.nav}>
        <NavLink 
          className={({ isActive }) => 
            `${styles.navItem} ${isActive ? styles.active : ''}`
          } 
          to="/"
          end
        >
          <span className={styles.navContent}>
            <FaHome className={styles.icon} />
            <span className={styles.label}>Inicio</span>
          </span>
        </NavLink>
        <NavLink 
          className={({ isActive }) => 
            `${styles.navItem} ${isActive ? styles.active : ''}`
          } 
          to="clasificacion-vinos"
        >
          <span className={styles.navContent}>
            <FaWineBottle className={styles.icon} />
            <span className={styles.label}>Clasificación de Vinos</span>
          </span>
        </NavLink>
        <NavLink 
          className={({ isActive }) => 
            `${styles.navItem} ${isActive ? styles.active : ''}`
          } 
          to="abandono"
        >
          <span className={styles.navContent}>
            <FaSchool className={styles.icon} />
            <span className={styles.label}>Abandono escolar</span>
          </span>
        </NavLink>
        <NavLink 
          className={({ isActive }) => 
            `${styles.navItem} ${isActive ? styles.active : ''}`
          } 
          to="estadisticas"
        >
          <span className={styles.navContent}>
            <FaChartLine className={styles.icon} />
            <span className={styles.label}>Estadísticas</span>
          </span>
        </NavLink>

        <div className={styles.group}>
          <button
            type="button"
            className={styles.navItem}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            <span className={styles.navContent}>
              <FaCog className={styles.icon} />
              <span className={styles.label}>Configuraciones</span>
            </span>
            <span className={styles.chevron} aria-hidden>
              {open ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </button>

          {open && (
            <div className={styles.groupChildren}>
              <NavLink className={styles.navButton} to="configuraciones/perfil">
                <span className={styles.navContent}>
                  <FaUser className={styles.icon} />
                  <span className={styles.label}>Perfil</span>
                </span>
              </NavLink>
              <NavLink className={styles.navButton} to="configuraciones/usuarios">
                <span className={styles.navContent}>
                  <FaUsers className={styles.icon} />
                  <span className={styles.label}>Usuarios</span>
                </span>
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      <div className={styles.logout}>
        <button className={styles.logoutButton}>
          <span className={styles.navContent}>
            <FaSignOutAlt className={styles.icon} />
            <span className={styles.label}>Cerrar sesión</span>
          </span>
        </button>
        <div className={styles.separator} />
        <div className={styles.copyright}>© 2025 Proyecto Predicciones</div>
      </div>
    </aside>
  );
}
