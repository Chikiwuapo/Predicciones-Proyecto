import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaWineBottle, 
  FaChartLine, 
  FaHistory, 
  FaArrowRight, 
  FaWineGlassAlt,
  FaFlask,
  FaBalanceScale,
  FaArrowUp,
  FaArrowDown,
  FaInfoCircle,
  FaCheck,
  FaTimes,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUpAlt,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import styles from './Vinos.module.css';

type WineQuality = 'Baja' | 'Media' | 'Alta' | '';

interface WineAnalysis {
  id: string;
  date: string;
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulación de llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Resultado simulado
      const qualities: WineQuality[] = ['Baja', 'Media', 'Alta'];
      const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
      const randomConfidence = Math.floor(Math.random() * 30) + 70; // 70-100%
      
      setResult({
        quality: randomQuality,
        confidence: randomConfidence
      });
    } catch (error) {
      console.error('Error al analizar el vino:', error);
      alert('Ocurrió un error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setResult(null);
    setFormData(initialFormData);
    setActiveTab('nuevo');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <FaWineBottle className={styles.headerIcon} />
          <h1>Análisis de Calidad de Vinos</h1>
        </div>
        <button 
          className={styles.navButton}
          onClick={() => navigate('/abandono')}
        >
          <FaChartLine className={styles.buttonIcon} />
          <span>Ir a Predicción de Abandono</span>
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
                  <FaInfoCircle 
                    className={styles.infoIcon} 
                    title="Rango recomendado: 3.8 - 15.9 g/L" 
                  />
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
                  <FaInfoCircle 
                    className={styles.infoIcon} 
                    title="Rango recomendado: 0.08 - 1.58 g/L" 
                  />
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
                  <FaInfoCircle 
                    className={styles.infoIcon} 
                    title="Rango recomendado: 0 - 1.66 g/L" 
                  />
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
                  <FaInfoCircle 
                    className={styles.infoIcon} 
                    title="Rango recomendado: 0.6 - 65.8 g/L" 
                  />
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
                  <FaInfoCircle 
                    className={styles.infoIcon} 
                    title="Rango recomendado: 0.012 - 0.611 g/L" 
                  />
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
                  <FaInfoCircle 
                    className={styles.infoIcon} 
                    title="Rango recomendado: 0.99 - 1.04 g/cm³" 
                  />
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
                  <FaInfoCircle 
                    className={styles.infoIcon} 
                    title="Rango recomendado: 2.74 - 4.01" 
                  />
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
                  <FaInfoCircle 
                    className={styles.infoIcon} 
                    title="Rango recomendado: 0.22 - 2.0 g/L" 
                  />
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
                  <FaInfoCircle 
                    className={styles.infoIcon} 
                    title="Rango recomendado: 8.0 - 14.9% vol" 
                  />
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
          <div className={styles.historyContainer}>
            <div className={styles.historyHeader}>
              <h2>Historial de Análisis</h2>
              <button 
                onClick={handleNewAnalysis}
                className={styles.secondaryButton}
              >
                Nuevo Análisis
              </button>
            </div>
            
            {history.length > 0 ? (
              <div className={styles.historyList}>
                {history.map((item) => (
                  <div key={item.id} className={styles.historyCard}>
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
                ))}
              </div>
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
          <div className={styles.resultContainer}>
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
      </div>
    </div>
  );
}
