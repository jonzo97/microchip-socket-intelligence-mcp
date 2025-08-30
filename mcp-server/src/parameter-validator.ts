// Comprehensive Socket Parameter Validation Engine
// Prevents impossible requirements, detects conflicts, and provides intelligent suggestions

import { SocketRequirements, BlockDiagramRequirements } from './types.js';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  correctedRequirements?: SocketRequirements;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'critical' | 'high' | 'medium';
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  impact: string;
}

export interface ValidationSuggestion {
  field: string;
  currentValue: any;
  suggestedValue: any;
  reason: string;
  confidence: number; // 0-1
}

export interface SocketLimitations {
  max_flash_kb: number;
  max_sram_kb: number;
  max_clock_mhz: number;
  supported_peripherals: string[];
  package_options: string[];
  voltage_ranges: string[];
  temperature_ranges: string[];
  certifications_available: string[];
}

/**
 * Advanced Socket Parameter Validation Engine
 */
export class ParameterValidator {
  private socketLimitations: Map<string, SocketLimitations>;
  private conflictRules: ConflictRule[];
  private mchpPortfolioData: any;

  constructor() {
    this.socketLimitations = new Map();
    this.conflictRules = [];
    this.initializeSocketLimitations();
    this.initializeConflictRules();
    this.loadMchpPortfolioData();
  }

  /**
   * Comprehensive requirement validation with intelligent suggestions
   */
  async validateSocketRequirements(
    requirements: SocketRequirements,
    application?: string,
    marketSegment?: string
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // 1. Basic type and range validation
    await this.validateBasicRequirements(requirements, result);

    // 2. Socket-specific limitations
    await this.validateSocketLimitations(requirements, result);

    // 3. Peripheral compatibility validation
    await this.validatePeripheralCompatibility(requirements, result);

    // 4. Conflict detection (mutually exclusive requirements)
    await this.detectConflicts(requirements, result);

    // 5. Market segment appropriateness
    if (marketSegment) {
      await this.validateMarketSegmentFit(requirements, marketSegment, result);
    }

    // 6. Application-specific validation
    if (application) {
      await this.validateApplicationFit(requirements, application, result);
    }

    // 7. Generate intelligent suggestions
    await this.generateIntelligentSuggestions(requirements, application, marketSegment, result);

    // 8. Attempt automatic correction for minor issues
    if (result.errors.length === 0 && result.suggestions.length > 0) {
      result.correctedRequirements = await this.generateCorrectedRequirements(requirements, result.suggestions);
    }

    result.valid = result.errors.filter(e => e.severity === 'critical').length === 0;

    return result;
  }

  /**
   * Validate block diagram requirements
   */
  async validateBlockDiagramRequirements(
    requirements: BlockDiagramRequirements,
    application?: string
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Performance tier validation
    if (requirements.performance_tier) {
      const validTiers = ['entry', 'mainstream', 'high_performance'];
      if (!validTiers.includes(requirements.performance_tier)) {
        result.errors.push({
          field: 'performance_tier',
          message: `Invalid performance tier '${requirements.performance_tier}'. Valid options: ${validTiers.join(', ')}`,
          severity: 'high',
          code: 'INVALID_PERFORMANCE_TIER'
        });
      }
    }

    // Certification validation
    if (requirements.certifications) {
      await this.validateCertifications(requirements.certifications, application, result);
    }

    // Special features validation
    if (requirements.special_features) {
      await this.validateSpecialFeatures(requirements.special_features, result);
    }

    result.valid = result.errors.filter(e => e.severity === 'critical').length === 0;
    return result;
  }

