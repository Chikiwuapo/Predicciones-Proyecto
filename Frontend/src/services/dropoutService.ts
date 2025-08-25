const API_BASE_URL = 'http://localhost:8000/api';

interface AnalysisData {
  age: number;
  gender: string;
  familyIncome: number;
  location: string;
  economicSituation: string;
  studyTime: number;
  schoolSupport: boolean;
  familySupport: boolean;
  extraEducationalSupport: boolean;
  attendance: boolean;
  analysisDate: string;
}

interface AnalysisResult {
  id: number;
  age: number;
  gender: string;
  family_income: number;
  location: string;
  economic_situation: string;
  study_time: number;
  school_support: boolean;
  family_support: boolean;
  extra_educational_support: boolean;
  attendance: boolean;
  analysis_date: string;
  risk_level: string;
  confidence: number;
  created_at: string;
}

interface Statistics {
  risk_distribution: Array<{ risk_level: string; count: number }>;
  age_stats: {
    avg_age: number;
    min_age: number;
    max_age: number;
  };
  study_time_stats: {
    avg_study_time: number;
    min_study_time: number;
    max_study_time: number;
  };
  income_stats: {
    avg_income: number;
    min_income: number;
    max_income: number;
  };
  time_series_data: Array<{
    timestamp: string;
    risk_score: number;
    study_time: number;
    age: number;
  }>;
  total_analyses: number;
  recent_analyses_count: number;
}

export const dropoutService = {
  // Crear nuevo análisis de abandono escolar
  async createAnalysis(analysisData: AnalysisData): Promise<AnalysisResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/student-dropout-analysis/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating analysis:', error);
      throw error;
    }
  },

  // Obtener todos los análisis
  async getAllAnalyses(): Promise<AnalysisResult[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/student-dropout-analysis/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching analyses:', error);
      throw error;
    }
  },

  // Obtener estadísticas
  async getStatistics(): Promise<Statistics> {
    try {
      const response = await fetch(`${API_BASE_URL}/student-dropout-statistics/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  // Implementar datos de la base de datos
  async implementDatabaseData(recordsCount: number = 50): Promise<{ success: boolean; count: number; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/implement-database-data/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records_count: recordsCount
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error implementing database data:', error);
      throw error;
    }
  },

  // Obtener datos básicos para gráficos con filtros
  async getBasicChartData(year?: number, month?: number): Promise<{
    chart_data: Array<{label: string, value: number, color: string}>;
    total_analyses: number;
    attendance_percentage: number;
    absence_percentage: number;
    filters_applied: {year?: number, month?: number};
  }> {
    try {
      let url = `${API_BASE_URL}/basic-chart-data/`;
      const params = new URLSearchParams();
      
      if (year) params.append('year', year.toString());
      if (month) params.append('month', month.toString());
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching basic chart data:', error);
      throw error;
    }
  },

  // Obtener fechas disponibles
  async getAvailableDates(): Promise<{
    available_years: number[];
    available_months: Array<{number: number, name: string}>;
    total_analyses: number;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/available-dates/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching available dates:', error);
      throw error;
    }
  },

  // Eliminar todos los análisis
  async clearAllAnalyses(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/student-dropout-analysis/clear-all/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error clearing all analyses:', error);
      throw error;
    }
  }
}; 