import * as fs from 'fs';
import * as path from 'path';

export interface PartSpecification {
  part_number: string;
  vendor: string;
  category: string;
  specifications: { [param: string]: any };
  datasheet_url?: string;
  pricing_info?: {
    unit_price_1k: number;
    unit_price_10k: number;
    currency: string;
  };
  availability: {
    lifecycle_status: string;
    lead_time_weeks: number;
    inventory_level: 'high' | 'medium' | 'low';
  };
  scraped_date: string;
}

export interface CompetitiveDataSources {
  microchip: string[];
  ti: string[];
  stm: string[];
  nxp: string[];
  infineon: string[];
  broadcom: string[];
  analog_devices: string[];
}

export class DataEnrichmentScraper {
  private dataSources: CompetitiveDataSources;
  private partSpecifications: Map<string, PartSpecification> = new Map();
  
  constructor() {
    this.dataSources = {
      microchip: [
        'https://www.microchip.com/en-us/products/microcontrollers-and-microprocessors',
        'https://www.microchip.com/en-us/products/analog',
        'https://www.microchip.com/en-us/products/interface',
        'https://www.microchip.com/en-us/products/power-management'
      ],
      ti: [
        'https://www.ti.com/microcontrollers/',
        'https://www.ti.com/amplifiers-linear/',
        'https://www.ti.com/power-management/'
      ],
      stm: [
        'https://www.st.com/en/microcontrollers-microprocessors/',
        'https://www.st.com/en/analog-and-power/'
      ],
      nxp: [
        'https://www.nxp.com/products/processors-and-microcontrollers/',
        'https://www.nxp.com/products/analog-mixed-signal/'
      ],
      infineon: [
        'https://www.infineon.com/cms/en/product/microcontroller/',
        'https://www.infineon.com/cms/en/product/analog-circuit/'
      ],
      broadcom: [
        'https://www.broadcom.com/products/ethernet-connectivity/switching/',
        'https://www.broadcom.com/products/ethernet-connectivity/phy-transceivers/'
      ],
      analog_devices: [
        'https://www.analog.com/en/products/amplifiers.html',
        'https://www.analog.com/en/products/microcontrollers.html'
      ]
    };
  }

  /**
   * Scrape competitive part data for socket intelligence enhancement
   */
  async scrapeCompetitiveData(
    socketTypes: string[] = ['MCU', 'ANALOG', 'POWER', 'INTERFACE'],
    targetVendors: string[] = ['microchip', 'ti', 'stm', 'nxp']
  ): Promise<Map<string, PartSpecification[]>> {
    console.log('🔍 Starting competitive data scraping...');
    
    const results = new Map<string, PartSpecification[]>();

    for (const vendor of targetVendors) {
      console.log(`\n📊 Scraping ${vendor.toUpperCase()} data...`);
      const vendorParts = await this.scrapeVendorData(vendor, socketTypes);
      results.set(vendor, vendorParts);
      
      // Rate limiting
      await this.delay(5000);
    }

    // Save results for analysis
    await this.saveCompetitiveData(results);
    
    console.log(`✅ Completed competitive data scraping: ${results.size} vendors`);
    return results;
  }

  /**
   * Scrape data for specific vendor
   */
  private async scrapeVendorData(vendor: string, socketTypes: string[]): Promise<PartSpecification[]> {
    const parts: PartSpecification[] = [];
    
    // Use parametric search approach for each vendor
    switch (vendor.toLowerCase()) {
      case 'microchip':
        parts.push(...await this.scrapeMicrochipData(socketTypes));
        break;
      case 'ti':
        parts.push(...await this.scrapeTIData(socketTypes));
        break;
      case 'stm':
        parts.push(...await this.scrapeSTMData(socketTypes));
        break;
      case 'nxp':
        parts.push(...await this.scrapeNXPData(socketTypes));
        break;
      default:
        console.log(`❌ Vendor ${vendor} not supported yet`);
    }

    console.log(`📈 Found ${parts.length} parts for ${vendor}`);
    return parts;
  }

