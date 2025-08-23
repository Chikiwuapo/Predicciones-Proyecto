import { useState } from 'react';
import styles from './Stats.module.css';

export default function Stats() {
  const [activeTab, setActiveTab] = useState('vinos');
  
  // Datos de ejemplo para estadísticas
  const statsData = {
    vinos: {
      totalAnalisis: 24,
      precision: '92%',
      calidadPromedio: '7.8',
      tendencia: '+12%',
    },
    abandono: {
      totalAnalisis: 45,
      precision: '88%',
      riesgoPromedio: '32%',
      tendencia: '-5%',
    }
  };

  const currentStats = statsData[activeTab as keyof typeof statsData];
  
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Estadísticas</h1>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'vinos' ? styles.active : ''}`}
            onClick={() => setActiveTab('vinos')}
          >
            Vinos
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'abandono' ? styles.active : ''}`}
            onClick={() => setActiveTab('abandono')}
          >
            Abandono Escolar
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Total de Análisis</h3>
          <div className={styles.statValue}>{currentStats.totalAnalisis}</div>
          <div className={styles.statChange}>
            <span className={styles.changePositive}>+0%</span> vs período anterior
          </div>
        </div>
        
        <div className={styles.card}>
          <h3>Precisión del Modelo</h3>
          <div className={styles.statValue}>0%</div>
          <div className={styles.statChange}>
            Última actualización: --/--/----
          </div>
        </div>
        
        <div className={styles.card}>
          <h3>Promedio de Calidad</h3>
          <div className={styles.statValue}>0.0</div>
          <div className={styles.statChange}>
            <span className={styles.changeNegative}>0%</span> vs período anterior
          </div>
        </div>
        
        <div className={styles.card}>
          <h3>Riesgo de Abandono</h3>
          <div className={styles.statValue}>0%</div>
          <div className={styles.statChange}>
            <span className={styles.changePositive}>0%</span> vs período anterior
          </div>
        </div>
      </div>
      
      <div className={styles.chartContainer}>
        <div className={styles.chartPlaceholder}>
          <p>Gráfico de análisis se mostrará aquí</p>
        </div>
      </div>
    </div>
  );
}
