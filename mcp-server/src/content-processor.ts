import * as fs from 'fs';
import * as path from 'path';

import { ProcessedResearchFile } from './types.js';

export interface SocketIntelligenceDatabase {
  sockets: Map<string, SocketProfile>;
  competitive_landscape: Map<string, CompetitorProfile>;
  market_segments: Map<string, SegmentProfile>;
  research_files: ProcessedResearchFile[];
  processing_summary: ProcessingSummary;
}

export interface SocketProfile {
  socket_name: string;
  category: string;
  market_size_estimate: number;
  growth_rate: number;
  mchp_current_position: string;
  key_applications: string[];
  technical_requirements: { [param: string]: any };
  competitive_dynamics: {
    primary_competitors: string[];
    mchp_win_rate: number;
    key_win_factors: string[];
    primary_loss_factors: string[];
  };
  research_quality: 'high' | 'medium' | 'low';
}

export interface CompetitorProfile {
  vendor: string;
  overall_threat_level: 'high' | 'medium' | 'low';
  key_strengths: string[];
  key_vulnerabilities: string[];
  target_sockets: string[];
  displacement_opportunities: string[];
}

export interface SegmentProfile {
  segment_name: string;
  total_addressable_market: number;
  mchp_penetration: number;
  key_success_factors: string[];
  regulatory_requirements: string[];
  customer_decision_criteria: string[];
}

export interface ProcessingSummary {
  total_files_processed: number;
  files_by_category: { [category: string]: number };
  confidence_distribution: { [level: string]: number };
  content_gaps_identified: string[];
  manual_context_recommendations: string[];
  vector_db_readiness_score: number;
}

export class ContentProcessor {
  private socketProfiles: Map<string, SocketProfile> = new Map();
  private competitorProfiles: Map<string, CompetitorProfile> = new Map();
  private segmentProfiles: Map<string, SegmentProfile> = new Map();
  
  constructor() {}

  /**
   * Process all research files and create structured intelligence database
   */
  async processAllResearchContent(basePath: string): Promise<SocketIntelligenceDatabase> {
    console.log('🔍 Starting comprehensive research content processing...');
    
    const researchFiles: ProcessedResearchFile[] = [];
    
    // Process socket-research-batch outputs (40 files)
    const batchOutputs = path.join(basePath, 'socket-research-batch', 'outputs');
    if (fs.existsSync(batchOutputs)) {
      const batchFiles = await this.processDirectory(batchOutputs, 'batch_research');
      researchFiles.push(...batchFiles);
    }

    // Process socket-research-priority outputs (19 files)
    const priorityOutputs = path.join(basePath, 'socket-research-priority', 'output-dropzones');
    if (fs.existsSync(priorityOutputs)) {
      const priorityFiles = await this.processDirectory(priorityOutputs, 'deep_research');
      researchFiles.push(...priorityFiles);
    }

    // Generate intelligence profiles from processed content
    await this.generateIntelligenceProfiles(researchFiles);
    
    // Create processing summary
    const processingSummary = this.createProcessingSummary(researchFiles);

    console.log(`✅ Processed ${researchFiles.length} research files`);
    console.log(`📊 Socket profiles: ${this.socketProfiles.size}`);
    console.log(`🏢 Competitor profiles: ${this.competitorProfiles.size}`);
    console.log(`🎯 Market segments: ${this.segmentProfiles.size}`);

    return {
      sockets: this.socketProfiles,
      competitive_landscape: this.competitorProfiles,
      market_segments: this.segmentProfiles,
      research_files: researchFiles,
      processing_summary: processingSummary
    };
  }

  /**
   * Process files in a specific directory
   */
  private async processDirectory(dirPath: string, contentType: string): Promise<ProcessedResearchFile[]> {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
    const results: ProcessedResearchFile[] = [];

    for (const filename of files) {
      const filePath = path.join(dirPath, filename);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      if (content.trim().length < 100) {
        console.log(`⚠️ Skipping short file: ${filename} (${content.length} chars)`);
        continue;
      }

      const processedFile = await this.processResearchFile(filename, filePath, content, contentType);
      results.push(processedFile);
      
      console.log(`📄 Processed: ${filename} - ${processedFile.metadata.confidence_level} confidence`);
    }

    return results;
  }

