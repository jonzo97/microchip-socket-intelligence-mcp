import { SocketRequirements, QualificationResult, MchpSolution, CompetitiveAnalysis } from './types.js';

export interface SocketParameterTemplate {
  socket_type: string;
  critical_parameters: string[];
  performance_parameters: string[];
  differentiator_parameters: string[];
  must_have_parameters: string[];
}

export interface RequirementMatch {
  parameter: string;
  required_value: any;
  mchp_value: any;
  competitor_values: { [vendor: string]: any };
  match_score: number; // 0.0 to 1.0
  importance_weight: number; // 0.0 to 1.0
  competitive_advantage: boolean;
}

export class SocketQualificationEngine {
  private parameterTemplates: Map<string, SocketParameterTemplate> = new Map();
  private mchpPortfolio: Map<string, any> = new Map();
  private competitorData: Map<string, any> = new Map();

  constructor() {
    this.initializeParameterTemplates();
    this.initializeMchpPortfolio();
    this.initializeCompetitorData();
  }

  /**
   * Qualify a socket based on requirements and competitive landscape
   */
  async qualifySocket(
    socketType: string,
    requirements: SocketRequirements,
    application?: string,
    volume?: string,
    competition?: string[]
  ): Promise<QualificationResult> {
    console.log(`🎯 Qualifying ${socketType} socket for ${application || 'general application'}`);

    // Get parameter template for socket type
    const template = this.parameterTemplates.get(socketType.toUpperCase());
    if (!template) {
      throw new Error(`Socket type ${socketType} not supported`);
    }

    // Find best MCHP solution
    const mchpSolution = await this.findBestMchpSolution(socketType, requirements);
    
    // Analyze competitive position
    const competitiveAnalysis = await this.analyzeCompetitivePosition(
      socketType, 
      requirements, 
      mchpSolution,
      competition
    );

    // Calculate overall qualification score
    const qualificationScore = this.calculateQualificationScore(
      requirements,
      mchpSolution,
      competitiveAnalysis,
      template,
      volume
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      mchpSolution,
      competitiveAnalysis,
      requirements,
      application
    );

    return {
      qualification_score: qualificationScore,
      mchp_solution: mchpSolution,
      competitive_analysis: competitiveAnalysis,
      recommendations
    };
  }

  /**
   * Find best matching Microchip solution
   */
  private async findBestMchpSolution(
    socketType: string,
    requirements: SocketRequirements
  ): Promise<MchpSolution> {
    const solutions = this.mchpPortfolio.get(socketType.toUpperCase()) || [];
    
    let bestMatch: MchpSolution = {
      part: "No suitable solution found",
      match_percentage: 0,
      advantages: [],
      gaps: []
    };

    let bestScore = 0;

    for (const solution of solutions) {
      const score = this.calculateSolutionMatch(solution, requirements);
      if (score.match_percentage > bestScore) {
        bestScore = score.match_percentage;
        bestMatch = score;
      }
    }

    return bestMatch;
  }

  /**
   * Calculate how well a solution matches requirements
   */
  private calculateSolutionMatch(solution: any, requirements: SocketRequirements): MchpSolution {
    const matches: RequirementMatch[] = [];
    const advantages: string[] = [];
    const gaps: string[] = [];

    let totalScore = 0;
    let totalWeight = 0;

    for (const [param, reqValue] of Object.entries(requirements)) {
      if (solution.specs && solution.specs[param] !== undefined) {
        const match = this.evaluateParameterMatch(param, reqValue, solution.specs[param]);
        matches.push(match);
        
        totalScore += match.match_score * match.importance_weight;
        totalWeight += match.importance_weight;

        // Determine advantages and gaps
        if (match.match_score >= 1.0 && match.competitive_advantage) {
          advantages.push(`Superior ${param}: ${solution.specs[param]} vs required ${reqValue}`);
        } else if (match.match_score < 0.7) {
          gaps.push(`${param}: ${solution.specs[param]} vs required ${reqValue}`);
        }
      } else {
        gaps.push(`Missing specification: ${param}`);
      }
    }

    const matchPercentage = totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;

    return {
      part: solution.part_number || solution.name || "Unknown Part",
      match_percentage: matchPercentage,
      advantages,
      gaps
    };
  }