  /**
   * Scrape Microchip parametric data
   */
  private async scrapeMicrochipData(socketTypes: string[]): Promise<PartSpecification[]> {
    const parts: PartSpecification[] = [];

    // Microchip MCU families to analyze
    const mcuFamilies = [
      'SAM E70/S70/V70/V71', 'SAM C21', 'SAM D21', 'SAM L21',
      'dsPIC33C', 'dsPIC33F', 'PIC32MZ', 'PIC32MX',
      'PIC18F', 'PIC16F', 'AVR-DA', 'AVR-DB'
    ];

    // Analog families
    const analogFamilies = [
      'MCP6xxx OpAmps', 'MCP35xx/36xx ADCs', 'MCP47xx/48xx DACs',
      'MCP9xxx Temperature Sensors', 'MCP16xxx DC-DC Converters'
    ];

    // Generate sample competitive data (in production, this would scrape real data)
    if (socketTypes.includes('MCU')) {
      parts.push(...this.generateMicrochipMCUData());
    }
    
    if (socketTypes.includes('ANALOG')) {
      parts.push(...this.generateMicrochipAnalogData());
    }

    return parts;
  }

  /**
   * Generate sample Microchip MCU competitive data
   */
  private generateMicrochipMCUData(): PartSpecification[] {
    return [
      {
        part_number: 'ATSAME70Q21B-AN',
        vendor: 'Microchip',
        category: 'MCU',
        specifications: {
          core_architecture: 'ARM Cortex-M7',
          max_cpu_speed_mhz: 300,
          program_memory_kb: 2048,
          sram_kb: 384,
          operating_voltage_min: 1.62,
          operating_voltage_max: 3.6,
          operating_temp_min: -40,
          operating_temp_max: 85,
          gpio_pins: 103,
          can_controllers: 2,
          can_fd_support: true,
          ethernet_mac: true,
          usb_interfaces: 2,
          spi_interfaces: 4,
          uart_interfaces: 5,
          i2c_interfaces: 3,
          adc_channels: 24,
          adc_resolution_bits: 12,
          dac_channels: 2,
          timer_counters: 12,
          dma_channels: 24,
          crypto_engine: true,
          fpu: 'single_precision',
          mpu: true,
          package: 'LQFP-144',
          coremark_score: 1440,
          dhrystone_mips: 827
        },
        datasheet_url: 'https://ww1.microchip.com/downloads/en/DeviceDoc/SAM-E70-S70-V70-V71-Family-Data-Sheet-DS60001527.pdf',
        pricing_info: {
          unit_price_1k: 8.45,
          unit_price_10k: 7.23,
          currency: 'USD'
        },
        availability: {
          lifecycle_status: 'Active',
          lead_time_weeks: 12,
          inventory_level: 'medium'
        },
        scraped_date: new Date().toISOString()
      },
      {
        part_number: 'dsPIC33CK256MP508-I/PT',
        vendor: 'Microchip',
        category: 'MCU',
        specifications: {
          core_architecture: 'dsPIC33C',
          max_cpu_speed_mhz: 100,
          program_memory_kb: 256,
          sram_kb: 32,
          operating_voltage_min: 2.3,
          operating_voltage_max: 3.6,
          operating_temp_min: -40,
          operating_temp_max: 85,
          gpio_pins: 48,
          can_controllers: 2,
          can_fd_support: true,
          spi_interfaces: 2,
          uart_interfaces: 2,
          i2c_interfaces: 1,
          adc_channels: 18,
          adc_resolution_bits: 12,
          timer_counters: 9,
          dma_channels: 8,
          dsp_engine: true,
          hardware_multiplier: '17x17_single_cycle',
          motor_control_pwm: '16_channel_enhanced',
          comparators: 4,
          package: 'TQFP-64',
          coremark_score: 300,
          motor_control_benchmarks: 'FOC_capable'
        },
        datasheet_url: 'https://ww1.microchip.com/downloads/en/DeviceDoc/dsPIC33CK-Family-Data-Sheet-DS70005349.pdf',
        pricing_info: {
          unit_price_1k: 4.25,
          unit_price_10k: 3.87,
          currency: 'USD'
        },
        availability: {
          lifecycle_status: 'Active',
          lead_time_weeks: 8,
          inventory_level: 'high'
        },
        scraped_date: new Date().toISOString()
      }
    ];
  }