  /**
   * Process individual research file with AI-powered analysis
   */
  private async processResearchFile(
    filename: string,
    filePath: string,
    content: string,
    contentType: string
  ): Promise<ProcessedResearchFile> {
    
    // Extract metadata through content analysis
    const metadata = await this.analyzeFileContent(filename, content, contentType);
    
    // Clean and enhance content for manual context engineering
    const processedContent = this.enhanceContentForManualContext(content, metadata);
    
    // Generate unique ID
    const id = this.generateFileId(filePath);

    return {
      id,
      filename,
      source_path: filePath,
      content,
      processed_content: processedContent,
      metadata
    };
  }

  /**
   * AI-powered content analysis to extract structured metadata
   */
  private async analyzeFileContent(filename: string, content: string, contentType: string): Promise<ProcessedResearchFile['metadata']> {
    // Socket category determination
    const socketCategory = this.determineSocketCategory(filename, content);
    
    // Market segment analysis
    const marketSegment = this.determineMarketSegment(filename, content);
    
    // Content confidence assessment
    const confidenceLevel = this.assessContentConfidence(content);
    
    // Extract key insights
    const keyInsights = this.extractKeyInsights(content);
    
    // Competitive intelligence extraction
    const competitiveIntelligence = this.extractCompetitiveIntelligence(content);
    
    // Generate tags
    const tags = this.generateContentTags(filename, content, socketCategory, marketSegment);

    return {
      socket_category: socketCategory,
      market_segment: marketSegment,
      confidence_level: confidenceLevel,
      content_type: contentType as any,
      key_insights: keyInsights,
      competitive_intelligence: competitiveIntelligence,
      tags: tags,
      processed_date: new Date().toISOString(),
      manual_context_ready: true
    };
  }

