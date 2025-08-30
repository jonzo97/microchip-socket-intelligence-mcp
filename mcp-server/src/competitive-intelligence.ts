import * as fs from 'fs';
import * as path from 'path';

export interface CompetitivePartData {
  part_number: string;
  vendor: string;
  socket_type: string;
  key_specs: { [parameter: string]: any };
  market_position: 'leader' | 'challenger' | 'follower' | 'niche';
  strengths: string[];
  weaknesses: string[];
  typical_applications: string[];
  win_rate_vs_mchp: number;
  pricing_tier: 'premium' | 'mainstream' | 'value';
}

export interface MchpPartData {
  part_number: string;
  family: string;
  socket_type: string;
  key_specs: { [parameter: string]: any };
  competitive_advantages: string[];
  known_gaps: string[];
  typical_applications: string[];
  design_wins: string[];
  reference_designs: string[];
  recommended_bundles: string[];
}

export interface SocketCompetitiveLandscape {
  socket_name: string;
  total_market_size_m: number;
  mchp_market_share: number;
  key_competitors: {
    vendor: string;
    market_share: number;
    key_advantages: string[];
    vulnerability_points: string[];
  }[];
  win_loss_patterns: {
    win_factors: string[];
    loss_factors: string[];
    typical_win_rate: number;
  };
}

export class CompetitiveIntelligenceEngine {
  private mchpPortfolio: Map<string, MchpPartData[]> = new Map();
  private competitorPortfolio: Map<string, CompetitivePartData[]> = new Map();
  private socketLandscapes: Map<string, SocketCompetitiveLandscape> = new Map();
  private initialized = false;

  constructor() {
    this.initializeCompetitiveIntelligence();
  }

  /**
   * Get competitive analysis for a specific socket
   */
  async getSocketCompetitiveAnalysis(
    socketType: string,
    requirements: any,
    targetCompetitors?: string[]
  ): Promise<{
    mchp_solutions: MchpPartData[];
    competitor_solutions: CompetitivePartData[];
    competitive_matrix: any;
    win_probability: number;
    recommendations: string[];
  }> {
    
    // Find matching MCHP solutions
    const mchpSolutions = this.findMatchingMchpSolutions(socketType, requirements);
    
    // Find competing solutions
    const competitorSolutions = this.findCompetingSolutions(socketType, requirements, targetCompetitors);
    
    // Create competitive matrix
    const competitiveMatrix = this.createCompetitiveMatrix(mchpSolutions, competitorSolutions, requirements);
    
    // Calculate win probability
    const winProbability = this.calculateWinProbability(socketType, competitiveMatrix);
    
    // Generate strategic recommendations
    const recommendations = this.generateCompetitiveRecommendations(competitiveMatrix, socketType);

    return {
      mchp_solutions: mchpSolutions,
      competitor_solutions: competitorSolutions,
      competitive_matrix: competitiveMatrix,
      win_probability: winProbability,
      recommendations: recommendations
    };
  }

  /**
   * Find matching Microchip solutions
   */
  private findMatchingMchpSolutions(socketType: string, requirements: any): MchpPartData[] {
    const solutions = this.mchpPortfolio.get(socketType.toUpperCase()) || [];
    
    return solutions.filter(solution => {
      // Basic requirement matching
      return this.evaluateSolutionMatch(solution.key_specs, requirements) > 0.6;
    }).sort((a, b) => {
      // Sort by match quality
      const scoreA = this.evaluateSolutionMatch(a.key_specs, requirements);
      const scoreB = this.evaluateSolutionMatch(b.key_specs, requirements);
      return scoreB - scoreA;
    });
  }