  /**
   * Basic type and range validation
   */
  private async validateBasicRequirements(requirements: SocketRequirements, result: ValidationResult): Promise<void> {
    // Flash memory validation
    if (requirements.flash_kb !== undefined) {
      if (typeof requirements.flash_kb !== 'number' || requirements.flash_kb <= 0) {
        result.errors.push({
          field: 'flash_kb',
          message: 'Flash memory must be a positive number in KB',
          severity: 'critical',
          code: 'INVALID_FLASH_SIZE'
        });
      } else if (requirements.flash_kb > 8192) {
        result.warnings.push({
          field: 'flash_kb',
          message: 'Flash size >8MB is very unusual for MCUs',
          impact: 'May limit socket options or require external memory'
        });
      }
    }

    // SRAM validation
    if (requirements.sram_kb !== undefined) {
      if (typeof requirements.sram_kb !== 'number' || requirements.sram_kb <= 0) {
        result.errors.push({
          field: 'sram_kb',
          message: 'SRAM must be a positive number in KB',
          severity: 'critical',
          code: 'INVALID_SRAM_SIZE'
        });
      }
    }

    // Clock frequency validation
    if (requirements.max_clock_mhz !== undefined) {
      if (typeof requirements.max_clock_mhz !== 'number' || requirements.max_clock_mhz <= 0) {
        result.errors.push({
          field: 'max_clock_mhz',
          message: 'Clock frequency must be a positive number in MHz',
          severity: 'critical',
          code: 'INVALID_CLOCK_FREQ'
        });
      } else if (requirements.max_clock_mhz > 1000) {
        result.warnings.push({
          field: 'max_clock_mhz',
          message: 'Clock >1GHz is unusual for MCUs, consider if this should be a processor/SoC',
          impact: 'May require different socket category'
        });
      }
    }

    // Package validation
    if (requirements.package && typeof requirements.package !== 'string') {
      result.errors.push({
        field: 'package',
        message: 'Package must be a string (e.g., "LQFP144", "BGA256")',
        severity: 'high',
        code: 'INVALID_PACKAGE_TYPE'
      });
    }

    // Socket type validation
    if (requirements.socket_type) {
      const validTypes = ['MCU', 'Analog', 'Power', 'Interface', 'RF', 'Memory', 'Clock', 'FPGA'];
      if (!validTypes.includes(requirements.socket_type)) {
        result.errors.push({
          field: 'socket_type',
          message: `Invalid socket type '${requirements.socket_type}'. Valid types: ${validTypes.join(', ')}`,
          severity: 'critical',
          code: 'INVALID_SOCKET_TYPE'
        });
      }
    }
  }

  /**
   * Validate against socket-specific limitations
   */
  private async validateSocketLimitations(requirements: SocketRequirements, result: ValidationResult): Promise<void> {
    const socketType = requirements.socket_type || 'MCU';
    const limitations = this.socketLimitations.get(socketType);

    if (!limitations) return;

    // Flash limitations
    if (requirements.flash_kb && requirements.flash_kb > limitations.max_flash_kb) {
      result.errors.push({
        field: 'flash_kb',
        message: `${socketType} sockets typically have max ${limitations.max_flash_kb}KB flash. Requested: ${requirements.flash_kb}KB`,
        severity: 'high',
        code: 'EXCEEDS_FLASH_LIMIT'
      });
    }

    // SRAM limitations  
    if (requirements.sram_kb && requirements.sram_kb > limitations.max_sram_kb) {
      result.errors.push({
        field: 'sram_kb',
        message: `${socketType} sockets typically have max ${limitations.max_sram_kb}KB SRAM. Requested: ${requirements.sram_kb}KB`,
        severity: 'high',
        code: 'EXCEEDS_SRAM_LIMIT'
      });
    }

    // Clock limitations
    if (requirements.max_clock_mhz && requirements.max_clock_mhz > limitations.max_clock_mhz) {
      result.errors.push({
        field: 'max_clock_mhz',
        message: `${socketType} sockets typically have max ${limitations.max_clock_mhz}MHz clock. Requested: ${requirements.max_clock_mhz}MHz`,
        severity: 'medium',
        code: 'EXCEEDS_CLOCK_LIMIT'
      });
    }

    // Peripheral support
    if (requirements.peripherals) {
      const unsupportedPeripherals = requirements.peripherals.filter((p: string) => 
        !limitations.supported_peripherals.some((sp: string) => 
          sp.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(sp.toLowerCase())
        )
      );
      
      if (unsupportedPeripherals.length > 0) {
        result.warnings.push({
          field: 'peripherals',
          message: `These peripherals may have limited support in ${socketType} sockets: ${unsupportedPeripherals.join(', ')}`,
          impact: 'May require external components or different socket type'
        });
      }
    }
  }