  /**
   * Evaluate how well a parameter matches requirements
   */
  private evaluateParameterMatch(
    parameter: string,
    requiredValue: any,
    actualValue: any,
    competitorValues?: { [vendor: string]: any }
  ): RequirementMatch {
    let matchScore = 0;
    let importanceWeight = 0.5; // Default weight
    let competitiveAdvantage = false;

    // Parameter-specific matching logic
    switch (parameter.toLowerCase()) {
      case 'clock_speed':
      case 'frequency':
      case 'max_frequency_mhz':
        matchScore = this.evaluateNumericParameter(requiredValue, actualValue, 'minimum');
        importanceWeight = 0.8;
        competitiveAdvantage = actualValue > requiredValue * 1.2;
        break;

      case 'flash_kb':
      case 'ram_kb':
      case 'memory_size':
        matchScore = this.evaluateNumericParameter(requiredValue, actualValue, 'minimum');
        importanceWeight = 0.9;
        competitiveAdvantage = actualValue > requiredValue * 1.5;
        break;

      case 'lut_count':
      case 'logic_cells':
        matchScore = this.evaluateNumericParameter(requiredValue, actualValue, 'minimum');
        importanceWeight = 0.95;
        competitiveAdvantage = actualValue > requiredValue * 1.3;
        break;

      case 'jitter_ps':
      case 'phase_noise_dbc':
        matchScore = this.evaluateNumericParameter(requiredValue, actualValue, 'maximum');
        importanceWeight = 0.7;
        competitiveAdvantage = actualValue < requiredValue * 0.8;
        break;

      case 'power_consumption':
      case 'quiescent_current':
        matchScore = this.evaluateNumericParameter(requiredValue, actualValue, 'maximum');
        importanceWeight = 0.6;
        competitiveAdvantage = actualValue < requiredValue * 0.7;
        break;

      case 'safety':
      case 'asil_level':
        matchScore = this.evaluateStringParameter(requiredValue, actualValue, [
          'ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D'
        ]);
        importanceWeight = 1.0;
        break;

      case 'peripherals':
      case 'interfaces':
        matchScore = this.evaluateArrayParameter(requiredValue, actualValue);
        importanceWeight = 0.8;
        break;

      default:
        // Generic string/numeric matching
        if (typeof requiredValue === 'number' && typeof actualValue === 'number') {
          matchScore = this.evaluateNumericParameter(requiredValue, actualValue, 'minimum');
        } else {
          matchScore = actualValue === requiredValue ? 1.0 : 0.0;
        }
        importanceWeight = 0.5;
    }

    return {
      parameter,
      required_value: requiredValue,
      mchp_value: actualValue,
      competitor_values: competitorValues || {},
      match_score: Math.max(0, Math.min(1, matchScore)),
      importance_weight: importanceWeight,
      competitive_advantage: competitiveAdvantage
    };
  }

  /**
   * Evaluate numeric parameter matching
   */
  private evaluateNumericParameter(
    required: number,
    actual: number,
    type: 'minimum' | 'maximum' | 'exact'
  ): number {
    switch (type) {
      case 'minimum':
        if (actual >= required) return 1.0;
        return Math.max(0, actual / required);
      
      case 'maximum':
        if (actual <= required) return 1.0;
        return Math.max(0, required / actual);
      
      case 'exact':
        const tolerance = 0.1; // 10% tolerance
        const diff = Math.abs(actual - required) / required;
        return diff <= tolerance ? 1.0 : Math.max(0, 1 - diff);
      
      default:
        return 0;
    }
  }

  /**
   * Evaluate string parameter matching (ordered preference)
   */
  private evaluateStringParameter(
    required: string,
    actual: string,
    orderedOptions?: string[]
  ): number {
    if (actual === required) return 1.0;
    
    if (orderedOptions) {
      const reqIndex = orderedOptions.indexOf(required);
      const actualIndex = orderedOptions.indexOf(actual);
      
      if (reqIndex !== -1 && actualIndex !== -1) {
        // For safety levels, higher is better
        return actualIndex >= reqIndex ? 1.0 : 0.5;
      }
    }
    
    return 0.0;
  }

