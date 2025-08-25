import requests
import json

# URLs de los nuevos endpoints
base_url = "http://localhost:8000/api"

def test_new_endpoints():
    """Probar los nuevos endpoints que deberían funcionar"""
    
    print("=== Probando nuevos endpoints ===\n")
    
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
    
    # 2. Probar endpoint de datos básicos (sin filtros)
    print("2. Probando endpoint de datos básicos (sin filtros)...")
    try:
        response = requests.get(f"{base_url}/basic-chart-data/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Éxito: Total de análisis: {data.get('total_analyses')}")
            print(f"   Tasa de asistencia: {data.get('attendance_percentage')}%")
            print(f"   Tasa de inasistencia: {data.get('absence_percentage')}%")
            print(f"   Datos de gráfico: {data.get('chart_data')}")
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
    
    print()
    
    # 3. Probar endpoint de datos básicos con filtro de año
    print("3. Probando endpoint de datos básicos con filtro de año (2025)...")
    try:
        response = requests.get(f"{base_url}/basic-chart-data/?year=2025")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Éxito: Total de análisis para 2025: {data.get('total_analyses')}")
            print(f"   Tasa de asistencia: {data.get('attendance_percentage')}%")
            print(f"   Tasa de inasistencia: {data.get('absence_percentage')}%")
            print(f"   Filtros aplicados: {data.get('filters_applied')}")
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
    
    print()
    
    # 4. Probar endpoint de datos básicos con filtro de año y mes
    print("4. Probando endpoint de datos básicos con filtro de año y mes (2025, 8)...")
    try:
        response = requests.get(f"{base_url}/basic-chart-data/?year=2025&month=8")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Éxito: Total de análisis para 2025/8: {data.get('total_analyses')}")
            print(f"   Tasa de asistencia: {data.get('attendance_percentage')}%")
            print(f"   Tasa de inasistencia: {data.get('absence_percentage')}%")
            print(f"   Filtros aplicados: {data.get('filters_applied')}")
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Error de conexión: {e}")

if __name__ == "__main__":
    test_new_endpoints() 