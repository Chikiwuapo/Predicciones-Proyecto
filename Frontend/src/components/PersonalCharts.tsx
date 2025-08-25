import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, ComposedChart, Scatter, ScatterChart, ZAxis } from 'recharts';
import { dropoutService } from '../services/dropoutService';
import './PersonalCharts.module.css';

interface PersonalChartsProps {
  studentData: {
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
    risk_level: string;
    confidence: number;
  };
}

interface GlobalStatistics {
  avg_age: number;
  avg_study_time: number;
  avg_income: number;
  risk_distribution: Array<{ risk_level: string; count: number }>;
  total_analyses: number;
  income_stats: {
    avg_income: number;
    min_income: number;
    max_income: number;
  };
  study_time_stats: {
    avg_study_time: number;
    min_study_time: number;
    max_study_time: number;
  };
  age_stats: {
    avg_age: number;
    min_age: number;
    max_age: number;
  };
}

const PersonalCharts: React.FC<PersonalChartsProps> = ({ studentData }) => {
  const [globalStats, setGlobalStats] = useState<GlobalStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  // Cargar estadísticas globales reales
  useEffect(() => {
    const loadGlobalStats = async () => {
      try {
        setLoading(true);
        const stats = await dropoutService.getStatistics();
        
        // Verificar si hay datos en la base de datos
        if (stats.total_analyses === 0) {
          setHasData(false);
          setLoading(false);
          return;
        }
        
        setHasData(true);
        
        // Transformar datos para el formato esperado
        const transformedStats: GlobalStatistics = {
          avg_age: stats.age_stats.avg_age,
          avg_study_time: stats.study_time_stats.avg_study_time,
          avg_income: stats.income_stats.avg_income,
          risk_distribution: stats.risk_distribution,
          total_analyses: stats.total_analyses,
          income_stats: stats.income_stats,
          study_time_stats: stats.study_time_stats,
          age_stats: stats.age_stats
        };
        
        setGlobalStats(transformedStats);
      } catch (err) {
        console.error('Error loading global statistics:', err);
        setError('Error al cargar estadísticas globales');
        setHasData(false);
      } finally {
        setLoading(false);
      }
    };

    loadGlobalStats();
  }, []);

  if (loading) {
    return (
      <div className="personal-charts">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando estadísticas personales...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="personal-charts">
        <div className="error-container">
          <p>⚠️ {error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  // Si no hay datos en la base de datos, mostrar mensaje
  if (!hasData || !globalStats || globalStats.total_analyses === 0) {
    return (
      <div className="personal-charts">
        <div className="no-data-container">
          <h3 className="charts-title">📊 ANÁLISIS PERSONAL AVANZADO</h3>
          <div className="no-data-message">
            <div className="no-data-icon">📭</div>
            <h4>No hay datos disponibles para análisis</h4>
            <p>
              La base de datos no contiene análisis previos. Para ver gráficos personales y estadísticas comparativas, 
              necesitas tener al menos un análisis en el historial.
            </p>
            <div className="no-data-actions">
              <p><strong>Para generar datos:</strong></p>
              <ul>
                <li>Haz clic en "Implementar Datos de BD" para cargar datos de ejemplo</li>
                <li>O realiza un nuevo análisis en la pestaña "Nuevo Análisis"</li>
                <li>Los gráficos aparecerán automáticamente una vez que haya datos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Datos para el gráfico de comparación personal vs global
  const comparisonData = [
    {
      name: 'Edad',
      Estudiante: studentData.age,
      'Promedio General': globalStats.avg_age,
      'Rango Min-Max': `${globalStats.age_stats.min_age}-${globalStats.age_stats.max_age}`,
      'Diferencia': studentData.age - globalStats.avg_age,
      'Percentil': calculatePercentile(studentData.age, globalStats.age_stats.min_age, globalStats.age_stats.max_age)
    },
    {
      name: 'Tiempo de Estudio',
      Estudiante: studentData.study_time,
      'Promedio General': globalStats.avg_study_time,
      'Rango Min-Max': `${globalStats.study_time_stats.min_study_time}-${globalStats.study_time_stats.max_study_time}`,
      'Diferencia': studentData.study_time - globalStats.avg_study_time,
      'Percentil': calculatePercentile(studentData.study_time, globalStats.study_time_stats.min_study_time, globalStats.study_time_stats.max_study_time)
    },
    {
      name: 'Ingresos (miles)',
      Estudiante: studentData.family_income / 1000,
      'Promedio General': globalStats.avg_income / 1000,
      'Rango Min-Max': `${(globalStats.income_stats.min_income / 1000).toFixed(1)}-${(globalStats.income_stats.max_income / 1000).toFixed(1)}`,
      'Diferencia': (studentData.family_income - globalStats.avg_income) / 1000,
      'Percentil': calculatePercentile(studentData.family_income, globalStats.income_stats.min_income, globalStats.income_stats.max_income)
    },
  ];

  // Datos para el gráfico de factores de riesgo con valores reales
  const riskFactorsData = [
    { 
      name: 'Apoyo Escolar', 
      value: studentData.school_support ? 1 : 0, 
      fill: '#4BC0C0',
      description: studentData.school_support ? 'Recibe apoyo escolar' : 'No recibe apoyo escolar',
      impact: 'Alto impacto en reducción de riesgo'
    },
    { 
      name: 'Apoyo Familiar', 
      value: studentData.family_support ? 1 : 0, 
      fill: '#FF9F40',
      description: studentData.family_support ? 'Recibe apoyo familiar' : 'No recibe apoyo familiar',
      impact: 'Impacto moderado en estabilidad emocional'
    },
    { 
      name: 'Clases Particulares', 
      value: studentData.extra_educational_support ? 1 : 0, 
      fill: '#9966FF',
      description: studentData.extra_educational_support ? 'Recibe clases particulares' : 'No recibe clases particulares',
      impact: 'Impacto en rendimiento académico'
    },
    { 
      name: 'Asistencia', 
      value: studentData.attendance ? 1 : 0, 
      fill: '#FFCD56',
      description: studentData.attendance ? 'Asiste regularmente' : 'No asiste regularmente',
      impact: 'Factor crítico para el éxito académico'
    },
  ];

  // Datos para el gráfico de distribución de riesgo
  const riskDistributionData = globalStats.risk_distribution.map(item => ({
    name: item.risk_level,
    value: item.count,
    percentage: ((item.count / globalStats.total_analyses) * 100).toFixed(1),
    fill: item.risk_level === 'ALTO' ? '#FF6B6B' : item.risk_level === 'MEDIO' ? '#FFD93D' : '#6BCF7F'
  }));

  // Datos para el gráfico de dispersión edad vs tiempo de estudio
  const scatterData = [
    {
      age: studentData.age,
      study_time: studentData.study_time,
      risk_level: studentData.risk_level,
      income: studentData.family_income,
      size: 20,
      color: getRiskColor(studentData.risk_level)
    }
  ];

  // Calcular estadísticas personales avanzadas
  const personalStats = {
    riskScore: studentData.confidence,
    supportLevel: [studentData.school_support, studentData.family_support, studentData.extra_educational_support].filter(Boolean).length,
    incomeCategory: categorizeIncome(studentData.family_income, globalStats.income_stats),
    studyEfficiency: categorizeStudyTime(studentData.study_time, globalStats.study_time_stats),
    ageGroup: categorizeAge(studentData.age, globalStats.age_stats),
    riskTrend: calculateRiskTrend(studentData, globalStats),
    supportGap: calculateSupportGap(studentData),
    economicVulnerability: calculateEconomicVulnerability(studentData, globalStats)
  };

  // Colores para los gráficos
  const COLORS = ['#4BC0C0', '#FF9F40', '#9966FF', '#FFCD56', '#FF6384', '#36A2EB'];

  // Tooltip personalizado para gráficos
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="personal-charts">
      <h3 className="charts-title">📊 ANÁLISIS PERSONAL AVANZADO</h3>
      
      {/* Estadísticas personales rápidas (compactas) */}
      <div className="quick-stats">
        <div className="stat-card">
          <h4>🎯 Riesgo</h4>
          <p className={`risk-level ${studentData.risk_level.toLowerCase()}`}>
            {studentData.risk_level}
          </p>
          <p>Confianza: {studentData.confidence.toFixed(2)}%</p>
        </div>
        
        <div className="stat-card">
          <h4>📚 Estudio</h4>
          <p className="efficiency">{personalStats.studyEfficiency.level}</p>
          <p>{studentData.study_time} h/sem</p>
        </div>
        
        <div className="stat-card">
          <h4>💰 Ingresos</h4>
          <p className="income-category">{personalStats.incomeCategory.level}</p>
          <p>S/. {studentData.family_income.toLocaleString()}</p>
        </div>
        
        <div className="stat-card">
          <h4>🤝 Apoyo</h4>
          <p className="support-level">{personalStats.supportLevel}/3</p>
          <p>Factores activos</p>
        </div>
      </div>

      {/* Gráficos profesionales */}
      <div className="charts-grid">
        {/* Comparación Personal vs Global Avanzada */}
        <div className="chart-container full-width">
          <h4>📈 Análisis Comparativo Personal vs Estadísticas Globales</h4>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#cccccc" />
              <YAxis yAxisId="left" stroke="#cccccc" />
              <YAxis yAxisId="right" orientation="right" stroke="#cccccc" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="Estudiante" fill="#36A2EB" name="Valor del Estudiante" />
              <Bar yAxisId="left" dataKey="Promedio General" fill="#FF6384" name="Promedio General" />
              <Line yAxisId="right" type="monotone" dataKey="Percentil" stroke="#FFD93D" strokeWidth={3} name="Percentil (%)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Factores de Riesgo Detallados */}
        <div className="chart-container">
          <h4>🔍 Factores de Riesgo y Apoyo</h4>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={riskFactorsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value ? 'Sí' : 'No'}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {riskFactorsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución de Riesgo en la Población */}
        <div className="chart-container">
          <h4>📊 Distribución de Riesgo</h4>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={riskDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#cccccc" />
              <YAxis stroke="#cccccc" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Análisis de Dispersión Edad vs Tiempo de Estudio */}
        <div className="chart-container full-width">
          <h4>🎯 Dispersión: Edad vs Tiempo de Estudio</h4>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis type="number" dataKey="age" name="Edad" stroke="#cccccc" />
              <YAxis type="number" dataKey="study_time" name="Tiempo de Estudio (h/sem)" stroke="#cccccc" />
              <ZAxis type="number" dataKey="income" range={[60, 400]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Scatter name="Estudiante" data={scatterData} fill="#FF6384" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secciones textuales extensas removidas para un enfoque 100% gráfico */}
    </div>
  );
};

// Funciones auxiliares para cálculos
function calculatePercentile(value: number, min: number, max: number): number {
  return Math.round(((value - min) / (max - min)) * 100);
}

function categorizeIncome(income: number, stats: any) {
  const percentile = calculatePercentile(income, stats.min_income, stats.max_income);
  if (percentile <= 25) return { level: 'Bajo', description: 'Ingresos en el cuartil inferior', percentile };
  if (percentile <= 75) return { level: 'Medio', description: 'Ingresos en el rango medio', percentile };
  return { level: 'Alto', description: 'Ingresos en el cuartil superior', percentile };
}

function categorizeStudyTime(studyTime: number, stats: any) {
  const percentile = calculatePercentile(studyTime, stats.min_study_time, stats.max_study_time);
  if (percentile >= 75) return { level: 'Excelente', description: 'Tiempo de estudio superior al 75%', percentile };
  if (percentile >= 50) return { level: 'Bueno', description: 'Tiempo de estudio en el rango medio-alto', percentile };
  if (percentile >= 25) return { level: 'Regular', description: 'Tiempo de estudio en el rango medio-bajo', percentile };
  return { level: 'Necesita mejorar', description: 'Tiempo de estudio inferior al 25%', percentile };
}

function categorizeAge(age: number, stats: any) {
  const percentile = calculatePercentile(age, stats.min_age, stats.max_age);
  return { percentile, description: `Edad en el percentil ${percentile}%` };
}

function calculateRiskTrend(student: any, global: any) {
  const riskScore = student.confidence;
  const avgRisk = 50; // Asumiendo escala de 0-100
  const percentile = riskScore > avgRisk ? 
    Math.round(((riskScore - avgRisk) / (100 - avgRisk)) * 100) : 
    Math.round((riskScore / avgRisk) * 100);
  
  return {
    percentile,
    description: riskScore > avgRisk ? 'Riesgo superior al promedio' : 'Riesgo inferior al promedio',
    trend: riskScore > avgRisk ? 'Aumentando' : 'Disminuyendo'
  };
}

function calculateSupportGap(student: any) {
  const supportCount = [student.school_support, student.family_support, student.extra_educational_support].filter(Boolean).length;
  if (supportCount === 0) return { description: 'Sin apoyo externo - Intervención crítica requerida' };
  if (supportCount === 1) return { description: 'Apoyo limitado - Necesita fortalecimiento' };
  if (supportCount === 2) return { description: 'Apoyo moderado - Estable pero mejorable' };
  return { description: 'Apoyo completo - Condiciones favorables' };
}

function calculateEconomicVulnerability(student: any, global: any) {
  const incomePercentile = calculatePercentile(student.family_income, global.income_stats.min_income, global.income_stats.max_income);
  if (incomePercentile <= 20) return { index: 'Alto', description: 'Vulnerabilidad económica crítica' };
  if (incomePercentile <= 40) return { index: 'Medio-Alto', description: 'Vulnerabilidad económica significativa' };
  if (incomePercentile <= 60) return { index: 'Medio', description: 'Vulnerabilidad económica moderada' };
  if (incomePercentile <= 80) return { index: 'Medio-Bajo', description: 'Vulnerabilidad económica baja' };
  return { index: 'Bajo', description: 'Sin vulnerabilidad económica significativa' };
}

function getRiskColor(riskLevel: string): string {
  switch (riskLevel.toUpperCase()) {
    case 'ALTO': return '#FF6B6B';
    case 'MEDIO': return '#FFD93D';
    case 'BAJO': return '#6BCF7F';
    default: return '#8884d8';
  }
}

export default PersonalCharts; 