  /**
   * Validate peripheral compatibility
   */
  private async validatePeripheralCompatibility(requirements: SocketRequirements, result: ValidationResult): Promise<void> {
    if (!requirements.peripherals) return;

    const peripherals = requirements.peripherals.map((p: string) => p.toLowerCase());

    // Check for conflicting peripherals
    const conflicts = [
      { group: ['wifi', 'bluetooth'], message: 'WiFi and Bluetooth often require integrated wireless MCU or separate radio modules' },
      { group: ['can-fd', 'lin'], message: 'CAN-FD and LIN can coexist but verify pin count requirements' },
      { group: ['ethernet', 'wifi'], message: 'Dual networking (Ethernet + WiFi) increases complexity and power consumption' },
      { group: ['usb', 'usb-otg'], message: 'USB and USB-OTG are mutually exclusive features' }
    ];

    for (const conflict of conflicts) {
      const matchingPeripherals = conflict.group.filter((p: string) => 
        peripherals.some((req: string) => req.includes(p))
      );
      
      if (matchingPeripherals.length > 1) {
        result.warnings.push({
          field: 'peripherals',
          message: conflict.message,
          impact: 'May require careful pin planning or external components'
        });
      }
    }

    // Check for high pin count requirements
    const highPinPeripherals = peripherals.filter((p: string) => 
      ['ethernet', 'usb', 'can-fd', 'camera', 'lcd', 'sdio'].some((hp: string) => p.includes(hp))
    );

    if (highPinPeripherals.length > 2) {
      result.warnings.push({
        field: 'peripherals',
        message: `High pin count peripherals (${highPinPeripherals.join(', ')}) may require larger packages`,
        impact: 'Consider BGA packages or external interface chips'
      });
    }
  }

  /**
   * Detect requirement conflicts
   */
  private async detectConflicts(requirements: SocketRequirements, result: ValidationResult): Promise<void> {
    for (const rule of this.conflictRules) {
      if (rule.condition(requirements)) {
        result.errors.push({
          field: rule.fields.join(', '),
          message: rule.message,
          severity: rule.severity,
          code: rule.code
        });
      }
    }

    // Memory ratio validation
    if (requirements.flash_kb && requirements.sram_kb) {
      const ratio = requirements.flash_kb / requirements.sram_kb;
      if (ratio < 2) {
        result.warnings.push({
          field: 'flash_kb, sram_kb',
          message: `Flash/SRAM ratio (${ratio.toFixed(1)}) is low. Typical MCU ratio is 4-16x`,
          impact: 'May indicate oversized SRAM requirement or undersized Flash'
        });
      } else if (ratio > 32) {
        result.warnings.push({
          field: 'flash_kb, sram_kb',
          message: `Flash/SRAM ratio (${ratio.toFixed(1)}) is high. May need more SRAM for this Flash size`,
          impact: 'Could limit processing of large datasets or buffers'
        });
      }
    }
  }

