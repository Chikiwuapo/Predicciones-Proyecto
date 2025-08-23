import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartLine, FaWineBottle, FaSchool, FaHistory, FaCog, FaInfoCircle } from 'react-icons/fa';
import styles from './Home.module.css';

interface QuickAccessCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

export default function Home() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      // Formatear hora (HH:MM:SS)
      const timeStr = now.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      
      // Formatear fecha (Día, DD de Mes de AAAA)
      const dateStr = now.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      // Capitalizar primera letra del día y mes
      const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
      
      setCurrentTime(timeStr);
      setCurrentDate(formattedDate);
    };

    // Actualizar cada segundo
    const timer = setInterval(updateDateTime, 1000);
    updateDateTime(); // Llamar inmediatamente

    return () => clearInterval(timer);
  }, []);

  const quickAccessCards: QuickAccessCardProps[] = [
    {
      title: 'Análisis de Vinos',
      description: 'Evalúa la calidad de los vinos basado en sus características químicas',
      icon: <FaWineBottle className={styles.cardIcon} />,
      path: '/clasificacion-vinos',
      color: '#9c27b0'
    },
    {
      title: 'Predicción de Abandono',
      description: 'Analiza el riesgo de abandono escolar de los estudiantes',
      icon: <FaSchool className={styles.cardIcon} />,
      path: '/abandono',
      color: '#2196f3'
    },
    {
      title: 'Estadísticas',
      description: 'Visualiza gráficos y estadísticas de los análisis realizados',
      icon: <FaChartLine className={styles.cardIcon} />,
      path: '/estadisticas',
      color: '#4caf50'
    },
    {
      title: 'Historial',
      description: 'Revisa el historial de análisis previos',
      icon: <FaHistory className={styles.cardIcon} />,
      path: '/historial',
      color: '#ff9800'
    },
    {
      title: 'Configuración',
      description: 'Ajusta las preferencias de la aplicación',
      icon: <FaCog className={styles.cardIcon} />,
      path: '/configuracion',
      color: '#607d8b'
    },
    {
      title: 'Acerca de',
      description: 'Información sobre el proyecto y los desarrolladores',
      icon: <FaInfoCircle className={styles.cardIcon} />,
      path: '/acerca-de',
      color: '#795548'
    }
  ];

  const navigateTo = (path: string) => {
    navigate(path);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Bienvenido al Panel de Control</h1>
          <p>Sistema de análisis predictivo para vinos y abandono escolar</p>
        </div>
        <div className={styles.datetime}>
          <span className={styles.time}>{currentTime}</span>
          <span className={styles.date}>{currentDate}</span>
        </div>
      </header>

      <section className={styles.aboutSection}>
        <div className={styles.aboutCard}>
          <h2>Acerca del Proyecto</h2>
          <p>
            Este sistema permite analizar y predecir la calidad de vinos y el riesgo de abandono escolar 
            utilizando modelos de aprendizaje automático. Selecciona una de las herramientas a continuación 
            para comenzar.
          </p>
        </div>
      </section>

      <section className={styles.quickAccessSection}>
        <h2>Herramientas Disponibles</h2>
        <div className={styles.cardsGrid}>
          {quickAccessCards.map((card, index) => (
            <div 
              key={index} 
              className={styles.quickAccessCard}
              onClick={() => navigateTo(card.path)}
              style={{ '--card-color': card.color } as React.CSSProperties}
            >
              <div className={styles.cardIconContainer} style={{ backgroundColor: `${card.color}15` }}>
                {card.icon}
              </div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <span className={styles.cardLink}>Ir a {card.title.toLowerCase()} →</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.recentActivity}>
        <h2>Actividad Reciente</h2>
        <div className={styles.activityCard}>
          <p>No hay actividad reciente para mostrar</p>
          <button 
            className={styles.primaryButton}
            onClick={() => navigate('/historial')}
          >
            Ver historial completo
          </button>
        </div>
      </section>
    </div>
  );
}
