from django.db import models
from django.utils import timezone

class WineAnalysis(models.Model):
    """Modelo para almacenar análisis de vinos"""
    QUALITY_CHOICES = [
        ('Baja', 'Baja'),
        ('Media', 'Media'),
        ('Alta', 'Alta'),
    ]
    
    # Parámetros del vino
    fixed_acidity = models.FloatField(verbose_name="Acidez Fija (g/L)")
    volatile_acidity = models.FloatField(verbose_name="Acidez Volátil (g/L)")
    citric_acid = models.FloatField(verbose_name="Ácido Cítrico (g/L)")
    residual_sugar = models.FloatField(verbose_name="Azúcar Residual (g/L)")
    chlorides = models.FloatField(verbose_name="Cloruros (g/L)")
    free_sulfur_dioxide = models.FloatField(verbose_name="Dióxido de Azufre Libre (mg/L)")
    total_sulfur_dioxide = models.FloatField(verbose_name="Dióxido de Azufre Total (mg/L)")
    density = models.FloatField(verbose_name="Densidad (g/cm³)")
    ph = models.FloatField(verbose_name="pH")
    sulphates = models.FloatField(verbose_name="Sulfatos (g/L)")
    alcohol = models.FloatField(verbose_name="Alcohol (% vol)")
    
    # Resultados del análisis
    quality = models.CharField(max_length=10, choices=QUALITY_CHOICES, verbose_name="Calidad")
    confidence = models.FloatField(verbose_name="Confianza (%)")
    
    # Metadatos
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Fecha de Creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Última Actualización")
    
    class Meta:
        verbose_name = "Análisis de Vino"
        verbose_name_plural = "Análisis de Vinos"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Análisis {self.id} - {self.quality} ({self.confidence}%) - {self.created_at.strftime('%d/%m/%Y %H:%M')}"

class WineClassification(models.Model):
    """Modelo para clasificaciones de vinos basadas en diferentes criterios"""
    CLASSIFICATION_TYPES = [
        ('sugar', 'Por Contenido de Azúcar'),
        ('bubbles', 'Por Burbujas'),
        ('fortified', 'Fortificado/Generoso'),
        ('dessert', 'De Postre'),
    ]
    
    analysis = models.ForeignKey(WineAnalysis, on_delete=models.CASCADE, related_name='classifications')
    classification_type = models.CharField(max_length=20, choices=CLASSIFICATION_TYPES, verbose_name="Tipo de Clasificación")
    classification_name = models.CharField(max_length=100, verbose_name="Nombre de Clasificación")
    confidence = models.FloatField(verbose_name="Confianza (%)")
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        verbose_name = "Clasificación de Vino"
        verbose_name_plural = "Clasificaciones de Vinos"
    
    def __str__(self):
        return f"{self.get_classification_type_display()}: {self.classification_name}"

class WineComponent(models.Model):
    """Modelo para componentes químicos del vino para gráficos"""
    analysis = models.ForeignKey(WineAnalysis, on_delete=models.CASCADE, related_name='components')
    component_name = models.CharField(max_length=50, verbose_name="Nombre del Componente")
    value = models.FloatField(verbose_name="Valor")
    unit = models.CharField(max_length=20, verbose_name="Unidad")
    percentage = models.FloatField(verbose_name="Porcentaje del Total", null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        verbose_name = "Componente del Vino"
        verbose_name_plural = "Componentes del Vino"
    
    def __str__(self):
        return f"{self.component_name}: {self.value} {self.unit}"
