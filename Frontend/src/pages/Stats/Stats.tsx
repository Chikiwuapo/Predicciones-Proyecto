import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Line, 
  Area, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import { 
  FaChartLine, 
  FaUsers, 
  FaExclamationTriangle, 
  FaGraduationCap,
  FaMoneyBillWave,
  FaClock
} from 'react-icons/fa';
import { dropoutService } from '../../services/dropoutService.ts';
import styles from './Stats.module.css';

interface DropoutData {
  id: number;
  age: number;
  gender: string;
  family_income: number;
  location: string;
  economic_situation: string;
  study_time: number;
  school_support: boolean;
  family_support: boolean;
  extra_educational_support: boolean;
  attendance: boolean;
  analysis_date: string;
  risk_level: string;
  confidence: number;
  created_at: string;
}

interface Statistics {
  risk_distribution: Array<{ risk_level: string; count: number }>;
  age_stats: {
    avg_age: number;
    min_age: number;
    max_age: number;
  };
  study_time_stats: {
    avg_study_time: number;
    min_study_time: number;
    max_study_time: number;
  };
  income_stats: {
    avg_income: number;
    min_income: number;
    max_income: number;
  };
  time_series_data: Array<{
    timestamp: string;
    risk_score: number;
    study_time: number;
    age: number;
  }>;
  total_analyses: number;
  recent_analyses_count: number;
}

