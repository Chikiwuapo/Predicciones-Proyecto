from django.urls import path
from .views import (
    hello_world, 
    test_classifications,
    WineAnalysisView, 
    WineAnalysisDetailView, 
    WineStatisticsView, 
    RealTimeDataView
)

urlpatterns = [
    path('hello/', hello_world),
    path('test-classifications/', test_classifications, name='test-classifications'),
    path('wine-analysis/', WineAnalysisView.as_view(), name='wine-analysis'),
    path('wine-analysis/<int:analysis_id>/', WineAnalysisDetailView.as_view(), name='wine-analysis-detail'),
    path('wine-statistics/', WineStatisticsView.as_view(), name='wine-statistics'),
    path('real-time-data/<int:analysis_id>/', RealTimeDataView.as_view(), name='real-time-data'),
]