  /**
   * Determine socket category from filename and content
   */
  private determineSocketCategory(filename: string, content: string): string {
    const categoryKeywords = {
      'MCU': ['microcontroller', 'mcu', 'cortex', 'arm', 'dspic', 'pic32'],
      'ANALOG': ['amplifier', 'opamp', 'adc', 'dac', 'sensor', 'precision'],
      'POWER': ['power', 'regulator', 'converter', 'charger', 'pmic', 'ldo'],
      'INTERFACE': ['interface', 'usb', 'ethernet', 'can', 'spi', 'i2c', 'uart'],
      'RF': ['wireless', 'wifi', 'bluetooth', 'rf', 'transceiver'],
      'MEMORY': ['memory', 'eeprom', 'flash', 'sram', 'controller'],
      'CLOCK': ['clock', 'timing', 'oscillator', 'pll', 'jitter'],
      'FPGA': ['fpga', 'programmable', 'logic', 'lut']
    };

    const lowerContent = content.toLowerCase();
    const lowerFilename = filename.toLowerCase();

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => 
        lowerFilename.includes(keyword) || lowerContent.includes(keyword)
      )) {
        return category;
      }
    }

    return 'MIXED_SIGNAL'; // Default category
  }

  /**
   * Determine market segment from content analysis
   */
  private determineMarketSegment(filename: string, content: string): string {
    const segmentKeywords = {
      'AUTOMOTIVE': ['automotive', 'vehicle', 'car', 'asil', 'aec-q100', 'telematics'],
      'INDUSTRIAL': ['industrial', 'automation', 'plc', 'factory', 'manufacturing'],
      'MEDICAL': ['medical', 'healthcare', 'patient', 'diagnostic', 'therapeutic'],
      'CONSUMER': ['consumer', 'home', 'appliance', 'gaming', 'entertainment'],
      'INFRASTRUCTURE': ['telecom', 'network', 'base station', 'datacenter', '5g'],
      'IOT': ['iot', 'edge', 'sensor', 'wireless', 'battery', 'low power']
    };

    const lowerContent = content.toLowerCase();
    const lowerFilename = filename.toLowerCase();

    for (const [segment, keywords] of Object.entries(segmentKeywords)) {
      if (keywords.some(keyword => 
        lowerFilename.includes(keyword) || lowerContent.includes(keyword)
      )) {
        return segment;
      }
    }

    return 'GENERAL'; // Default segment
  }

  /**
   * Assess content confidence level based on depth and quality indicators
   */
  private assessContentConfidence(content: string): 'A' | 'B' | 'C' | 'D' {
    const length = content.length;
    const lines = content.split('\n').length;
    const hasNumbers = /\d+/.test(content);
    const hasPercentages = /%|\bpercent\b/.test(content);
    const hasCompetitors = /\b(TI|STM|NXP|Infineon|Broadcom|Intel|ADI)\b/i.test(content);
    const hasMetrics = /\b(market share|revenue|units|growth|TAM|SAM)\b/i.test(content);
    
    let score = 0;
    
    // Length scoring
    if (length > 5000) score += 3;
    else if (length > 2000) score += 2;
    else if (length > 1000) score += 1;
    
    // Quality indicators
    if (hasNumbers) score += 1;
    if (hasPercentages) score += 1;
    if (hasCompetitors) score += 2;
    if (hasMetrics) score += 2;
    if (lines > 100) score += 1;

    // Confidence mapping
    if (score >= 8) return 'A';
    if (score >= 6) return 'B';
    if (score >= 3) return 'C';
    return 'D';
  }

  /**
   * Extract key insights from content
   */
  private extractKeyInsights(content: string): string[] {
    const insights: string[] = [];
    
    // Look for key insight patterns
    const insightPatterns = [
      /•\s*([^•\n]+)/g,
      /-\s*([^-\n]+)/g,
      /\*\s*([^*\n]+)/g,
      /Key finding:?\s*([^\n]+)/gi,
      /Important:?\s*([^\n]+)/gi,
      /Critical:?\s*([^\n]+)/gi
    ];

    for (const pattern of insightPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        insights.push(...matches.slice(0, 3).map(m => m.trim()));
      }
    }

    // Extract percentage findings
    const percentageMatches = content.match(/\d+%[^.!?\n]*/g);
    if (percentageMatches) {
      insights.push(...percentageMatches.slice(0, 2));
    }

    return insights.slice(0, 5); // Limit to top 5 insights
  }

  /**
   * Extract competitive intelligence from content
   */
  private extractCompetitiveIntelligence(content: string): ProcessedResearchFile['metadata']['competitive_intelligence'] {
    const mchpAdvantages: string[] = [];
    const mchpGaps: string[] = [];
    const competitorThreats: string[] = [];
    const winProbabilityFactors: string[] = [];

    // Extract MCHP advantages
    const advantagePatterns = [
      /microchip advantage:?\s*([^\n]+)/gi,
      /mchp strength:?\s*([^\n]+)/gi,
      /advantage:?\s*([^\n]+)/gi
    ];

    for (const pattern of advantagePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        mchpAdvantages.push(...matches.slice(0, 3));
      }
    }

    // Extract gaps
    const gapPatterns = [
      /gap:?\s*([^\n]+)/gi,
      /weakness:?\s*([^\n]+)/gi,
      /limitation:?\s*([^\n]+)/gi
    ];

    for (const pattern of gapPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        mchpGaps.push(...matches.slice(0, 2));
      }
    }

    // Extract competitor information
    const competitors = ['TI', 'STM', 'NXP', 'Infineon', 'Broadcom', 'Intel', 'ADI'];
    for (const competitor of competitors) {
      if (content.includes(competitor)) {
        const competitorContext = this.extractCompetitorContext(content, competitor);
        if (competitorContext) {
          competitorThreats.push(`${competitor}: ${competitorContext}`);
        }
      }
    }

    return {
      mchp_advantages: mchpAdvantages.slice(0, 5),
      mchp_gaps: mchpGaps.slice(0, 3),
      competitor_threats: competitorThreats.slice(0, 5),
      win_probability_factors: winProbabilityFactors
    };
  }

  /**
   * Extract competitor context from content
   */
  private extractCompetitorContext(content: string, competitor: string): string {
    // Find sentences mentioning the competitor
    const sentences = content.split(/[.!?]+/);
    const competitorSentences = sentences.filter(s => 
      s.toLowerCase().includes(competitor.toLowerCase())
    );
    
    if (competitorSentences.length > 0) {
      return competitorSentences[0].trim().substring(0, 100);
    }
    
    return '';
  }

  /**
   * Generate content tags for categorization
   */
  private generateContentTags(filename: string, content: string, socketCategory: string, marketSegment: string): string[] {
    const tags: string[] = [socketCategory, marketSegment];
    
    // Technology tags
    const techTags = {
      'arm': 'ARM',
      'cortex': 'CORTEX',
      'ethernet': 'ETHERNET',
      'can': 'CAN',
      'usb': 'USB',
      'wireless': 'WIRELESS',
      'power': 'POWER',
      'analog': 'ANALOG',
      'digital': 'DIGITAL',
      'tsn': 'TSN',
      'automotive': 'AUTO',
      'industrial': 'INDUSTRIAL',
      'medical': 'MEDICAL'
    };

    const lowerContent = content.toLowerCase();
    for (const [keyword, tag] of Object.entries(techTags)) {
      if (lowerContent.includes(keyword)) {
        tags.push(tag);
      }
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Enhance content for manual context engineering
   */
  private enhanceContentForManualContext(content: string, metadata: ProcessedResearchFile['metadata']): string {
    let enhanced = content;

    // Add metadata header
    const metadataHeader = `# METADATA
- Socket Category: ${metadata.socket_category}
- Market Segment: ${metadata.market_segment}
- Confidence Level: ${metadata.confidence_level}
- Key Tags: ${metadata.tags.join(', ')}
- Processing Date: ${metadata.processed_date.split('T')[0]}

# KEY INSIGHTS
${metadata.key_insights.map(insight => `- ${insight}`).join('\n')}

# COMPETITIVE INTELLIGENCE
## MCHP Advantages:
${metadata.competitive_intelligence.mchp_advantages.map(adv => `- ${adv}`).join('\n')}

## MCHP Gaps:
${metadata.competitive_intelligence.mchp_gaps.map(gap => `- ${gap}`).join('\n')}

## Competitor Threats:
${metadata.competitive_intelligence.competitor_threats.map(threat => `- ${threat}`).join('\n')}

---

# ORIGINAL RESEARCH CONTENT

`;

    enhanced = metadataHeader + enhanced;

    return enhanced;
  }

  /**
   * Generate intelligence profiles from processed research
   */
  private async generateIntelligenceProfiles(researchFiles: ProcessedResearchFile[]): Promise<void> {
    // Group by socket categories
    const socketGroups = new Map<string, ProcessedResearchFile[]>();
    
    for (const file of researchFiles) {
      const category = file.metadata.socket_category;
      if (!socketGroups.has(category)) {
        socketGroups.set(category, []);
      }
      socketGroups.get(category)!.push(file);
    }

    // Generate socket profiles
    for (const [category, files] of socketGroups.entries()) {
      const profile = this.createSocketProfile(category, files);
      this.socketProfiles.set(category, profile);
    }

    // Extract competitor profiles
    this.extractCompetitorProfiles(researchFiles);
    
    // Extract segment profiles
    this.extractSegmentProfiles(researchFiles);
  }

  /**
   * Create socket profile from research files
   */
  private createSocketProfile(category: string, files: ProcessedResearchFile[]): SocketProfile {
    const applications = new Set<string>();
    const competitors = new Set<string>();
    let totalConfidence = 0;

    for (const file of files) {
      // Extract applications from tags
      file.metadata.tags.forEach(tag => {
        if (!['A', 'B', 'C', 'D'].includes(tag)) {
          applications.add(tag);
        }
      });

      // Extract competitors
      file.metadata.competitive_intelligence.competitor_threats.forEach(threat => {
        const competitor = threat.split(':')[0];
        competitors.add(competitor);
      });

      // Accumulate confidence
      const confidenceScore = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 }[file.metadata.confidence_level];
      totalConfidence += confidenceScore;
    }

    const avgConfidence = totalConfidence / files.length;
    const researchQuality = avgConfidence >= 3.5 ? 'high' : avgConfidence >= 2.5 ? 'medium' : 'low';

    return {
      socket_name: category,
      category,
      market_size_estimate: 500, // Placeholder - would extract from content
      growth_rate: 0.15, // Placeholder
      mchp_current_position: 'established_player',
      key_applications: Array.from(applications).slice(0, 5),
      technical_requirements: {}, // Would extract from content
      competitive_dynamics: {
        primary_competitors: Array.from(competitors).slice(0, 5),
        mchp_win_rate: 0.6, // Placeholder - would calculate from research
        key_win_factors: [],
        primary_loss_factors: []
      },
      research_quality: researchQuality
    };
  }

  /**
   * Extract competitor profiles from research
   */
  private extractCompetitorProfiles(researchFiles: ProcessedResearchFile[]): void {
    const competitors = ['TI', 'STM', 'NXP', 'Infineon', 'Broadcom', 'Intel', 'ADI'];
    
    for (const competitor of competitors) {
      const relevantFiles = researchFiles.filter(file =>
        file.content.includes(competitor)
      );

      if (relevantFiles.length > 0) {
        const profile: CompetitorProfile = {
          vendor: competitor,
          overall_threat_level: 'medium', // Would calculate from analysis
          key_strengths: [],
          key_vulnerabilities: [],
          target_sockets: [],
          displacement_opportunities: []
        };

        this.competitorProfiles.set(competitor, profile);
      }
    }
  }

  /**
   * Extract segment profiles from research
   */
  private extractSegmentProfiles(researchFiles: ProcessedResearchFile[]): void {
    const segments = ['AUTOMOTIVE', 'INDUSTRIAL', 'MEDICAL', 'CONSUMER', 'INFRASTRUCTURE'];
    
    for (const segment of segments) {
      const relevantFiles = researchFiles.filter(file =>
        file.metadata.market_segment === segment
      );

      if (relevantFiles.length > 0) {
        const profile: SegmentProfile = {
          segment_name: segment,
          total_addressable_market: 1000, // Placeholder
          mchp_penetration: 0.2, // Placeholder
          key_success_factors: [],
          regulatory_requirements: [],
          customer_decision_criteria: []
        };

        this.segmentProfiles.set(segment, profile);
      }
    }
  }

  /**
   * Create processing summary
   */
  private createProcessingSummary(researchFiles: ProcessedResearchFile[]): ProcessingSummary {
    const filesByCategory: { [category: string]: number } = {};
    const confidenceDistribution: { [level: string]: number } = {};

    for (const file of researchFiles) {
      // Count by category
      filesByCategory[file.metadata.socket_category] = 
        (filesByCategory[file.metadata.socket_category] || 0) + 1;
      
      // Count by confidence
      confidenceDistribution[file.metadata.confidence_level] = 
        (confidenceDistribution[file.metadata.confidence_level] || 0) + 1;
    }

    const vectorDbReadinessScore = this.calculateVectorDbReadiness(researchFiles);

    return {
      total_files_processed: researchFiles.length,
      files_by_category: filesByCategory,
      confidence_distribution: confidenceDistribution,
      content_gaps_identified: [],
      manual_context_recommendations: [
        'Enhance content with quantitative metrics where possible',
        'Add competitor pricing intelligence',
        'Include technical specification comparisons',
        'Expand on win/loss factors with specific examples'
      ],
      vector_db_readiness_score: vectorDbReadinessScore
    };
  }

  /**
   * Calculate vector database readiness score
   */
  private calculateVectorDbReadiness(researchFiles: ProcessedResearchFile[]): number {
    let score = 0;
    let maxScore = 0;

    for (const file of researchFiles) {
      maxScore += 10;
      
      // Content length score
      if (file.content.length > 2000) score += 3;
      else if (file.content.length > 1000) score += 2;
      else score += 1;

      // Confidence score
      const confidenceScore = { 'A': 3, 'B': 2, 'C': 1, 'D': 0 }[file.metadata.confidence_level];
      score += confidenceScore;

      // Metadata richness
      if (file.metadata.key_insights.length > 3) score += 2;
      if (file.metadata.competitive_intelligence.mchp_advantages.length > 2) score += 2;
    }

    return Math.round((score / maxScore) * 100);
  }

  /**
   * Generate unique file ID
   */
  private generateFileId(filePath: string): string {
    return Buffer.from(filePath).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  }

  /**
   * Save processed database to files
   */
  async saveProcessedDatabase(database: SocketIntelligenceDatabase, outputDir: string): Promise<void> {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save complete database
    const dbFile = path.join(outputDir, 'socket-intelligence-database.json');
    const serializedDb = {
      sockets: Array.from(database.sockets.entries()),
      competitive_landscape: Array.from(database.competitive_landscape.entries()),
      market_segments: Array.from(database.market_segments.entries()),
      research_files: database.research_files,
      processing_summary: database.processing_summary
    };
    fs.writeFileSync(dbFile, JSON.stringify(serializedDb, null, 2));

    // Save enhanced content files for manual context engineering
    const contextDir = path.join(outputDir, 'enhanced-context');
    if (!fs.existsSync(contextDir)) {
      fs.mkdirSync(contextDir, { recursive: true });
    }

    for (const file of database.research_files) {
      const contextFile = path.join(contextDir, `enhanced-${file.filename}`);
      fs.writeFileSync(contextFile, file.processed_content);
    }

    console.log(`💾 Saved intelligence database to ${dbFile}`);
    console.log(`📂 Enhanced context files saved to ${contextDir}`);
    console.log(`📊 Processing summary: ${database.processing_summary.vector_db_readiness_score}% vector DB ready`);
  }
}