  /**
   * Validate market segment appropriateness
   */
  private async validateMarketSegmentFit(requirements: SocketRequirements, marketSegment: string, result: ValidationResult): Promise<void> {
    const segment = marketSegment.toLowerCase();

    // Automotive-specific validation
    if (segment === 'automotive') {
      if (!requirements.automotive_qualified && requirements.temperature_range !== 'automotive') {
        result.warnings.push({
          field: 'automotive_qualified',
          message: 'Automotive applications typically require AEC-Q100 qualified parts',
          impact: 'May limit socket options or require qualification testing'
        });
      }

      // Check for automotive-appropriate peripherals
      const automotivePeripherals = ['can', 'can-fd', 'lin', 'ethernet'];
      const hasAutomotiveComms = requirements.peripherals?.some((p: string) => 
        automotivePeripherals.some((ap: string) => p.toLowerCase().includes(ap))
      );

      if (!hasAutomotiveComms) {
        result.warnings.push({
          field: 'peripherals',
          message: 'Automotive applications typically need CAN, CAN-FD, LIN, or automotive Ethernet',
          impact: 'May not meet automotive communication requirements'
        });
      }
    }

    // Medical device validation
    if (segment === 'medical') {
      if (requirements.max_clock_mhz && requirements.max_clock_mhz > 200) {
        result.warnings.push({
          field: 'max_clock_mhz',
          message: 'High-frequency clocks may increase EMI concerns in medical devices',
          impact: 'May require additional shielding or EMC testing'
        });
      }
    }

    // Industrial validation
    if (segment === 'industrial') {
      if (!requirements.peripherals?.some((p: string) => ['ethernet', 'rs-485', 'modbus', 'profinet'].some((ip: string) => p.toLowerCase().includes(ip)))) {
        result.warnings.push({
          field: 'peripherals',
          message: 'Industrial applications typically need industrial networking (Ethernet, RS-485, Modbus, PROFINET)',
          impact: 'May not integrate well with industrial automation systems'
        });
      }
    }
  }

  /**
   * Validate application-specific requirements
   */
  private async validateApplicationFit(requirements: SocketRequirements, application: string, result: ValidationResult): Promise<void> {
    const app = application.toLowerCase();

    // Motor control applications
    if (app.includes('motor') || app.includes('drive')) {
      if (!requirements.peripherals?.some((p: string) => ['pwm', 'adc', 'dac', 'timer'].some((mp: string) => p.toLowerCase().includes(mp)))) {
        result.suggestions.push({
          field: 'peripherals',
          currentValue: requirements.peripherals || [],
          suggestedValue: [...(requirements.peripherals || []), 'PWM', 'High-res ADC', 'Timers'],
          reason: 'Motor control applications typically require PWM generation and precise analog measurement',
          confidence: 0.9
        });
      }
    }

    // Gateway/bridge applications  
    if (app.includes('gateway') || app.includes('bridge')) {
      const networkPeripherals = requirements.peripherals?.filter((p: string) => 
        ['ethernet', 'can', 'wifi', 'bluetooth', 'usb'].some((np: string) => p.toLowerCase().includes(np))
      );

      if (!networkPeripherals || networkPeripherals.length < 2) {
        result.suggestions.push({
          field: 'peripherals',
          currentValue: requirements.peripherals || [],
          suggestedValue: [...(requirements.peripherals || []), 'CAN-FD', 'Ethernet'],
          reason: 'Gateway applications need multiple communication interfaces to bridge between networks',
          confidence: 0.85
        });
      }
    }

    // IoT applications
    if (app.includes('iot') || app.includes('connected') || app.includes('wireless')) {
      if (!requirements.peripherals?.some((p: string) => ['wifi', 'bluetooth', 'cellular', 'lora'].some((wp: string) => p.toLowerCase().includes(wp)))) {
        result.suggestions.push({
          field: 'peripherals',
          currentValue: requirements.peripherals || [],
          suggestedValue: [...(requirements.peripherals || []), 'WiFi', 'Bluetooth'],
          reason: 'IoT applications require wireless connectivity for remote access and control',
          confidence: 0.9
        });
      }
    }
  }

