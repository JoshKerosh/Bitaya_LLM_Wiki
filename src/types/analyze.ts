export interface AnalyzeResponse {
  caseTitle: string;
  detectedSituation: string;
  vulnerabilityCategory: string;
  urgencyLevel: "Alta" | "Media-alta" | "Media" | "Baja";
  suggestedInstitutions: string[];
  missingData: string[];
  nextSteps: string[];
  copyReadyMessage: string;
  officialSummary: string;
  responsibleAIWarning: string;
  humanReviewRequired: boolean;
  confidence: number;
  whyThisRoute: string[];
}