  /**
   * Find competing solutions
   */
  private findCompetingSolutions(
    socketType: string,
    requirements: any,
    targetCompetitors?: string[]
  ): CompetitivePartData[] {
    let solutions: CompetitivePartData[] = [];
    
    // Get all competitor solutions for this socket type
    this.competitorPortfolio.forEach((parts, vendor) => {
      const vendorSolutions = parts.filter(part => 
        part.socket_type.toUpperCase() === socketType.toUpperCase() &&
        (!targetCompetitors || targetCompetitors.includes(vendor)) &&
        this.evaluateSolutionMatch(part.key_specs, requirements) > 0.5
      );
      solutions.push(...vendorSolutions);
    });

    return solutions.sort((a, b) => {
      const scoreA = this.evaluateSolutionMatch(a.key_specs, requirements);
      const scoreB = this.evaluateSolutionMatch(b.key_specs, requirements);
      return scoreB - scoreA;
    });
  }

  /**
   * Create competitive comparison matrix
   */
  private createCompetitiveMatrix(
    mchpSolutions: MchpPartData[],
    competitorSolutions: CompetitivePartData[],
    requirements: any
  ): any {
    const matrix = {
      requirement_coverage: {},
      parameter_comparison: {},
      competitive_advantages: {},
      gap_analysis: {}
    };

    // Analyze each requirement
    for (const [param, reqValue] of Object.entries(requirements)) {
      (matrix.requirement_coverage as any)[param] = {
        microchip: this.analyzeParameterCoverage(mchpSolutions, param, reqValue),
        competitors: this.analyzeCompetitorParameterCoverage(competitorSolutions, param, reqValue)
      };
    }

    // Overall competitive positioning
    matrix.competitive_advantages = this.identifyCompetitiveAdvantages(mchpSolutions, competitorSolutions);
    matrix.gap_analysis = this.identifyCompetitiveGaps(mchpSolutions, competitorSolutions);

    return matrix;
  }

  /**
   * Calculate win probability based on competitive analysis
   */
  private calculateWinProbability(socketType: string, competitiveMatrix: any): number {
    // Base win rates by socket type (from your research)
    const baseWinRates: { [key: string]: number } = {
      'TSN_NETWORKING': 0.85,
      'SERIAL_EEPROM': 0.92,
      'POE_CONTROLLERS': 0.76,
      'MOTOR_CONTROL_DSC': 0.78,
      'CRYPTO_AUTH': 0.73,
      'SIC_GATE_DRIVERS': 0.70,
      'PRECISION_ANALOG': 0.65,
      'MCU': 0.45,
      'FPGA': 0.35,
      'WIFI': 0.18,
      'BLUETOOTH': 0.22
    };

    let winProbability = baseWinRates[socketType.toUpperCase()] || 0.5;

    // Adjust based on competitive advantages
    const advantageCount = Object.keys(competitiveMatrix.competitive_advantages).length;
    const gapCount = Object.keys(competitiveMatrix.gap_analysis).length;

    winProbability += (advantageCount * 0.05) - (gapCount * 0.03);

    return Math.max(0.1, Math.min(0.95, winProbability));
  }

  /**
   * Generate competitive recommendations
   */
  private generateCompetitiveRecommendations(competitiveMatrix: any, socketType: string): string[] {
    const recommendations: string[] = [];

    // Analyze advantages and gaps
    const advantages = competitiveMatrix.competitive_advantages;
    const gaps = competitiveMatrix.gap_analysis;

    // Leverage advantages
    if (advantages.ecosystem) {
      recommendations.push("Emphasize comprehensive development ecosystem advantage");
    }
    if (advantages.integration) {
      recommendations.push("Highlight integrated solution benefits vs. multi-vendor approach");
    }
    if (advantages.support) {
      recommendations.push("Leverage local FAE support as key differentiator");
    }

    // Address gaps
    if (gaps.performance) {
      recommendations.push("Consider performance benchmarking to validate requirements");
    }
    if (gaps.features) {
      recommendations.push("Explore system-level solution to overcome feature gaps");
    }
    if (gaps.cost) {
      recommendations.push("Develop total cost of ownership narrative");
    }

    // Socket-specific recommendations
    switch (socketType.toUpperCase()) {
      case 'MCU':
        recommendations.push("Bundle with complementary analog and interface products");
        break;
      case 'FPGA':
        recommendations.push("Partner with FPGA vendor or focus on mixed-signal applications");
        break;
      case 'ANALOG':
        recommendations.push("Emphasize precision and integration advantages");
        break;
    }

    return recommendations.slice(0, 5);
  }

