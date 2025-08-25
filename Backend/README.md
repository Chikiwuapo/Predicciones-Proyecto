# Módulo de Abandono Escolar (Backend)

Este documento describe cómo funciona la sección de Abandono Escolar del proyecto, la lógica de negocio aplicada y cómo se conecta a la base de datos `abandono.sqlite3`.

## Arquitectura

- Framework: Django 5 + Django REST Framework
- App principal: `api`
- Base de datos: SQLite (`abandono.sqlite3`) configurada en `Backend/settings.py`
- CORS habilitado para desarrollo

```text
Backend/
  ├─ Backend/settings.py        # Configuración de DB y CORS
  ├─ api/views.py               # Endpoints REST
  ├─ api/models.py              # Modelos (StudentDropoutAnalysis, etc.)
  └─ abandono.sqlite3           # Base de datos SQLite
```

## Conexión a Base de Datos

- Configuración (Backend/Backend/settings.py):
  - ENGINE: `django.db.backends.sqlite3`
  - NAME: `BASE_DIR / 'abandono.sqlite3'`
- La app `api` usa ORM de Django para CRUD sobre `StudentDropoutAnalysis`.
- El endpoint de implementación (`/api/implement-database-data/`) usa `sqlite3` para leer la tabla `abandono_escolar` y migrar registros al modelo Django.

## Endpoints REST (prefijo `/api`)

- Análisis de abandono
  - `GET /student-dropout-analysis/`: Lista todos los análisis.
  - `POST /student-dropout-analysis/`: Crea un análisis desde datos del formulario (Front).
  - `GET /student-dropout-analysis/<id>/`: Detalle de un análisis.
  - `DELETE /student-dropout-analysis/<id>/`: Elimina un análisis.
  - `DELETE /student-dropout-analysis/clear-all/`: Borra todo el historial.

- Estadísticas y series
  - `GET /student-dropout-statistics/`: Métricas globales (distribución de riesgo, asistencia, rangos por edad/ingreso/estudio, series temporales).
  - `GET /available-dates/`: Años y meses disponibles (por `analysis_date`).
  - `GET /basic-chart-data/?year&month`: Porcentajes asistencia/inasistencia filtrados.
  - `GET /real-time-series-data?year&month`: Series reales por fecha (agregado por día) con asistencia/riesgo.
  - `GET /time-series-data`, `GET /risk-time-series-data`, `GET /attendance-timeline`: Series sintéticas para visualizaciones.

- Implementación desde BD externa
  - `POST /implement-database-data/` body: `{ "records_count": number }`
    - Lee `abandono.sqlite3` (tabla `abandono_escolar`), calcula `attendance`, `risk_level`, `confidence` y crea registros `StudentDropoutAnalysis`.

## Modelo de Datos (resumen)

`StudentDropoutAnalysis` (campos clave):
- `age`, `gender`, `family_income`, `location`, `economic_situation`
- `study_time`, `school_support`, `family_support`, `extra_educational_support`
- `attendance` (bool), `analysis_date` (date)
- `risk_level` (Bajo/Medio/Alto), `confidence` (float), timestamps

## Lógica de Negocio (riesgo y asistencia)

Ubicación: `api/views.py`

- Creación (`POST /student-dropout-analysis/`):
  - Normaliza `economicSituation` a minúsculas.
  - Calcula `risk_level` y `confidence` en `_analyze_risk(student_data)` usando ponderaciones:
    - Edad, horas de estudio, ingresos, situación económica, apoyos (escolar/familiar/particular) y asistencia.
  - Umbrales: Alto ≥ 70, Medio ≥ 45, Bajo < 45.

- Implementación desde BD (`/implement-database-data/`):
  - Lee columnas reales de `abandono_escolar`:
    - `[id, anio, ubicacion, genero, edad, ingresos_familiares, estado_economico, tiempo_estudio, apoyo_escuela, apoyo_familiar, clases_particulares, situacion]`
  - Calcula:
    - `attendance` con `_calculate_attendance(record)`.
    - `risk_level` y `confidence` con `_calculate_risk_from_data(record)`.
  - Asigna `analysis_date` a partir de `anio`.

- Estadísticas globales (`GET /student-dropout-statistics/`):
  - Agregados ORM (Count/Avg/Min/Max) y series temporales con variación/tendencia para gráficos (asistencia/riesgo/ingresos).

## Integración con Frontend

- Servicio `Frontend/src/services/dropoutService.ts` consume los endpoints:
  - `createAnalysis`, `getAllAnalyses`, `getStatistics`, `implementDatabaseData`, `getAvailableDates`, `getBasicChartData`, `clearAllAnalyses`.
- Páginas:
  - `Abandono.tsx`: formulario, historial y detalle; al seleccionar un registro, renderiza gráficos personales.
  - `Stats.tsx`: estadísticas globales con filtros (Año/Mes). En “Solo mes seleccionado” el front agrupa por día y rellena días sin datos para curvas continuas.

## Puesta en Marcha (desarrollo)

1) Backend
```bash
cd Predicciones-Proyecto/Backend
python -m venv venv
venv/Scripts/activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver  # http://localhost:8000
```

2) Frontend
```bash
cd Predicciones-Proyecto/Frontend
npm install
npm run dev  # http://localhost:5173
```

3) Verificar CORS y URL base:
- `dropoutService.ts` apunta a `http://localhost:8000/api`.
- En producción: limitar CORS y mover `SECRET_KEY` a variables de entorno.

## Notas de Producción
- Sustituir SQLite por Postgres/MySQL si se requiere concurrencia/escala.
- Restringir `CORS_ALLOW_ALL_ORIGINS`.
- Validaciones adicionales y sanitización en endpoints.

---

Este README resume el funcionamiento del módulo de Abandono Escolar, su lógica de negocio, endpoints y la conexión con `abandono.sqlite3`, además de cómo el Frontend consume estos servicios para gráficos globales y personales. 