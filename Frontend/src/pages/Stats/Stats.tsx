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
  ReferenceLine,
  Legend
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
  const [showAllMonths, setShowAllMonths] = useState(true);
  const [fillEmptyMonths, setFillEmptyMonths] = useState(true);
  const [yearFilteredData, setYearFilteredData] = useState<any[]>([]);

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
  }, []);

  // Cargar datos filtrados por año
  useEffect(() => {
    const loadYearData = async () => {
      try {
        const yearData = await dropoutService.getYearFilteredData(selectedYear);
        setYearFilteredData(yearData.data);
      } catch (error) {
        console.error('Error loading year data:', error);
        setYearFilteredData([]);
      }
    };

    if (selectedYear) {
      loadYearData();
    }
  }, [selectedYear]);

  // Función para filtrar datos por año y mes
  const getFilteredData = () => {
    if (!dropoutData.length) return [];
    
    return dropoutData.filter(item => {
      const itemDate = new Date(item.analysis_date || item.created_at);
      const itemYear = itemDate.getFullYear();
      const itemMonth = itemDate.getMonth();
      
      if (itemYear !== selectedYear) return false;
      
      if (!showAllMonths) {
        return itemMonth === selectedMonth;
      }
      
      return true;
    });
  };

  const filteredData = getFilteredData();

  // Preparar datos para el gráfico principal con diseño profesional
  const prepareChartData = () => {
    if (!filteredData.length) return [];

    // Si es "mes seleccionado", crear datos por día dentro del mes
    if (!showAllMonths) {
      const selectedMonthData = filteredData.filter(item => {
        const itemDate = new Date(item.analysis_date || item.created_at);
        return itemDate.getMonth() === selectedMonth && itemDate.getFullYear() === selectedYear;
      });

      // Agrupar por día del mes
      const dailyData = selectedMonthData.reduce((acc, item) => {
        const date = new Date(item.analysis_date || item.created_at);
        const day = date.getDate();
        
        if (!acc[day]) {
          acc[day] = {
            day: day,
            month: `${day} ${new Date(selectedYear, selectedMonth).toLocaleDateString('es-ES', { month: 'short' })}`,
            asistencia: 0,
            ausencia: 0,
            riesgo: 0,
            ingreso: 0,
            count: 0,
            asistenciaPorcentaje: 0,
            ausenciaPorcentaje: 0,
            riesgoPorcentaje: 0
          };
        }
        
        acc[day].asistencia += item.attendance ? 1 : 0;
        acc[day].ausencia += item.attendance ? 0 : 1;
        acc[day].riesgo += item.risk_level === 'Alto' ? 1 : 0;
        acc[day].ingreso += item.family_income || 0;
        acc[day].count += 1;
        
        return acc;
      }, {} as Record<string, any>);

      return Object.values(dailyData).map(item => {
        const total = item.asistencia + item.ausencia;
        return {
          ...item,
          ingreso: Math.round(item.ingreso / item.count),
          asistenciaPorcentaje: total > 0 ? Math.round((item.asistencia / total) * 100) : 0,
          ausenciaPorcentaje: total > 0 ? Math.round((item.ausencia / total) * 100) : 0,
          riesgoPorcentaje: item.count > 0 ? Math.round((item.riesgo / item.count) * 100) : 0
        };
      }).sort((a, b) => a.day - b.day);
    }

    // Si es "todos los meses", agrupar por mes
    const groupedData = filteredData.reduce((acc, item) => {
      const date = new Date(item.analysis_date || item.created_at);
      const monthName = date.toLocaleDateString('es-ES', { month: 'long' });
      
      if (!acc[monthName]) {
        acc[monthName] = {
          month: monthName,
          asistencia: 0,
          ausencia: 0,
          riesgo: 0,
          ingreso: 0,
          count: 0,
          asistenciaPorcentaje: 0,
          ausenciaPorcentaje: 0,
          riesgoPorcentaje: 0
        };
      }
      
      acc[monthName].asistencia += item.attendance ? 1 : 0;
      acc[monthName].ausencia += item.attendance ? 0 : 1;
      acc[monthName].riesgo += item.risk_level === 'Alto' ? 1 : 0;
      acc[monthName].ingreso += item.family_income || 0;
      acc[monthName].count += 1;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedData).map(item => {
      const total = item.asistencia + item.ausencia;
      return {
        ...item,
        ingreso: Math.round(item.ingreso / item.count),
        asistenciaPorcentaje: total > 0 ? Math.round((item.asistencia / total) * 100) : 0,
        ausenciaPorcentaje: total > 0 ? Math.round((item.ausencia / total) * 100) : 0,
        riesgoPorcentaje: item.count > 0 ? Math.round((item.riesgo / item.count) * 100) : 0
      };
    });
  };

  // Calcular KPIs filtrados
  const filteredKPIs = () => {
    if (!filteredData.length) return {
      totalAnalyses: 0,
      riskPercentage: 0,
      avgStudyTime: 0,
      avgIncome: 0
    };

    const totalAnalyses = filteredData.length;
    const highRiskCount = filteredData.filter(d => d.risk_level === 'Alto').length;
    const riskPercentage = Math.round((highRiskCount / totalAnalyses) * 100);
    const avgStudyTime = Math.round(filteredData.reduce((sum, item) => sum + item.study_time, 0) / totalAnalyses);
    const avgIncome = Math.round(filteredData.reduce((sum, item) => sum + (item.family_income || 0), 0) / totalAnalyses);

    return { totalAnalyses, riskPercentage, avgStudyTime, avgIncome };
  };

  const kpis = filteredKPIs();

  // Datos para distribución de riesgo
  const riskDistributionData = () => {
    if (!filteredData.length) return [];
    
    const distribution = filteredData.reduce((acc, item) => {
      acc[item.risk_level] = (acc[item.risk_level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([level, count]) => ({
      name: level,
      value: count,
      percentage: Math.round((count / filteredData.length) * 100)
    }));
  };

  // Datos para abandono por mes
  const generateDropoutByMonthData = () => {
    if (!filteredData.length) return [];

    const monthData = filteredData.reduce((acc, item) => {
      const date = new Date(item.analysis_date || item.created_at);
      const monthName = date.toLocaleDateString('es-ES', { month: 'long' });
      
      if (!acc[monthName]) {
        acc[monthName] = {
          mes: monthName,
          alto: 0,
          medio: 0,
          bajo: 0,
          altoPorcentaje: 0,
          medioPorcentaje: 0,
          bajoPorcentaje: 0
        };
      }
      
      if (item.risk_level === 'Alto') acc[monthName].alto += 1;
      else if (item.risk_level === 'Medio') acc[monthName].medio += 1;
      else acc[monthName].bajo += 1;
      
      return acc;
    }, {} as Record<string, any>);

    // Calcular porcentajes
    Object.keys(monthData).forEach(month => {
      const total = monthData[month].alto + monthData[month].medio + monthData[month].bajo;
      monthData[month].altoPorcentaje = total > 0 ? Math.round((monthData[month].alto / total) * 100) : 0;
      monthData[month].medioPorcentaje = total > 0 ? Math.round((monthData[month].medio / total) * 100) : 0;
      monthData[month].bajoPorcentaje = total > 0 ? Math.round((monthData[month].bajo / total) * 100) : 0;
    });

    // Si no mostrar todos los meses, solo mostrar el mes seleccionado
    if (!showAllMonths) {
      const selectedMonthName = new Date(selectedYear, selectedMonth).toLocaleDateString('es-ES', { month: 'long' });
      return monthData[selectedMonthName] ? [monthData[selectedMonthName]] : [];
    }

    return Object.values(monthData);
  };

  // Datos para edad vs tiempo de estudio
  const ageStudyData = () => {
    if (!filteredData.length) return [];
    
    return filteredData.map(item => ({
      age: item.age,
      study_time: item.study_time,
      location: item.location
    }));
  };

  const chartData = prepareChartData();
  const riskData = riskDistributionData();
  const dropoutByMonthData = generateDropoutByMonthData();
  const ageStudyDataArray = ageStudyData();

  const noDataMessage = filteredData.length === 0 ? 
    `No hay datos para el año ${selectedYear}${!showAllMonths ? ` y mes ${new Date(selectedYear, selectedMonth).toLocaleDateString('es-ES', { month: 'long' })}` : ''}` : 
    '';

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

      {activeTab === 'abandono' && (
        <>
          {/* KPIs */}
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <FaUsers className={styles.cardIcon} />
                <h3>Total de Análisis</h3>
              </div>
              <div className={styles.statValue}>{kpis.totalAnalyses}</div>
              <div className={styles.statChange}>
                Análisis del período seleccionado
              </div>
            </div>
            
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <FaExclamationTriangle className={styles.cardIcon} />
                <h3>Riesgo Promedio</h3>
              </div>
              <div className={styles.statValue}>{kpis.riskPercentage}%</div>
              <div className={styles.statChange}>
                Estudiantes en riesgo alto
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <FaClock className={styles.cardIcon} />
                <h3>Tiempo de Estudio Promedio</h3>
              </div>
              <div className={styles.statValue}>{kpis.avgStudyTime}h/sem</div>
              <div className={styles.statChange}>
                Horas por semana
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <FaMoneyBillWave className={styles.cardIcon} />
                <h3>Ingresos Promedio</h3>
              </div>
              <div className={styles.statValue}>${kpis.avgIncome}</div>
              <div className={styles.statChange}>
                Ingresos familiares
              </div>
            </div>
          </div>

          {/* Controles de Filtro */}
          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3>Asistencia Estudiantil</h3>
                
                <div className={styles.dateControls}>
                  <div className={styles.dateControlGroup}>
                    <label className={styles.dateLabel}>Año</label>
                    <select 
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className={styles.dateSelect}
                    >
                      {Array.from({ length: 11 }, (_, i) => 2025 - i).map(year => (
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
                </div>

                <div className={styles.currentValue}>
                  {showAllMonths ? (
                    <span>Mostrando: Todos los meses del {selectedYear}</span>
                  ) : (
                    <span>Mostrando: {new Date(selectedYear, selectedMonth).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
                  )}
                </div>
              </div>
              
                             {noDataMessage ? (
                 <div className={styles.noDataMessage}>
                   <p>{noDataMessage}</p>
                 </div>
               ) : (
                 <ResponsiveContainer width="100%" height={600}>
                   <ComposedChart data={chartData} margin={{ top: 30, right: 40, left: 30, bottom: 30 }}>
                     <defs>
                       <linearGradient id="asistenciaGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#00BCD4" stopOpacity={1}/>
                         <stop offset="50%" stopColor="#00BCD4" stopOpacity={0.8}/>
                         <stop offset="100%" stopColor="#0097A7" stopOpacity={0.4}/>
                       </linearGradient>
                       <linearGradient id="ausenciaGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#FF5722" stopOpacity={1}/>
                         <stop offset="50%" stopColor="#FF5722" stopOpacity={0.8}/>
                         <stop offset="100%" stopColor="#D84315" stopOpacity={0.4}/>
                       </linearGradient>
                       <linearGradient id="riesgoGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#FF9800" stopOpacity={1}/>
                         <stop offset="50%" stopColor="#FF9800" stopOpacity={0.8}/>
                         <stop offset="100%" stopColor="#E65100" stopOpacity={0.4}/>
                       </linearGradient>
                       <linearGradient id="ingresoGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#00BCD4" stopOpacity={1}/>
                         <stop offset="50%" stopColor="#00BCD4" stopOpacity={0.8}/>
                         <stop offset="100%" stopColor="#0097A7" stopOpacity={0.4}/>
                       </linearGradient>
                       <filter id="glow">
                         <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                         <feMerge> 
                           <feMergeNode in="coloredBlur"/>
                           <feMergeNode in="SourceGraphic"/>
                         </feMerge>
                       </filter>
                     </defs>
                     
                     <CartesianGrid 
                       strokeDasharray="3 3" 
                       stroke="#333" 
                       strokeOpacity={0.3}
                       vertical={false}
                     />
                     <XAxis 
                       dataKey="month" 
                       stroke="#fff"
                       fontSize={12}
                       fontWeight={500}
                       tickLine={false}
                       axisLine={false}
                       tick={{ fill: '#fff', fontSize: 11 }}
                       tickMargin={10}
                     />
                     <YAxis 
                       stroke="#fff"
                       fontSize={12}
                       fontWeight={500}
                       tickLine={false}
                       axisLine={false}
                       tick={{ fill: '#fff', fontSize: 11 }}
                       tickMargin={10}
                     />
                     <Tooltip 
                       contentStyle={{
                         backgroundColor: 'rgba(0, 0, 0, 0.9)',
                         border: '1px solid #333',
                         borderRadius: '8px',
                         color: '#fff',
                         boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                       }}
                       labelStyle={{
                         color: '#00BCD4',
                         fontWeight: 'bold',
                         fontSize: '13px'
                       }}
                       itemStyle={{
                         color: '#fff',
                         fontSize: '12px'
                       }}
                     />
                     <Legend 
                       verticalAlign="top" 
                       height={36}
                       wrapperStyle={{
                         paddingBottom: '20px',
                         fontSize: '12px',
                         fontWeight: '500',
                         color: '#fff'
                       }}
                     />
                     
                     {/* Líneas de referencia como en la imagen */}
                     {activeSeries === 'ingreso' && chartData.length > 0 && (
                       <>
                         <ReferenceLine 
                           y={Math.max(...chartData.map(d => d.ingreso))} 
                           stroke="#00BCD4" 
                           strokeDasharray="3 3"
                           strokeWidth={2}
                           label={{
                             value: `Máximo: $${Math.max(...chartData.map(d => d.ingreso))}`,
                             position: 'right',
                             fill: '#00BCD4',
                             fontSize: 11,
                             fontWeight: 'bold'
                           }}
                         />
                         <ReferenceLine 
                           y={Math.round(chartData.reduce((sum, d) => sum + d.ingreso, 0) / chartData.length)} 
                           stroke="#FF9800" 
                           strokeDasharray="3 3"
                           strokeWidth={2}
                           label={{
                             value: `Promedio: $${Math.round(chartData.reduce((sum, d) => sum + d.ingreso, 0) / chartData.length)}`,
                             position: 'right',
                             fill: '#FF9800',
                             fontSize: 11,
                             fontWeight: 'bold'
                           }}
                         />
                         <ReferenceLine 
                           y={Math.min(...chartData.map(d => d.ingreso))} 
                           stroke="#4CAF50" 
                           strokeDasharray="3 3"
                           strokeWidth={2}
                           label={{
                             value: `Mínimo: $${Math.min(...chartData.map(d => d.ingreso))}`,
                             position: 'right',
                             fill: '#4CAF50',
                             fontSize: 11,
                             fontWeight: 'bold'
                           }}
                         />
                       </>
                     )}
                     
                     {activeSeries === 'asistencia' && (
                       <>
                         <Area 
                           type="monotone"
                           dataKey="asistencia" 
                           fill="url(#asistenciaGradient)"
                           stroke="#00BCD4"
                           strokeWidth={3}
                           fillOpacity={0.9}
                           name="Asistencia"
                           filter="url(#glow)"
                         />
                         <Area 
                           type="monotone"
                           dataKey="ausencia" 
                           fill="url(#ausenciaGradient)"
                           stroke="#FF5722"
                           strokeWidth={3}
                           fillOpacity={0.9}
                           name="Ausencia"
                           filter="url(#glow)"
                         />
                       </>
                     )}
                     
                     {activeSeries === 'riesgo' && (
                       <Area 
                         type="monotone"
                         dataKey="riesgo" 
                         fill="url(#riesgoGradient)"
                         stroke="#FF9800"
                         strokeWidth={3}
                         fillOpacity={0.9}
                         name="Estudiantes en Riesgo"
                         filter="url(#glow)"
                       />
                     )}
                     
                     {activeSeries === 'ingreso' && (
                       <Area 
                         type="monotone" 
                         dataKey="ingreso" 
                         fill="url(#ingresoGradient)"
                         stroke="#00BCD4"
                         strokeWidth={3}
                         fillOpacity={0.9}
                         name="Ingresos Promedio"
                         filter="url(#glow)"
                       />
                     )}
                   </ComposedChart>
                 </ResponsiveContainer>
               )}
              
                             <div className={styles.chartControls}>
                 <div className={styles.seriesOptions}>
                   <button 
                     className={`${styles.seriesButton} ${activeSeries === 'asistencia' ? styles.active : ''}`}
                     onClick={() => setActiveSeries('asistencia')}
                   >
                     📊 Asistencia
                   </button>
                   <button 
                     className={`${styles.seriesButton} ${activeSeries === 'riesgo' ? styles.active : ''}`}
                     onClick={() => setActiveSeries('riesgo')}
                   >
                     ⚠️ Riesgo
                   </button>
                   <button 
                     className={`${styles.seriesButton} ${activeSeries === 'ingreso' ? styles.active : ''}`}
                     onClick={() => setActiveSeries('ingreso')}
                   >
                     💰 Ingresos
                   </button>
                 </div>
               </div>
            </div>
          </div>

          {/* Gráficos Secundarios */}
          <div className={styles.chartsGrid}>
                         {/* Distribución de Niveles de Riesgo */}
             <div className={styles.chartCard}>
               <h3>🎯 Distribución de Niveles de Riesgo</h3>
               {riskData.length > 0 ? (
                 <ResponsiveContainer width="100%" height={350}>
                   <PieChart>
                     <Pie
                       data={riskData}
                       cx="50%"
                       cy="50%"
                       labelLine={false}
                       label={({ name, percentage }) => `${name}\n${percentage}%`}
                       outerRadius={90}
                       innerRadius={35}
                       fill="#8884d8"
                       dataKey="value"
                       paddingAngle={3}
                     >
                       {riskData.map((entry, index) => (
                         <Cell 
                           key={`cell-${index}`} 
                           fill={['#00BCD4', '#FF9800', '#4CAF50'][index % 3]}
                         />
                       ))}
                     </Pie>
                     <Tooltip 
                       contentStyle={{
                         backgroundColor: 'rgba(0, 0, 0, 0.9)',
                         border: '1px solid #333',
                         borderRadius: '8px',
                         color: '#fff',
                         boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                       }}
                       formatter={(value: any, name: any) => [
                         `${value} estudiantes`,
                         name
                       ]}
                     />
                   </PieChart>
                 </ResponsiveContainer>
               ) : (
                 <div className={styles.noDataMessage}>
                   <p>No hay datos de distribución de riesgo para el período seleccionado</p>
                 </div>
               )}
             </div>

                         {/* Abandono Escolar por Mes */}
             <div className={styles.chartCard}>
               <h3>📈 Abandono Escolar por Mes</h3>
               {dropoutByMonthData.length > 0 ? (
                 <ResponsiveContainer width="100%" height={450}>
                   <ComposedChart data={dropoutByMonthData} margin={{ top: 30, right: 40, left: 30, bottom: 30 }}>
                     <defs>
                       <linearGradient id="altoGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#FF5722" stopOpacity={1}/>
                         <stop offset="50%" stopColor="#FF5722" stopOpacity={0.8}/>
                         <stop offset="100%" stopColor="#D84315" stopOpacity={0.4}/>
                       </linearGradient>
                       <linearGradient id="medioGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#FF9800" stopOpacity={1}/>
                         <stop offset="50%" stopColor="#FF9800" stopOpacity={0.8}/>
                         <stop offset="100%" stopColor="#E65100" stopOpacity={0.4}/>
                       </linearGradient>
                       <linearGradient id="bajoGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#4CAF50" stopOpacity={1}/>
                         <stop offset="50%" stopColor="#4CAF50" stopOpacity={0.8}/>
                         <stop offset="100%" stopColor="#2E7D32" stopOpacity={0.4}/>
                       </linearGradient>
                       <filter id="glow2">
                         <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                         <feMerge> 
                           <feMergeNode in="coloredBlur"/>
                           <feMergeNode in="SourceGraphic"/>
                         </feMerge>
                       </filter>
                     </defs>
                     <CartesianGrid 
                       strokeDasharray="3 3" 
                       stroke="#333" 
                       strokeOpacity={0.3}
                       vertical={false}
                     />
                     <XAxis 
                       dataKey="mes" 
                       stroke="#fff"
                       fontSize={12}
                       fontWeight={500}
                       tickLine={false}
                       axisLine={false}
                       tick={{ fill: '#fff', fontSize: 11 }}
                       tickMargin={10}
                     />
                     <YAxis 
                       stroke="#fff"
                       fontSize={12}
                       fontWeight={500}
                       tickLine={false}
                       axisLine={false}
                       tick={{ fill: '#fff', fontSize: 11 }}
                       tickMargin={10}
                     />
                     <Tooltip 
                       contentStyle={{
                         backgroundColor: 'rgba(0, 0, 0, 0.9)',
                         border: '1px solid #333',
                         borderRadius: '8px',
                         color: '#fff',
                         boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                       }}
                       formatter={(value: any, name: any) => [
                         `${value} estudiantes`,
                         name === 'alto' ? 'Alto Riesgo' : name === 'medio' ? 'Medio Riesgo' : 'Bajo Riesgo'
                       ]}
                     />
                     <Legend 
                       verticalAlign="top" 
                       height={36}
                       wrapperStyle={{
                         paddingBottom: '20px',
                         fontSize: '12px',
                         fontWeight: '500',
                         color: '#fff'
                       }}
                     />
                     <Area 
                       type="monotone"
                       dataKey="alto" 
                       fill="url(#altoGradient)"
                       stroke="#FF5722"
                       strokeWidth={3}
                       fillOpacity={0.9}
                       name="Alto Riesgo"
                       filter="url(#glow2)"
                     />
                     <Area 
                       type="monotone"
                       dataKey="medio" 
                       fill="url(#medioGradient)"
                       stroke="#FF9800"
                       strokeWidth={3}
                       fillOpacity={0.9}
                       name="Medio Riesgo"
                       filter="url(#glow2)"
                     />
                     <Area 
                       type="monotone"
                       dataKey="bajo" 
                       fill="url(#bajoGradient)"
                       stroke="#4CAF50"
                       strokeWidth={3}
                       fillOpacity={0.9}
                       name="Bajo Riesgo"
                       filter="url(#glow2)"
                     />
                   </ComposedChart>
                 </ResponsiveContainer>
               ) : (
                 <div className={styles.noDataMessage}>
                   <p>No hay datos de abandono por mes para el período seleccionado</p>
                 </div>
               )}
             </div>

                         {/* Porcentaje de Riesgo por Mes */}
             <div className={styles.chartCard}>
               <h3>📊 Porcentaje de Riesgo por Mes</h3>
               {dropoutByMonthData.length > 0 ? (
                 <ResponsiveContainer width="100%" height={350}>
                   <ComposedChart data={dropoutByMonthData} margin={{ top: 30, right: 40, left: 30, bottom: 30 }}>
                     <defs>
                       <linearGradient id="altoLineGradient" x1="0" y1="0" x2="1" y2="0">
                         <stop offset="0%" stopColor="#FF5722" stopOpacity={0.8}/>
                         <stop offset="100%" stopColor="#D84315" stopOpacity={0.6}/>
                       </linearGradient>
                       <linearGradient id="medioLineGradient" x1="0" y1="0" x2="1" y2="0">
                         <stop offset="0%" stopColor="#FF9800" stopOpacity={0.8}/>
                         <stop offset="100%" stopColor="#E65100" stopOpacity={0.6}/>
                       </linearGradient>
                       <linearGradient id="bajoLineGradient" x1="0" y1="0" x2="1" y2="0">
                         <stop offset="0%" stopColor="#4CAF50" stopOpacity={0.8}/>
                         <stop offset="100%" stopColor="#2E7D32" stopOpacity={0.6}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid 
                       strokeDasharray="3 3" 
                       stroke="#333" 
                       strokeOpacity={0.3}
                       vertical={false}
                     />
                     <XAxis 
                       dataKey="mes" 
                       stroke="#fff"
                       fontSize={12}
                       fontWeight={500}
                       tickLine={false}
                       axisLine={false}
                       tick={{ fill: '#fff', fontSize: 11 }}
                       tickMargin={10}
                     />
                     <YAxis 
                       stroke="#fff"
                       fontSize={12}
                       fontWeight={500}
                       tickLine={false}
                       axisLine={false}
                       tick={{ fill: '#fff', fontSize: 11 }}
                       tickMargin={10}
                     />
                     <Tooltip 
                       contentStyle={{
                         backgroundColor: 'rgba(0, 0, 0, 0.9)',
                         border: '1px solid #333',
                         borderRadius: '8px',
                         color: '#fff',
                         boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                       }}
                       formatter={(value: any, name: any) => [
                         `${value}%`,
                         name === 'altoPorcentaje' ? 'Alto Riesgo' : name === 'medioPorcentaje' ? 'Medio Riesgo' : 'Bajo Riesgo'
                       ]}
                     />
                     <Legend 
                       verticalAlign="top" 
                       height={36}
                       wrapperStyle={{
                         paddingBottom: '20px',
                         fontSize: '12px',
                         fontWeight: '500',
                         color: '#fff'
                       }}
                     />
                     <Line 
                       type="monotone" 
                       dataKey="altoPorcentaje" 
                       stroke="url(#altoLineGradient)"
                       strokeWidth={3}
                       name="Alto Riesgo"
                       dot={{ 
                         fill: '#FF5722', 
                         strokeWidth: 2, 
                         r: 4, 
                         stroke: '#fff'
                       }}
                       activeDot={{ 
                         fill: '#FF5722', 
                         strokeWidth: 3, 
                         r: 6, 
                         stroke: '#fff'
                       }}
                     />
                     <Line 
                       type="monotone" 
                       dataKey="medioPorcentaje" 
                       stroke="url(#medioLineGradient)"
                       strokeWidth={3}
                       name="Medio Riesgo"
                       dot={{ 
                         fill: '#FF9800', 
                         strokeWidth: 2, 
                         r: 4, 
                         stroke: '#fff'
                       }}
                       activeDot={{ 
                         fill: '#FF9800', 
                         strokeWidth: 3, 
                         r: 6, 
                         stroke: '#fff'
                       }}
                     />
                     <Line 
                       type="monotone" 
                       dataKey="bajoPorcentaje" 
                       stroke="url(#bajoLineGradient)"
                       strokeWidth={3}
                       name="Bajo Riesgo"
                       dot={{ 
                         fill: '#4CAF50', 
                         strokeWidth: 2, 
                         r: 4, 
                         stroke: '#fff'
                       }}
                       activeDot={{ 
                         fill: '#4CAF50', 
                         strokeWidth: 3, 
                         r: 6, 
                         stroke: '#fff'
                       }}
                     />
                   </ComposedChart>
                 </ResponsiveContainer>
               ) : (
                 <div className={styles.noDataMessage}>
                   <p>No hay datos de porcentaje de riesgo para el período seleccionado</p>
                 </div>
               )}
             </div>

                         {/* Gráfico de dispersión - Edad vs Tiempo de Estudio */}
             <div className={`${styles.chartCard} ${styles.fullWidth}`}>
               <h3>🎓 Edad vs Tiempo de Estudio</h3>
               {ageStudyDataArray.length > 0 ? (
                 <ResponsiveContainer width="100%" height={600}>
                   <ComposedChart data={ageStudyDataArray} margin={{ top: 30, right: 40, left: 30, bottom: 30 }}>
                     <defs>
                       <linearGradient id="studyBarGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#00BCD4" stopOpacity={0.9}/>
                         <stop offset="95%" stopColor="#0097A7" stopOpacity={0.7}/>
                       </linearGradient>
                       <linearGradient id="ageLineGradient" x1="0" y1="0" x2="1" y2="0">
                         <stop offset="0%" stopColor="#fff" stopOpacity={0.8}/>
                         <stop offset="100%" stopColor="#E0E0E0" stopOpacity={0.6}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid 
                       strokeDasharray="3 3" 
                       stroke="#333" 
                       strokeOpacity={0.3}
                       vertical={false}
                     />
                     <XAxis 
                       dataKey="age" 
                       stroke="#fff"
                       fontSize={12}
                       fontWeight={500}
                       tickLine={false}
                       axisLine={false}
                       tick={{ fill: '#fff', fontSize: 11 }}
                       interval={0}
                       tickMargin={10}
                       label={{ value: 'Edad (años)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#fff', fontSize: 13, fontWeight: '500' } }}
                     />
                     <YAxis 
                       dataKey="study_time" 
                       stroke="#fff"
                       fontSize={12}
                       fontWeight={500}
                       tickLine={false}
                       axisLine={false}
                       tick={{ fill: '#fff', fontSize: 11 }}
                       tickMargin={10}
                       label={{ value: 'Tiempo de Estudio (horas/semana)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#fff', fontSize: 13, fontWeight: '500' } }}
                     />
                     <Tooltip 
                       contentStyle={{
                         backgroundColor: 'rgba(0, 0, 0, 0.9)',
                         border: '1px solid #333',
                         borderRadius: '8px',
                         color: '#fff',
                         boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                       }}
                       formatter={(value: any, name: any) => [
                         `${value} ${name === 'study_time' ? 'horas/semana' : 'años'}`,
                         name === 'study_time' ? 'Tiempo de Estudio' : 'Edad'
                       ]}
                     />
                     <Legend 
                       verticalAlign="top" 
                       height={36}
                       wrapperStyle={{
                         paddingBottom: '20px',
                         fontSize: '12px',
                         fontWeight: '500',
                         color: '#fff'
                       }}
                     />
                     <Area 
                       type="monotone"
                       dataKey="study_time" 
                       fill="url(#studyBarGradient)"
                       stroke="#00BCD4"
                       strokeWidth={3}
                       fillOpacity={0.9}
                       name="Tiempo de Estudio"
                       filter="url(#glow)"
                     />
                     <Line 
                       type="monotone" 
                       dataKey="age" 
                       stroke="url(#ageLineGradient)"
                       strokeWidth={3}
                       name="Edad"
                       dot={{ 
                         fill: '#fff', 
                         strokeWidth: 2, 
                         r: 4, 
                         stroke: '#000'
                       }}
                       activeDot={{ 
                         fill: '#fff', 
                         strokeWidth: 3, 
                         r: 6, 
                         stroke: '#000'
                       }}
                     />
                   </ComposedChart>
                 </ResponsiveContainer>
               ) : (
                 <div className={styles.noDataMessage}>
                   <p>No hay datos de edad vs tiempo de estudio para el período seleccionado</p>
                 </div>
               )}
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