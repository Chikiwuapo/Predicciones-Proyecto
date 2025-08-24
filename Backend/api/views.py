from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView
from django.db.models import Count, Avg
from django.utils import timezone
from datetime import timedelta
import json
import random

from .models import WineAnalysis, WineClassification, WineComponent
from .serializers import WineAnalysisSerializer, WineClassificationSerializer, WineComponentSerializer

# Serializers
class WineAnalysisSerializer:
    @staticmethod
    def to_dict(analysis):
        return {
            'id': analysis.id,
            'fixed_acidity': analysis.fixed_acidity,
            'volatile_acidity': analysis.volatile_acidity,
            'citric_acid': analysis.citric_acid,
            'residual_sugar': analysis.residual_sugar,
            'chlorides': analysis.chlorides,
            'free_sulfur_dioxide': analysis.free_sulfur_dioxide,
            'total_sulfur_dioxide': analysis.total_sulfur_dioxide,
            'density': analysis.density,
            'ph': analysis.ph,
            'sulphates': analysis.sulphates,
            'alcohol': analysis.alcohol,
            'quality': analysis.quality,
            'confidence': analysis.confidence,
            'created_at': analysis.created_at.isoformat(),
            'classifications': [WineClassificationSerializer.to_dict(c) for c in analysis.classifications.all()],
            'components': [WineComponentSerializer.to_dict(c) for c in analysis.components.all()]
        }

class WineClassificationSerializer:
    @staticmethod
    def to_dict(classification):
        return {
            'id': classification.id,
            'classification_type': classification.classification_type,
            'classification_name': classification.classification_name,
            'confidence': classification.confidence,
            'created_at': classification.created_at.isoformat()
        }

class WineComponentSerializer:
    @staticmethod
    def to_dict(component):
        return {
            'id': component.id,
            'component_name': component.component_name,
            'value': component.value,
            'unit': component.unit,
            'percentage': component.percentage,
            'created_at': component.created_at.isoformat()
        }

# Vistas
@api_view(['GET'])
def hello_world(request):
    return Response({"message": "Hola desde Django REST!"})