  /**
   * Initialize competitive intelligence from research files
   */
  private async initializeCompetitiveIntelligence(): Promise<void> {
    if (this.initialized) return;

    // Load MCHP portfolio data
    await this.loadMchpPortfolioData();
    
    // Load competitor intelligence
    await this.loadCompetitorData();
    
    // Load socket landscape analysis
    await this.loadSocketLandscapes();

    this.initialized = true;
  }

  /**
   * Load Microchip portfolio data from knowledge base
   */
  private async loadMchpPortfolioData(): Promise<void> {
    // MCU Portfolio
    const mcuPortfolio: MchpPartData[] = [
      {
        part_number: 'SAME70Q21B',
        family: 'SAM E70',
        socket_type: 'MCU',
        key_specs: {
          core: 'ARM Cortex-M7',
          clock_mhz: 300,
          flash_kb: 2048,
          sram_kb: 384,
          package: 'LQFP144',
          peripherals: ['CAN-FD', 'Ethernet', 'USB', 'QSPI', 'UART', 'SPI', 'I2C'],
          operating_voltage: '1.62V-3.6V',
          temp_range: '-40°C to +85°C'
        },
        competitive_advantages: [
          'Integrated Ethernet MAC+PHY solution',
          'Hardware cryptographic engine',
          'Comprehensive development ecosystem',
          'Superior CAN-FD implementation'
        ],
        known_gaps: [
          'No integrated WiFi/Bluetooth',
          'Limited AI/ML acceleration',
          'Higher power vs ultra-low power competitors'
        ],
        typical_applications: ['Industrial automation', 'Automotive gateway', 'IoT gateway'],
        design_wins: ['Tier-1 automotive supplier BMS', 'Industrial PLC manufacturer'],
        reference_designs: ['SAM E70 Ethernet Gateway', 'CAN-FD Bridge Reference'],
        recommended_bundles: ['KSZ8081 Ethernet PHY', 'ATECC608 Crypto Auth']
      },
      {
        part_number: 'dsPIC33CK256MP508',
        family: 'dsPIC33C',
        socket_type: 'MCU',
        key_specs: {
          core: 'dsPIC33C',
          clock_mhz: 100,
          flash_kb: 256,
          sram_kb: 32,
          dsp_engine: true,
          motor_control_pwm: '16-channel',
          peripherals: ['CAN-FD', 'SPI', 'I2C', 'UART', 'ADC', 'Comparator'],
          operating_voltage: '2.3V-3.6V'
        },
        competitive_advantages: [
          'Integrated motor control PWM',
          'Hardware DSP engine',
          'Best-in-class CAN-FD timestamping',
          'Deterministic interrupt response'
        ],
        known_gaps: [
          'Lower ARM ecosystem adoption',
          'Limited third-party software',
          'Proprietary architecture learning curve'
        ],
        typical_applications: ['Motor control', 'Power conversion', 'Digital power'],
        design_wins: ['Industrial servo drive', 'EV charger controller'],
        reference_designs: ['Motor Control Reference', 'Digital Power Reference'],
        recommended_bundles: ['MCP6L92 OpAmp', 'MCP3561 ADC']
      }
    ];

    this.mchpPortfolio.set('MCU', mcuPortfolio);

    // Analog Portfolio
    const analogPortfolio: MchpPartData[] = [
      {
        part_number: 'MCP6L92',
        family: 'MCP6L',
        socket_type: 'ANALOG',
        key_specs: {
          type: 'Precision OpAmp',
          channels: 2,
          gbw_mhz: 10,
          offset_voltage_uv: 150,
          noise_nv_sqrthz: 8.7,
          supply_voltage: '1.8V-5.5V',
          quiescent_current_ua: 850,
          rail_to_rail: 'Input and Output'
        },
        competitive_advantages: [
          'Best-in-class offset voltage',
          'Excellent CMRR performance',
          'Wide supply voltage range',
          'Superior temperature stability'
        ],
        known_gaps: [
          'Higher power vs nanopower competitors',
          'Limited high-speed variants',
          'Package options vs competitors'
        ],
        typical_applications: ['Precision sensing', 'Signal conditioning', 'Medical devices'],
        design_wins: ['Medical device manufacturer', 'Industrial sensor module'],
        reference_designs: ['Precision Thermocouple Amplifier', 'Current Sense Reference'],
        recommended_bundles: ['MCP3561 24-bit ADC', 'MCP1826 LDO']
      }
    ];

    this.mchpPortfolio.set('ANALOG', analogPortfolio);
  }

