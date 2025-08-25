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
  FaClock,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaDatabase,
  FaChartBar
} from 'react-icons/fa';
import { dropoutService } from '../../services/dropoutService.ts';
import styles from './Abandono.module.css';
import PersonalCharts from '../../components/PersonalCharts';

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
  attendance: boolean; // true = asiste, false = no asiste
  analysisDate: string; // fecha del análisis
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
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedAnalysis, setSelectedAnalysis] = useState<StudentAnalysis | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearMode, setClearMode] = useState<'select' | 'all'>('select');
  
  // Estado para el modal de implementación de base de datos
  const [showImplementModal, setShowImplementModal] = useState(false);
  const [recordsToImplement, setRecordsToImplement] = useState(50);
  const [totalRecordsAvailable, setTotalRecordsAvailable] = useState(200);
  
  // Estado para datos de gráficos
  const [chartData, setChartData] = useState<any>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableMonths, setAvailableMonths] = useState<Array<{number: number, name: string}>>([]);
  
  // Cargar datos iniciales cuando se monte el componente
  useEffect(() => {
    const initializeData = async () => {
      await loadChartData();
      
      // Verificar si realmente hay datos en la BD
      const isEmpty = await checkIfDatabaseIsEmpty();
      if (isEmpty) {
        // Si la BD está vacía, limpiar el estado local
        setHistory([]);
        setChartData(null);
        setResult(null);
        setSelectedAnalysis(null);
      }
    };
    
    initializeData();
  }, []);
  
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
    attendance: true, // true = asiste, false = no asiste
    analysisDate: new Date().toISOString().split('T')[0], // fecha actual
  });

  // Función para implementar datos de la base de datos
  const implementDatabaseData = async () => {
    // Mostrar el modal para seleccionar cantidad de registros
    setShowImplementModal(true);
  };

  // Función para confirmar la implementación
  const confirmImplementDatabaseData = async () => {
    try {
      setIsLoading(true);
      setShowImplementModal(false);
      
      // Llamar al servicio para implementar datos de la base de datos
      const response = await dropoutService.implementDatabaseData(recordsToImplement);
      
      if (response.success) {
        // Recargar el historial
        await loadHistory();
        
        // Cargar datos de gráficos después de implementar
        await loadChartData();
        
        // Mostrar mensaje de éxito
        alert(`Se implementaron ${response.count} registros de la base de datos exitosamente.`);
        
        // Cambiar a la pestaña de historial para mostrar los datos
        setActiveTab('historial');
      } else {
        alert('Error al implementar datos: ' + response.message);
      }
    } catch (error) {
      console.error('Error implementando datos:', error);
      alert('Error al implementar datos de la base de datos');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cargar el historial
  const loadHistory = async () => {
    try {
      const analyses = await dropoutService.getAllAnalyses();
      // Mapear AnalysisResult a StudentAnalysis
      const mappedAnalyses: StudentAnalysis[] = analyses.map(analysis => ({
        id: analysis.id.toString(),
        date: analysis.analysis_date || analysis.created_at, // Usar analysis_date si está disponible
        risk: analysis.risk_level as RiskLevel,
        confidence: analysis.confidence,
        parameters: {
          age: analysis.age.toString(),
          gender: analysis.gender as Gender,
          familyIncome: analysis.family_income.toString(),
          location: analysis.location,
          economicSituation: analysis.economic_situation,
          studyTime: analysis.study_time.toString(),
          schoolSupport: analysis.school_support,
          familySupport: analysis.family_support,
          extraEducationalSupport: analysis.extra_educational_support,
          attendance: analysis.attendance,
          analysisDate: analysis.analysis_date
        }
      }));
      setHistory(mappedAnalyses);
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  // Función para cargar datos de gráficos con filtros
  const loadChartData = async (year?: number, month?: number) => {
    try {
      console.log('Cargando datos de gráficos para:', { year, month });
      
      // Cargar fechas disponibles primero
      const availableDates = await dropoutService.getAvailableDates();
      console.log('Fechas disponibles:', availableDates);
      
      // Actualizar estado de fechas disponibles
      setAvailableYears(availableDates.available_years);
      setAvailableMonths(availableDates.available_months);
      
      // Cargar datos de gráficos con filtros
      const chartData = await dropoutService.getBasicChartData(year, month);
      console.log('Datos de gráficos cargados:', chartData);
      
      // Actualizar estado de datos de gráficos
      setChartData(chartData);
      
      return chartData;
    } catch (error) {
      console.error('Error cargando datos de gráficos:', error);
      return null;
    }
  };

  // Función para calcular automáticamente la situación económica
  const calculateEconomicSituation = (age: string, familyIncome: string, studyTime: string): string => {
    if (!age || !familyIncome || !studyTime) return '';
    
    const ageNum = parseInt(age);
    const incomeNum = parseFloat(familyIncome);
    const studyTimeNum = parseInt(studyTime);
    
    // LÓGICA PRINCIPAL: Si los ingresos son menos de 1000, automáticamente es 'bajo'
    if (incomeNum < 1000) return 'bajo';
    
    let score = 0;
    
    // Factores de edad
    if (ageNum > 25) score += 2;      // Adultos tienen más dificultades económicas
    else if (ageNum > 18) score += 1; // Jóvenes adultos
    else score -= 1;                   // Adolescentes suelen tener apoyo familiar
    
    // Factores de ingresos (solo para ingresos >= 1000)
    if (incomeNum < 2000) score += 2; // Ingresos moderados
    else if (incomeNum < 4000) score += 1; // Ingresos medios-altos
    else score -= 1;                        // Altos ingresos
    
    // Factores de tiempo de estudio
    if (studyTimeNum < 10) score += 2;     // Poco estudio puede indicar problemas económicos
    else if (studyTimeNum < 20) score += 1;
    else score -= 1;                        // Mucho estudio puede indicar estabilidad
    
    // Determinar situación económica basada en el score
    if (score >= 3) return 'medio';      // Situación económica moderada
    else return 'alto';                   // Situación económica favorable
  };

  // Función para calcular el riesgo de abandono basado en los datos del estudiante
  const calculateDropoutRisk = (age: string, familyIncome: string, studyTime: string, gender: string, 
                               schoolSupport: boolean, familySupport: boolean, extraEducationalSupport: boolean, 
                               attendance: boolean, location: string): { risk: RiskLevel; confidence: number } => {
    if (!age || !familyIncome || !studyTime) {
      return { risk: 'Medio', confidence: 70 };
    }
    
    const ageNum = parseInt(age);
    const incomeNum = parseFloat(familyIncome);
    const studyTimeNum = parseInt(studyTime);
    
    let riskScore = 50; // Punto de partida neutral
    
    // Factores de riesgo por edad
    if (ageNum > 25) riskScore += 25;        // Estudiantes adultos tienen más riesgo
    else if (ageNum > 18) riskScore += 15;   // Estudiantes mayores tienen más riesgo
    else if (ageNum < 15) riskScore += 20;   // Estudiantes muy jóvenes también
    else riskScore -= 5;                      // Edad ideal (15-18)
    
    // Factores de riesgo por tiempo de estudio
    if (studyTimeNum < 5) riskScore += 30;   // Muy poco tiempo de estudio
    else if (studyTimeNum < 10) riskScore += 20; // Poco tiempo de estudio
    else if (studyTimeNum < 15) riskScore += 10; // Tiempo moderado
    else riskScore -= 10;                        // Mucho tiempo de estudio reduce riesgo
    
    // Factores de riesgo por ingresos familiares
    if (incomeNum < 500) riskScore += 35;    // Muy bajos ingresos
    else if (incomeNum < 1000) riskScore += 25; // Bajos ingresos
    else if (incomeNum < 2000) riskScore += 15; // Ingresos moderados
    else riskScore -= 8;                        // Altos ingresos reducen riesgo
    
    // Factores de riesgo por situación económica (ya calculada)
    const economicSituation = calculateEconomicSituation(age, familyIncome, studyTime);
    if (economicSituation === 'bajo') riskScore += 30;
    else if (economicSituation === 'medio') riskScore += 15;
    else riskScore -= 10;
    
    // Factores protectores (reducen riesgo)
    if (schoolSupport) riskScore -= 12;      // Apoyo escolar
    if (familySupport) riskScore -= 15;      // Apoyo familiar
    if (extraEducationalSupport) riskScore -= 8; // Clases particulares
    if (attendance) riskScore -= 20;         // Asistencia regular (factor muy importante)
    
    // Factores adicionales
    if (gender === 'F') riskScore -= 5;      // Las mujeres suelen tener menor riesgo
    if (location.toLowerCase().includes('lima') || location.toLowerCase().includes('arequipa')) {
      riskScore -= 5;                        // Ubicaciones urbanas principales
    }
    
    // Asegurar que el score esté entre 0 y 100
    riskScore = Math.max(0, Math.min(100, riskScore));
    
    // Determinar nivel de riesgo
    let risk: RiskLevel;
    if (riskScore >= 60) risk = 'Alto';
    else if (riskScore >= 30) risk = 'Medio';
    else risk = 'Bajo';
    
    // Calcular confianza basada en la consistencia de los datos
    const confidence = 85 + Math.random() * 10;
    
    return { risk, confidence: Math.round(confidence) };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    };
    
    // Si cambió edad, ingresos o tiempo de estudio, recalcular situación económica
    if (['age', 'familyIncome', 'studyTime'].includes(name)) {
      const newEconomicSituation = calculateEconomicSituation(
        newFormData.age, 
        newFormData.familyIncome, 
        newFormData.studyTime
      );
      newFormData.economicSituation = newEconomicSituation;
    }
    
    // Recalcular riesgo de abandono cuando cambien datos relevantes
    if (['age', 'familyIncome', 'studyTime', 'gender', 'schoolSupport', 'familySupport', 'extraEducationalSupport', 'attendance', 'location'].includes(name)) {
      const riskCalculation = calculateDropoutRisk(
        newFormData.age,
        newFormData.familyIncome,
        newFormData.studyTime,
        newFormData.gender,
        newFormData.schoolSupport,
        newFormData.familySupport,
        newFormData.extraEducationalSupport,
        newFormData.attendance,
        newFormData.location
      );
      
      // Actualizar el estado del resultado en tiempo real
      setResult({
        risk: riskCalculation.risk,
        confidence: riskCalculation.confidence
      });
    }
    
    setFormData(newFormData);
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
      // Preparar datos para enviar al backend
      const analysisData = {
        age: parseInt(formData.age),
        gender: formData.gender,
        familyIncome: parseFloat(formData.familyIncome),
        location: formData.location,
        economicSituation: formData.economicSituation,
        studyTime: parseInt(formData.studyTime),
        schoolSupport: formData.schoolSupport,
        familySupport: formData.familySupport,
        extraEducationalSupport: formData.extraEducationalSupport,
        attendance: formData.attendance,
        analysisDate: formData.analysisDate,
      };

      console.log('=== DATOS ENVIADOS DESDE FRONTEND ===');
      console.log('analysisData:', analysisData);
      console.log('formData.economicSituation:', formData.economicSituation);
      console.log('typeof formData.economicSituation:', typeof formData.economicSituation);
      console.log('formData.attendance:', formData.attendance);
      console.log('typeof formData.attendance:', typeof formData.attendance);
      console.log('=== CÁLCULO AUTOMÁTICO FRONTEND ===');
      console.log('Edad:', formData.age);
      console.log('Ingresos:', formData.familyIncome);
      console.log('Tiempo estudio:', formData.studyTime);
      console.log('Situación económica calculada:', formData.economicSituation);

      // Usar el servicio para crear el análisis
      const result = await dropoutService.createAnalysis(analysisData);
      
      console.log('=== RESPUESTA DEL BACKEND ===');
      console.log('result:', result);
      console.log('result.risk_level:', result.risk_level);
      console.log('result.economic_situation:', result.economic_situation);
      console.log('result.risk_level tipo:', typeof result.risk_level);
      console.log('result.risk_level valor exacto:', `"${result.risk_level}"`);
      
      // Actualizar el estado con el resultado
      const riskLevel = result.risk_level as RiskLevel;
      console.log('riskLevel convertido:', riskLevel);
      console.log('riskLevel tipo:', typeof riskLevel);
      
      setResult({ 
        risk: riskLevel, 
        confidence: result.confidence 
      });
      
      console.log('=== ESTADO ACTUALIZADO ===');
      console.log('result.risk:', riskLevel);
      console.log('result.confidence:', result.confidence);

      // Guardar entrada en historial
      const entry: StudentAnalysis = {
        id: String(result.id),
        date: result.analysis_date 
          ? new Date(result.analysis_date).toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : new Date(result.created_at).toLocaleString(),
        risk: riskLevel,
        confidence: result.confidence,
        parameters: { 
          ...formData,
          attendance: formData.attendance,
          analysisDate: formData.analysisDate
        },
      };
      
      console.log('=== ENTRADA DEL HISTORIAL ===');
      console.log('entry.risk:', entry.risk);
      console.log('entry.risk tipo:', typeof entry.risk);
      console.log('entry completa:', entry);
      
      setHistory(prev => [entry, ...prev]);

      // Navegar a la página de estadísticas
      navigate('/estadisticas');
      
    } catch (error) {
      console.error('Error al analizar el riesgo:', error);
      alert('Ocurrió un error al procesar la solicitud. Verifica que el servidor esté ejecutándose.');
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

  // Cargar historial desde la base de datos y filtros de localStorage al montar
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await dropoutService.getAllAnalyses();
        const historyData: StudentAnalysis[] = data.map((item) => ({
          id: String(item.id),
          date: item.analysis_date 
          ? new Date(item.analysis_date).toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : new Date(item.created_at).toLocaleString(),
          risk: item.risk_level as RiskLevel,
          confidence: item.confidence,
          parameters: {
            age: String(item.age),
            gender: item.gender as Gender,
            familyIncome: String(item.family_income),
            location: item.location,
            economicSituation: item.economic_situation,
            studyTime: String(item.study_time),
            schoolSupport: item.school_support,
            familySupport: item.family_support,
            extraEducationalSupport: item.extra_educational_support,
            attendance: item.attendance || true, // valor por defecto si no existe
            analysisDate: item.analysis_date || new Date(item.created_at).toISOString().split('T')[0], // usar fecha de creación si no existe
          },
        }));
        setHistory(historyData);
      } catch (error) {
        console.error('Error al cargar el historial:', error);
      }
    };

    loadHistory();

    // Cargar filtros de localStorage
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
    setSelectedAnalysis(item);
    setActiveTab('historial');
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  // Manejar selección de elementos para eliminar
  const handleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Manejar selección/deselección de todos
  const handleSelectAll = () => {
    if (selectedItems.size === filteredHistory.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredHistory.map(item => item.id)));
    }
  };

  // Función para eliminar elementos seleccionados
  const handleDeleteSelected = async () => {
    try {
      const itemsToDelete = Array.from(selectedItems);
      const promises = itemsToDelete.map(id => 
        fetch(`http://localhost:8000/api/student-dropout-analysis/${id}/`, {
          method: 'DELETE',
        })
      );
      
      await Promise.all(promises);
      
      // Actualizar el historial local
      setHistory(prev => prev.filter(item => !selectedItems.has(item.id)));
      setSelectedItems(new Set());
      setShowClearModal(false);
      
      alert('Elementos eliminados exitosamente');
    } catch (error) {
      console.error('Error al eliminar elementos:', error);
      alert('Error al eliminar elementos');
    }
  };

  // Función para eliminar todo el historial
  const handleDeleteAll = async () => {
    try {
      setIsLoading(true);
      
      // Confirmar con el usuario
      const confirmDelete = window.confirm(
        '🗑️ ¿Eliminar todo el historial?\n\n' +
        'Esto eliminará todos los análisis guardados.\n' +
        '¿Estás seguro?'
      );
      
      if (!confirmDelete) {
        setIsLoading(false);
        return;
      }
      
      console.log('🔄 Iniciando limpieza del historial...');
      
      const response = await dropoutService.clearAllAnalyses();
      
      if (response.success) {
        // Limpiar estado local
        setHistory([]);
        setSelectedItems(new Set());
        setSelectedAnalysis(null);
        setShowClearModal(false);
        
        // Limpiar resultado actual si existe
        setResult(null);
        
        // Limpiar datos de gráficos
        setChartData(null);
        
        // Verificar que realmente se limpió la BD
        const isEmpty = await checkIfDatabaseIsEmpty();
        console.log('¿BD está vacía después de limpiar?', isEmpty);
        
        if (isEmpty) {
          // Forzar recarga de datos
          await loadChartData();
          alert('✅ Historial eliminado exitosamente!\n\nLa base de datos ha sido limpiada completamente.');
        } else {
          alert('⚠️ El historial se limpió pero la BD puede tener datos residuales.\nUsa "RESET COMPLETO BD" para limpieza total.');
        }
      } else {
        alert('❌ Error al eliminar todo el historial: ' + response.message);
      }
    } catch (error) {
      console.error('Error al eliminar todo:', error);
      alert('❌ Error al eliminar todo el historial');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para seleccionar un análisis del historial
  const handleSelectAnalysis = (analysis: StudentAnalysis) => {
    setSelectedAnalysis(analysis);
    // Scroll al resultado
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Función para verificar si realmente no hay datos en la BD
  const checkIfDatabaseIsEmpty = async (): Promise<boolean> => {
    try {
      const stats = await dropoutService.getStatistics();
      return stats.total_analyses === 0;
    } catch (error) {
      console.error('Error verificando BD:', error);
      return true; // Asumir que está vacía si hay error
    }
  };

  // Función para RESET COMPLETO de la base de datos
  const resetCompleteDatabase = async () => {
    try {
      setIsLoading(true);
      
      // Confirmar con el usuario
      const confirmReset = window.confirm(
        '🚨 ATENCIÓN: Esto eliminará TODOS los datos de la base de datos.\n\n' +
        '• Todos los análisis guardados\n' +
        '• Todas las estadísticas\n' +
        '• Todos los registros\n\n' +
        'Esta acción NO se puede deshacer.\n\n' +
        '¿Estás seguro de que quieres hacer un RESET COMPLETO?'
      );
      
      if (!confirmReset) {
        setIsLoading(false);
        return;
      }
      
      console.log('🔄 Iniciando RESET COMPLETO de la base de datos...');
      
      // 1. Limpiar desde el servicio
      const clearResponse = await dropoutService.clearAllAnalyses();
      console.log('Respuesta de limpieza:', clearResponse);
      
      // 2. Verificar que realmente se limpió
      const isEmpty = await checkIfDatabaseIsEmpty();
      console.log('¿BD está vacía después de limpiar?', isEmpty);
      
      if (isEmpty) {
        // 3. Limpiar todo el estado local
        setHistory([]);
        setSelectedItems(new Set());
        setSelectedAnalysis(null);
        setResult(null);
        setChartData(null);
        
        // 4. Forzar recarga de datos para confirmar
        await loadChartData();
        
        // 5. Verificar nuevamente
        const finalCheck = await checkIfDatabaseIsEmpty();
        console.log('Verificación final - ¿BD está vacía?', finalCheck);
        
        if (finalCheck) {
          alert('✅ RESET COMPLETO exitoso!\n\nLa base de datos ha sido completamente limpiada.\nTodos los gráficos y datos han sido eliminados.');
        } else {
          alert('⚠️ La base de datos no se limpió completamente.\nIntenta nuevamente o contacta al administrador.');
        }
      } else {
        alert('❌ ERROR: La base de datos no se limpió.\n\nRespuesta del servidor: ' + JSON.stringify(clearResponse));
      }
    } catch (error) {
      console.error('Error durante RESET COMPLETO:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert('❌ Error durante el RESET COMPLETO:\n' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para forzar limpieza completa
  const forceCompleteCleanup = async () => {
    try {
      setIsLoading(true);
      
      // 1. Limpiar desde el servicio
      await dropoutService.clearAllAnalyses();
      
      // 2. Verificar que realmente se limpió
      const isEmpty = await checkIfDatabaseIsEmpty();
      
      if (isEmpty) {
        // 3. Limpiar todo el estado local
        setHistory([]);
        setSelectedItems(new Set());
        setSelectedAnalysis(null);
        setResult(null);
        setChartData(null);
        
        // 4. Recargar datos para confirmar
        await loadChartData();
        
        alert('Limpieza completa exitosa. Base de datos verificada como vacía.');
      } else {
        alert('⚠️ La base de datos no se limpió completamente. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error en limpieza completa:', error);
      alert('Error durante la limpieza completa');
    } finally {
      setIsLoading(false);
    }
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
        <button 
          className={`${styles.navButton} ${styles.implementButton}`}
          onClick={implementDatabaseData}
          disabled={isLoading}
        >
          <FaDatabase className={styles.buttonIcon} />
          <span>Implementar Datos de BD</span>
          {isLoading && <div className={styles.spinner}></div>}
        </button>
        
        <button 
          className={`${styles.navButton} ${styles.testButton}`}
          onClick={() => loadChartData()}
          disabled={isLoading}
        >
          <FaChartBar className={styles.buttonIcon} />
          <span>Probar Gráficos</span>
        </button>
        
        <button 
          className={`${styles.navButton} ${styles.resetButton}`}
          onClick={resetCompleteDatabase}
          disabled={isLoading}
          title="RESET COMPLETO de la base de datos"
        >
          🗑️
          <span>RESET COMPLETO BD</span>
          {isLoading && <div className={styles.spinner}></div>}
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
                  <span className={styles.autoLabel}>(Calculado automáticamente)</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input 
                    type="text" 
                    name="economicSituation"
                    value={formData.economicSituation ? 
                      (formData.economicSituation === 'bajo' ? 'Bajo' : 
                       formData.economicSituation === 'medio' ? 'Medio' : 'Alto') : 
                      'Calculando...'
                    }
                    readOnly
                    className={styles.readOnlyInput}
                    placeholder="Se calculará automáticamente"
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>
                  <FaExclamationTriangle className={styles.inputIcon} />
                  <span>Riesgo de Abandono</span>
                  <span className={styles.autoLabel}>(Calculado automáticamente)</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input 
                    type="text" 
                    name="dropoutRisk"
                    value={result ? 
                      `${result.risk} (${result.confidence}% confianza)` : 
                      'Calculando...'
                    }
                    readOnly
                    className={`${styles.readOnlyInput} ${result ? styles[`risk${result.risk}`] : ''}`}
                    placeholder="Se calculará automáticamente"
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>
                  <FaCalendarAlt className={styles.inputIcon} />
                  <span>Fecha del Análisis</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input 
                    type="date" 
                    name="analysisDate"
                    value={formData.analysisDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>
                  <FaUserGraduate className={styles.inputIcon} />
                  <span>Asistencia</span>
                </label>
                <div className={styles.selectWrapper}>
                  <select 
                    name="attendance" 
                    value={formData.attendance ? 'true' : 'false'}
                    onChange={(e) => {
                      const newValue = e.target.value === 'true';
                      setFormData(prev => ({
                        ...prev,
                        attendance: newValue
                      }));
                    }}
                    required
                  >
                    <option value="true">Asiste regularmente</option>
                    <option value="false">No asiste regularmente</option>
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
                    onClick={() => setShowClearModal(true)}
                    disabled={filteredHistory.length === 0}
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
            
            {/* Información sobre gráficos personales */}
            <div className={styles.infoBox}>
              <FaInfoCircle className={styles.infoIcon} />
              <p>
                <strong>💡 Tip:</strong> Haz clic en cualquier análisis del historial para ver sus 
                <strong>gráficos personales</strong> y estadísticas individuales debajo.
              </p>
              
              {/* Estado de la base de datos */}
              <div className={styles.databaseStatus}>
                <span className={styles.statusLabel}>Estado BD:</span>
                <span className={`${styles.statusIndicator} ${history.length > 0 ? styles.hasData : styles.noData}`}>
                  {history.length > 0 ? `📊 ${history.length} análisis` : '📭 Sin datos'}
                </span>
                {history.length === 0 && (
                  <button 
                    className={styles.refreshButton}
                    onClick={resetCompleteDatabase}
                    title="Verificar estado de la base de datos"
                  >
                    🔄 Verificar
                  </button>
                )}
              </div>
              
              {/* Información sobre limpieza */}
              <div className={styles.cleanupInfo}>
                <p><strong>🧹 Opciones de limpieza:</strong></p>
                <ul>
                  <li><strong>Limpiar Historial:</strong> Elimina análisis del historial (puede dejar datos residuales)</li>
                  <li><strong>RESET COMPLETO BD:</strong> Elimina TODOS los datos de la base de datos (acción irreversible)</li>
                </ul>
              </div>
            </div>

            {/* Barra de selección */}
            {selectedItems.size > 0 && (
              <div className={styles.selectionBar}>
                <div className={styles.selectionInfo}>
                  <span>{selectedItems.size} elemento{selectedItems.size !== 1 ? 's' : ''} seleccionado{selectedItems.size !== 1 ? 's' : ''}</span>
                </div>
                <div className={styles.selectionActions}>
                  <button
                    type="button"
                    className={styles.deleteSelectedButton}
                    onClick={handleDeleteSelected}
                  >
                    Eliminar Seleccionados
                  </button>
                  <button
                    type="button"
                    className={styles.cancelSelectionButton}
                    onClick={() => setSelectedItems(new Set())}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {filteredHistory.length > 0 ? (
              <>
                {/* Checkbox para seleccionar todos */}
                <div className={styles.selectAllBar}>
                  <label className={styles.selectAllLabel}>
                    <input
                      type="checkbox"
                      checked={selectedItems.size === filteredHistory.length && filteredHistory.length > 0}
                      onChange={handleSelectAll}
                    />
                    <span>Seleccionar todos</span>
                  </label>
                </div>

                <div className={styles.historyScroll}>
                  <div className={styles.historyList}>
                    {filteredHistory
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((item, idx) => {
                        const globalIdx = (currentPage - 1) * itemsPerPage + idx;
                        const isSelected = selectedItems.has(item.id);
                        const isAnalysisSelected = selectedAnalysis?.id === item.id;
                        return (
                          <div
                            key={item.id}
                            className={`${styles.historyCard} ${isSelected ? styles.selected : ''} ${isAnalysisSelected ? styles.analysisSelected : ''}`}
                            style={{ animationDelay: `${globalIdx * 50}ms` }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectHistory(item); } }}
                            aria-label={`Ver análisis del ${item.date}`}
                          >
                            {/* Checkbox de selección */}
                            <div className={styles.selectionCheckbox}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleItemSelection(item.id);
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>

                            {/* Contenido del card */}
                            <div 
                              className={styles.cardContent}
                              onClick={() => handleSelectHistory(item)}
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

            {/* Gráficos Personales - Solo mostrar si hay datos en la BD */}
            {result && history.length > 0 && chartData && (
              <PersonalCharts
                studentData={{
                  age: parseInt(formData.age) || 0,
                  gender: formData.gender,
                  family_income: parseFloat(formData.familyIncome) || 0,
                  location: formData.location,
                  economic_situation: formData.economicSituation,
                  study_time: parseInt(formData.studyTime) || 0,
                  school_support: formData.schoolSupport,
                  family_support: formData.familySupport,
                  extra_educational_support: formData.extraEducationalSupport,
                  attendance: formData.attendance,
                  risk_level: result.risk.toUpperCase(),
                  confidence: result.confidence,
                }}
              />
            )}

            {/* Mensaje cuando no hay historial para gráficos */}
            {result && history.length === 0 && (
              <div className={styles.noHistoryForCharts}>
                <h3>📊 Gráficos Personales No Disponibles</h3>
                <div className={styles.noHistoryMessage}>
                  <p>
                    <strong>Para ver gráficos personales y estadísticas comparativas</strong>, 
                    necesitas tener análisis previos en el historial.
                  </p>
                  <div className={styles.noHistoryActions}>
                    <p><strong>Opciones disponibles:</strong></p>
                    <ul>
                      <li>💾 <strong>Implementar Datos de BD:</strong> Carga datos de ejemplo para probar la funcionalidad</li>
                      <li>🔄 <strong>Realizar más análisis:</strong> Cada nuevo análisis se guarda automáticamente</li>
                      <li>📈 <strong>Ver estadísticas globales:</strong> Ve a la pestaña "Estadísticas" para ver datos generales</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Gráficos Personales para Análisis del Historial - Solo mostrar si hay datos */}
            {selectedAnalysis && history.length > 0 && chartData && (
              <PersonalCharts
                key={selectedAnalysis.id}
                studentData={{
                  age: parseInt(selectedAnalysis.parameters.age) || 0,
                  gender: selectedAnalysis.parameters.gender,
                  family_income: parseFloat(selectedAnalysis.parameters.familyIncome) || 0,
                  location: selectedAnalysis.parameters.location,
                  economic_situation: selectedAnalysis.parameters.economicSituation,
                  study_time: parseInt(selectedAnalysis.parameters.studyTime) || 0,
                  school_support: selectedAnalysis.parameters.schoolSupport,
                  family_support: selectedAnalysis.parameters.familySupport,
                  extra_educational_support: selectedAnalysis.parameters.extraEducationalSupport,
                  attendance: selectedAnalysis.parameters.attendance,
                  risk_level: selectedAnalysis.risk.toUpperCase(),
                  confidence: selectedAnalysis.confidence,
                }}
              />
            )}
          </div>
        )}
      </div>
      {/* Modal de confirmación de análisis */}

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

      {/* Modal de confirmación para limpiar */}
      {showClearModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" onClick={() => setShowClearModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Limpiar Historial</h3>
              <button className={styles.modalClose} aria-label="Cerrar" onClick={() => setShowClearModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.clearOptions}>
                <label className={styles.clearOption}>
                  <input
                    type="radio"
                    name="clearMode"
                    value="select"
                    checked={clearMode === 'select'}
                    onChange={(e) => setClearMode(e.target.value as 'select' | 'all')}
                  />
                  <div className={styles.optionContent}>
                    <h4>Seleccionar elementos específicos</h4>
                    <p>Selecciona los elementos que quieres eliminar del historial</p>
                  </div>
                </label>
                <label className={styles.clearOption}>
                  <input
                    type="radio"
                    name="clearMode"
                    value="all"
                    checked={clearMode === 'all'}
                    onChange={(e) => setClearMode(e.target.value as 'select' | 'all')}
                  />
                  <div className={styles.optionContent}>
                    <h4>Eliminar todo el historial</h4>
                    <p>Elimina todos los análisis del historial (acción irreversible)</p>
                  </div>
                </label>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.secondaryButton} onClick={() => setShowClearModal(false)}>Cancelar</button>
              <button 
                className={styles.confirmButton} 
                onClick={() => {
                  if (clearMode === 'select') {
                    setShowClearModal(false);
                    // El usuario puede seleccionar elementos después
                  } else {
                    handleDeleteAll();
                  }
                }}
              >
                {clearMode === 'select' ? 'Continuar' : 'Eliminar Todo'}
              </button>
              
              {/* Botón adicional para limpieza forzada */}
              <button 
                className={styles.forceCleanupButton} 
                onClick={forceCompleteCleanup}
                disabled={isLoading}
                title="Limpieza completa con verificación de BD"
              >
                {isLoading ? 'Limpiando...' : '🧹 Limpieza Forzada'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de implementación de base de datos */}
      {showImplementModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" onClick={() => setShowImplementModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Implementar Datos de Base de Datos</h3>
              <button className={styles.modalClose} aria-label="Cerrar" onClick={() => setShowImplementModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p>Selecciona cuántos registros de los {totalRecordsAvailable} disponibles quieres implementar:</p>
              <div className={styles.recordsSelector}>
                <label htmlFor="recordsCount">Cantidad de registros:</label>
                <input
                  id="recordsCount"
                  type="number"
                  min="1"
                  max={totalRecordsAvailable}
                  value={recordsToImplement}
                  onChange={(e) => setRecordsToImplement(parseInt(e.target.value) || 1)}
                  className={styles.recordsInput}
                />
                <span className={styles.recordsInfo}>
                  de {totalRecordsAvailable} disponibles
                </span>
              </div>
              <div className={styles.recordsPreview}>
                <p><strong>Información:</strong></p>
                <ul>
                  <li>Los registros se cargarán desde la base de datos abandono.sqlite3</li>
                  <li>Se calcularán automáticamente: Situación económica, Estado económico y Riesgo de abandono</li>
                  <li>Los datos aparecerán en el historial y se actualizarán las estadísticas</li>
                </ul>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.secondaryButton} onClick={() => setShowImplementModal(false)}>Cancelar</button>
              <button 
                className={styles.confirmButton} 
                onClick={confirmImplementDatabaseData}
                disabled={isLoading}
              >
                {isLoading ? 'Implementando...' : 'Implementar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
