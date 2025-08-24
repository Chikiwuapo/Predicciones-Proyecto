# 🍷 Sistema de Análisis de Vinos

Sistema completo de análisis de vinos con frontend en React/TypeScript y backend en Django/Python, que incluye análisis en tiempo real, clasificación automática de vinos y visualización de datos interactiva.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Instalación](#-instalación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Comandos](#-comandos)
- [Funcionalidades](#-funcionalidades)

## ✨ Características

- **Análisis en Tiempo Real**: Monitoreo continuo de parámetros del vino
- **Clasificación Automática**: 6 tipos de vino con porcentajes de confianza
- **Gráficos Interactivos**: Visualización dinámica con Recharts
- **Diseño Responsivo**: Adaptable a diferentes tamaños de pantalla
- **Tema Dinámico**: Soporte para modo claro y oscuro
- **API REST**: Backend robusto con Django REST Framework

## 🛠️ Tecnologías Utilizadas

### Frontend (React/TypeScript)

#### Dependencias Principales
```bash
# React y React DOM
npm install react@^19.1.1 react-dom@^19.1.1

# React Router para navegación
npm install react-router-dom@^7.8.2

# React Icons para iconos
npm install react-icons@^5.5.0

# Recharts para gráficos interactivos
npm install recharts@^3.1.2
```

#### Dependencias de Desarrollo
```bash
# TypeScript
npm install --save-dev typescript@~5.8.3

# Tipos para React
npm install --save-dev @types/react@^19.1.10 @types/react-dom@^19.1.7

# Vite y plugin de React
npm install --save-dev vite@^7.1.2 @vitejs/plugin-react@^5.0.0

# ESLint y plugins
npm install --save-dev eslint@^9.33.0 @eslint/js@^9.33.0
npm install --save-dev eslint-plugin-react-hooks@^5.2.0 eslint-plugin-react-refresh@^0.4.20

# TypeScript ESLint
npm install --save-dev typescript-eslint@^8.39.1

# Otros tipos y utilidades
npm install --save-dev @types/node@^24.3.0 globals@^16.3.0
```

### Backend (Django/Python)

#### Dependencias
```bash
# Django framework
pip install Django==5.2.5

# Django REST Framework para APIs
pip install djangorestframework==3.15.2

# Django CORS Headers para manejo de CORS
pip install django-cors-headers==4.3.1

# Python Decouple para variables de entorno
pip install python-decouple==3.8
```

## 🚀 Instalación

### Prerrequisitos

- **Node.js** (versión 18 o superior)
- **Python** (versión 3.8 o superior)
- **npm** o **yarn**
- **pip**

### 🚀 Instalación Rápida (Desarrolladores Experimentados)

```bash
# Clonar repositorio
git clone <url-del-repositorio>
cd Predicciones-Proyecto

# Frontend (Terminal 1)
cd Frontend
npm install
npm run dev

# Backend (Terminal 2)
cd Backend
python -m venv env
env\Scripts\activate  # Windows
# source env/bin/activate  # macOS/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd Predicciones-Proyecto
```

### 2. Configurar Frontend

```bash
# Navegar al directorio Frontend
cd Frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

### 3. Configurar Backend

```bash
# Navegar al directorio Backend
cd Backend

# Crear entorno virtual
python -m venv env

# Activar entorno virtual
# Windows:
env\Scripts\activate
# macOS/Linux:
source env/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Aplicar migraciones
python manage.py migrate

# Crear superusuario (opcional)
python manage.py createsuperuser

# Ejecutar servidor
python manage.py runserver
```

## 📁 Estructura del Proyecto

```
Predicciones-Proyecto/
├── Frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── Vinos/
│   │   │       ├── Vinos.tsx
│   │   │       ├── WineCharts.tsx
│   │   │       └── Vinos.module.css
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
├── Backend/
│   ├── api/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   ├── Backend/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── requirements.txt
│   └── manage.py
└── README.md
```

## ⚡ Comandos

### Frontend

#### Instalación de Dependencias
```bash
# Instalar todas las dependencias de una vez (recomendado)
npm install

# O instalar dependencias individualmente:
# Dependencias principales
npm install react@^19.1.1 react-dom@^19.1.1 react-router-dom@^7.8.2 react-icons@^5.5.0 recharts@^3.1.2

# Dependencias de desarrollo
npm install --save-dev typescript@~5.8.3 @types/react@^19.1.10 @types/react-dom@^19.1.7 vite@^7.1.2 @vitejs/plugin-react@^5.0.0 eslint@^9.33.0 @eslint/js@^9.33.0 eslint-plugin-react-hooks@^5.2.0 eslint-plugin-react-refresh@^0.4.20 typescript-eslint@^8.39.1 @types/node@^24.3.0 globals@^16.3.0
```

#### Comandos de Desarrollo
```bash
# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar linter
npm run lint

# Vista previa de producción
npm run preview
```

### Backend

#### Instalación de Dependencias
```bash
# Activar entorno virtual
# Windows:
env\Scripts\activate
# macOS/Linux:
source env/bin/activate

# Instalar todas las dependencias de una vez (recomendado)
pip install -r requirements.txt

# O instalar dependencias individualmente:
pip install Django==5.2.5
pip install djangorestframework==3.15.2
pip install django-cors-headers==4.3.1
pip install python-decouple==3.8
```

#### Comandos de Desarrollo
```bash
# Aplicar migraciones
python manage.py migrate

# Crear migraciones
python manage.py makemigrations

# Ejecutar servidor de desarrollo
python manage.py runserver

# Crear superusuario
python manage.py createsuperuser

# Ejecutar tests
python manage.py test

# Shell de Django
python manage.py shell
```

## 🎯 Funcionalidades

### Análisis de Vinos
- **Parámetros Químicos**: Análisis de acidez, pH, alcohol, densidad, etc.
- **Clasificación Automática**: 6 tipos de vino con porcentajes de confianza
- **Distribución de Alcohol**: Gráfico circular con porcentajes
- **Componentes Químicos**: Gráfico de barras con valores detallados

### Visualización en Tiempo Real
- **Datos Dinámicos**: Actualización automática cada 2 segundos
- **Gráficos Interactivos**: Tooltips y animaciones
- **Tarjetas de Información**: Valores actuales de alcohol, pH, temperatura y humedad

### Tipos de Vino Soportados
1. **Vino Seco**: Muy poca azúcar residual
2. **Vino Semiseco**: Cantidad moderada de azúcar
3. **Vino Semidulce**: Más azúcar que semiseco
4. **Vino Dulce**: Mayor concentración de azúcar
5. **Vino Espumoso**: Efervescencia y burbujas
6. **Vino Fortificado**: Grado alcohólico más alto

### Características del Dashboard
- **Layout Responsivo**: Adaptable a diferentes tamaños de pantalla
- **Colores Dinámicos**: Adaptación automática al tema claro/oscuro
- **Navegación Fluida**: Transiciones suaves entre secciones
- **Historial de Análisis**: Persistencia de datos en localStorage

## 🌐 Puertos por Defecto

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000

## 📝 Notas de Desarrollo

### Variables de Entorno
Crear archivo `.env` en el directorio Backend:
```env
DEBUG=True
SECRET_KEY=tu-clave-secreta-aqui
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## 🔧 Solución de Problemas

### Frontend

#### Error: "Could not read package.json"
```bash
# Asegúrate de estar en el directorio correcto
cd Frontend
npm install
```

#### Error: "Module not found"
```bash
# Limpiar cache de npm
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Error: "TypeScript compilation failed"
```bash
# Reinstalar TypeScript
npm install --save-dev typescript@~5.8.3
npx tsc --init
```

### Backend

#### Error: "No module named 'django'"
```bash
# Activar entorno virtual
# Windows:
env\Scripts\activate
# macOS/Linux:
source env/bin/activate

# Reinstalar dependencias
pip install -r requirements.txt
```

#### Error: "Database does not exist"
```bash
# Aplicar migraciones
python manage.py migrate

# Si persiste, crear base de datos
python manage.py makemigrations
python manage.py migrate
```

#### Error: "Port already in use"
```bash
# Cambiar puerto
python manage.py runserver 8001

# O matar proceso en puerto 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
# macOS/Linux:
lsof -ti:8000 | xargs kill -9
```

### Estructura de Datos
El sistema utiliza parámetros químicos del vino como:
- Acidez fija y volátil
- Ácido cítrico
- Azúcar residual
- Cloruros
- Sulfatos
- Alcohol
- pH
- Densidad
- Dióxido de azufre

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- **Tu Nombre** - *Desarrollo inicial* - [TuUsuario](https://github.com/TuUsuario)

## 🙏 Agradecimientos

- React y su ecosistema
- Django y Django REST Framework
- Recharts para visualización de datos
- La comunidad de desarrolladores open source