  /**
   * Load competitor data
   */
  private async loadCompetitorData(): Promise<void> {
    // TI Competitors
    const tiParts: CompetitivePartData[] = [
      {
        part_number: 'TMS320F28379D',
        vendor: 'TI',
        socket_type: 'MCU',
        key_specs: {
          core: 'C28x DSP + ARM Cortex-M4',
          clock_mhz: 200,
          flash_kb: 1024,
          sram_kb: 204,
          dsp_engine: true,
          motor_control_pwm: '24-channel',
          peripherals: ['CAN', 'USB', 'SPI', 'I2C', 'UART', 'ADC']
        },
        market_position: 'leader',
        strengths: [
          'Dual-core architecture',
          'Extensive motor control library',
          'Large ecosystem',
          'High-performance DSP'
        ],
        weaknesses: [
          'Complex development environment',
          'Higher learning curve',
          'Limited CAN-FD support',
          'Power consumption'
        ],
        typical_applications: ['Motor control', 'Digital power', 'Solar inverters'],
        win_rate_vs_mchp: 0.65,
        pricing_tier: 'premium'
      }
    ];

    this.competitorPortfolio.set('TI', tiParts);

    // STMicroelectronics
    const stmParts: CompetitivePartData[] = [
      {
        part_number: 'STM32H743VIT6',
        vendor: 'STM',
        socket_type: 'MCU',
        key_specs: {
          core: 'ARM Cortex-M7',
          clock_mhz: 480,
          flash_kb: 2048,
          sram_kb: 1024,
          peripherals: ['CAN-FD', 'Ethernet', 'USB', 'QSPI', 'UART', 'SPI', 'I2C'],
          operating_voltage: '1.62V-3.6V'
        },
        market_position: 'leader',
        strengths: [
          'Highest performance Cortex-M7',
          'Large memory configuration',
          'Comprehensive STM32Cube ecosystem',
          'Wide product portfolio'
        ],
        weaknesses: [
          'Complex pin multiplexing',
          'Limited differentiation',
          'Support quality inconsistency',
          'Supply chain issues'
        ],
        typical_applications: ['Industrial automation', 'Medical devices', 'Consumer electronics'],
        win_rate_vs_mchp: 0.58,
        pricing_tier: 'mainstream'
      }
    ];

    this.competitorPortfolio.set('STM', stmParts);
  }