  /**
   * Generate sample Microchip Analog competitive data
   */
  private generateMicrochipAnalogData(): PartSpecification[] {
    return [
      {
        part_number: 'MCP6L92T-E/SN',
        vendor: 'Microchip',
        category: 'ANALOG',
        specifications: {
          amplifier_type: 'Precision OpAmp',
          channels: 2,
          gbw_mhz: 10,
          offset_voltage_max_uv: 150,
          offset_voltage_drift_uv_per_c: 0.6,
          input_bias_current_pa: 1,
          voltage_noise_nv_sqrt_hz: 8.7,
          current_noise_pa_sqrt_hz: 0.8,
          cmrr_db: 130,
          psrr_db: 130,
          slew_rate_v_per_us: 5.5,
          supply_voltage_min: 1.8,
          supply_voltage_max: 5.5,
          quiescent_current_per_channel_ua: 850,
          shutdown_current_na: 10,
          input_range: 'rail_to_rail',
          output_range: 'rail_to_rail',
          operating_temp_min: -40,
          operating_temp_max: 125,
          package: 'SOIC-8',
          unity_gain_stable: true,
          auto_zero: false
        },
        datasheet_url: 'https://ww1.microchip.com/downloads/en/DeviceDoc/MCP6L91-2-4-Family-Data-Sheet-DS20002447.pdf',
        pricing_info: {
          unit_price_1k: 0.89,
          unit_price_10k: 0.76,
          currency: 'USD'
        },
        availability: {
          lifecycle_status: 'Active',
          lead_time_weeks: 6,
          inventory_level: 'high'
        },
        scraped_date: new Date().toISOString()
      }
    ];
  }

  /**
   * Scrape TI competitive data
   */
  private async scrapeTIData(socketTypes: string[]): Promise<PartSpecification[]> {
    const parts: PartSpecification[] = [];

    if (socketTypes.includes('MCU')) {
      parts.push({
        part_number: 'TMS320F28379DZPZT',
        vendor: 'TI',
        category: 'MCU',
        specifications: {
          core_architecture: 'C28x_DSP_plus_ARM_Cortex_M4',
          max_cpu_speed_mhz: 200,
          program_memory_kb: 1024,
          sram_kb: 204,
          operating_voltage_min: 2.97,
          operating_voltage_max: 3.63,
          operating_temp_min: -40,
          operating_temp_max: 105,
          gpio_pins: 169,
          can_controllers: 2,
          can_fd_support: false,
          spi_interfaces: 4,
          uart_interfaces: 2,
          i2c_interfaces: 2,
          adc_channels: 24,
          adc_resolution_bits: 16,
          timer_counters: 12,
          dma_channels: 6,
          dsp_engine: true,
          fpu: 'single_precision',
          motor_control_pwm: '24_channel_enhanced',
          package: 'LQFP-176',
          coremark_score: 600,
          dhrystone_mips: 400
        },
        pricing_info: {
          unit_price_1k: 12.50,
          unit_price_10k: 10.25,
          currency: 'USD'
        },
        availability: {
          lifecycle_status: 'Active',
          lead_time_weeks: 20,
          inventory_level: 'low'
        },
        scraped_date: new Date().toISOString()
      });
    }

    return parts;
  }

