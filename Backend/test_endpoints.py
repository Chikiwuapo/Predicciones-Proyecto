import requests
import json

# URLs de los endpoints
base_url = "http://localhost:8000/api"

def test_endpoints():
    """Probar los endpoints de series temporales"""
    
    print("=== Probando endpoints de series temporales ===\n")
    
    # 1. Probar endpoint de fechas disponibles
    print("1. Probando endpoint de fechas disponibles...")
    try:
        response = requests.get(f"{base_url}/available-dates/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Éxito: Total de análisis: {data.get('total_analyses')}")
            print(f"   Años disponibles: {data.get('available_years')}")
            print(f"   Meses disponibles: {[m['name'] for m in data.get('available_months', [])]}")
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
    
    print()
    
    # 2. Probar endpoint de datos reales (sin filtros)
    print("2. Probando endpoint de datos reales (sin filtros)...")
    try:
        response = requests.get(f"{base_url}/real-time-series-data/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Éxito: {len(data.get('time_series', []))} puntos de datos")
            print(f"   Total de análisis: {data.get('total_analyses')}")
            
            # Mostrar algunos datos de ejemplo
            if data.get('time_series'):
                print("   Primeros 3 puntos de datos:")
                for i, point in enumerate(data['time_series'][:3]):
                    print(f"     Fecha: {point['date']}, Asistencia: {point['attendance_rate']}%, Riesgo: {point['risk_percentage']}%")
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
    
    print()
    
    # 3. Probar endpoint de datos reales con filtro de año
    print("3. Probando endpoint de datos reales con filtro de año (2025)...")
    try:
        response = requests.get(f"{base_url}/real-time-series-data/?year=2025")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Éxito: {len(data.get('time_series', []))} puntos de datos para 2025")
            print(f"   Filtros aplicados: {data.get('filters_applied')}")
            print(f"   Rango de fechas: {data.get('date_range')}")
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
    
    print()
    
    # 4. Probar endpoint simple
    print("4. Probando endpoint simple...")
    try:
        response = requests.get(f"{base_url}/simple-statistics/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Éxito: Total de análisis: {data.get('total_analyses')}")
            print(f"   Tasa de asistencia: {data.get('attendance_percentage')}%")
            print(f"   Tasa de inasistencia: {data.get('absence_percentage')}%")
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Error de conexión: {e}")

if __name__ == "__main__":
    test_endpoints() 