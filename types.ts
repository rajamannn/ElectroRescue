
export interface PCBComponent {
  name: string;
  type: string;
  function: string;
  isCritical: boolean;
}

export interface DamageAssessment {
  detected: boolean;
  visibleFaults: string[];
  conditionGrade: 'A' | 'B' | 'C' | 'D';
  conditionDescription: string;
}

export interface CostAnalysis {
  componentValueRange: string;
  manufacturingComplexity: string;
  conditionDepreciation: string;
}

export interface FinalValuation {
  asIsValue: string;
}

export interface AnalysisResult {
  summary: string[];
  components: PCBComponent[];
  pcbCategory: string;
  damageAssessment: DamageAssessment;
  costAnalysis: CostAnalysis;
  finalValuation: FinalValuation;
  technicalInsights: string;
  suggestions: string[];
}

export interface AnalysisState {
  isLoading: boolean;
  result: AnalysisResult | null;
  error: string | null;
  imagePreview: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  result: AnalysisResult;
  imageData: string; // Base64 data URI
}

export interface ProjectIdea {
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  missingComponents: string[];
}
