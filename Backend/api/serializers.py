from rest_framework import serializers
from .models import WineAnalysis, WineClassification, WineComponent, StudentDropoutAnalysis

class WineAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = WineAnalysis
        fields = '__all__'

class WineClassificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = WineClassification
        fields = '__all__'

class WineComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = WineComponent
        fields = '__all__'

class StudentDropoutAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentDropoutAnalysis
        fields = '__all__'