  /**
   * Generate intelligent suggestions for optimization
   */
  private async generateIntelligentSuggestions(
    requirements: SocketRequirements,
    application?: string,
    marketSegment?: string,
    result?: ValidationResult
  ): Promise<void> {
    if (!result) return;

    // Memory optimization suggestions
    if (requirements.flash_kb && requirements.sram_kb) {
      const commonFlashSizes = [32, 64, 128, 256, 512, 1024, 2048];
      const nearestFlash = commonFlashSizes.find(size => size >= requirements.flash_kb);
      
      if (nearestFlash && nearestFlash !== requirements.flash_kb) {
        result.suggestions.push({
          field: 'flash_kb',
          currentValue: requirements.flash_kb,
          suggestedValue: nearestFlash,
          reason: `Standard flash size ${nearestFlash}KB available, may offer better pricing`,
          confidence: 0.7
        });
      }
    }

    // Package optimization
    if (requirements.peripherals && requirements.peripherals.length > 6 && !requirements.package?.includes('BGA')) {
      result.suggestions.push({
        field: 'package',
        currentValue: requirements.package,
        suggestedValue: 'BGA (Ball Grid Array)',
        reason: 'High peripheral count may benefit from BGA package for better pin availability',
        confidence: 0.6
      });
    }

    // Power optimization for battery applications
    if (application?.toLowerCase().includes('battery') || application?.toLowerCase().includes('portable')) {
      if (requirements.max_clock_mhz && requirements.max_clock_mhz > 100) {
        result.suggestions.push({
          field: 'max_clock_mhz',
          currentValue: requirements.max_clock_mhz,
          suggestedValue: Math.min(requirements.max_clock_mhz, 48),
          reason: 'Battery applications benefit from lower clock speeds for power efficiency',
          confidence: 0.8
        });
      }
    }
  }

  /**
   * Generate corrected requirements based on suggestions
   */
  private async generateCorrectedRequirements(
    originalRequirements: SocketRequirements,
    suggestions: ValidationSuggestion[]
  ): Promise<SocketRequirements> {
    const corrected = { ...originalRequirements };

    // Apply high-confidence suggestions automatically
    for (const suggestion of suggestions) {
      if (suggestion.confidence > 0.8) {
        (corrected as any)[suggestion.field] = suggestion.suggestedValue;
      }
    }

    return corrected;
  }

  /**
   * Validate certifications
   */
  private async validateCertifications(certifications: string[], application?: string, result?: ValidationResult): Promise<void> {
    if (!result) return;

    const validCertifications = [
      'AEC-Q100', 'ISO26262', 'IEC61508', 'IEC62304', 'FDA510k',
      'FCC', 'CE', 'IC', 'PTCRB', 'GCF', 'WEEE', 'RoHS'
    ];

    const invalidCerts = certifications.filter((cert: string) => 
      !validCertifications.some((valid: string) => valid.toLowerCase() === cert.toLowerCase())
    );

    if (invalidCerts.length > 0) {
      result.warnings.push({
        field: 'certifications',
        message: `Unknown certifications: ${invalidCerts.join(', ')}. Verify requirements.`,
        impact: 'May not be available or may increase cost/timeline'
      });
    }

    // Application-specific certification recommendations
    if (application) {
      const app = application.toLowerCase();
      
      if (app.includes('automotive') && !certifications.some(c => c.includes('AEC'))) {
        result.suggestions.push({
          field: 'certifications',
          currentValue: certifications,
          suggestedValue: [...certifications, 'AEC-Q100'],
          reason: 'Automotive applications typically require AEC-Q100 qualification',
          confidence: 0.9
        });
      }

      if (app.includes('medical') && !certifications.some(c => c.includes('IEC62304'))) {
        result.suggestions.push({
          field: 'certifications',
          currentValue: certifications,
          suggestedValue: [...certifications, 'IEC62304'],
          reason: 'Medical devices typically require IEC 62304 compliance',
          confidence: 0.85
        });
      }
    }
  }

  /**
   * Validate special features
   */
  private async validateSpecialFeatures(features: string[], result?: ValidationResult): Promise<void> {
    if (!result) return;

    const validFeatures = [
      'Hardware security', 'TSN support', 'Real-time control', 'Deterministic networking',
      'Patient safety', 'Low power', 'High precision', 'Motor control', 'Wireless connectivity',
      'Camera interface', 'Display controller', 'Audio processing', 'Image processing'
    ];

    const unknownFeatures = features.filter((feature: string) =>
      !validFeatures.some((valid: string) => 
        valid.toLowerCase().includes(feature.toLowerCase()) || 
        feature.toLowerCase().includes(valid.toLowerCase())
      )
    );

    if (unknownFeatures.length > 0) {
      result.warnings.push({
        field: 'special_features',
        message: `Verify feasibility of features: ${unknownFeatures.join(', ')}`,
        impact: 'May require custom solutions or external components'
      });
    }
  }

