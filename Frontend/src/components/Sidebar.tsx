import { useState } from "react";
import { NavLink } from "react-router-dom";
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
        <div className={styles.profileBadge} />
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
          Inicio
        </NavLink>
        <NavLink 
          className={({ isActive }) => 
            `${styles.navItem} ${isActive ? styles.active : ''}`
          } 
          to="clasificacion-vinos"
        >
          Clasificación multiclase (Vinos)
        </NavLink>
        <NavLink 
          className={({ isActive }) => 
            `${styles.navItem} ${isActive ? styles.active : ''}`
          } 
          to="abandono"
        >
          Abandono escolar
        </NavLink>
        <NavLink 
          className={({ isActive }) => 
            `${styles.navItem} ${isActive ? styles.active : ''}`
          } 
          to="estadisticas"
        >
          Estadísticas
        </NavLink>

        <div className={styles.group}>
          <button
            type="button"
            className={styles.navItem}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            <span>Configuraciones</span>
            <span>{open ? "▴" : "▾"}</span>
          </button>

          {open && (
            <div className={styles.groupChildren}>
              <NavLink className={styles.navButton} to="configuraciones/perfil">
                Perfil
              </NavLink>
              <NavLink className={styles.navButton} to="configuraciones/usuarios">
                Usuarios
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      <div className={styles.logout}>
        <button className={styles.logoutButton}>Cerrar sesión</button>
        <div className={styles.separator} />
        <div className={styles.copyright}>© 2025 Proyecto Predicciones</div>
      </div>
    </aside>
  );
}