  /**
   * Load socket landscape data from research files
   */
  private async loadSocketLandscapes(): Promise<void> {
    // TSN Networking Socket
    this.socketLandscapes.set('TSN_NETWORKING', {
      socket_name: 'TSN Ethernet Switching',
      total_market_size_m: 850,
      mchp_market_share: 0.15,
      key_competitors: [
        {
          vendor: 'Broadcom',
          market_share: 0.45,
          key_advantages: ['Market leadership', 'Complete portfolio', 'Hyperscale wins'],
          vulnerability_points: ['Complex integration', 'Limited automotive focus', 'High cost']
        },
        {
          vendor: 'Marvell',
          market_share: 0.25,
          key_advantages: ['Alaska PHY integration', 'Automotive focus', 'IEEE leadership'],
          vulnerability_points: ['Limited software support', 'Integration complexity', 'Support quality']
        }
      ],
      win_loss_patterns: {
        win_factors: ['TSN expertise', 'Complete reference design', 'Single vendor solution', 'IEEE 802.1AS leadership'],
        loss_factors: ['Incumbent relationships', 'Performance requirements', 'Custom features needed'],
        typical_win_rate: 0.85
      }
    });

    // Motor Control DSC Socket
    this.socketLandscapes.set('MOTOR_CONTROL_DSC', {
      socket_name: 'Motor Control DSCs',
      total_market_size_m: 1200,
      mchp_market_share: 0.22,
      key_competitors: [
        {
          vendor: 'TI',
          market_share: 0.35,
          key_advantages: ['C2000 ecosystem', 'Performance leadership', 'Software libraries'],
          vulnerability_points: ['Development complexity', 'Support costs', 'CAN-FD limitations']
        },
        {
          vendor: 'Infineon',
          market_share: 0.18,
          key_advantages: ['Automotive focus', 'Safety certification', 'AURIX platform'],
          vulnerability_points: ['Limited industrial focus', 'Cost premium', 'Complex tools']
        }
      ],
      win_loss_patterns: {
        win_factors: ['Integrated CAN-FD', 'Easier development', 'Better support', 'Cost advantage'],
        loss_factors: ['Performance requirements', 'Ecosystem lock-in', 'Custom DSP needs'],
        typical_win_rate: 0.78
      }
    });
  }

  // Helper methods for analysis
  private evaluateSolutionMatch(specs: any, requirements: any): number {
    // Simple matching logic - can be enhanced
    let matches = 0;
    let total = 0;

    for (const [param, reqValue] of Object.entries(requirements)) {
      total++;
      if (specs[param] !== undefined) {
        // Implement parameter-specific matching logic
        matches += this.compareParameter(param, reqValue, specs[param]);
      }
    }

    return total > 0 ? matches / total : 0;
  }

  private compareParameter(param: string, required: any, actual: any): number {
    // Parameter-specific comparison logic
    if (typeof required === 'number' && typeof actual === 'number') {
      return actual >= required ? 1 : actual / required;
    } else if (typeof required === 'string' && typeof actual === 'string') {
      return actual.toLowerCase().includes(required.toLowerCase()) ? 1 : 0;
    } else if (Array.isArray(required) && Array.isArray(actual)) {
      const matches = required.filter(item => actual.includes(item)).length;
      return required.length > 0 ? matches / required.length : 1;
    }
    return required === actual ? 1 : 0;
  }

  private analyzeParameterCoverage(solutions: MchpPartData[], param: string, reqValue: any): any {
    return solutions.map(sol => ({
      part: sol.part_number,
      value: sol.key_specs[param],
      match_score: this.compareParameter(param, reqValue, sol.key_specs[param])
    }));
  }

  private analyzeCompetitorParameterCoverage(solutions: CompetitivePartData[], param: string, reqValue: any): any {
    return solutions.map(sol => ({
      vendor: sol.vendor,
      part: sol.part_number,
      value: sol.key_specs[param],
      match_score: this.compareParameter(param, reqValue, sol.key_specs[param])
    }));
  }

  private identifyCompetitiveAdvantages(mchpSolutions: MchpPartData[], competitorSolutions: CompetitivePartData[]): any {
    const advantages: any = {};

    // Analyze advantages from MCHP solutions
    mchpSolutions.forEach(solution => {
      solution.competitive_advantages.forEach(advantage => {
        (advantages as any)[advantage] = true;
      });
    });

    return advantages;
  }

  private identifyCompetitiveGaps(mchpSolutions: MchpPartData[], competitorSolutions: CompetitivePartData[]): any {
    const gaps: any = {};

    // Analyze gaps from MCHP solutions
    mchpSolutions.forEach(solution => {
      solution.known_gaps.forEach(gap => {
        (gaps as any)[gap] = true;
      });
    });

    return gaps;
  }
}