@api_view(['POST'])
def test_classifications(request):
    """Endpoint de prueba para verificar clasificaciones"""
    try:
        # Datos de prueba
        test_data = {
            'fixedAcidity': 8.5,
            'volatileAcidity': 0.5,
            'citricAcid': 0.3,
            'residualSugar': 2.0,
            'chlorides': 0.1,
            'freeSulfurDioxide': 15,
            'totalSulfurDioxide': 45,
            'density': 1.0,
            'pH': 3.2,
            'sulphates': 0.6,
            'alcohol': 12.0
        }
        
        # Crear análisis de prueba
        quality = 'Media'
        confidence = 85.0
        
        analysis = WineAnalysis.objects.create(
            fixed_acidity=test_data['fixedAcidity'],
            volatile_acidity=test_data['volatileAcidity'],
            citric_acid=test_data['citricAcid'],
            residual_sugar=test_data['residualSugar'],
            chlorides=test_data['chlorides'],
            free_sulfur_dioxide=test_data['freeSulfurDioxide'],
            total_sulfur_dioxide=test_data['totalSulfurDioxide'],
            density=test_data['density'],
            ph=test_data['pH'],
            sulphates=test_data['sulphates'],
            alcohol=test_data['alcohol'],
            quality=quality,
            confidence=confidence
        )
        
        # Crear clasificaciones de prueba
        view = WineAnalysisView()
        view._create_classifications(analysis, test_data)
        view._create_components(analysis, test_data)
        
        # Obtener el análisis con todas sus relaciones
        analysis.refresh_from_db()
        
        return Response({
            'message': 'Análisis de prueba creado exitosamente',
            'analysis': WineAnalysisSerializer.to_dict(analysis),
            'classifications_count': analysis.classifications.count(),
            'components_count': analysis.components.count()
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class WineAnalysisView(APIView):
    """Vista para crear y listar análisis de vinos"""
    
    def get(self, request):
        """Obtener lista de análisis de vinos"""
        analyses = WineAnalysis.objects.all()
        data = [WineAnalysisSerializer.to_dict(analysis) for analysis in analyses]
        return Response(data)
    
    def post(self, request):
        """Crear nuevo análisis de vino"""
        try:
            # Extraer datos del request
            wine_data = request.data
            
            # Simular análisis de calidad (en un caso real, aquí iría el modelo ML)
            quality = self._analyze_quality(wine_data)
            confidence = random.uniform(70, 95)
            
            # Crear el análisis
            analysis = WineAnalysis.objects.create(
                fixed_acidity=wine_data.get('fixedAcidity', 0),
                volatile_acidity=wine_data.get('volatileAcidity', 0),
                citric_acid=wine_data.get('citricAcid', 0),
                residual_sugar=wine_data.get('residualSugar', 0),
                chlorides=wine_data.get('chlorides', 0),
                free_sulfur_dioxide=wine_data.get('freeSulfurDioxide', 0),
                total_sulfur_dioxide=wine_data.get('totalSulfurDioxide', 0),
                density=wine_data.get('density', 0),
                ph=wine_data.get('pH', 0),
                sulphates=wine_data.get('sulphates', 0),
                alcohol=wine_data.get('alcohol', 0),
                quality=quality,
                confidence=confidence
            )
            
            # Crear clasificaciones
            self._create_classifications(analysis, wine_data)
            
            # Crear componentes para gráficos
            self._create_components(analysis, wine_data)
            
            return Response(WineAnalysisSerializer.to_dict(analysis), status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def _analyze_quality(self, wine_data):
        """Simular análisis de calidad basado en los parámetros"""
        alcohol = wine_data.get('alcohol', 0)
        ph = wine_data.get('pH', 0)
        volatile_acidity = wine_data.get('volatileAcidity', 0)
        
        # Lógica simple para determinar calidad
        score = 0
        
        # Alcohol: 12-14% es ideal
        if 12 <= alcohol <= 14:
            score += 3
        elif 11 <= alcohol <= 15:
            score += 2
        else:
            score += 1
        
        # pH: 3.0-3.5 es ideal
        if 3.0 <= ph <= 3.5:
            score += 3
        elif 2.8 <= ph <= 3.7:
            score += 2
        else:
            score += 1
        
        # Acidez volátil: menor es mejor
        if volatile_acidity < 0.3:
            score += 3
        elif volatile_acidity < 0.6:
            score += 2
        else:
            score += 1
        
        # Determinar calidad basada en el score
        if score >= 8:
            return 'Alta'
        elif score >= 5:
            return 'Media'
        else:
            return 'Baja'
    
    def _create_classifications(self, analysis, wine_data):
        """Crear clasificaciones del vino con análisis más detallado"""
        residual_sugar = wine_data.get('residualSugar', 0)
        alcohol = wine_data.get('alcohol', 0)
        ph = wine_data.get('pH', 0)
        volatile_acidity = wine_data.get('volatileAcidity', 0)
        density = wine_data.get('density', 0)
        
        # Usar la confianza del análisis principal para mantener consistencia
        base_confidence = analysis.confidence
        
        # Siempre crear al menos una clasificación por azúcar
        if residual_sugar < 4:
            WineClassification.objects.create(
                analysis=analysis,
                classification_type='sugar',
                classification_name="Vino Seco - Sin azúcar residual",
                confidence=base_confidence
            )
        elif residual_sugar < 12:
            WineClassification.objects.create(
                analysis=analysis,
                classification_type='sugar',
                classification_name="Vino Semiseco/Abocado - Azúcar moderada",
                confidence=base_confidence
            )
        elif residual_sugar < 45:
            WineClassification.objects.create(
                analysis=analysis,
                classification_type='sugar',
                classification_name="Vino Semidulce - Azúcar notable",
                confidence=base_confidence
            )
        else:
            WineClassification.objects.create(
                analysis=analysis,
                classification_type='sugar',
                classification_name="Vino Dulce - Alta concentración de azúcar",
                confidence=base_confidence
            )
        
        # Clasificación por alcohol
        if alcohol > 15:
            WineClassification.objects.create(
                analysis=analysis,
                classification_type='fortified',
                classification_name="Vino Fortificado/Generoso - Alto contenido alcohólico",
                confidence=base_confidence
            )
        elif alcohol > 13:
            WineClassification.objects.create(
                analysis=analysis,
                classification_type='alcohol',
                classification_name="Vino de Cuerpo Completo - Alcohol elevado",
                confidence=base_confidence
            )
        
        # Clasificación de postre
        if residual_sugar > 30 and alcohol > 12:
            WineClassification.objects.create(
                analysis=analysis,
                classification_type='dessert',
                classification_name="Vino de Postre - Dulce y generoso",
                confidence=base_confidence
            )
        
        # Clasificación por acidez
        if volatile_acidity > 0.8:
            WineClassification.objects.create(
                analysis=analysis,
                classification_type='acidity',
                classification_name="Vino con Defectos - Acidez volátil alta",
                confidence=base_confidence * 0.8  # Reducir confianza para defectos
            )
        elif volatile_acidity < 0.2:
            WineClassification.objects.create(
                analysis=analysis,
                classification_type='acidity',
                classification_name="Vino Fresco - Acidez volátil baja",
                confidence=base_confidence
            )
        
        # Clasificación por pH
        if ph < 3.0:
            WineClassification.objects.create(
                analysis=analysis,
                classification_type='ph',
                classification_name="Vino Ácido - pH muy bajo",
                confidence=base_confidence * 0.9
            )
        elif ph > 3.8:
            WineClassification.objects.create(
                analysis=analysis,
                classification_type='ph',
                classification_name="Vino Suave - pH elevado",
                confidence=base_confidence * 0.9
            )
        
        # Clasificación por densidad
        if density > 1.02:
            WineClassification.objects.create(
                analysis=analysis,
                classification_type='density',
                classification_name="Vino de Cuerpo Pesado - Alta densidad",
                confidence=base_confidence
            )
        elif density < 0.995:
            WineClassification.objects.create(
                analysis=analysis,
                classification_type='density',
                classification_name="Vino Ligero - Baja densidad",
                confidence=base_confidence
            )
        
        # Clasificación por estilo
        if alcohol < 11 and residual_sugar < 5:
            WineClassification.objects.create(
                analysis=analysis,
                classification_type='style',
                classification_name="Vino de Mesa - Estilo tradicional",
                confidence=base_confidence
            )
        elif alcohol > 14 and residual_sugar > 20:
            WineClassification.objects.create(
                analysis=analysis,
                classification_type='style',
                classification_name="Vino Premium - Características excepcionales",
                confidence=base_confidence * 1.1  # Aumentar confianza para premium
            )
    
    def _create_components(self, analysis, wine_data):
        """Crear componentes para gráficos con datos más detallados"""
        # Componentes principales con valores realistas
        components_data = [
            ('Acidez Fija', wine_data.get('fixedAcidity', 0), 'g/L', 15),
            ('Acidez Volátil', wine_data.get('volatileAcidity', 0), 'g/L', 8),
            ('Ácido Cítrico', wine_data.get('citricAcid', 0), 'g/L', 5),
            ('Azúcar Residual', wine_data.get('residualSugar', 0), 'g/L', 12),
            ('Cloruros', wine_data.get('chlorides', 0), 'g/L', 3),
            ('Sulfatos', wine_data.get('sulphates', 0), 'g/L', 7),
            ('Alcohol', wine_data.get('alcohol', 0), '% vol', 25),
            ('pH', wine_data.get('pH', 0), 'pH', 10),
            ('Densidad', wine_data.get('density', 0), 'g/cm³', 8),
            ('Dióxido de Azufre', wine_data.get('totalSulfurDioxide', 0), 'mg/L', 7),
        ]
        
        # Calcular porcentajes basados en importancia relativa
        total_importance = sum(importance for _, _, _, importance in components_data)
        
        for name, value, unit, importance in components_data:
            # Ajustar el porcentaje basado en la importancia del componente
            base_percentage = (importance / total_importance) * 100
            
            # Añadir variación basada en el valor real
            value_factor = min(value / 10, 2.0) if value > 0 else 0.5
            adjusted_percentage = base_percentage * value_factor
            
            # Asegurar que el porcentaje esté en un rango razonable
            final_percentage = max(2, min(40, adjusted_percentage))
            
            WineComponent.objects.create(
                analysis=analysis,
                component_name=name,
                value=value,
                unit=unit,
                percentage=final_percentage
            )

class WineAnalysisDetailView(APIView):
    """Vista para obtener detalles de un análisis específico"""
    
    def get(self, request, analysis_id):
        try:
            analysis = WineAnalysis.objects.get(id=analysis_id)
            return Response(WineAnalysisSerializer.to_dict(analysis))
        except WineAnalysis.DoesNotExist:
            return Response({'error': 'Análisis no encontrado'}, status=status.HTTP_404_NOT_FOUND)

class WineStatisticsView(APIView):
    """Vista para estadísticas en tiempo real"""
    
    def get(self, request):
        """Obtener estadísticas para gráficos en tiempo real"""
        try:
            # Estadísticas de calidad
            quality_stats = WineAnalysis.objects.values('quality').annotate(
                count=Count('id')
            ).order_by('quality')
            
            # Estadísticas de alcohol (para gráfico circular)
            alcohol_stats = WineAnalysis.objects.aggregate(
                avg_alcohol=Avg('alcohol'),
                min_alcohol=Avg('alcohol'),
                max_alcohol=Avg('alcohol')
            )
            
            # Componentes más comunes (para gráfico de barras)
            component_stats = WineComponent.objects.values('component_name').annotate(
                avg_value=Avg('value'),
                avg_percentage=Avg('percentage')
            ).order_by('-avg_percentage')[:10]
            
            # Clasificaciones más comunes
            classification_stats = WineClassification.objects.values('classification_name').annotate(
                count=Count('id')
            ).order_by('-count')[:5]
            
            # Datos para gráficos en tiempo real
            recent_analyses = WineAnalysis.objects.filter(
                created_at__gte=timezone.now() - timedelta(hours=24)
            ).order_by('created_at')
            
            time_series_data = []
            for analysis in recent_analyses:
                time_series_data.append({
                    'timestamp': analysis.created_at.isoformat(),
                    'alcohol': analysis.alcohol,
                    'quality_score': {'Baja': 1, 'Media': 2, 'Alta': 3}[analysis.quality]
                })
            
            return Response({
                'quality_distribution': list(quality_stats),
                'alcohol_stats': alcohol_stats,
                'component_stats': list(component_stats),
                'classification_stats': list(classification_stats),
                'time_series_data': time_series_data,
                'total_analyses': WineAnalysis.objects.count(),
                'recent_analyses_count': recent_analyses.count()
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RealTimeDataView(APIView):
    """Vista para datos en tiempo real de un análisis específico"""
    
    def get(self, request, analysis_id):
        """Obtener datos en tiempo real de un análisis"""
        try:
            analysis = WineAnalysis.objects.get(id=analysis_id)
            
            # Simular datos en tiempo real (en un caso real, estos vendrían de sensores)
            real_time_data = {
                'analysis_id': analysis.id,
                'timestamp': timezone.now().isoformat(),
                'current_alcohol': analysis.alcohol + random.uniform(-0.1, 0.1),
                'current_ph': analysis.ph + random.uniform(-0.05, 0.05),
                'current_density': analysis.density + random.uniform(-0.001, 0.001),
                'temperature': random.uniform(15, 25),  # Simulado
                'humidity': random.uniform(40, 80),     # Simulado
                'components': []
            }
            
            # Datos de componentes en tiempo real
            for component in analysis.components.all():
                real_time_data['components'].append({
                    'name': component.component_name,
                    'current_value': component.value + random.uniform(-component.value * 0.05, component.value * 0.05),
                    'unit': component.unit,
                    'percentage': component.percentage
                })
            
            return Response(real_time_data)
            
        except WineAnalysis.DoesNotExist:
            return Response({'error': 'Análisis no encontrado'}, status=status.HTTP_404_NOT_FOUND)