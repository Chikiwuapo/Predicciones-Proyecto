# Proyecto de Predicciones - Análisis de Abandono Escolar

Este proyecto incluye un sistema de análisis de abandono escolar con frontend en React/TypeScript y backend en Django.

## Estructura del Proyecto

```
Predicciones-Proyecto/
├── Backend/          # API Django
├── Frontend/         # Aplicación React
└── README.md
```

## Configuración y Ejecución

### Backend (Django)

1. **Navegar al directorio del backend:**
   ```bash
   cd Predicciones-Proyecto/Backend
   ```

2. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Aplicar migraciones:**
   ```bash
   python manage.py migrate
   ```

4. **Ejecutar el servidor:**
   ```bash
   python manage.py runserver
   ```

El backend estará disponible en: `http://localhost:8000`

### Frontend (React)

1. **Navegar al directorio del frontend:**
   ```bash
   cd Predicciones-Proyecto/Frontend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

El frontend estará disponible en: `http://localhost:3000`

## Funcionalidades

### Análisis de Abandono Escolar

- **Formulario de datos del estudiante:** Incluye edad, género, ingresos familiares, ubicación, situación económica, tiempo de estudio y apoyos disponibles.
- **Análisis de riesgo:** El sistema calcula automáticamente el nivel de riesgo de abandono (Alto, Medio, Bajo) basado en los datos ingresados.
- **Almacenamiento en base de datos:** Todos los análisis se guardan en la base de datos SQLite.
- **Navegación automática:** Al completar un análisis, el usuario es redirigido automáticamente a la página de estadísticas.

### Base de Datos

- **Archivo:** `abandono.sqlite3`
- **Modelo principal:** `StudentDropoutAnalysis`
- **Campos:** Datos del estudiante, resultados del análisis y metadatos

### API Endpoints

- `POST /api/student-dropout-analysis/` - Crear nuevo análisis
- `GET /api/student-dropout-analysis/` - Obtener todos los análisis
- `GET /api/student-dropout-statistics/` - Obtener estadísticas

## Tecnologías Utilizadas

### Backend
- Django 5.2.5
- Django REST Framework 3.15.2
- Django CORS Headers 4.3.1
- SQLite3

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- React Icons

## Notas Importantes

1. **CORS configurado:** El backend permite peticiones desde el frontend en desarrollo.
2. **Base de datos:** Se usa `abandono.sqlite3` como base de datos principal.
3. **Análisis simulado:** El cálculo de riesgo es simulado (en producción se integraría un modelo ML real).
4. **Navegación:** Al hacer clic en "ANALIZAR", el usuario es redirigido automáticamente a la página de estadísticas.

## Solución de Problemas

### Error de CORS
Si hay problemas de CORS, verificar que `django-cors-headers` esté instalado y configurado en `settings.py`.

### Error de Base de Datos
Si hay problemas con la base de datos, ejecutar:
```bash
python manage.py makemigrations
python manage.py migrate
```

### Error de Conexión
Verificar que ambos servidores (backend y frontend) estén ejecutándose en los puertos correctos.