export default function Stats() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('abandono');
  const [dropoutData, setDropoutData] = useState<DropoutData[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSeries, setActiveSeries] = useState<'asistencia' | 'riesgo' | 'ingreso'>('asistencia');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showExampleData, setShowExampleData] = useState(true); // Controlar si mostrar datos de ejemplo
  const [showAllMonths, setShowAllMonths] = useState(true);
  const [fillEmptyMonths, setFillEmptyMonths] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [analysesData, statsData] = await Promise.all([
          dropoutService.getAllAnalyses(),
          dropoutService.getStatistics()
        ]);
        setDropoutData(analysesData);
        setStatistics(statsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Configurar actualización automática cada 30 segundos
    const interval = setInterval(loadData, 30000);

    return () => clearInterval(interval);
  }, []);

  // Actualizar fecha automáticamente cada día
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      setSelectedYear(now.getFullYear());
      setSelectedMonth(now.getMonth());
    };

    // Actualizar al cargar la página
    updateDate();

    // Configurar actualización automática a medianoche
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timer = setTimeout(updateDate, timeUntilMidnight);
    
    return () => clearTimeout(timer);
  }, []);

  // Función para generar fechas dinámicas en tiempo real
  const generateDynamicDates = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Generar fechas para los últimos 6 meses, empezando desde el mes actual
    const dates = [];
    for (let i = 0; i < 6; i++) {
      const targetMonth = currentMonth - i;
      const targetYear = currentYear;
      
      if (targetMonth < 0) {
        // Si el mes es negativo, ir al año anterior
        const adjustedMonth = targetMonth + 12;
        const adjustedYear = targetYear - 1;
        dates.push({
          display: new Date(adjustedYear, adjustedMonth).toLocaleDateString('es-ES', { month: 'short' }),
          year: adjustedYear,
          month: adjustedMonth
        });
      } else {
        dates.push({
          display: new Date(targetYear, targetMonth).toLocaleDateString('es-ES', { month: 'short' }),
          year: targetYear,
          month: targetMonth
        });
      }
    }
    
    // Debug: Mostrar las fechas generadas
    console.log('Fechas dinámicas generadas:', dates.map(d => `${d.display} (${d.year}-${d.month})`));
    console.log('Mes actual:', currentMonth, 'Año actual:', currentYear);
    
    return dates;
  };

  // Generar datos de abandono por mes/año
  const generateDropoutByMonthData = () => {
    if (!dropoutData || !dropoutData.length) return [];
    
    const dynamicDates = generateDynamicDates();
    const monthlyData: Array<{
      month: string;
      total: number;
      alto: number;
      medio: number;
      bajo: number;
      altoPorcentaje: number;
      medioPorcentaje: number;
      bajoPorcentaje: number;
      ingresoPromedio: number;
    }> = [];
    
    dynamicDates.forEach(dateInfo => {
      const monthData = dropoutData.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate.getFullYear() === dateInfo.year && 
               itemDate.getMonth() === dateInfo.month;
      });
      
      if (monthData.length > 0) {
        const totalStudents = monthData.length;
        const highRiskCount = monthData.filter(item => item.risk_level === 'Alto').length;
        const mediumRiskCount = monthData.filter(item => item.risk_level === 'Medio').length;
        const lowRiskCount = monthData.filter(item => item.risk_level === 'Bajo').length;
        
        // Calcular ingreso promedio familiar del mes
        const totalIngreso = monthData.reduce((sum, item) => sum + (item.family_income || 0), 0);
        const ingresoPromedio = Math.round(totalIngreso / totalStudents);
        
        monthlyData.push({
          month: dateInfo.display,
          total: totalStudents,
          alto: highRiskCount,
          medio: mediumRiskCount,
          bajo: lowRiskCount,
          altoPorcentaje: Math.round((highRiskCount / totalStudents) * 100),
          medioPorcentaje: Math.round((mediumRiskCount / totalStudents) * 100),
          bajoPorcentaje: Math.round((lowRiskCount / totalStudents) * 100),
          ingresoPromedio: ingresoPromedio
        });
      }
    });
    
    return monthlyData;
  };

  // Preparar datos para gráficos
  const prepareChartData = () => {
    // Generar fechas dinámicas SOLO para datos de ejemplo
    const dynamicDates = generateDynamicDates();

    if (!dropoutData.length) {
      if (showExampleData) {
        const base = dynamicDates.map((dateInfo) => ({
          date: dateInfo.display,
          risk_score: 75 + Math.random() * 15,
          study_time: 15 + Math.random() * 10,
          age: 18 + Math.random() * 4,
          attendance_count: Math.floor(Math.random() * 20) + 10,
          total_count: Math.floor(Math.random() * 30) + 20,
          count: Math.floor(Math.random() * 30) + 20,
          family_income_total: Math.floor(Math.random() * 50000) + 20000,
          attendance_rate: Math.floor(Math.random() * 30) + 70,
          absence_rate: Math.floor(Math.random() * 30),
          ingresoPromedio: Math.floor(Math.random() * 3000) + 2000,
          monthIndex: dateInfo.month,
        }));
        if (!showAllMonths) {
          const selectedLabel = new Date(selectedYear, selectedMonth).toLocaleDateString('es-ES', { month: 'short' });
          return base.filter(d => d.date === selectedLabel);
        }
        return base.sort((a, b) => a.monthIndex - b.monthIndex).map(({ monthIndex, ...rest }) => rest);
      }
      return [];
    }

    // Vista por un solo mes: agrupar por día del mes seleccionado
    if (!showAllMonths) {
      const groupedByDay = dropoutData.reduce((acc, item) => {
        const d = new Date(item.created_at);
        const y = d.getFullYear();
        const m = d.getMonth();
        if (y !== selectedYear || m !== selectedMonth) return acc;
        const day = d.getDate();
        const label = new Date(selectedYear, selectedMonth, day).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        if (!acc[day]) {
          acc[day] = {
            date: label,
            dayIndex: day,
            risk_score: 0,
            study_time: 0,
            age: 0,
            attendance_count: 0,
            total_count: 0,
            count: 0,
            family_income_total: 0,
          };
        }
        let riskScore;
        switch (item.risk_level) {
          case 'Alto': riskScore = 85 + Math.random() * 10; break;
          case 'Medio': riskScore = 75 + Math.random() * 10; break;
          case 'Bajo': riskScore = 65 + Math.random() * 10; break;
          default: riskScore = 70 + Math.random() * 15;
        }
        acc[day].risk_score += riskScore;
        acc[day].study_time += item.study_time;
        acc[day].age += item.age;
        acc[day].family_income_total += item.family_income || 0;
        if (item.attendance === true) acc[day].attendance_count += 1;
        acc[day].total_count += 1;
        acc[day].count += 1;
        return acc;
      }, {} as Record<number, any>);

      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

      // Lista diaria con métricas
      let daily = Object.values(groupedByDay)
        .map((item: any) => {
          const attendance_rate = item.total_count > 0 ? Math.round((item.attendance_count / item.total_count) * 100) : 0;
          const absence_rate = 100 - attendance_rate;
          const ingresoPromedioCalculado = item.count > 0 ? Math.round(item.family_income_total / item.count) : 0;
          return {
            ...item,
            risk_score: item.count > 0 ? Math.round((item.risk_score / item.count) * 100) / 100 : 0,
            study_time: item.count > 0 ? Math.round((item.study_time / item.count) * 100) / 100 : 0,
            age: item.count > 0 ? Math.round((item.age / item.count) * 100) / 100 : 0,
            attendance_rate,
            absence_rate,
            ingresoPromedio: ingresoPromedioCalculado,
            hasData: item.count > 0,
          };
        })
        .sort((a: any, b: any) => a.dayIndex - b.dayIndex)
        .map(({ dayIndex, total_count, attendance_count, family_income_total, count, ...rest }: any) => rest);

      // Rellenar días faltantes con 0 para tener curva continua
      const filledDaily = Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
        const label = new Date(selectedYear, selectedMonth, day).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        const found = daily.find(d => d.date === label);
        return found || {
          date: label,
          risk_score: 0,
          study_time: 0,
          age: 0,
          attendance_rate: 0,
          absence_rate: 100,
          ingresoPromedio: 0,
          hasData: false,
        };
      });

      return filledDaily;
    }

    // Vista por año: agrupar por mes del año seleccionado
    const groupedByMonth = dropoutData.reduce((acc, item) => {
      const itemDate = new Date(item.created_at);
      const itemYear = itemDate.getFullYear();
      const itemMonth = itemDate.getMonth();

      if (itemYear !== selectedYear) return acc;

      const label = new Date(selectedYear, itemMonth).toLocaleDateString('es-ES', { month: 'short' });
      if (!acc[itemMonth]) {
        acc[itemMonth] = {
          date: label,
          monthIndex: itemMonth,
          risk_score: 0,
          study_time: 0,
          age: 0,
          attendance_count: 0,
          total_count: 0,
          count: 0,
          family_income_total: 0,
        };
      }

      let riskScore;
      switch (item.risk_level) {
        case 'Alto': riskScore = 85 + Math.random() * 10; break;
        case 'Medio': riskScore = 75 + Math.random() * 10; break;
        case 'Bajo': riskScore = 65 + Math.random() * 10; break;
        default: riskScore = 70 + Math.random() * 15;
      }

      acc[itemMonth].risk_score += riskScore;
      acc[itemMonth].study_time += item.study_time;
      acc[itemMonth].age += item.age;
      acc[itemMonth].family_income_total += item.family_income || 0;

      const isAttending = item.attendance === true;
      if (isAttending) acc[itemMonth].attendance_count += 1;
      acc[itemMonth].total_count += 1;
      acc[itemMonth].count += 1;
      return acc;
    }, {} as Record<number, any>);

    // Convertir a lista ordenada por mes y calcular métricas
    let result = Object.values(groupedByMonth)
      .map((item: any) => {
        const attendance_rate = item.total_count > 0 ? Math.round((item.attendance_count / item.total_count) * 100) : 0;
        const absence_rate = 100 - attendance_rate;
        const ingresoPromedioCalculado = item.count > 0 ? Math.round(item.family_income_total / item.count) : 0;
        return {
          ...item,
          risk_score: item.count > 0 ? Math.round((item.risk_score / item.count) * 100) / 100 : 0,
          study_time: item.count > 0 ? Math.round((item.study_time / item.count) * 100) / 100 : 0,
          age: item.count > 0 ? Math.round((item.age / item.count) * 100) / 100 : 0,
          attendance_rate,
          absence_rate,
          ingresoPromedio: ingresoPromedioCalculado,
          hasData: item.count > 0,
        };
      })
      .sort((a: any, b: any) => a.monthIndex - b.monthIndex)
      .map(({ monthIndex, total_count, attendance_count, family_income_total, count, ...rest }: any) => rest);

    // Rellenar meses vacíos con ceros (para curvas suaves) si corresponde
    if (showAllMonths && fillEmptyMonths) {
      const months = Array.from({ length: 12 }, (_, i) => i);
      const filled = months.map(i => {
        const label = new Date(selectedYear, i).toLocaleDateString('es-ES', { month: 'short' });
        const found = result.find(r => r.date === label);
        return found || {
          date: label,
          risk_score: 0,
          study_time: 0,
          age: 0,
          attendance_rate: 0,
          absence_rate: 100,
          ingresoPromedio: 0,
          hasData: false,
        };
      });
      result = filled;
    }

    return result;
  };

  const chartData = prepareChartData();

  // Calcular ingreso promedio real de todos los datos
  const ingresoPromedioReal = dropoutData.length > 0 
    ? Math.round(dropoutData.reduce((sum, item) => sum + (item.family_income || 0), 0) / dropoutData.length)
    : 0;

  // Función para recargar datos manualmente
  const refreshData = async () => {
    try {
      setLoading(true);
      const [analysesData, statsData] = await Promise.all([
        dropoutService.getAllAnalyses(),
        dropoutService.getStatistics()
      ]);
      setDropoutData(analysesData);
      setStatistics(statsData);
      
      // Si hay datos reales, permitir datos de ejemplo
      if (analysesData.length > 0) {
        setShowExampleData(true);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para limpiar datos de ejemplo (llamada cuando se limpia el historial)
  const clearExampleData = () => {
    setShowExampleData(false);
    setDropoutData([]);
    setStatistics(null);
  };

  // Debug: Mostrar información de los datos
  console.log('=== DEBUG INFO ===');
  console.log('dropoutData length:', dropoutData.length);
  console.log('chartData length:', chartData.length);
  console.log('chartData:', chartData);
  console.log('==================');

  // Datos para gráfico de distribución de riesgo
  const riskDistributionData = statistics?.risk_distribution || [];

  // Datos para gráfico de edad vs tiempo de estudio
  const ageStudyData = dropoutData.map(item => ({
    age: item.age,
    study_time: item.study_time,
    risk_level: item.risk_level,
    income: item.family_income
  }));

  // Colores para gráficos
  const colors = {
    primary: '#f5a623',
    secondary: '#7b68ee',
    success: '#00e676',
    warning: '#ff9800',
    danger: '#ff5252',
    info: '#2196f3'
  };

  const COLORS = [colors.danger, colors.warning, colors.success];

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Estadísticas</h1>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'vinos' ? styles.active : ''}`}
            onClick={() => setActiveTab('vinos')}
          >
            <FaChartLine className={styles.tabIcon} />
            Vinos
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'abandono' ? styles.active : ''}`}
            onClick={() => setActiveTab('abandono')}
          >
            <FaGraduationCap className={styles.tabIcon} />
            Abandono Escolar
          </button>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.refreshButton}
            onClick={refreshData}
            disabled={loading}
          >
            {loading ? 'Actualizando...' : '🔄 Actualizar Datos'}
          </button>
          <button 
            className={styles.navButton}
            onClick={() => navigate('/abandono')}
          >
            Ir a Análisis
          </button>
        </div>
      </header>

      {activeTab === 'abandono' && (
        <>
          {/* KPIs */}
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <FaUsers className={styles.cardIcon} />
                <h3>Total de Análisis</h3>
              </div>
              <div className={styles.statValue}>{statistics?.total_analyses || 0}</div>
              <div className={styles.statChange}>
                <span className={styles.changePositive}>+{statistics?.recent_analyses_count || 0}</span> análisis recientes
              </div>
            </div>
            
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <FaExclamationTriangle className={styles.cardIcon} />
                <h3>Riesgo Promedio</h3>
              </div>
              <div className={styles.statValue}>
                {dropoutData.length > 0 
                  ? Math.round((dropoutData.filter(d => d.risk_level === 'Alto').length / dropoutData.length) * 100)
                  : 0}%
              </div>
              <div className={styles.statChange}>
                Estudiantes en riesgo alto
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <FaClock className={styles.cardIcon} />
                <h3>Tiempo de Estudio Promedio</h3>
              </div>
              <div className={styles.statValue}>
                {statistics?.study_time_stats.avg_study_time 
                  ? Math.round(statistics.study_time_stats.avg_study_time)
                  : 0}h/sem
              </div>
              <div className={styles.statChange}>
                Horas por semana
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <FaMoneyBillWave className={styles.cardIcon} />
                <h3>Ingresos Promedio</h3>
              </div>
              <div className={styles.statValue}>
                ${statistics?.income_stats.avg_income 
                  ? Math.round(statistics.income_stats.avg_income)
                  : 0}
              </div>
              <div className={styles.statChange}>
                Ingresos familiares
              </div>
            </div>
          </div>

          {/* Segundo Gráfico Principal - Asistencia */}
          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3>
                  {activeSeries === 'asistencia' ? 'Asistencia Estudiantil' : 'Riesgo de Abandono'}
                </h3>
                
                {/* Controles de fecha mejorados */}
                <div className={styles.dateControls}>
                  <div className={styles.dateControlGroup}>
                    <label className={styles.dateLabel}>Año</label>
                    <select 
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className={styles.dateSelect}
                    >
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                                  {!showAllMonths && (
                  <div className={styles.dateControlGroup}>
                    <label className={styles.dateLabel}>Mes</label>
                    <select 
                      value={selectedMonth} 
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className={styles.dateSelect}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>
                          {new Date(2024, i).toLocaleDateString('es-ES', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                  <div className={styles.dateControlGroup}>
                    <label className={styles.dateLabel}>Rango</label>
                    <select 
                      value={showAllMonths ? 'all' : 'single'}
                      onChange={(e) => setShowAllMonths(e.target.value === 'all')}
                      className={styles.dateSelect}
                    >
                      <option value="single">Solo mes seleccionado</option>
                      <option value="all">Todos los meses del año</option>
                    </select>
                  </div>
                  {showAllMonths && (
                    <div className={styles.dateControlGroup}>
                      <label className={styles.dateLabel}>Rellenar meses vacíos</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input 
                          type="checkbox" 
                          checked={fillEmptyMonths} 
                          onChange={(e) => setFillEmptyMonths(e.target.checked)}
                        />
                        <span className={styles.dateLabel}>{fillEmptyMonths ? 'Sí' : 'No'}</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Etiqueta del período seleccionado */}
                <div className={styles.currentValue}>
                  {showAllMonths ? (
                    <span>
                      Mostrando: Todos los meses del {selectedYear}
                    </span>
                  ) : (
                    <span>
                      Mostrando: {new Date(selectedYear, selectedMonth).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>
                
                {chartData.length > 0 && (
                  <div className={styles.currentValue}>
                    {activeSeries === 'asistencia' ? (
                      (() => {
                        const lastWithData = [...chartData].reverse().find(d => (d as any).hasData);
                        const att = lastWithData ? (lastWithData as any).attendance_rate : 0;
                        return (
                          <>
                            <span style={{ color: '#00ff88' }}>
                              Tasa de Asistencia: {att.toFixed(1)}%
                            </span>
                            <span style={{ color: '#ff69b4' }}>
                              Tasa de Inasistencia: {(100 - att).toFixed(1)}%
                            </span>
                          </>
                        );
                      })()
                    ) : (
                      <span style={{ color: '#ff69b4' }}>
                        Riesgo Actual: {(() => { const lastWithData = [...chartData].reverse().find(d => (d as any).hasData); const rs = lastWithData ? (lastWithData as any).risk_score : 0; return rs.toFixed(2); })()}
                      </span>
                    )}
                  </div>
                )}
                <div className={styles.seriesOptions}>
                  <button 
                    className={`${styles.seriesButton} ${activeSeries === 'asistencia' ? styles.active : ''}`}
                    onClick={() => setActiveSeries('asistencia')}
                  >
                    Asistencia
                  </button>
                  <button 
                    className={`${styles.seriesButton} ${activeSeries === 'riesgo' ? styles.active : ''}`}
                    onClick={() => setActiveSeries('riesgo')}
                  >
                    Riesgo
                  </button>
                  <button 
                    className={`${styles.seriesButton} ${activeSeries === 'ingreso' ? styles.active : ''}`}
                    onClick={() => setActiveSeries('ingreso')}
                  >
                    Ingreso Familiar
                  </button>
                </div>
                <button className={styles.getChartButton}>
                  <span>Get this chart</span>
                  <span className={styles.codeIcon}>&lt;/&gt;</span>
                </button>
              </div>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={500}>
                  <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00ff88" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#00ff88" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    {/* Fondo del gráfico */}
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" strokeOpacity={0.2} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#999' }}
                    />
                    <YAxis 
                      stroke="#666"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#999' }}
                      domain={activeSeries === 'ingreso' ? [0, 'dataMax + 1000'] : [0, 100]}
                      ticks={activeSeries === 'ingreso' ? undefined : [0, 20, 40, 60, 80, 100]}
                      label={{ 
                        value: activeSeries === 'ingreso' ? 'Ingreso Familiar ($)' : 'Porcentaje (%)', 
                        angle: -90, 
                        position: 'insideLeft',
                        fill: '#666',
                        fontSize: 11
                      }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.95)',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: '#fff',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                      }}
                      cursor={false}
                      labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                      formatter={(value: any, name: any) => {
                        if (name === 'attendance_rate') {
                          return [`${value}%`, 'Tasa de Asistencia'];
                        } else if (name === 'risk_score') {
                          return [`${value.toFixed(2)}`, 'Riesgo de Abandono'];
                        } else if (name === 'ingresoPromedio') {
                          return [`$${value.toLocaleString()}`, 'Ingreso Promedio Familiar'];
                        }
                        return [value, name];
                      }}
                      labelFormatter={(label) => {
                        const dataPoint = chartData.find(item => item.date === label);
                        if (dataPoint) {
                          if (activeSeries === 'asistencia') {
                            return (
                              <div>
                                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{label}</div>
                                <div style={{ color: '#00ff88' }}>Tasa de Asistencia: {dataPoint.attendance_rate}%</div>
                                <div style={{ color: '#ff69b4' }}>Tasa de Inasistencia: {dataPoint.absence_rate}%</div>
                              </div>
                            );
                          } else if (activeSeries === 'riesgo') {
                            return (
                              <div>
                                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{label}</div>
                                <div style={{ color: '#ff69b4' }}>Riesgo de Abandono: {dataPoint.risk_score.toFixed(2)}</div>
                              </div>
                            );
                          } else if (activeSeries === 'ingreso') {
                            return (
                              <div>
                                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{label}</div>
                                <div style={{ color: '#ffa502' }}>Ingreso Promedio: ${dataPoint.ingresoPromedio?.toLocaleString() || '0'}</div>
                                <div style={{ color: '#666', fontSize: '11px' }}>Total de Estudiantes: {dataPoint.count}</div>
                              </div>
                            );
                          }
                        }
                        return label;
                      }}
                    />
                    {/* Área rellena para asistencia - solo mostrar si está seleccionada */}
                    {activeSeries === 'asistencia' && (
                    <Area 
                      type="monotone" 
                      dataKey="attendance_rate" 
                      fill="url(#attendanceGradient)"
                      stroke="none"
                    />
                    )}
                    
                    {/* Línea de asistencia - solo mostrar si está seleccionada */}
                    {activeSeries === 'asistencia' && (
                    <Line 
                      type="monotone" 
                      dataKey="attendance_rate" 
                      stroke="#00ff88"
                      strokeWidth={3}
                      dot={{ 
                        fill: '#00ff88', 
                        strokeWidth: 2, 
                        r: 3,
                        stroke: '#000'
                      }}
                      activeDot={{ 
                        fill: '#00ff88', 
                        strokeWidth: 3, 
                        r: 5,
                        stroke: '#fff'
                      }}
                      connectNulls={true}
                    />
                    )}
                    
                    {/* Línea de inasistencia - solo mostrar si está seleccionada */}
                    {activeSeries === 'asistencia' && (
                    <Line 
                      type="monotone" 
                        dataKey="absence_rate" 
                      stroke="#ff69b4"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ 
                        fill: '#ff69b4', 
                          strokeWidth: 2, 
                          r: 3,
                        stroke: '#000'
                      }}
                        activeDot={{ 
                          fill: '#ff69b4', 
                          strokeWidth: 3, 
                          r: 5,
                          stroke: '#fff'
                        }}
                      connectNulls={true}
                    />
                    )}
                    
                    {/* Línea de riesgo - solo mostrar si está seleccionada */}
                    {activeSeries === 'riesgo' && (
                      <Line 
                        type="monotone" 
                        dataKey="risk_score" 
                        stroke="#ff69b4"
                        strokeWidth={3}
                        dot={{ 
                          fill: '#ff69b4', 
                          strokeWidth: 2, 
                          r: 4,
                          stroke: '#000'
                        }}
                        activeDot={{ 
                          fill: '#ff69b4', 
                          strokeWidth: 3, 
                          r: 6,
                          stroke: '#fff'
                        }}
                        connectNulls={true}
                      />
                    )}

                    {/* Línea de ingreso familiar - solo mostrar si está seleccionada */}
                    {activeSeries === 'ingreso' && (
                      <Line 
                        type="monotone" 
                        dataKey="ingresoPromedio" 
                        stroke="#ffa502"
                        strokeWidth={3}
                        dot={{ 
                          fill: '#ffa502', 
                          strokeWidth: 2, 
                          r: 4,
                          stroke: '#000'
                        }}
                        activeDot={{ 
                          fill: '#ffa502', 
                          strokeWidth: 3, 
                          r: 6,
                          stroke: '#fff'
                        }}
                        connectNulls={true}
                      />
                    )}
                    {/* Línea de referencia horizontal - adaptarse a la serie seleccionada */}
                    {chartData.length > 0 && activeSeries === 'asistencia' && (
                      <ReferenceLine 
                        y={chartData[chartData.length - 1]?.attendance_rate} 
                        stroke="#00ff88" 
                        strokeDasharray="5 5" 
                        strokeWidth={1}
                        label={{
                          value: `${chartData[chartData.length - 1]?.attendance_rate.toFixed(1)}%`,
                          position: 'right',
                          fill: '#00ff88',
                          fontSize: 12,
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                    
                    {chartData.length > 0 && activeSeries === 'riesgo' && (
                      <ReferenceLine 
                        y={chartData[chartData.length - 1]?.risk_score} 
                        stroke="#ff69b4" 
                        strokeDasharray="5 5" 
                        strokeWidth={1}
                        label={{
                          value: chartData[chartData.length - 1]?.risk_score.toFixed(2),
                          position: 'right',
                          fill: '#ff69b4',
                          fontSize: 12,
                          fontWeight: 'bold'
                        }}
                      />
                    )}

                    {chartData.length > 0 && activeSeries === 'ingreso' && (
                      <ReferenceLine 
                        y={chartData[chartData.length - 1]?.ingresoPromedio} 
                        stroke="#ffa502" 
                        strokeDasharray="5 5" 
                        strokeWidth={1}
                        label={{
                          value: `$${chartData[chartData.length - 1]?.ingresoPromedio?.toLocaleString() || '0'}`,
                          position: 'right',
                          fill: '#ffa502',
                          fontSize: 12,
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.noDataMessage}>
                  <FaChartLine className={styles.noDataIcon} />
                  <h3>No hay datos para mostrar</h3>
                  <p>Realiza tu primer análisis de abandono escolar para ver las estadísticas aquí.</p>
                  <button 
                    className={styles.analyzeButton}
                    onClick={() => navigate('/abandono')}
                  >
                    Ir a Análisis de Abandono
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Gráficos Secundarios */}
          <div className={styles.chartsGridSecondary}>
            {/* Gráfico de distribución de riesgo */}
            <div className={styles.chartCard}>
              <h3>Distribución de Niveles de Riesgo</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => {
                      const total = riskDistributionData.reduce((sum, item) => sum + item.count, 0);
                      const percentage = total > 0 && value ? ((value / total) * 100).toFixed(0) : '0';
                      // Usar el nombre real del nivel de riesgo
                      return `${name} ${percentage}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="risk_level"
                  >
                    {riskDistributionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de abandono por mes */}
            <div className={styles.chartCard}>
              <h3>Abandono Escolar por Mes</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={generateDropoutByMonthData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" strokeOpacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#666"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#666' }}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#666' }}
                    label={{ 
                      value: 'Cantidad de Estudiantes', 
                      angle: -90, 
                      position: 'insideLeft',
                      fill: '#666',
                      fontSize: 11
                    }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: any, name: any) => [
                      `${value} estudiantes`,
                      name === 'alto' ? 'Riesgo Alto' : 
                      name === 'medio' ? 'Riesgo Medio' : 
                      name === 'bajo' ? 'Riesgo Bajo' : 'Total'
                    ]}
                    labelFormatter={(label) => `Mes: ${label}`}
                  />
                  <Bar 
                    dataKey="alto" 
                    stackId="a" 
                    fill="#ff4757" 
                    name="alto"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="medio" 
                    stackId="a" 
                    fill="#ffa502" 
                    name="medio"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="bajo" 
                    stackId="a" 
                    fill="#2ed573" 
                    name="bajo"
                    radius={[2, 2, 0, 0]}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de porcentaje de abandono por mes */}
            <div className={`${styles.chartCard} ${styles.fullWidth}`}>
              <h3>Porcentaje de Riesgo por Mes</h3>
              <ResponsiveContainer width="100%" height={420}>
                <ComposedChart data={generateDropoutByMonthData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" strokeOpacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#666"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#666' }}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#666' }}
                    label={{ 
                      value: 'Porcentaje (%)', 
                      angle: -90, 
                      position: 'insideLeft',
                      fill: '#666',
                      fontSize: 11
                    }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: any, name: any) => [
                      `${value}%`,
                      name === 'altoPorcentaje' ? 'Riesgo Alto' : 
                      name === 'medioPorcentaje' ? 'Riesgo Medio' : 
                      name === 'bajoPorcentaje' ? 'Riesgo Bajo' : 'Total'
                    ]}
                    labelFormatter={(label) => `Mes: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="altoPorcentaje" 
                    stroke="#ff4757" 
                    strokeWidth={3}
                    name="altoPorcentaje"
                    dot={{ fill: '#ff4757', strokeWidth: 2, r: 4, stroke: '#000' }}
                    activeDot={{ fill: '#ff4757', strokeWidth: 3, r: 6, stroke: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="medioPorcentaje" 
                    stroke="#ffa502" 
                    strokeWidth={3}
                    name="medioPorcentaje"
                    dot={{ fill: '#ffa502', strokeWidth: 2, r: 4, stroke: '#000' }}
                    activeDot={{ fill: '#ffa502', strokeWidth: 3, r: 6, stroke: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bajoPorcentaje" 
                    stroke="#2ed573" 
                    strokeWidth={3}
                    name="bajoPorcentaje"
                    dot={{ fill: '#2ed573', strokeWidth: 2, r: 4, stroke: '#000' }}
                    activeDot={{ fill: '#2ed573', strokeWidth: 3, r: 6, stroke: '#fff' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de dispersión - Edad vs Tiempo de Estudio */}
            <div className={`${styles.chartCard} ${styles.fullWidth}`}>
              <h3>Edad vs Tiempo de Estudio</h3>
              <ResponsiveContainer width="100%" height={500}>
                <ComposedChart data={ageStudyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" strokeOpacity={0.3} />
                  <XAxis 
                    dataKey="age" 
                    stroke="#666"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#666' }}
                    interval={0}
                    tickMargin={10}
                  />
                  <YAxis 
                    dataKey="study_time" 
                    stroke="#666"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#666' }}
                    tickMargin={10}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: any, name: any) => [
                      `${value} ${name === 'study_time' ? 'horas' : 'años'}`,
                      name === 'study_time' ? 'Tiempo de Estudio' : 'Edad'
                    ]}
                  />
                  <Bar 
                    dataKey="study_time" 
                    fill="#ff69b4" 
                    opacity={0.7}
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="age" 
                    stroke="#fff" 
                    strokeWidth={2}
                    dot={{ fill: '#fff', strokeWidth: 2, r: 4, stroke: '#000' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {activeTab === 'vinos' && (
        <div className={styles.chartContainer}>
          <div className={styles.chartPlaceholder}>
            <p>Estadísticas de vinos se mostrarán aquí</p>
          </div>
        </div>
      )}
    </div>
  );
}
