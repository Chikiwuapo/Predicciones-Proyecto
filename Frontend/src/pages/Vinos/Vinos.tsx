import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaWineBottle, 
  FaChartLine, 
  FaHistory, 
  FaArrowRight, 
  FaWineGlassAlt,
  FaFlask,
  FaBalanceScale,
  FaInfoCircle
} from 'react-icons/fa';
import styles from './Vinos.module.css';
import WineCharts from './WineCharts';

type WineQuality = 'Baja' | 'Media' | 'Alta' | '';

interface WineAnalysis {
  id: string;
  date: string;
  dateKey?: string; // yyyy-mm-dd para filtrado confiable
  quality: WineQuality;
  confidence: number;
  parameters: typeof initialFormData;
}

const initialFormData = {
  fixedAcidity: 0,
  volatileAcidity: 0,
  citricAcid: 0,
  residualSugar: 0,
  chlorides: 0,
  freeSulfurDioxide: 0,
  totalSulfurDioxide: 0,
  density: 0,
  pH: 0,
  sulphates: 0,
  alcohol: 0
};

export default function Vinos() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'nuevo' | 'historial'>('nuevo');
  const [formData, setFormData] = useState(initialFormData);
  const [result, setResult] = useState<{quality: WineQuality; confidence: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<WineAnalysis[]>([]);
  const historyRef = useRef<HTMLDivElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const [pendingScrollToHistory, setPendingScrollToHistory] = useState(false);
  const [infoModal, setInfoModal] = useState<{open: boolean; title: string; content: string}>({ open: false, title: '', content: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [qualityFilter, setQualityFilter] = useState<WineQuality | 'Todas'>('Todas');
  const [dateFilter, setDateFilter] = useState<string>(''); // yyyy-mm-dd
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  // Normaliza una fecha a yyyy-mm-dd. Usa dateKey si está disponible.
  const toISODate = (input: string, key?: string): string => {
    if (key) return key;
    if (!input) return '';
    // 1) Intento directo con Date
    const d = new Date(input);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    // 2) Parseo manual dd/mm/yyyy o dd-mm-yyyy (con o sin hora)
    const m1 = input.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);
    if (m1) {
      let dd = parseInt(m1[1], 10);
      let mm = parseInt(m1[2], 10);
      let yyyy = parseInt(m1[3].length === 2 ? `20${m1[3]}` : m1[3], 10);
      // Asumir formato día/mes/año por locales ES
      if (dd > 31 || mm > 12) {
        // fallback: intercambiar si parece mm/dd/yyyy
        [dd, mm] = [mm, dd];
      }
      const mmS = String(mm).padStart(2, '0');
      const ddS = String(dd).padStart(2, '0');
      return `${yyyy}-${mmS}-${ddS}`;
    }
    return '';
  };

  const runAnalysis = async () => {
    setIsLoading(true);
    
    try {
      // Simulación de llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Análisis inteligente basado en los parámetros del vino
      let quality: WineQuality = 'Media';
      let confidence = 75;
      
      // Evaluar calidad basada en parámetros
      const { alcohol, pH, volatileAcidity, residualSugar, fixedAcidity } = formData;
      
      // Criterios de calidad
      let score = 0;
      
      // Alcohol (ideal: 12-14%)
      if (alcohol >= 12 && alcohol <= 14) score += 25;
      else if (alcohol >= 11 && alcohol <= 15) score += 15;
      else score += 5;
      
      // pH (ideal: 3.0-3.5)
      if (pH >= 3.0 && pH <= 3.5) score += 25;
      else if (pH >= 2.8 && pH <= 3.8) score += 15;
      else score += 5;
      
      // Acidez volátil (ideal: < 0.6)
      if (volatileAcidity < 0.6) score += 20;
      else if (volatileAcidity < 1.0) score += 10;
      else score += 0;
      
      // Azúcar residual (depende del tipo)
      if (residualSugar < 4 || (residualSugar >= 12 && residualSugar <= 45)) score += 15;
      else score += 8;
      
      // Acidez fija (ideal: 6-9 g/L)
      if (fixedAcidity >= 6 && fixedAcidity <= 9) score += 15;
      else if (fixedAcidity >= 4 && fixedAcidity <= 12) score += 10;
      else score += 5;
      
      // Determinar calidad basada en el score
      if (score >= 80) {
        quality = 'Alta';
        confidence = Math.floor(Math.random() * 15) + 85; // 85-100%
      } else if (score >= 60) {
        quality = 'Media';
        confidence = Math.floor(Math.random() * 15) + 70; // 70-85%
      } else {
        quality = 'Baja';
        confidence = Math.floor(Math.random() * 15) + 55; // 55-70%
      }
      
      setResult({
        quality,
        confidence
      });

      // Crear nuevo análisis en el historial
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const newItem: WineAnalysis = {
        id: String(Date.now()),
        date: now.toLocaleString(),
        dateKey: `${yyyy}-${mm}-${dd}`,
        quality,
        confidence,
        parameters: { ...formData },
      };
      setHistory(prev => {
        const updated = [newItem, ...prev];
        // Guardar en localStorage
        try {
          localStorage.setItem('vinos.history', JSON.stringify(updated));
        } catch (error) {
          console.error('Error saving history:', error);
        }
        return updated;
      });
      setSelectedAnalysisForCharts(newItem);

      // Cambiar a la pestaña de historial y desplazar suavemente
      setActiveTab('historial');
      setPendingScrollToHistory(true);
    } catch (error) {
      console.error('Error al analizar el vino:', error);
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
    setFormData(initialFormData);
    setActiveTab('nuevo');
  };

  // Efecto para hacer scroll cuando cambiamos a historial
  useEffect(() => {
    if (activeTab === 'historial' && pendingScrollToHistory) {
      // dar un frame para montar el DOM
      requestAnimationFrame(() => {
        // Priorizar el bloque de resultados si existe, de lo contrario ir al inicio del historial
        const target = resultRef.current ?? historyRef.current;
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setPendingScrollToHistory(false);
      });
    }
  }, [activeTab, pendingScrollToHistory, result]);

  // Cargar datos de ejemplo y filtros al montar
  useEffect(() => {
    // Cargar filtros guardados
    try {
      const stored = localStorage.getItem('vinos.filters');
      if (stored) {
        const parsed = JSON.parse(stored) as { quality?: WineQuality | 'Todas'; date?: string; fromDate?: string; toDate?: string };
        if (parsed.quality) setQualityFilter(parsed.quality);
        // Compatibilidad: usar 'date' si existe; si no, intentar fromDate
        if (typeof parsed.date === 'string') setDateFilter(parsed.date);
        else if (typeof parsed.fromDate === 'string') setDateFilter(parsed.fromDate);
      }
    } catch {}

    // Cargar historial guardado o crear datos de ejemplo
    try {
      const storedHistory = localStorage.getItem('vinos.history');
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory) as WineAnalysis[];
        setHistory(parsedHistory);
      } else {
        // Crear datos de ejemplo
        const exampleData: WineAnalysis[] = [
          {
            id: '1',
            date: '2024-01-15 14:30:25',
            dateKey: '2024-01-15',
            quality: 'Alta',
            confidence: 92,
            parameters: {
              fixedAcidity: 7.4,
              volatileAcidity: 0.7,
              citricAcid: 0.0,
              residualSugar: 1.9,
              chlorides: 0.076,
              freeSulfurDioxide: 11,
              totalSulfurDioxide: 34,
              density: 0.9978,
              pH: 3.51,
              sulphates: 0.56,
              alcohol: 9.4
            }
          },
          {
            id: '2',
            date: '2024-01-14 16:45:12',
            dateKey: '2024-01-14',
            quality: 'Media',
            confidence: 78,
            parameters: {
              fixedAcidity: 8.8,
              volatileAcidity: 0.88,
              citricAcid: 0.0,
              residualSugar: 2.6,
              chlorides: 0.098,
              freeSulfurDioxide: 25,
              totalSulfurDioxide: 67,
              density: 0.9968,
              pH: 3.2,
              sulphates: 0.68,
              alcohol: 9.8
            }
          },
          {
            id: '3',
            date: '2024-01-13 11:20:33',
            dateKey: '2024-01-13',
            quality: 'Baja',
            confidence: 65,
            parameters: {
              fixedAcidity: 6.3,
              volatileAcidity: 0.31,
              citricAcid: 0.47,
              residualSugar: 3.6,
              chlorides: 0.067,
              freeSulfurDioxide: 18,
              totalSulfurDioxide: 42,
              density: 0.9959,
              pH: 3.16,
              sulphates: 0.69,
              alcohol: 11.0
            }
          }
        ];
        setHistory(exampleData);
        localStorage.setItem('vinos.history', JSON.stringify(exampleData));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('vinos.filters', JSON.stringify({ quality: qualityFilter, date: dateFilter }));
    } catch {}
  }, [qualityFilter, dateFilter]);

  // Reiniciar a la primera página al cambiar filtros o tamaño del historial
  useEffect(() => {
    setCurrentPage(1);
  }, [qualityFilter, dateFilter, history.length]);

  // Historial filtrado (se usa para paginación)
  const filteredHistory = history.filter((item) => {
    const byQuality = qualityFilter === 'Todas' || item.quality === qualityFilter;
    if (!byQuality) return false;
    if (!dateFilter) return true;
    const itemISO = toISODate(item.date, item.dateKey);
    return itemISO === dateFilter;
  });

  // Al seleccionar un registro, mostrar su información en el resultado
  const handleSelectHistory = (item: WineAnalysis) => {
    setFormData({ ...item.parameters });
    setResult({ quality: item.quality, confidence: item.confidence });
    setSelectedAnalysisForCharts(item);
    setActiveTab('historial');
    // Desplazar al resultado después de renderizar
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  // Estado para el análisis seleccionado en los gráficos
  const [selectedAnalysisForCharts, setSelectedAnalysisForCharts] = useState<WineAnalysis | null>(null);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <FaWineBottle className={styles.headerIcon} />
          <h1>Análisis de Calidad de Vinos</h1>
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
        >
          <FaFlask className={styles.tabIcon} />
          <span>Nuevo Análisis</span>
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'historial' ? styles.active : ''}`} 
          onClick={() => setActiveTab('historial')}
        >
          <FaHistory className={styles.tabIcon} />
          <span>Historial</span>
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'nuevo' ? (
          <form onSubmit={handleSubmit} className={styles.card}>
            <h2>Datos del Vino</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>
                  <FaFlask className={styles.inputIcon} />
                  <span>Acidez Fija (g/L)</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input 
                    type="number" 
                    step="0.1"
                    min="3.8"
                    max="15.9"
                    value={formData.fixedAcidity}
                    onChange={handleInputChange}
                    name="fixedAcidity"
                    required
                  />
                  <button
                    type="button"
                    className={styles.infoButton}
                    aria-label="Información sobre Acidez Fija"
                    onClick={() => setInfoModal({
                      open: true,
                      title: 'Acidez Fija (g/L)',
                      content: 'La acidez fija corresponde a ácidos no volátiles presentes en el vino (tartárico, málico, etc.). Rango de referencia común: 3.8 - 15.9 g/L. Valores altos suelen aportar frescura, pero en exceso pueden resultar agresivos.'
                    })}
                  >
                    <FaInfoCircle className={styles.infoIcon} />
                  </button>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>
                  <FaFlask className={styles.inputIcon} />
                  <span>Acidez Volátil (g/L)</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0.08"
                    max="1.58"
                    value={formData.volatileAcidity}
                    onChange={handleInputChange}
                    name="volatileAcidity"
                    required
                  />
                  <button
                    type="button"
                    className={styles.infoButton}
                    aria-label="Información sobre Acidez Volátil"
                    onClick={() => setInfoModal({
                      open: true,
                      title: 'Acidez Volátil (g/L)',
                      content: 'La acidez volátil (principalmente ácido acético) aporta aromas y sabores. En exceso genera defectos. Rango típico: 0.08 - 1.58 g/L.'
                    })}
                  >
                    <FaInfoCircle className={styles.infoIcon} />
                  </button>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>
                  <FaFlask className={styles.inputIcon} />
                  <span>Ácido Cítrico (g/L)</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    max="1.66"
                    value={formData.citricAcid}
                    onChange={handleInputChange}
                    name="citricAcid"
                    required
                  />
                  <button
                    type="button"
                    className={styles.infoButton}
                    aria-label="Información sobre Ácido Cítrico"
                    onClick={() => setInfoModal({
                      open: true,
                      title: 'Ácido Cítrico (g/L)',
                      content: 'El ácido cítrico contribuye a la frescura y estabilidad. Rango típico: 0 - 1.66 g/L.'
                    })}
                  >
                    <FaInfoCircle className={styles.infoIcon} />
                  </button>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>
                  <FaBalanceScale className={styles.inputIcon} />
                  <span>Azúcar Residual (g/L)</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0.6"
                    max="65.8"
                    value={formData.residualSugar}
                    onChange={handleInputChange}
                    name="residualSugar"
                    required
                  />
                  <button
                    type="button"
                    className={styles.infoButton}
                    aria-label="Información sobre Azúcar Residual"
                    onClick={() => setInfoModal({
                      open: true,
                      title: 'Azúcar Residual (g/L)',
                      content: 'Cantidad de azúcar que queda tras la fermentación. Afecta dulzor y cuerpo. Rango típico: 0.6 - 65.8 g/L.'
                    })}
                  >
                    <FaInfoCircle className={styles.infoIcon} />
                  </button>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>
                  <FaFlask className={styles.inputIcon} />
                  <span>Cloruros (g/L)</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input 
                    type="number" 
                    step="0.001"
                    min="0.012"
                    max="0.611"
                    value={formData.chlorides}
                    onChange={handleInputChange}
                    name="chlorides"
                    required
                  />
                  <button
                    type="button"
                    className={styles.infoButton}
                    aria-label="Información sobre Cloruros"
                    onClick={() => setInfoModal({
                      open: true,
                      title: 'Cloruros (g/L)',
                      content: 'Los cloruros (sales) influyen en el sabor salino y estabilidad. Rango típico: 0.012 - 0.611 g/L.'
                    })}
                  >
                    <FaInfoCircle className={styles.infoIcon} />
                  </button>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>
                  <FaBalanceScale className={styles.inputIcon} />
                  <span>Densidad (g/cm³)</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input 
                    type="number" 
                    step="0.0001"
                    min="0.99"
                    max="1.04"
                    value={formData.density}
                    onChange={handleInputChange}
                    name="density"
                    required
                  />
                  <button
                    type="button"
                    className={styles.infoButton}
                    aria-label="Información sobre Densidad"
                    onClick={() => setInfoModal({
                      open: true,
                      title: 'Densidad (g/cm³)',
                      content: 'La densidad se relaciona con el contenido de azúcar y alcohol. Rango típico: 0.99 - 1.04 g/cm³.'
                    })}
                  >
                    <FaInfoCircle className={styles.infoIcon} />
                  </button>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>
                  <FaFlask className={styles.inputIcon} />
                  <span>pH</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input 
                    type="number" 
                    step="0.01"
                    min="2.74"
                    max="4.01"
                    value={formData.pH}
                    onChange={handleInputChange}
                    name="pH"
                    required
                  />
                  <button
                    type="button"
                    className={styles.infoButton}
                    aria-label="Información sobre pH"
                    onClick={() => setInfoModal({
                      open: true,
                      title: 'pH',
                      content: 'El pH mide la acidez total. Rango típico: 2.74 - 4.01. Valores bajos implican mayor acidez.'
                    })}
                  >
                    <FaInfoCircle className={styles.infoIcon} />
                  </button>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>
                  <FaFlask className={styles.inputIcon} />
                  <span>Sulfatos (g/L)</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0.22"
                    max="2.0"
                    value={formData.sulphates}
                    onChange={handleInputChange}
                    name="sulphates"
                    required
                  />
                  <button
                    type="button"
                    className={styles.infoButton}
                    aria-label="Información sobre Sulfatos"
                    onClick={() => setInfoModal({
                      open: true,
                      title: 'Sulfatos (g/L)',
                      content: 'Los sulfatos pueden contribuir a la estabilidad del vino. Rango típico: 0.22 - 2.0 g/L.'
                    })}
                  >
                    <FaInfoCircle className={styles.infoIcon} />
                  </button>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>
                  <FaWineGlassAlt className={styles.inputIcon} />
                  <span>Grado Alcohólico (% vol)</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input 
                    type="number" 
                    step="0.1"
                    min="8.0"
                    max="14.9"
                    value={formData.alcohol}
                    onChange={handleInputChange}
                    name="alcohol"
                    required
                  />
                  <button
                    type="button"
                    className={styles.infoButton}
                    aria-label="Información sobre Grado Alcohólico"
                    onClick={() => setInfoModal({
                      open: true,
                      title: 'Grado Alcohólico (% vol)',
                      content: 'Porcentaje de alcohol del vino. Afecta cuerpo y percepción. Rango típico: 8.0 - 14.9 % vol.'
                    })}
                  >
                    <FaInfoCircle className={styles.infoIcon} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className={styles.formActions}>
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
                    <FaFlask className={styles.buttonIcon} />
                    <span>Analizar Vino</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.historyContainer} ref={historyRef}>
            <div className={styles.historyHeader}>
              <h2>Historial de Análisis</h2>
              <div className={styles.historyActions}>
                <div className={styles.filtersBar}>
                  <div className={styles.filterItem}>
                    <label>Calidad</label>
                    <select
                      value={qualityFilter}
                      onChange={(e) => setQualityFilter(e.target.value as any)}
                    >
                      <option value="Todas">Todas</option>
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baja">Baja</option>
                    </select>
                  </div>
                  <div className={styles.filterItem}>
                    <label>Fecha</label>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                  </div>
                  <button
                    className={styles.clearFilters}
                    type="button"
                    onClick={() => { setQualityFilter('Todas'); setDateFilter(''); }}
                  >
                    Limpiar
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
                      .slice((currentPage - 1) * itemsPerPage, (currentPage) * itemsPerPage)
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
                              <span className={`${styles.qualityBadge} ${styles[`quality${item.quality}`]}`}>
                                {item.quality}
                              </span>
                              <span className={styles.confidenceBadge}>
                                {item.confidence}% de confianza
                              </span>
                            </div>
                            <div className={styles.historyDetails}>
                              <div className={styles.parameterGrid}>
                                <div className={styles.parameterItem}>
                                  <span>Acidez fija:</span>
                                  <span>{item.parameters.fixedAcidity} g/dm³</span>
                                </div>
                                <div className={styles.parameterItem}>
                                  <span>Alcohol:</span>
                                  <span>{item.parameters.alcohol}% vol</span>
                                </div>
                                <div className={styles.parameterItem}>
                                  <span>pH:</span>
                                  <span>{item.parameters.pH}</span>
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
                <button 
                  onClick={handleNewAnalysis}
                  className={styles.primaryButton}
                >
                  Realizar primer análisis
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Mostrar resultados si estamos en la pestaña de historial y hay un análisis seleccionado */}
        {activeTab === 'historial' && result && (
          <div className={styles.resultContainer} ref={resultRef}>
            <h2>Resultado del Análisis</h2>
            <div className={`${styles.resultCard} ${styles[`result${result.quality}`]}`}>
              <div className={styles.resultHeader}>
                <h3>Calidad del Vino</h3>
                <div className={styles.resultQuality}>
                  <span>Nivel:</span>
                  <strong>{result.quality}</strong>
                </div>
                <div className={styles.resultConfidence}>
                  <span>Confianza:</span>
                  <strong>{result.confidence}%</strong>
                </div>
              </div>
              
              <div className={styles.resultMessage}>
                {result.quality === 'Alta' 
                  ? '¡Excelente vino! Tiene características sobresalientes.' 
                  : result.quality === 'Media'
                  ? 'Buen vino con características equilibradas.'
                  : 'Vino con características mejorables.'}
              </div>
              
              <div className={styles.recommendations}>
                <h4>Recomendaciones:</h4>
                {result.quality === 'Alta' ? (
                  <ul>
                    <li>Excelente perfil de vino, listo para ser disfrutado</li>
                    <li>Considerar añejamiento para desarrollar más complejidad</li>
                    <li>Ideal para maridar con carnes rojas y quesos fuertes</li>
                  </ul>
                ) : result.quality === 'Media' ? (
                  <ul>
                    <li>Buena relación calidad-precio</li>
                    <li>Ideal para consumo en el corto plazo</li>
                    <li>Marida bien con pastas y carnes blancas</li>
                  </ul>
                ) : (
                  <ul>
                    <li>Considerar mejoras en el proceso de producción</li>
                    <li>Ideal para uso en cocina más que para consumo directo</li>
                    <li>Recomendado para consumo joven</li>
                  </ul>
                )}
              </div>
            </div>
            
            <div className={styles.analysisDetails}>
              <h3>Detalles del Análisis</h3>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span>Acidez fija:</span>
                  <span>{formData.fixedAcidity} g/dm³</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Acidez volátil:</span>
                  <span>{formData.volatileAcidity} g/dm³</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Ácido cítrico:</span>
                  <span>{formData.citricAcid} g/dm³</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Azúcar residual:</span>
                  <span>{formData.residualSugar} g/dm³</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Cloruros:</span>
                  <span>{formData.chlorides} g/dm³</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Densidad:</span>
                  <span>{formData.density} g/cm³</span>
                </div>
                <div className={styles.detailItem}>
                  <span>pH:</span>
                  <span>{formData.pH}</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Sulfatos:</span>
                  <span>{formData.sulphates} g/dm³</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Alcohol:</span>
                  <span>{formData.alcohol}% vol</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Componente de Gráficos */}
        {activeTab === 'historial' && selectedAnalysisForCharts && (
          <WineCharts 
            selectedAnalysis={selectedAnalysisForCharts}
          />
        )}
      </div>
      {/* Modales */}
      {infoModal.open && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" onClick={() => setInfoModal({ ...infoModal, open: false })}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{infoModal.title}</h3>
              <button className={styles.modalClose} aria-label="Cerrar" onClick={() => setInfoModal({ ...infoModal, open: false })}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p>{infoModal.content}</p>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.secondaryButton} onClick={() => setInfoModal({ ...infoModal, open: false })}>Entendido</button>
            </div>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" onClick={() => setConfirmOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Confirmar análisis</h3>
              <button className={styles.modalClose} aria-label="Cerrar" onClick={() => setConfirmOpen(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p>¿Deseas proceder con el análisis del vino con los datos ingresados?</p>
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
