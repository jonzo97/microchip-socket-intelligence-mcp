// Socket Intelligence MCP Server Type Definitions

export interface SocketRequirements {
  [key: string]: any;
}

export interface CompetitiveAnalysis {
  win_probability: number;
  displacement_difficulty: 'easy' | 'medium' | 'hard';
  key_differentiators: string[];
}

export interface MchpSolution {
  part: string;
  match_percentage: number;
  advantages: string[];
  gaps: string[];
}

export interface QualificationResult {
  qualification_score: number;
  mchp_solution: MchpSolution;
  competitive_analysis: CompetitiveAnalysis;
  recommendations: string[];
}

export interface SearchFilters {
  socket_type?: string;
  socket_category?: string;
  application?: string;
  market_segment?: string;
  confidence_level?: 'A' | 'B' | 'C' | 'D';
  content_type?: 'market_analysis' | 'competitive_intel' | 'technical_spec' | 'customer_requirement';
}

export interface SearchResult {
  id: string;
  content: string;
  metadata: {
    socket_type: string;
    application: string;
    confidence: string;
    source: string;
  };
  score: number;
}

export interface ProcessedResearchFile {
  id: string;
  filename: string;
  source_path: string;
  content: string;
  processed_content: string;
  metadata: {
    socket_category: string;
    market_segment: string;
    confidence_level: 'A' | 'B' | 'C' | 'D';
    content_type: 'market_analysis' | 'competitive_intel' | 'technical_spec' | 'customer_requirement';
    key_insights: string[];
    competitive_intelligence: {
      mchp_advantages: string[];
      mchp_gaps: string[];
      competitor_threats: string[];
      win_probability_factors: string[];
    };
    tags: string[];
    processed_date: string;
    manual_context_ready: boolean;
  };
}

export interface BlockDiagramRequirements {
  performance_tier?: 'entry' | 'mainstream' | 'high_performance';
  certifications?: string[];
  special_features?: string[];
}

export interface DisplacementContext {
  current_satisfaction?: 'high' | 'medium' | 'low';
  pain_points?: string[];
  switching_barriers?: string[];
}

export interface SocketType {
  MCU: 'MCU';
  FPGA: 'FPGA';
  Analog: 'Analog';
  Power: 'Power';
  Clock: 'Clock';
  Interface: 'Interface';
  RF: 'RF';
  Memory: 'Memory';
}

export interface MarketSegment {
  Automotive: 'Automotive';
  Industrial: 'Industrial';
  Medical: 'Medical';
  Consumer: 'Consumer';
  Infrastructure: 'Infrastructure';
}

export interface VolumeCategory {
  prototype: 'prototype';
  low: 'low';
  medium: 'medium';
  high: 'high';
}