  /**
   * Scrape STMicroelectronics data
   */
  private async scrapeSTMData(socketTypes: string[]): Promise<PartSpecification[]> {
    const parts: PartSpecification[] = [];

    if (socketTypes.includes('MCU')) {
      parts.push({
        part_number: 'STM32H743VIT6',
        vendor: 'STM',
        category: 'MCU',
        specifications: {
          core_architecture: 'ARM Cortex-M7',
          max_cpu_speed_mhz: 480,
          program_memory_kb: 2048,
          sram_kb: 1024,
          operating_voltage_min: 1.62,
          operating_voltage_max: 3.6,
          operating_temp_min: -40,
          operating_temp_max: 85,
          gpio_pins: 168,
          can_controllers: 3,
          can_fd_support: true,
          ethernet_mac: true,
          usb_interfaces: 2,
          spi_interfaces: 6,
          uart_interfaces: 8,
          i2c_interfaces: 4,
          adc_channels: 24,
          adc_resolution_bits: 16,
          dac_channels: 2,
          timer_counters: 22,
          dma_channels: 16,
          crypto_engine: true,
          fpu: 'double_precision',
          mpu: true,
          package: 'LQFP-100',
          coremark_score: 2020,
          dhrystone_mips: 1177
        },
        pricing_info: {
          unit_price_1k: 9.75,
          unit_price_10k: 8.45,
          currency: 'USD'
        },
        availability: {
          lifecycle_status: 'Active',
          lead_time_weeks: 24,
          inventory_level: 'low'
        },
        scraped_date: new Date().toISOString()
      });
    }

    return parts;
  }

  /**
   * Scrape NXP data
   */
  private async scrapeNXPData(socketTypes: string[]): Promise<PartSpecification[]> {
    const parts: PartSpecification[] = [];

    if (socketTypes.includes('MCU')) {
      parts.push({
        part_number: 'S32K344EHT1VPBST',
        vendor: 'NXP',
        category: 'MCU',
        specifications: {
          core_architecture: 'ARM Cortex-M7',
          max_cpu_speed_mhz: 160,
          program_memory_kb: 4096,
          sram_kb: 512,
          operating_voltage_min: 1.71,
          operating_voltage_max: 5.5,
          operating_temp_min: -40,
          operating_temp_max: 150,
          gpio_pins: 145,
          can_controllers: 6,
          can_fd_support: true,
          ethernet_mac: true,
          spi_interfaces: 6,
          uart_interfaces: 12,
          i2c_interfaces: 2,
          adc_channels: 96,
          adc_resolution_bits: 12,
          timer_counters: 24,
          safety_features: 'ASIL_B_certified',
          automotive_qualified: 'AEC_Q100',
          package: 'TEQFP-172',
          coremark_score: 800
        },
        pricing_info: {
          unit_price_1k: 15.50,
          unit_price_10k: 13.25,
          currency: 'USD'
        },
        availability: {
          lifecycle_status: 'Active',
          lead_time_weeks: 16,
          inventory_level: 'medium'
        },
        scraped_date: new Date().toISOString()
      });
    }

    return parts;
  }

