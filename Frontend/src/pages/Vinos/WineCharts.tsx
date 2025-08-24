import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import styles from './Vinos.module.css';

interface WineParameters {
  fixedAcidity: number;
  volatileAcidity: number;
  citricAcid: number;
  residualSugar: number;
  chlorides: number;
  freeSulfurDioxide: number;
  totalSulfurDioxide: number;
  density: number;
  pH: number;
  sulphates: number;
  alcohol: number;
}

interface WineAnalysis {
  id: string;
  date: string;
  quality: string;
  confidence: number;
  parameters: WineParameters;
}

interface WineChartsProps {
  selectedAnalysis: WineAnalysis | null;
}

interface WineClassification {
  name: string;
  confidence: number;
  color: string;
}

interface RealTimeData {
  time: string;
  alcohol: number;
  pH: number;
  temperature: number;
  humidity: number;
}

export default function WineCharts({ selectedAnalysis }: WineChartsProps) {
  const [realTimeData, setRealTimeData] = useState<RealTimeData[]>([]);

  // Generar TODAS las clasificaciones específicas con diferentes porcentajes
  const generateClassifications = (params: WineParameters): WineClassification[] => {
    const classifications: WineClassification[] = [];

    // SIEMPRE agregar las 6 clasificaciones principales

    // 1. Vino Seco: Contiene muy poca azúcar residual
    let secoConfidence = 50;
    if (params.residualSugar < 4) secoConfidence = 85 + Math.random() * 13;
    else if (params.residualSugar < 8) secoConfidence = 65 + Math.random() * 15;
    else secoConfidence = 40 + Math.random() * 20;
    
    classifications.push({ 
      name: 'Vino Seco', 
      confidence: Math.round(secoConfidence), 
      color: secoConfidence > 80 ? 'var(--chart-success)' : secoConfidence > 65 ? 'var(--chart-secondary)' : 'var(--chart-accent)'
    });

    // 2. Vino Semiseco: Cantidad moderada de azúcar, entre seco y semidulce
    let semisecoConfidence = 50;
    if (params.residualSugar >= 4 && params.residualSugar < 12) semisecoConfidence = 80 + Math.random() * 15;
    else if (params.residualSugar < 4 || (params.residualSugar >= 12 && params.residualSugar < 20)) semisecoConfidence = 60 + Math.random() * 15;
    else semisecoConfidence = 35 + Math.random() * 20;
    
    classifications.push({ 
      name: 'Vino Semiseco', 
      confidence: Math.round(semisecoConfidence), 
      color: semisecoConfidence > 80 ? 'var(--chart-success)' : semisecoConfidence > 65 ? 'var(--chart-secondary)' : 'var(--chart-accent)'
    });

    // 3. Vino Semidulce: Más azúcar que un vino semiseco
    let semidulceConfidence = 50;
    if (params.residualSugar >= 12 && params.residualSugar < 45) semidulceConfidence = 78 + Math.random() * 17;
    else if (params.residualSugar >= 8 && params.residualSugar < 60) semidulceConfidence = 55 + Math.random() * 20;
    else semidulceConfidence = 30 + Math.random() * 25;
    
    classifications.push({ 
      name: 'Vino Semidulce', 
      confidence: Math.round(semidulceConfidence), 
      color: semidulceConfidence > 80 ? 'var(--chart-success)' : semidulceConfidence > 65 ? 'var(--chart-secondary)' : 'var(--chart-accent)'
    });

    // 4. Vino Dulce: Mayor concentración de azúcar
    let dulceConfidence = 45;
    if (params.residualSugar >= 45) dulceConfidence = 85 + Math.random() * 13;
    else if (params.residualSugar >= 30) dulceConfidence = 60 + Math.random() * 20;
    else dulceConfidence = 25 + Math.random() * 25;
    
    classifications.push({ 
      name: 'Vino Dulce', 
      confidence: Math.round(dulceConfidence), 
      color: dulceConfidence > 80 ? 'var(--chart-success)' : dulceConfidence > 65 ? 'var(--chart-secondary)' : 'var(--chart-accent)'
    });

    // 5. Vino Espumoso: Efervescencia y burbujas
    let espumosoConfidence = 40;
    if (params.freeSulfurDioxide > 30 && params.totalSulfurDioxide > 100 && params.alcohol < 13) {
      espumosoConfidence = 82 + Math.random() * 15;
    } else if (params.freeSulfurDioxide > 20 && params.alcohol < 14) {
      espumosoConfidence = 55 + Math.random() * 20;
    } else {
      espumosoConfidence = 25 + Math.random() * 25;
    }
    
    classifications.push({ 
      name: 'Vino Espumoso', 
      confidence: Math.round(espumosoConfidence), 
      color: espumosoConfidence > 80 ? 'var(--chart-success)' : espumosoConfidence > 65 ? 'var(--chart-secondary)' : 'var(--chart-accent)'
    });

    // 6. Vino Fortificado: Grado alcohólico más alto
    let fortificadoConfidence = 45;
    if (params.alcohol > 15) fortificadoConfidence = 88 + Math.random() * 10;
    else if (params.alcohol > 13) fortificadoConfidence = 60 + Math.random() * 20;
    else fortificadoConfidence = 25 + Math.random() * 20;
    
    classifications.push({ 
      name: 'Vino Fortificado', 
      confidence: Math.round(fortificadoConfidence), 
      color: fortificadoConfidence > 80 ? 'var(--chart-success)' : fortificadoConfidence > 65 ? 'var(--chart-secondary)' : 'var(--chart-accent)'
    });

    return classifications.sort((a, b) => b.confidence - a.confidence);
  };

  // Datos para el gráfico de distribución de alcohol con animación
  const getAlcoholDistributionData = (alcohol: number) => {
    const baseAlcohol = alcohol;
    const otherComponents = 100 - baseAlcohol;
    return [
      { name: 'Alcohol', value: baseAlcohol, fill: 'var(--chart-danger)' },
      { name: 'Componentes', value: otherComponents, fill: 'var(--chart-teal)' }
    ];
  };

  // Estado para animar el gráfico circular
  const [alcoholAnimationKey, setAlcoholAnimationKey] = useState(0);

  // Datos para el gráfico de componentes químicos
  const getChemicalComponentsData = (params: WineParameters) => {
    const colors = [
      'var(--chart-primary)', 'var(--chart-secondary)', 'var(--chart-accent)',
      'var(--chart-info)', 'var(--chart-warning)', 'var(--chart-success)',
      'var(--chart-purple)', 'var(--chart-teal)', 'var(--chart-pink)', 'var(--chart-indigo)'
    ];
    
    return [
      { name: 'Acidez Fija', value: params.fixedAcidity, fill: colors[0] },
      { name: 'Acidez Volátil', value: params.volatileAcidity, fill: colors[1] },
      { name: 'Ácido Cítrico', value: params.citricAcid, fill: colors[2] },
      { name: 'Azúcar Residual', value: params.residualSugar, fill: colors[3] },
      { name: 'Cloruros', value: params.chlorides * 100, fill: colors[4] },
      { name: 'Sulfatos', value: params.sulphates, fill: colors[5] },
      { name: 'Alcohol', value: params.alcohol, fill: colors[6] },
      { name: 'pH', value: params.pH, fill: colors[7] },
      { name: 'Densidad', value: params.density * 100, fill: colors[8] },
      { name: 'Dióxido de Azufre', value: params.totalSulfurDioxide / 10, fill: colors[9] }
    ];
  };

  // Efecto para animar el gráfico circular cuando cambia el análisis
  useEffect(() => {
    if (selectedAnalysis) {
      setAlcoholAnimationKey(prev => prev + 1);
    }
  }, [selectedAnalysis]);

  // Simulación de datos en tiempo real
  useEffect(() => {
    if (!selectedAnalysis) return;

    const interval = setInterval(() => {
      setRealTimeData(prev => {
        const now = new Date();
        const baseAlcohol = selectedAnalysis.parameters.alcohol;
        const basePH = selectedAnalysis.parameters.pH;
        
        // Generar hora con formato HH:MM:SS
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const formattedTime = `${hours}:${minutes}:${seconds}`;
        
        const newData: RealTimeData = {
          time: formattedTime,
          alcohol: baseAlcohol + (Math.random() - 0.5) * 0.5,
          pH: basePH + (Math.random() - 0.5) * 0.1,
          temperature: 18 + Math.random() * 6,
          humidity: 65 + Math.random() * 20
        };

        const updated = [...prev, newData];
        if (updated.length > 10) {
          updated.shift();
        }
        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedAnalysis]);

  if (!selectedAnalysis) {
    return (
      <div className={styles.chartsContainer}>
        <div className={styles.noDataMessage}>
          <p>Selecciona un análisis del historial para ver los gráficos</p>
        </div>
      </div>
    );
  }

  const classifications = generateClassifications(selectedAnalysis.parameters);
  const alcoholData = getAlcoholDistributionData(selectedAnalysis.parameters.alcohol);
  const chemicalData = getChemicalComponentsData(selectedAnalysis.parameters);

  return (
    <div className={styles.chartsContainer}>
      
            {/* Primera fila: Componentes Químicos y Clasificaciones Comparativas */}
      <div className={styles.chartsGrid}>
        <div className={styles.topRow}>
          {/* Gráfico de Distribución de Alcohol */}
          <div className={styles.chartSection}>
            <h3>Distribución de Alcohol</h3>
            <div className={`${styles.chartContainer} ${styles.pieChartContainer}`}>
              <ResponsiveContainer width="100%" height={350} key={alcoholAnimationKey}>
                <PieChart>
                  <Pie
                    data={alcoholData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name} ${(value || 0).toFixed(1)}%`}
                    labelLine={{ stroke: '#fff', strokeWidth: 1 }}
                  >
                    {alcoholData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      color: '#333',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Porcentaje']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.alcoholInfo}>
              <p><strong>Alcohol: {selectedAnalysis.parameters.alcohol.toFixed(1)}% vol</strong></p>
            </div>
            
            {/* Leyenda del gráfico circular */}
            <div className={styles.chartLegend}>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: 'var(--chart-danger)' }}></span>
                <span>Alcohol</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: 'var(--chart-teal)' }}></span>
                <span>Otros Componentes</span>
              </div>
            </div>
          </div>

          {/* Análisis Gráfico del Vino */}
          <div className={styles.chartSection}>
            <h3>Clasificaciones Comparativas</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={classifications} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--stroke)" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12, fill: 'var(--text)' }}
                  />
                  <YAxis 
                    label={{ value: '% de confianza', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'var(--text)' } }}
                    tick={{ fontSize: 12, fill: 'var(--text)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: number) => [`${value || 0}%`, 'Confianza']}
                  />
                  <Bar dataKey="confidence" fill="#4CAF50">
                    {classifications.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.chartLegend}>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: 'var(--chart-success)' }}></span>
                <span>Excelente (90%+)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: 'var(--chart-secondary)' }}></span>
                <span>Muy Buena (80-89%)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: 'var(--chart-accent)' }}></span>
                <span>Buena (70-79%)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: 'var(--chart-danger)' }}></span>
                <span>Regular (&lt;70%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Segunda fila: Componentes Químicos (ancho completo) */}
        <div className={styles.bottomRow}>
          {/* Gráfico de Componentes Químicos */}
          <div className={styles.chartSection}>
            <h3>Componentes Químicos</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={450}>
                <BarChart data={chemicalData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--stroke)" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 12, fill: 'var(--text)' }}
                    interval={0}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'var(--text)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'Cloruros') return [`${(value / 100).toFixed(3)} g/L`, name];
                      if (name === 'pH') return [`${(value / 10).toFixed(2)}`, name];
                      return [`${value.toFixed(2)} g/L`, name];
                    }}
                  />
                  <Bar dataKey="value" fill="#4CAF50">
                    {chemicalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>



        {/* Tercera fila: Datos en Tiempo Real (ancho completo) */}
        <div className={styles.bottomRow}>
          {/* Gráfico de Datos en Tiempo Real */}
          <div className={styles.chartSection}>
            <h3>Datos en Tiempo Real</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={realTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--stroke)" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 11, fill: 'var(--text)' }}
                    interval={0}
                    height={50}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'var(--text)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pH" 
                    stackId="1"
                    stroke="var(--chart-success)" 
                    fill="var(--chart-success)" 
                    fillOpacity={0.3}
                    name="pH"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="temperature" 
                    stackId="2"
                    stroke="var(--chart-accent)" 
                    fill="var(--chart-accent)" 
                    fillOpacity={0.3}
                    name="Temperatura (°C)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="alcohol" 
                    stackId="3"
                    stroke="var(--chart-secondary)" 
                    fill="var(--chart-secondary)" 
                    fillOpacity={0.3}
                    name="Alcohol (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Leyenda de colores */}
            <div className={styles.chartLegend}>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: 'var(--chart-success)' }}></span>
                <span>pH</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: 'var(--chart-accent)' }}></span>
                <span>Temperatura (°C)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: 'var(--chart-secondary)' }}></span>
                <span>Alcohol (%)</span>
              </div>
            </div>
            {/* Información en tiempo real en tarjetas */}
            <div className={styles.realTimeCards}>
              <div className={`${styles.realTimeCard} ${styles.alcoholCard}`}>
                <div className={styles.cardLabel}>Alcohol Actual:</div>
                <div className={styles.cardValue}>
                  {realTimeData.length > 0 ? `${realTimeData[realTimeData.length - 1].alcohol.toFixed(2)}% vol` : `${selectedAnalysis.parameters.alcohol}% vol`}
                </div>
              </div>
              <div className={`${styles.realTimeCard} ${styles.pHCard}`}>
                <div className={styles.cardLabel}>pH Actual:</div>
                <div className={styles.cardValue}>
                  {realTimeData.length > 0 ? realTimeData[realTimeData.length - 1].pH.toFixed(2) : selectedAnalysis.parameters.pH.toFixed(2)}
                </div>
              </div>
              <div className={`${styles.realTimeCard} ${styles.temperatureCard}`}>
                <div className={styles.cardLabel}>Temperatura:</div>
                <div className={styles.cardValue}>
                  {realTimeData.length > 0 ? `${realTimeData[realTimeData.length - 1].temperature.toFixed(1)}°C` : '20.0°C'}
                </div>
              </div>
              <div className={`${styles.realTimeCard} ${styles.humidityCard}`}>
                <div className={styles.cardLabel}>Humedad:</div>
                <div className={styles.cardValue}>
                  {realTimeData.length > 0 ? `${Math.round(realTimeData[realTimeData.length - 1].humidity)}%` : '70%'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Tercera fila: Resultado Principal (ancho completo) */}
      <div className={`${styles.mainResult} ${styles.fullWidthSection}`}>
        <h3>Resultado Principal</h3>
        <div className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <span className={styles.resultLabel}>Tipo de Vino Detectado:</span>
            <span className={styles.resultValue} style={{ color: classifications[0]?.color }}>
              {classifications[0]?.name}
            </span>
          </div>
          <div className={styles.confidenceInfo}>
            <span>Confianza: {classifications[0]?.confidence}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
