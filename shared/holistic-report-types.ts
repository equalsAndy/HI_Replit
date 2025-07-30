// Shared types for holistic report system

export type ReportType = 'standard' | 'personal';
export type ReportGenerationStatus = 'pending' | 'generating' | 'completed' | 'failed';

// Core participant information
export interface ParticipantInfo {
  name: string;
  title?: string;
  organization?: string;
  profilePicture?: string;
  completedAt: Date;
}

// Strengths assessment data
export interface StrengthsProfile {
  thinking: number;
  acting: number;
  feeling: number;
  planning: number;
  topStrengths: string[];
  strengthInsights: string[];
}

// Flow state analysis
export interface FlowAttribute {
  name: string;
  description?: string;
  category: string;
}

export interface FlowAnalysis {
  attributes: FlowAttribute[];
  flowScore?: number;
  flowInsights: string[];
  preferredWorkStyle: string[];
}

// Vision and goals from reflections
export interface VisionTimeline {
  currentState: string;
  futureVision: string;
  obstacles: string[];
  strengths: string[];
  actionSteps: string[];
}

// Professional development pathway
export interface GrowthPathway {
  developmentAreas: string[];
  recommendedActions: string[];
  teamCollaborationTips: string[];
  wellBeingFactors?: string[]; // Only in personal reports
}

// Personal reflections (only in personal reports)
export interface PersonalReflections {
  challenges: string[];
  wellBeingFactors: string[];
  personalGrowthAreas: string[];
  privateInsights: string[];
  reflectionQuotes: string[];
}

// Complete report data structure
export interface HolisticReportData {
  participant: ParticipantInfo;
  strengths: StrengthsProfile;
  flow: FlowAnalysis;
  vision: VisionTimeline;
  growth: GrowthPathway;
  personalReflections?: PersonalReflections; // Only included in personal reports
  starCardImagePath?: string;
  reportType: ReportType;
  generatedAt: Date;
  workshopVersion: string;
  // AI-generated content fields
  personalReport?: string; // AI-generated personal development content
  professionalProfile?: string; // AI-generated professional development content
  generatedBy?: string; // AI persona that generated the content
  assessmentData?: any; // Raw assessment data used for generation
}

// Database record structure
export interface HolisticReport {
  id: string;
  userId: number;
  reportType: ReportType;
  reportData: HolisticReportData;
  pdfFilePath?: string;
  pdfFileName?: string;
  pdfFileSize?: number;
  generationStatus: ReportGenerationStatus;
  generatedAt: Date;
  updatedAt: Date;
  errorMessage?: string;
  generatedByUserId?: number;
  starCardImagePath?: string;
}

// API request/response types
export interface GenerateReportRequest {
  reportType: ReportType;
  userId?: number; // Optional for admin generation
}

export interface GenerateReportResponse {
  success: boolean;
  reportId?: string;
  message: string;
  status: ReportGenerationStatus;
}

export interface ReportStatusResponse {
  reportId: string;
  status: ReportGenerationStatus;
  pdfUrl?: string;
  downloadUrl?: string;
  errorMessage?: string;
  generatedAt?: Date;
}

// Mock data service interface
export interface MockDataService {
  generateMockReportData(userId: number, reportType: ReportType): Promise<HolisticReportData>;
  generateMockStrengths(): StrengthsProfile;
  generateMockFlow(): FlowAnalysis;
  generateMockVision(): VisionTimeline;
  generateMockGrowth(): GrowthPathway;
  generateMockPersonalReflections(): PersonalReflections;
}

// PDF generation service interface
export interface PDFGenerationService {
  generatePDF(reportData: HolisticReportData, starCardImagePath: string): Promise<Buffer>;
  savePDF(pdfBuffer: Buffer, userId: number, reportType: ReportType): Promise<string>;
  getPDFPath(userId: number, reportType: ReportType): string;
}

// Report template data for PDF generation
export interface ReportTemplateData {
  participant: ParticipantInfo;
  reportType: ReportType;
  strengths: StrengthsProfile;
  flow: FlowAnalysis;
  vision: VisionTimeline;
  growth: GrowthPathway;
  personalReflections?: PersonalReflections;
  starCardImageBase64: string;
  generatedAt: string;
  workshopVersion: string;
}