  /**
   * Initialize socket-specific limitations
   */
  private initializeSocketLimitations(): void {
    // MCU limitations
    this.socketLimitations.set('MCU', {
      max_flash_kb: 8192,
      max_sram_kb: 1024,
      max_clock_mhz: 600,
      supported_peripherals: [
        'GPIO', 'UART', 'SPI', 'I2C', 'USB', 'CAN', 'CAN-FD', 'LIN',
        'Ethernet', 'ADC', 'DAC', 'PWM', 'Timer', 'RTC', 'DMA',
        'Crypto', 'QSPI', 'SDIO', 'Camera', 'LCD'
      ],
      package_options: ['QFN', 'LQFP', 'BGA', 'TQFP', 'DIP'],
      voltage_ranges: ['1.8V', '3.3V', '5V'],
      temperature_ranges: ['commercial', 'industrial', 'automotive', 'military'],
      certifications_available: ['AEC-Q100', 'ISO26262', 'IEC61508']
    });

    // Analog limitations
    this.socketLimitations.set('Analog', {
      max_flash_kb: 0, // No flash in pure analog
      max_sram_kb: 0,
      max_clock_mhz: 0,
      supported_peripherals: ['OpAmp', 'Comparator', 'ADC', 'DAC', 'Reference', 'PGA'],
      package_options: ['SOT', 'SOIC', 'QFN', 'DFN', 'MSOP'],
      voltage_ranges: ['1.8V', '3.3V', '5V', '12V', '24V'],
      temperature_ranges: ['commercial', 'industrial', 'automotive'],
      certifications_available: ['AEC-Q100']
    });

    // Add more socket types as needed
  }

  /**
   * Initialize conflict detection rules
   */
  private initializeConflictRules(): void {
    this.conflictRules = [
      {
        fields: ['max_clock_mhz', 'socket_type'],
        condition: (req) => req.socket_type === 'Analog' && req.max_clock_mhz > 0,
        message: 'Analog sockets do not have clock frequencies',
        severity: 'critical',
        code: 'ANALOG_CLOCK_CONFLICT'
      },
      {
        fields: ['flash_kb', 'socket_type'],
        condition: (req) => req.socket_type === 'Analog' && req.flash_kb > 0,
        message: 'Pure analog sockets do not have flash memory',
        severity: 'critical',
        code: 'ANALOG_MEMORY_CONFLICT'
      },
      {
        fields: ['automotive_qualified', 'temperature_range'],
        condition: (req) => req.automotive_qualified && req.temperature_range === 'commercial',
        message: 'Automotive qualified parts require automotive temperature range (-40°C to +125°C)',
        severity: 'high',
        code: 'AUTOMOTIVE_TEMP_CONFLICT'
      }
    ];
  }

  /**
   * Load MCHP portfolio data for validation
   */
  private loadMchpPortfolioData(): void {
    // This would load actual MCHP product data in production
    this.mchpPortfolioData = {
      // Portfolio data for validation
    };
  }
}

interface ConflictRule {
  fields: string[];
  condition: (requirements: SocketRequirements) => boolean;
  message: string;
  severity: 'critical' | 'high' | 'medium';
  code: string;
}

/**
 * Quick validation helper function
 */
export function validateQuick(requirements: SocketRequirements): boolean {
  const validator = new ParameterValidator();
  // This would be async in real implementation, simplified for quick checks
  const hasBasicRequirements = requirements.socket_type !== undefined;
  const hasValidTypes = !requirements.socket_type || 
    ['MCU', 'Analog', 'Power', 'Interface', 'RF', 'Memory', 'Clock', 'FPGA'].includes(requirements.socket_type);
  
  return hasBasicRequirements && hasValidTypes;
}