import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserGraduate, 
  FaChartLine, 
  FaHistory, 
  FaWineBottle, 
  FaArrowRight, 
  FaCheck, 
  FaExclamationTriangle, 
  FaInfoCircle,
  FaVenusMars,
  FaHome,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import styles from './Abandono.module.css';

type Gender = 'M' | 'F' | 'O' | '';

interface StudentForm {
  age: string;
  gender: Gender;
  familyIncome: string;
  location: string;
  economicSituation: string;
  studyTime: string;
  schoolSupport: boolean;
  familySupport: boolean;
  extraEducationalSupport: boolean;
}

export default function Abandono() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('nuevo');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{risk: 'Alto' | 'Medio' | 'Bajo'; confidence: number} | null>(null);
  
  const [formData, setFormData] = useState<StudentForm>({
    age: '',
    gender: '',
    familyIncome: '',
    location: '',
    economicSituation: '',
    studyTime: '',
    schoolSupport: false,
    familySupport: false,
    extraEducationalSupport: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulación de llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Resultado simulado basado en los datos del formulario
      const riskScore = Math.random();
      const riskLevel = riskScore > 0.7 ? 'Alto' : riskScore > 0.4 ? 'Medio' : 'Bajo';
      const confidence = Math.floor(Math.random() * 20) + 80; // 80-100%
      
      setResult({
        risk: riskLevel,
        confidence
      });
      
      // Cambiar a la pestaña de resultados
      setActiveTab('resultado');
    } catch (error) {
      console.error('Error al analizar el riesgo:', error);
      alert('Ocurrió un error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNewAnalysis = () => {
    setResult(null);
    setActiveTab('nuevo');
  };
  
  const navigateToVinos = () => {
    navigate('/clasificacion-vinos');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <FaUserGraduate className={styles.headerIcon} />
          <h1>Predicción de Abandono Escolar</h1>
        </div>
        <button 
          className={styles.navButton}
          onClick={() => navigate('/clasificacion-vinos')}
        >
          <FaWineBottle className={styles.buttonIcon} />
          <span>Ir a Clasificación de Vinos</span>
          <FaArrowRight className={styles.buttonIcon} />
        </button>
      </header>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'nuevo' ? styles.active : ''}`} 
          onClick={() => setActiveTab('nuevo')} 
          disabled={isLoading}
        >
          <FaChartLine className={styles.tabIcon} />
          <span>Nuevo Análisis</span>
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'historial' ? styles.active : ''}`} 
          onClick={() => setActiveTab('historial')} 
          disabled={isLoading}
        >
          <FaHistory className={styles.tabIcon} />
          <span>Historial</span>
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'nuevo' && (
          <form onSubmit={handleSubmit} className={styles.card}>
            <h2>Datos del Estudiante</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>
                  <FaClock className={styles.inputIcon} />
                  <span>Tiempo de Estudio</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input 
                    type="number" 
                    name="studyTime" 
                    value={formData.studyTime}
                    onChange={handleChange}
                    placeholder="Horas de estudio por semana"
                    min="1"
                    max="168"
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>
                  <FaVenusMars className={styles.inputIcon} />
                  <span>Género</span>
                </label>
                <div className={styles.selectWrapper}>
                  <select 
                    name="gender" 
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>
                  <FaMoneyBillWave className={styles.inputIcon} />
                  <span>Ingresos Familiares</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input 
                    type="number" 
                    name="familyIncome" 
                    value={formData.familyIncome}
                    onChange={handleChange}
                    placeholder="Ingrese los ingresos familiares"
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>
                  <FaMapMarkerAlt className={styles.inputIcon} />
                  <span>Ubicación</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input 
                    type="text" 
                    name="location" 
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Ingrese la ubicación"
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>
                  <FaClock className={styles.inputIcon} />
                  <span>Edad</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input 
                    type="number" 
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="10" 
                    max="30" 
                    placeholder="16" 
                    required
                  />
                </div>
              </div>
              
              
              
              <div className={styles.formGroup}>
                <label>
                  <FaInfoCircle className={styles.inputIcon} />
                  <span>Situación y estado económico</span>
                </label>
                <div className={styles.selectWrapper}>
                  <select 
                    name="economicSituation"
                    value={formData.economicSituation}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    <option value="bajo">Bajo</option>
                    <option value="medio">Medio</option>
                    <option value="alto">Alto</option>
                  </select>
                </div>
              </div>
              
              <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    name="schoolSupport"
                    checked={formData.schoolSupport}
                    onChange={handleChange}
                  />
                  <span>Apoyo educativo de la escuela</span>
                </label>
                
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    name="familySupport"
                    checked={formData.familySupport}
                    onChange={handleChange}
                  />
                  <span>Apoyo familiar</span>
                </label>
                
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    name="extraEducationalSupport"
                    checked={formData.extraEducationalSupport}
                    onChange={handleChange}
                  />
                  <span>Clases particulares</span>
                </label>
              </div>
            </div>
            
            <div className={styles.actions}>
              <button 
                type="button" 
                className={styles.secondaryButton}
                onClick={navigateToVinos}
              >
                Ir a Vinos
              </button>
              <button 
                type="submit" 
                className={styles.primaryButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className={styles.spinner}></span>
                    <span>Analizando...</span>
                  </>
                ) : (
                  <>
                    <FaChartLine className={styles.buttonIcon} />
                    <span>Analizar</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
        
        {activeTab === 'resultado' && result && (
          <div className={`${styles.card} ${styles.resultCard} ${styles[`risk${result.risk}`]}`}>
            <h2>Resultado del Análisis</h2>
            <div className={styles.resultContent}>
              <div className={styles.riskLevel}>
                <span>Nivel de Riesgo:</span>
                <strong>{result.risk}</strong>
              </div>
              <div className={styles.confidence}>
                <span>Confianza:</span>
                <strong>{result.confidence}%</strong>
              </div>
              
              <div className={styles.recommendations}>
                <h3>Recomendaciones:</h3>
                {result.risk === 'Alto' ? (
                  <ul>
                    <li>Sesión de asesoramiento con el departamento de orientación</li>
                    <li>Plan de apoyo académico personalizado</li>
                    <li>Seguimiento semanal del progreso</li>
                    <li>Reunión con los padres/tutores</li>
                  </ul>
                ) : result.risk === 'Medio' ? (
                  <ul>
                    <li>Monitoreo quincenal del rendimiento</li>
                    <li>Sesiones de tutoría opcionales</li>
                    <li>Evaluación de necesidades específicas</li>
                  </ul>
                ) : (
                  <ul>
                    <li>Seguimiento estándar del rendimiento</li>
                    <li>Recursos de autoaprendizaje disponibles</li>
                  </ul>
                )}
              </div>
              
              <div className={styles.actions}>
                <button 
                  type="button" 
                  className={styles.secondaryButton}
                  onClick={handleNewAnalysis}
                >
                  Nuevo Análisis
                </button>
                <button 
                  type="button" 
                  className={styles.primaryButton}
                  onClick={() => setActiveTab('historial')}
                >
                  Ver Historial
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'historial' && (
          <div className={styles.card}>
            <h2>Historial de Análisis</h2>
            <div className={styles.emptyState}>
              <p>No hay análisis recientes</p>
              <button 
                className={styles.primaryButton}
                onClick={() => setActiveTab('nuevo')}
              >
                Realizar Nuevo Análisis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