  /**
   * Evaluate array parameter matching (required features subset)
   */
  private evaluateArrayParameter(required: string[], actual: string[]): number {
    if (!Array.isArray(required) || !Array.isArray(actual)) return 0;
    
    const matchedCount = required.filter(item => 
      actual.some(actualItem => 
        actualItem.toLowerCase().includes(item.toLowerCase()) ||
        item.toLowerCase().includes(actualItem.toLowerCase())
      )
    ).length;
    
    return required.length > 0 ? matchedCount / required.length : 1.0;
  }

  /**
   * Analyze competitive position
   */
  private async analyzeCompetitivePosition(
    socketType: string,
    requirements: SocketRequirements,
    mchpSolution: MchpSolution,
    competition?: string[]
  ): Promise<CompetitiveAnalysis> {
    let winProbability = 0.5; // Default
    let displacementDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
    const keyDifferentiators: string[] = [];

    // Socket-specific win probability adjustments
    const socketWinRates = {
      'TSN_NETWORKING': 0.85,
      'SERIAL_EEPROM': 0.92,
      'POE_CONTROLLERS': 0.76,
      'MOTOR_CONTROL_DSC': 0.78,
      'CRYPTO_AUTH': 0.73,
      'SIC_GATE_DRIVERS': 0.70,
      'WIFI': 0.18,
      'BLUETOOTH': 0.22,
      'MCU': 0.45,
      'ANALOG': 0.55,
      'POWER': 0.60
    };

    // Determine application-based win probability
    const appType = this.categorizeApplication(socketType, requirements);
    winProbability = (socketWinRates as any)[appType] || (socketWinRates as any)[socketType.toUpperCase()] || 0.5;

    // Adjust based on solution match quality
    const matchAdjustment = (mchpSolution.match_percentage - 70) / 100;
    winProbability = Math.max(0.1, Math.min(0.95, winProbability + matchAdjustment));

    // Determine difficulty based on competition
    if (competition?.includes('Broadcom') || competition?.includes('Intel')) {
      displacementDifficulty = 'hard';
      winProbability *= 0.8;
    } else if (competition?.includes('TI') || competition?.includes('STM')) {
      displacementDifficulty = 'medium';
      winProbability *= 0.9;
    }

    // Key differentiators based on advantages
    if (mchpSolution.advantages.length > 0) {
      keyDifferentiators.push(...mchpSolution.advantages.slice(0, 3));
    } else {
      keyDifferentiators.push("Comprehensive ecosystem support", "Local FAE technical support");
    }

    return {
      win_probability: Math.round(winProbability * 100) / 100,
      displacement_difficulty: displacementDifficulty,
      key_differentiators: keyDifferentiators
    };
  }

  /**
   * Categorize application type for win probability lookup
   */
  private categorizeApplication(socketType: string, requirements: SocketRequirements): string {
    // Check for specific high-value applications
    if (requirements.tsn_support || requirements.ieee_1588) return 'TSN_NETWORKING';
    if (requirements.poe || requirements.power_over_ethernet) return 'POE_CONTROLLERS';
    if (requirements.motor_control || requirements.dsp_instructions) return 'MOTOR_CONTROL_DSC';
    if (requirements.crypto || requirements.security) return 'CRYPTO_AUTH';
    if (requirements.sic || requirements.gate_driver) return 'SIC_GATE_DRIVERS';
    if (requirements.wifi || requirements.wireless) return 'WIFI';
    if (requirements.bluetooth || requirements.ble) return 'BLUETOOTH';
    
    return socketType.toUpperCase();
  }

  /**
   * Calculate overall qualification score
   */
  private calculateQualificationScore(
    requirements: SocketRequirements,
    mchpSolution: MchpSolution,
    competitiveAnalysis: CompetitiveAnalysis,
    template: SocketParameterTemplate,
    volume?: string
  ): number {
    const weights = {
      technical_match: 0.4,
      competitive_position: 0.3,
      commercial_viability: 0.2,
      ecosystem_support: 0.1
    };

    const scores = {
      technical_match: mchpSolution.match_percentage / 100,
      competitive_position: competitiveAnalysis.win_probability,
      commercial_viability: this.calculateCommercialScore(volume, mchpSolution),
      ecosystem_support: 0.8 // Microchip generally strong here
    };

    const overallScore = Object.entries(scores).reduce((acc, [key, score]) => {
      return acc + score * weights[key as keyof typeof weights];
    }, 0);

    return Math.round(overallScore * 100) / 100;
  }

