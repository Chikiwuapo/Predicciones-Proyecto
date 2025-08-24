# 🍷 Sistema de Análisis de Calidad de Vinos

Un sistema completo de análisis de vinos con gráficos interactivos, clasificaciones automáticas y navegación fluida que funciona completamente en el frontend con opción de backend Django.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Funcionalidades](#-funcionalidades)
- [Gráficos](#-gráficos)
- [Clasificaciones](#-clasificaciones)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Contribución](#-contribución)

## ✨ Características

### 🎯 Funcionalidades Principales
- **Análisis en tiempo real** sin depender del backend
- **Gráficos interactivos** con clasificaciones automáticas
- **Navegación fluida** con redirección automática
- **Historial persistente** durante la sesión
- **15 tipos de clasificaciones** diferentes de vinos
- **Sistema de colores** por nivel de confianza
- **Diseño responsive** y moderno

### 📊 Gráficos Implementados
- **Clasificaciones Comparativas del Vino** (Principal)
- **Distribución de Alcohol** (Gráfico circular tipo donut)
- **Componentes Químicos** (Gráfico de barras)
- **Datos en Tiempo Real** (Gráfico de área)

## 🛠 Tecnologías

### Frontend
- **React 18** con TypeScript
- **Recharts** para gráficos interactivos
- **React Router** para navegación
- **CSS Modules** para estilos
- **Vite** como bundler

### Backend (Opcional)
- **Django 5.2.5** con Python
- **Django REST Framework** para APIs
- **SQLite** como base de datos
- **Entorno virtual** para dependencias

## 🚀 Instalación

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

### Backend (Opcional)
```bash
cd Backend
# Activar entorno virtual
.\env\Scripts\activate  # Windows
source env/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar migraciones
python manage.py migrate

# Iniciar servidor
python manage.py runserver
```

## 📖 Uso

### 1. Análisis de Vino
1. Ve a la página de **Vinos**
2. Llena el formulario con los parámetros del vino:
   - Acidez Fija (g/L): 3.8 - 15.9
   - Acidez Volátil (g/L): 0.08 - 1.58
   - Ácido Cítrico (g/L): 0 - 1.66
   - Azúcar Residual (g/L): 0.6 - 65.8
   - Cloruros (g/L): 0.012 - 0.611
   - Densidad (g/cm³): 0.99 - 1.04
   - pH: 2.74 - 4.01
   - Sulfatos (g/L): 0.22 - 2.0
   - Grado Alcohólico (% vol): 8.0 - 14.9

3. Haz clic en **"Analizar Vino"**
4. El sistema automáticamente:
   - Te redirige al historial
   - Selecciona el nuevo análisis
   - Muestra los gráficos
   - Destaca el tipo de vino principal

### 2. Visualización de Resultados
- **Gráfico Principal**: Clasificaciones comparativas con porcentajes
- **Gráfico Circular**: Distribución de alcohol
- **Gráfico de Barras**: Componentes químicos
- **Resultado**: Tipo de vino detectado con mayor confianza

## 🎨 Funcionalidades

### 📈 Gráfico de Clasificaciones Comparativas del Vino
- **Tipo**: Gráfico de barras verticales
- **Eje X**: Clasificaciones de vinos (rotadas -45°)
- **Eje Y**: "% de confianza" (0-100%)
- **Colores por confianza**:
  - 🟢 Verde: >90% (Excelente)
  - 🟢 Verde claro: >80% (Muy Buena)
  - 🟡 Amarillo: >70% (Buena)
  - 🔴 Rojo: <70% (Regular)
- **Funcionalidad**: Muestra TODOS los tipos de vino detectados
- **Resultado**: El tipo con mayor porcentaje se destaca como principal

### 🍷 Gráfico de Distribución de Alcohol
- **Tipo**: Gráfico circular tipo donut
- **Características**:
  - Radio interior (30px) para efecto donut
  - Líneas de etiqueta conectadas
  - Leyenda en la parte inferior
  - Tooltips mejorados
  - Información destacada del alcohol
- **Altura**: 350px para mejor visualización

### 🧪 Gráfico de Componentes Químicos
- **Tipo**: Gráfico de barras
- **Muestra**: Todos los componentes del vino
- **Diseño**: Limpio y compacto
- **Interactividad**: Tooltips informativos

### ⏱ Datos en Tiempo Real
- **Tipo**: Gráfico de área
- **Simulación**: Variaciones en tiempo real
- **Actualización**: Cada 2 segundos
- **Métricas**: Alcohol, pH, temperatura

## 🏷 Clasificaciones

### 15 Tipos de Clasificaciones Automáticas

#### Por Contenido de Azúcar
1. **Vino Seco** (< 4 g/L)
2. **Vino Semiseco** (4-12 g/L)
3. **Vino Semidulce** (12-45 g/L)
4. **Vino Dulce** (> 45 g/L)

#### Por Grado Alcohólico
5. **Vino Fortificado** (> 15% vol)
6. **Vino de Cuerpo Completo** (13-15% vol)
7. **Vino de Mesa** (11-13% vol)
8. **Vino Ligero** (< 11% vol)

#### Por Acidez
9. **Vino Fresco** (Acidez volátil < 0.2 g/L)
10. **Vino Equilibrado** (Acidez volátil 0.2-0.8 g/L)
11. **Vino con Defectos** (Acidez volátil > 0.8 g/L)

#### Por pH
12. **Vino Ácido** (pH < 3.0)
13. **Vino Suave** (pH > 3.8)
14. **Vino con pH Óptimo** (pH 3.0-3.5)

#### Por Densidad
15. **Vino de Cuerpo Pesado** (Densidad > 1.02 g/cm³)
16. **Vino de Cuerpo Medio** (Densidad 0.995-1.02 g/cm³)
17. **Vino Ligero** (Densidad < 0.995 g/cm³)

#### Clasificaciones Especiales
18. **Vino Premium** (Alcohol > 14% + Azúcar > 20 g/L)
19. **Vino Tradicional** (Alcohol < 11% + Azúcar < 5 g/L)
20. **Vino de Postre** (Azúcar > 30 g/L + Alcohol > 12%)
21. **Vino Espumante** (Alcohol < 12% + Azúcar < 3 g/L + Acidez > 6 g/L)
22. **Vino Rosado** (Alcohol 10-13% + Azúcar 2-8 g/L)

## 📁 Estructura del Proyecto

```
Predicciones-Proyecto/
├── Frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── Vinos/
│   │   │       ├── Vinos.tsx          # Componente principal
│   │   │       ├── WineCharts.tsx     # Gráficos interactivos
│   │   │       └── Vinos.module.css   # Estilos
│   │   ├── components/
│   │   ├── context/
│   │   └── services/
├── Backend/
│   ├── api/
│   │   ├── models.py                  # Modelos de datos
│   │   ├── views.py                   # Vistas y lógica
│   │   ├── serializers.py             # Serializadores
│   │   └── urls.py                    # Rutas de API
│   ├── Backend/
│   │   ├── settings.py                # Configuración
│   │   └── urls.py                    # Rutas principales
│   └── requirements.txt               # Dependencias Python
└── README.md
```

## 🔌 API Endpoints

### Backend (Django REST Framework)

#### Análisis de Vinos
- `POST /api/wine-analysis/` - Crear nuevo análisis
- `GET /api/wine-analysis/` - Listar todos los análisis
- `GET /api/wine-analysis/<id>/` - Obtener análisis específico

#### Estadísticas
- `GET /api/wine-statistics/` - Estadísticas globales
- `GET /api/real-time-data/<id>/` - Datos en tiempo real

#### Utilidades
- `GET /api/hello/` - Endpoint de prueba
- `POST /api/test-classifications/` - Crear análisis de prueba

### Frontend (React)

#### Páginas
- `/vinos` - Análisis de vinos
- `/estadisticas` - Estadísticas globales
- `/dashboard` - Panel principal
- `/configuracion` - Configuración

## 🎯 Características Técnicas

### Navegación Automática
- **Redirección automática**: Al hacer análisis → va directo al historial
- **Selección automática**: El nuevo análisis se selecciona inmediatamente
- **Gráficos automáticos**: Se muestran sin hacer clic
- **Scroll inteligente**: Se enfoca en el análisis creado

### Sistema de Colores
- **Verde (#4CAF50)**: Excelente confianza (90%+)
- **Verde claro (#8BC34A)**: Muy buena confianza (80-89%)
- **Amarillo (#FFC107)**: Buena confianza (70-79%)
- **Rojo (#F44336)**: Confianza regular (<70%)

### Responsive Design
- **Grid adaptativo**: Se ajusta a diferentes tamaños de pantalla
- **Gráficos responsivos**: Se redimensionan automáticamente
- **Navegación móvil**: Optimizada para dispositivos móviles

## 🤝 Contribución

### Cómo Contribuir
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código
- **TypeScript**: Para el frontend
- **ESLint**: Para linting
- **Prettier**: Para formateo
- **PEP 8**: Para Python (backend)

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- **Desarrollador Principal** - [Tu Nombre]
- **Contribuidores** - [Lista de contribuidores]

## 🙏 Agradecimientos

- **Recharts** por las librerías de gráficos
- **Django** por el framework backend
- **React** por el framework frontend
- **Vite** por el bundler rápido

---

**🍷 ¡Disfruta analizando vinos con nuestro sistema!**