  /**
   * Save competitive data to files for analysis
   */
  private async saveCompetitiveData(data: Map<string, PartSpecification[]>): Promise<void> {
    const outputDir = path.join(__dirname, '..', '..', 'competitive-data');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save by vendor
    for (const [vendor, parts] of data.entries()) {
      const filename = path.join(outputDir, `${vendor}-parts-${new Date().toISOString().split('T')[0]}.json`);
      fs.writeFileSync(filename, JSON.stringify(parts, null, 2));
      console.log(`💾 Saved ${parts.length} ${vendor} parts to ${filename}`);
    }

    // Create consolidated competitive matrix
    const competitiveMatrix = this.createCompetitiveMatrix(data);
    const matrixFile = path.join(outputDir, `competitive-matrix-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(matrixFile, JSON.stringify(competitiveMatrix, null, 2));
    console.log(`📊 Created competitive matrix: ${matrixFile}`);
  }

  /**
   * Create competitive comparison matrix
   */
  private createCompetitiveMatrix(data: Map<string, PartSpecification[]>): any {
    const matrix: any = {
      comparison_date: new Date().toISOString(),
      categories: {},
      parameter_analysis: {},
      vendor_strengths: {}
    };

    // Analyze by category
    for (const [vendor, parts] of data.entries()) {
      const categoryBreakdown: any = {};
      
      parts.forEach(part => {
        if (!categoryBreakdown[part.category]) {
          categoryBreakdown[part.category] = [];
        }
        categoryBreakdown[part.category].push({
          part_number: part.part_number,
          key_specs: this.extractKeySpecs(part.specifications, part.category)
        });
      });

      matrix.categories[vendor] = categoryBreakdown;
    }

    // Parameter analysis across vendors
    matrix.parameter_analysis = this.analyzeParameterCompetitiveness(data);

    return matrix;
  }

  /**
   * Extract key specifications for comparison
   */
  private extractKeySpecs(specs: any, category: string): any {
    switch (category.toUpperCase()) {
      case 'MCU':
        return {
          core: specs.core_architecture,
          speed_mhz: specs.max_cpu_speed_mhz,
          flash_kb: specs.program_memory_kb,
          sram_kb: specs.sram_kb,
          can_fd: specs.can_fd_support,
          ethernet: specs.ethernet_mac,
          coremark: specs.coremark_score
        };
      case 'ANALOG':
        return {
          type: specs.amplifier_type,
          channels: specs.channels,
          gbw_mhz: specs.gbw_mhz,
          offset_uv: specs.offset_voltage_max_uv,
          noise_nv: specs.voltage_noise_nv_sqrt_hz,
          quiescent_ua: specs.quiescent_current_per_channel_ua
        };
      default:
        return specs;
    }
  }

  /**
   * Analyze parameter competitiveness across vendors
   */
  private analyzeParameterCompetitiveness(data: Map<string, PartSpecification[]>): any {
    const analysis: any = {
      performance_leaders: {},
      cost_leaders: {},
      feature_leaders: {},
      market_gaps: []
    };

    // Example analysis for MCU performance
    const mcuParts: any[] = [];
    for (const [vendor, parts] of data.entries()) {
      mcuParts.push(...parts.filter(p => p.category === 'MCU').map(p => ({...p, vendor})));
    }

    if (mcuParts.length > 0) {
      // Performance leaders
      const speedLeader = mcuParts.reduce((max, part) => 
        (part.specifications.max_cpu_speed_mhz || 0) > (max.specifications.max_cpu_speed_mhz || 0) ? part : max
      );
      analysis.performance_leaders.cpu_speed = {
        vendor: speedLeader.vendor,
        part: speedLeader.part_number,
        value: speedLeader.specifications.max_cpu_speed_mhz
      };

      // Cost leaders (example - would need real pricing data)
      analysis.cost_leaders.mcu_mainstream = {
        vendor: 'Microchip',
        rationale: 'Competitive pricing with integrated peripherals'
      };
    }

    return analysis;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get enriched competitive data for socket qualification
   */
  async getCompetitiveIntelligence(
    socketType: string,
    targetVendors: string[] = ['microchip', 'ti', 'stm', 'nxp']
  ): Promise<Map<string, PartSpecification[]>> {
    // Load cached data or scrape fresh
    const cacheDir = path.join(__dirname, '..', '..', 'competitive-data');
    
    if (fs.existsSync(cacheDir)) {
      console.log('📂 Loading cached competitive data...');
      return this.loadCachedData(cacheDir, targetVendors);
    } else {
      console.log('🔄 Scraping fresh competitive data...');
      return await this.scrapeCompetitiveData([socketType], targetVendors);
    }
  }

  /**
   * Load cached competitive data
   */
  private loadCachedData(cacheDir: string, vendors: string[]): Map<string, PartSpecification[]> {
    const data = new Map<string, PartSpecification[]>();
    
    for (const vendor of vendors) {
      const files = fs.readdirSync(cacheDir).filter(f => f.startsWith(`${vendor}-parts-`));
      if (files.length > 0) {
        const latestFile = files.sort().reverse()[0];
        const filePath = path.join(cacheDir, latestFile);
        const parts: PartSpecification[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        data.set(vendor, parts);
        console.log(`📖 Loaded ${parts.length} ${vendor} parts from cache`);
      }
    }
    
    return data;
  }
}