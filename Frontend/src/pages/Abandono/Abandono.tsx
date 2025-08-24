import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserGraduate, 
  FaChartLine, 
  FaHistory, 
  FaArrowRight, 
  FaInfoCircle,
  FaVenusMars,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaClock
} from 'react-icons/fa';
import styles from './Abandono.module.css';

type Gender = 'M' | 'F' | 'O' | '';
type RiskLevel = 'Alto' | 'Medio' | 'Bajo';

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

interface StudentAnalysis {
  id: string;
  date: string;
  risk: RiskLevel;
  confidence: number;
  parameters: StudentForm;
}

export default function Abandono() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('nuevo');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{risk: 'Alto' | 'Medio' | 'Bajo'; confidence: number} | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [history, setHistory] = useState<StudentAnalysis[]>([]);
  const historyRef = useRef<HTMLDivElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const [pendingScrollToHistory, setPendingScrollToHistory] = useState(false);
  // Filtros y paginación
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'Todos'>('Todos');
  const [dateFilter, setDateFilter] = useState<string>(''); // yyyy-mm-dd
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;
  
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

  // Normaliza una fecha a yyyy-mm-dd para filtrado
  const toISODate = (input: string): string => {
    if (!input) return '';
    const d = new Date(input);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    const m1 = input.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);
    if (m1) {
      let dd = parseInt(m1[1], 10);
      let mm = parseInt(m1[2], 10);
      let yyyy = parseInt(m1[3].length === 2 ? `20${m1[3]}` : m1[3], 10);
      if (dd > 31 || mm > 12) [dd, mm] = [mm, dd];
      const mmS = String(mm).padStart(2, '0');
      const ddS = String(dd).padStart(2, '0');
      return `${yyyy}-${mmS}-${ddS}`;
    }
    return '';
  };

  const runAnalysis = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const riskScore = Math.random();
      const riskLevel = riskScore > 0.7 ? 'Alto' : riskScore > 0.4 ? 'Medio' : 'Bajo';
      const confidence = Math.floor(Math.random() * 20) + 80;
      setResult({ risk: riskLevel as RiskLevel, confidence });

      // Guardar entrada en historial (mock)
      const entry: StudentAnalysis = {
        id: String(Date.now()),
        date: new Date().toLocaleString(),
        risk: riskLevel as RiskLevel,
        confidence,
        parameters: { ...formData },
      };
      setHistory(prev => [entry, ...prev]);

      // Ir a historial y preparar scroll suave
      setActiveTab('historial');
      setPendingScrollToHistory(true);
    } catch (error) {
      console.error('Error al analizar el riesgo:', error);
      alert('Ocurrió un error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmOpen(true);
  };
  
  const handleNewAnalysis = () => {
    setResult(null);
    setActiveTab('nuevo');
  };

  // Hacer scroll cuando abrimos historial tras análisis
  useEffect(() => {
    if (activeTab === 'historial' && pendingScrollToHistory) {
      requestAnimationFrame(() => {
        const target = resultRef.current ?? historyRef.current;
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setPendingScrollToHistory(false);
      });
    }
  }, [activeTab, pendingScrollToHistory, result]);

  // Cargar filtros de localStorage al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem('abandono.filters');
      if (stored) {
        const parsed = JSON.parse(stored) as { risk?: RiskLevel | 'Todos'; date?: string };
        if (parsed.risk) setRiskFilter(parsed.risk);
        if (typeof parsed.date === 'string') setDateFilter(parsed.date);
      }
    } catch {}
  }, []);

  // Guardar filtros
  useEffect(() => {
    try {
      localStorage.setItem('abandono.filters', JSON.stringify({ risk: riskFilter, date: dateFilter }));
    } catch {}
  }, [riskFilter, dateFilter]);

  // Resetear página cuando cambian los filtros o el tamaño del historial
  useEffect(() => {
    setCurrentPage(1);
  }, [riskFilter, dateFilter, history.length]);

  // Aplicar filtros para paginación
  const filteredHistory = history.filter((item) => {
    const byRisk = riskFilter === 'Todos' || item.risk === riskFilter;
    if (!byRisk) return false;
    if (!dateFilter) return true;
    return toISODate(item.date) === dateFilter;
  });

  // Click en historial: mostrar resultado y desplazar
  const handleSelectHistory = (item: StudentAnalysis) => {
    setResult({ risk: item.risk, confidence: item.confidence });
    setFormData({ ...item.parameters });
    setActiveTab('historial');
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
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
          onClick={() => navigate('/estadisticas')}
        >
          <FaChartLine className={styles.buttonIcon} />
          <span>Ir a Estadísticas globales</span>
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
                    placeholder="Ingrese edad" 
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
        
        
        
        {activeTab === 'historial' && (
          <div className={styles.historyContainer} ref={historyRef}>
            <div className={styles.historyHeader}>
              <h2>Historial de Análisis</h2>
              <div className={styles.headerActions}>
                <div className={styles.filtersBar}>
                  <label className={styles.filterLabel}>
                    <span>RIESGO</span>
                    <div className={styles.selectWrapper}>
                      <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value as RiskLevel | 'Todos')} aria-label="Filtrar por riesgo">
                        <option value="Todos">Todos</option>
                        <option value="Alto">Alto</option>
                        <option value="Medio">Medio</option>
                        <option value="Bajo">Bajo</option>
                      </select>
                    </div>
                  </label>
                  <label className={styles.filterLabel}>
                    <span>FECHA</span>
                    <div className={styles.inputWrapper}>
                      <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} aria-label="Filtrar por fecha" />
                    </div>
                  </label>
                  <button
                    type="button"
                    className={styles.clearButton}
                    onClick={() => { setRiskFilter('Todos'); setDateFilter(''); }}
                  >
                    LIMPIAR
                  </button>
                </div>
                <button 
                  onClick={handleNewAnalysis}
                  className={styles.secondaryButton}
                >
                  Nuevo Análisis
                </button>
              </div>
            </div>

            {filteredHistory.length > 0 ? (
              <>
                <div className={styles.historyScroll}>
                  <div className={styles.historyList}>
                    {filteredHistory
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((item, idx) => {
                        const globalIdx = (currentPage - 1) * itemsPerPage + idx;
                        return (
                          <div
                            key={item.id}
                            className={styles.historyCard}
                            style={{ animationDelay: `${globalIdx * 50}ms` }}
                            onClick={() => handleSelectHistory(item)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectHistory(item); } }}
                            aria-label={`Ver análisis del ${item.date}`}
                          >
                            <div className={styles.historyCardHeader}>
                              <span className={styles.historyDate}>{item.date}</span>
                              <span className={`${styles.riskBadge} ${styles[`risk${item.risk}`]}`}>
                                {item.risk}
                              </span>
                              <span className={styles.confidenceBadge}>{item.confidence}% de confianza</span>
                            </div>
                            <div className={styles.historyDetails}>
                              <div className={styles.parameterGrid}>
                                <div className={styles.parameterItem}>
                                  <span>Tiempo de estudio:</span>
                                  <span>{item.parameters.studyTime} h/sem</span>
                                </div>
                                <div className={styles.parameterItem}>
                                  <span>Ingresos:</span>
                                  <span>{item.parameters.familyIncome}</span>
                                </div>
                                <div className={styles.parameterItem}>
                                  <span>Ubicación:</span>
                                  <span>{item.parameters.location}</span>
                                </div>
                                <div className={styles.parameterItem}>
                                  <span>Edad:</span>
                                  <span>{item.parameters.age}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
                <div className={styles.paginationBar}>
                  <button
                    className={styles.pageButton}
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    Anterior
                  </button>
                  <span className={styles.pageInfo}>
                    Página {currentPage} de {Math.max(1, Math.ceil(filteredHistory.length / itemsPerPage))}
                  </span>
                  <button
                    className={styles.pageButton}
                    type="button"
                    disabled={currentPage >= Math.ceil(filteredHistory.length / itemsPerPage)}
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredHistory.length / itemsPerPage) || 1, p + 1))}
                  >
                    Siguiente
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.noHistory}>
                <p>No hay análisis guardados en el historial.</p>
                <button onClick={handleNewAnalysis} className={styles.primaryButton}>Realizar primer análisis</button>
              </div>
            )}
          </div>
        )}

        {/* Mostrar resultado también en la pestaña de historial, con layout estilo Vinos */}
        {activeTab === 'historial' && result && (
          <div className={styles.resultContainer} ref={resultRef}>
            <h2>Resultado del Análisis</h2>
            <div className={`${styles.resultCard} ${styles[`result${result.risk}`]}`}>
              <div className={styles.resultHeader}>
                <h3>Riesgo de Abandono</h3>
                <div className={styles.resultQuality}>
                  <span>Nivel:</span>
                  <strong>{result.risk}</strong>
                </div>
                <div className={styles.resultConfidence}>
                  <span>Confianza:</span>
                  <strong>{result.confidence}%</strong>
                </div>
              </div>

              <div className={styles.resultMessage}>
                {result.risk === 'Bajo' && 'Riesgo bajo. El estudiante presenta condiciones favorables.'}
                {result.risk === 'Medio' && 'Riesgo medio. Se recomienda monitoreo y apoyo preventivo.'}
                {result.risk === 'Alto' && 'Riesgo alto. Requiere intervención y plan de apoyo inmediato.'}
              </div>

              <div className={styles.recommendations}>
                <h4>Recomendaciones:</h4>
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
            </div>

            <div className={styles.analysisDetails}>
              <h3>Detalles del Análisis</h3>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span>Tiempo de estudio:</span>
                  <span>{formData.studyTime || '-'} h/sem</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Ingresos familiares:</span>
                  <span>{formData.familyIncome || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Ubicación:</span>
                  <span>{formData.location || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Edad:</span>
                  <span>{formData.age || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Apoyo escolar:</span>
                  <span>{formData.schoolSupport ? 'Sí' : 'No'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Apoyo familiar:</span>
                  <span>{formData.familySupport ? 'Sí' : 'No'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Clases particulares:</span>
                  <span>{formData.extraEducationalSupport ? 'Sí' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Modal de confirmación */}

      {confirmOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" onClick={() => setConfirmOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Confirmar análisis</h3>
              <button className={styles.modalClose} aria-label="Cerrar" onClick={() => setConfirmOpen(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p>¿Deseas proceder con el análisis de abandono con los datos ingresados?</p>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.secondaryButton} onClick={() => setConfirmOpen(false)}>Cancelar</button>
              <button className={styles.confirmButton} onClick={() => { setConfirmOpen(false); runAnalysis(); }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