  /**
   * Calculate commercial viability score
   */
  private calculateCommercialScore(volume?: string, solution?: MchpSolution): number {
    let score = 0.7; // Base score

    // Volume considerations
    if (volume === 'high') score += 0.2;
    else if (volume === 'medium') score += 0.1;
    else if (volume === 'prototype') score -= 0.1;

    // Solution availability
    if (solution && solution.match_percentage > 80) score += 0.1;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Generate recommendations based on qualification results
   */
  private generateRecommendations(
    mchpSolution: MchpSolution,
    competitiveAnalysis: CompetitiveAnalysis,
    requirements: SocketRequirements,
    application?: string
  ): string[] {
    const recommendations: string[] = [];

    // Technical recommendations
    if (mchpSolution.gaps.length > 0) {
      recommendations.push(`Address technical gaps: ${mchpSolution.gaps.slice(0, 2).join(', ')}`);
    }

    // Competitive positioning
    if (competitiveAnalysis.win_probability < 0.6) {
      recommendations.push("Consider bundling with complementary products for system solution");
      recommendations.push("Emphasize total cost of ownership advantages");
    }

    // Application-specific recommendations
    if (application?.toLowerCase().includes('automotive')) {
      recommendations.push("Highlight automotive qualification and AEC-Q100 compliance");
    }

    if (requirements.safety || requirements.asil_level) {
      recommendations.push("Partner with functional safety consultant if needed");
    }

    // Always include ecosystem advantage
    recommendations.push("Leverage comprehensive development ecosystem and local support");

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  /**
   * Initialize parameter templates from socket-parameter-templates.md
   */
  private initializeParameterTemplates(): void {
    // MCU Template
    this.parameterTemplates.set('MCU', {
      socket_type: 'MCU',
      critical_parameters: ['clock_speed', 'flash_kb', 'ram_kb', 'core_architecture'],
      performance_parameters: ['dmips', 'coremark_score', 'peripherals'],
      differentiator_parameters: ['dsp_instructions', 'fpu', 'security', 'safety'],
      must_have_parameters: ['core_architecture', 'clock_speed', 'flash_kb']
    });

    // FPGA Template  
    this.parameterTemplates.set('FPGA', {
      socket_type: 'FPGA',
      critical_parameters: ['lut_count', 'block_ram', 'dsp_slices', 'io_banks'],
      performance_parameters: ['system_fmax', 'transceiver_speed', 'hard_ip'],
      differentiator_parameters: ['ultraram', 'hard_processors', 'ai_engines'],
      must_have_parameters: ['lut_count', 'io_banks']
    });

    // Add more templates for other socket types...
  }

  /**
   * Initialize Microchip portfolio data
   */
  private initializeMchpPortfolio(): void {
    // MCU Portfolio
    this.mchpPortfolio.set('MCU', [
      {
        part_number: 'SAME70Q21B',
        specs: {
          core_architecture: 'ARM Cortex-M7',
          clock_speed: 300,
          flash_kb: 2048,
          ram_kb: 384,
          peripherals: ['CAN-FD', 'Ethernet', 'USB', 'QSPI'],
          dsp_instructions: true,
          fpu: 'single_precision',
          safety: 'ASIL-B_ready'
        }
      },
      {
        part_number: 'dsPIC33CK256MP508',
        specs: {
          core_architecture: 'dsPIC33C',
          clock_speed: 100,
          flash_kb: 256,
          ram_kb: 32,
          peripherals: ['CAN-FD', 'SPI', 'I2C', 'UART'],
          dsp_instructions: true,
          motor_control: true,
          safety: 'ASIL-B_ready'
        }
      }
    ]);

    // Add more portfolio data...
  }

  /**
   * Initialize competitor data
   */
  private initializeCompetitorData(): void {
    // Competitor portfolio and capabilities
    this.competitorData.set('TI', {
      strengths: ['analog_portfolio', 'processor_performance'],
      weaknesses: ['ecosystem_complexity', 'support_quality'],
      key_products: ['C2000', 'MSP432', 'Sitara']
    });

    this.competitorData.set('STM', {
      strengths: ['cortex_m_portfolio', 'development_tools'],
      weaknesses: ['analog_integration', 'power_efficiency'],
      key_products: ['STM32F4', 'STM32H7', 'STM32MP1']
    });

    // Add more competitor data...
  }
}