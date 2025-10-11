export type WorkshopType = 'AST' | 'IA';

export interface WorkshopProgress {
  workshopType: WorkshopType;
  currentStep: string;
  completedSteps: string[];
}

export interface WorkshopData {
  id: string;
  type: WorkshopType;
  assessments: any[];
  progress: WorkshopProgress;
}
