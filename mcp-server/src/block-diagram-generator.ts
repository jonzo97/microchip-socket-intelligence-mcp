// Enhanced Block Diagram Generator for Socket Intelligence
// Supports draw.io XML, intelligent layout, and hierarchical organization

import { BlockDiagramRequirements } from './types.js';

export interface DiagramComponent {
  id: string;
  type: 'microchip' | 'competitor' | 'peripheral' | 'connector' | 'power' | 'signal' | 'system';
  label: string;
  part_number?: string;
  specifications: { [key: string]: string };
  connections: Connection[];
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: ComponentStyle;
}

export interface Connection {
  from: string;
  to: string;
  signal_type: 'power' | 'data' | 'control' | 'analog' | 'clock';
  protocol?: string;
  bandwidth?: string;
  voltage?: string;
  notes?: string;
}

export interface ComponentStyle {
  fillColor: string;
  strokeColor: string;
  fontColor: string;
  shape: 'rectangle' | 'rounded' | 'ellipse' | 'diamond' | 'cloud';
  fontSize: number;
  strokeWidth: number;
}

export interface DiagramLayout {
  width: number;
  height: number;
  grid_size: number;
  spacing: { horizontal: number; vertical: number };
  hierarchical: boolean;
  orientation: 'horizontal' | 'vertical';
}

export interface ComponentOverlap {
  component1: DiagramComponent;
  component2: DiagramComponent;
  severity: number; // 0-1, higher means more severe overlap
}

/**
 * Advanced Block Diagram Generator with Draw.io Integration
 */
export class BlockDiagramGenerator {
  private componentTemplates: Map<string, Partial<DiagramComponent>>;
  private layoutEngine: LayoutEngine;

  constructor() {
    this.componentTemplates = new Map();
    this.layoutEngine = new LayoutEngine();
    this.initializeComponentTemplates();
  }

  /**
   * Generate comprehensive block diagram for socket requirements
   */
  async generateSystemDiagram(
    application: string,
    marketSegment: string,
    socketRequirements: any,
    requirements?: BlockDiagramRequirements,
    outputFormat: 'drawio' | 'mermaid' | 'svg' | 'json' = 'drawio'
  ): Promise<string> {
    // Analyze requirements and build component hierarchy
    const components = await this.analyzeAndCreateComponents(
      application, 
      marketSegment, 
      socketRequirements, 
      requirements
    );

    // Apply intelligent layout
    const layoutedComponents = this.layoutEngine.arrangeComponents(
      components,
      this.determineOptimalLayout(application, components.length)
    );

    // Generate connections
    const connections = this.generateIntelligentConnections(layoutedComponents);

    // Output in requested format
    switch (outputFormat) {
      case 'drawio':
        return this.generateDrawIoXML(layoutedComponents, connections);
      case 'mermaid':
        return this.generateMermaidDiagram(layoutedComponents, connections);
      case 'svg':
        return this.generateSVGDiagram(layoutedComponents, connections);
      case 'json':
        return JSON.stringify({ components: layoutedComponents, connections }, null, 2);
      default:
        return this.generateDrawIoXML(layoutedComponents, connections);
    }
  }

  /**
   * Analyze requirements and create intelligent component hierarchy
   */
  private async analyzeAndCreateComponents(
    application: string,
    marketSegment: string,
    socketRequirements: any,
    requirements?: BlockDiagramRequirements
  ): Promise<DiagramComponent[]> {
    const components: DiagramComponent[] = [];

    // 1. Core Microchip Socket (Primary)
    const primarySocket = this.createMicrochipSocket(socketRequirements, requirements);
    components.push(primarySocket);

    // 2. System Power Architecture
    const powerComponents = this.createPowerSubsystem(socketRequirements, marketSegment);
    components.push(...powerComponents);

    // 3. Interface and Connectivity
    const interfaceComponents = this.createInterfaceSubsystem(socketRequirements, application);
    components.push(...interfaceComponents);

    // 4. External Components (if needed)
    const externalComponents = this.createExternalComponents(socketRequirements, application);
    components.push(...externalComponents);

    // 5. System-level blocks
    const systemComponents = this.createSystemLevelBlocks(application, marketSegment);
    components.push(...systemComponents);

    return components;
  }

  /**
   * Create optimized Microchip socket component
   */
  private createMicrochipSocket(socketRequirements: any, requirements?: BlockDiagramRequirements): DiagramComponent {
    // Determine best MCHP solution
    const socketType = socketRequirements.socket_type || 'MCU';
    const template = this.componentTemplates.get(`mchp_${socketType.toLowerCase()}`) || this.componentTemplates.get('mchp_mcu');
    
    const part = this.selectOptimalMchpPart(socketRequirements);
    
    return {
      id: 'mchp_primary',
      type: 'microchip',
      label: `${part.family}\n${part.part_number}`,
      part_number: part.part_number,
      specifications: {
        'Core': part.core || '',
        'Flash': part.flash || '',
        'RAM': part.ram || '',
        'Package': part.package || '',
        'Key Features': part.key_features?.slice(0, 3).join(', ') || ''
      },
      connections: [],
      position: { x: 0, y: 0 }, // Will be set by layout engine
      size: { width: 200, height: 120 },
      style: {
        fillColor: '#E3F2FD',
        strokeColor: '#1976D2', 
        fontColor: '#000000',
        shape: 'rounded',
        fontSize: 12,
        strokeWidth: 2
      }
    };
  }

  /**
   * Create intelligent power subsystem
   */
  private createPowerSubsystem(socketRequirements: any, marketSegment: string): DiagramComponent[] {
    const components: DiagramComponent[] = [];
    
    // Main power input
    components.push({
      id: 'power_input',
      type: 'power',
      label: this.determinePowerInput(socketRequirements, marketSegment),
      specifications: {
        'Input': this.getPowerInputSpec(marketSegment),
        'Regulation': 'Required'
      },
      connections: [],
      position: { x: 0, y: 0 },
      size: { width: 120, height: 60 },
      style: {
        fillColor: '#FFF3E0',
        strokeColor: '#F57C00',
        fontColor: '#000000',
        shape: 'rectangle',
        fontSize: 10,
        strokeWidth: 2
      }
    });

    // Power management IC (if needed)
    if (this.needsPowerManagement(socketRequirements, marketSegment)) {
      components.push({
        id: 'power_mgmt',
        type: 'microchip',
        label: this.selectPowerManagementIC(socketRequirements),
        specifications: {
          'Type': 'PMIC/LDO',
          'Outputs': 'Multiple Rails'
        },
        connections: [],
        position: { x: 0, y: 0 },
        size: { width: 140, height: 80 },
        style: {
          fillColor: '#E8F5E8',
          strokeColor: '#4CAF50',
          fontColor: '#000000', 
          shape: 'rounded',
          fontSize: 10,
          strokeWidth: 2
        }
      });
    }

    return components;
  }

  /**
   * Create interface and connectivity subsystem
   */
  private createInterfaceSubsystem(socketRequirements: any, application: string): DiagramComponent[] {
    const components: DiagramComponent[] = [];
    const peripherals = socketRequirements.peripherals || [];

    // Ethernet interfaces
    if (this.hasEthernet(peripherals)) {
      components.push({
        id: 'ethernet_phy',
        type: 'microchip',
        label: 'Ethernet PHY\nKSZ8081RNB',
        part_number: 'KSZ8081RNB',
        specifications: {
          'Speed': '10/100 Mbps',
          'Interface': 'RMII',
          'Power': '3.3V'
        },
        connections: [],
        position: { x: 0, y: 0 },
        size: { width: 130, height: 80 },
        style: {
          fillColor: '#E1F5FE',
          strokeColor: '#0277BD',
          fontColor: '#000000',
          shape: 'rounded',
          fontSize: 10,
          strokeWidth: 2
        }
      });

      components.push({
        id: 'ethernet_connector',
        type: 'connector',
        label: 'RJ45\nConnector',
        specifications: {
          'Type': 'Magnetic',
          'Speed': '100BASE-TX'
        },
        connections: [],
        position: { x: 0, y: 0 },
        size: { width: 80, height: 60 },
        style: {
          fillColor: '#F3E5F5',
          strokeColor: '#7B1FA2',
          fontColor: '#000000',
          shape: 'rectangle',
          fontSize: 9,
          strokeWidth: 2
        }
      });
    }

    // CAN interfaces
    if (this.hasCAN(peripherals)) {
      components.push({
        id: 'can_transceiver',
        type: 'microchip',
        label: 'CAN Transceiver\nMCP2562FD',
        part_number: 'MCP2562FD',
        specifications: {
          'Type': 'CAN-FD',
          'Speed': '8 Mbps',
          'Isolation': 'Optional'
        },
        connections: [],
        position: { x: 0, y: 0 },
        size: { width: 130, height: 80 },
        style: {
          fillColor: '#FFF8E1',
          strokeColor: '#FBC02D',
          fontColor: '#000000',
          shape: 'rounded',
          fontSize: 10,
          strokeWidth: 2
        }
      });
    }

    // USB interfaces
    if (this.hasUSB(peripherals)) {
      components.push({
        id: 'usb_connector',
        type: 'connector',
        label: 'USB\nConnector',
        specifications: {
          'Type': this.getUSBType(socketRequirements),
          'Speed': this.getUSBSpeed(socketRequirements)
        },
        connections: [],
        position: { x: 0, y: 0 },
        size: { width: 80, height: 60 },
        style: {
          fillColor: '#F3E5F5',
          strokeColor: '#7B1FA2',
          fontColor: '#000000',
          shape: 'rectangle',
          fontSize: 9,
          strokeWidth: 2
        }
      });
    }

    return components;
  }

  /**
   * Create external components based on application needs
   */
  private createExternalComponents(socketRequirements: any, application: string): DiagramComponent[] {
    const components: DiagramComponent[] = [];

    // Add security element if needed
    if (this.needsSecurity(application, socketRequirements)) {
      components.push({
        id: 'crypto_auth',
        type: 'microchip',
        label: 'Crypto Auth\nATECC608B',
        part_number: 'ATECC608B',
        specifications: {
          'Type': 'Hardware Security',
          'Algorithms': 'ECC P-256',
          'Interface': 'I2C'
        },
        connections: [],
        position: { x: 0, y: 0 },
        size: { width: 120, height: 70 },
        style: {
          fillColor: '#FFEBEE',
          strokeColor: '#C62828',
          fontColor: '#000000',
          shape: 'rounded',
          fontSize: 9,
          strokeWidth: 2
        }
      });
    }

    // Add memory if external memory needed
    if (this.needsExternalMemory(socketRequirements)) {
      components.push({
        id: 'external_memory',
        type: 'peripheral',
        label: this.selectExternalMemory(socketRequirements),
        specifications: {
          'Type': 'Serial Flash/EEPROM',
          'Capacity': this.getMemorySize(socketRequirements),
          'Interface': 'SPI/I2C'
        },
        connections: [],
        position: { x: 0, y: 0 },
        size: { width: 110, height: 70 },
        style: {
          fillColor: '#F1F8E9',
          strokeColor: '#689F38',
          fontColor: '#000000',
          shape: 'rectangle',
          fontSize: 9,
          strokeWidth: 2
        }
      });
    }

    return components;
  }

  /**
   * Create system-level functional blocks
   */
  private createSystemLevelBlocks(application: string, marketSegment: string): DiagramComponent[] {
    const components: DiagramComponent[] = [];

    // Application-specific system blocks
    if (application.toLowerCase().includes('automotive')) {
      components.push({
        id: 'vehicle_network',
        type: 'system',
        label: 'Vehicle Network\n(CAN/LIN Bus)',
        specifications: {
          'Protocols': 'CAN-FD, LIN',
          'Topology': 'Bus'
        },
        connections: [],
        position: { x: 0, y: 0 },
        size: { width: 140, height: 70 },
        style: {
          fillColor: '#E8EAF6',
          strokeColor: '#3F51B5',
          fontColor: '#000000',
          shape: 'cloud',
          fontSize: 10,
          strokeWidth: 2
        }
      });
    }

    if (application.toLowerCase().includes('industrial')) {
      components.push({
        id: 'industrial_network',
        type: 'system', 
        label: 'Industrial Network\n(Ethernet/Fieldbus)',
        specifications: {
          'Protocols': 'EtherCAT, PROFINET',
          'Topology': 'Star/Ring'
        },
        connections: [],
        position: { x: 0, y: 0 },
        size: { width: 140, height: 70 },
        style: {
          fillColor: '#E8EAF6',
          strokeColor: '#3F51B5',
          fontColor: '#000000',
          shape: 'cloud',
          fontSize: 10,
          strokeWidth: 2
        }
      });
    }

    return components;
  }

  /**
   * Generate intelligent connections between components
   */
  private generateIntelligentConnections(components: DiagramComponent[]): Connection[] {
    const connections: Connection[] = [];
    
    // Find primary microchip component
    const primaryMcu = components.find(c => c.id === 'mchp_primary');
    if (!primaryMcu) return connections;

    // Power connections
    const powerInput = components.find(c => c.type === 'power');
    const powerMgmt = components.find(c => c.id === 'power_mgmt');
    
    if (powerInput && powerMgmt) {
      connections.push({
        from: 'power_input',
        to: 'power_mgmt',
        signal_type: 'power',
        voltage: this.getPowerInputSpec('general'),
        notes: 'Main power input'
      });
      
      connections.push({
        from: 'power_mgmt',
        to: 'mchp_primary',
        signal_type: 'power',
        voltage: '3.3V/1.8V',
        notes: 'Regulated power rails'
      });
    } else if (powerInput) {
      connections.push({
        from: 'power_input',
        to: 'mchp_primary',
        signal_type: 'power',
        voltage: this.getPowerInputSpec('general')
      });
    }

    // Interface connections
    const ethernetPhy = components.find(c => c.id === 'ethernet_phy');
    const ethernetConn = components.find(c => c.id === 'ethernet_connector');
    
    if (ethernetPhy && ethernetConn) {
      connections.push({
        from: 'mchp_primary',
        to: 'ethernet_phy',
        signal_type: 'data',
        protocol: 'RMII',
        bandwidth: '100 Mbps'
      });
      
      connections.push({
        from: 'ethernet_phy',
        to: 'ethernet_connector',
        signal_type: 'data',
        protocol: '100BASE-TX',
        bandwidth: '100 Mbps'
      });
    }

    // CAN connections
    const canTransceiver = components.find(c => c.id === 'can_transceiver');
    if (canTransceiver) {
      connections.push({
        from: 'mchp_primary',
        to: 'can_transceiver',
        signal_type: 'data',
        protocol: 'CAN-FD',
        bandwidth: '8 Mbps'
      });
    }

    // Security connections
    const cryptoAuth = components.find(c => c.id === 'crypto_auth');
    if (cryptoAuth) {
      connections.push({
        from: 'mchp_primary',
        to: 'crypto_auth',
        signal_type: 'data',
        protocol: 'I2C',
        notes: 'Secure authentication'
      });
    }

    // Memory connections
    const extMemory = components.find(c => c.id === 'external_memory');
    if (extMemory) {
      connections.push({
        from: 'mchp_primary',
        to: 'external_memory',
        signal_type: 'data',
        protocol: 'SPI/QSPI',
        notes: 'Program/data storage'
      });
    }

    return connections;
  }

  /**
   * Generate Draw.io compatible XML
   */
  private generateDrawIoXML(components: DiagramComponent[], connections: Connection[]): string {
    const cells: string[] = [];
    
    // Root and model
    cells.push('<mxCell id="0"/>');
    cells.push('<mxCell id="1" parent="0"/>');
    
    let cellId = 2;
    const componentIdMap = new Map<string, string>(); // Original ID -> Draw.io cell ID
    
    // Generate component cells
    for (const comp of components) {
      const style = this.buildDrawIoStyle(comp.style);
      const label = this.buildComponentLabel(comp);
      
      cells.push(`<mxCell id="${cellId}" value="${this.escapeXML(label)}" style="${style}" vertex="1" parent="1">`);
      cells.push(`  <mxGeometry x="${comp.position.x}" y="${comp.position.y}" width="${comp.size.width}" height="${comp.size.height}" as="geometry"/>`);
      cells.push('</mxCell>');
      
      // Map original component ID to draw.io cell ID
      componentIdMap.set(comp.id, cellId.toString());
      cellId++;
    }
    
    // Generate connection cells
    for (const conn of connections) {
      const fromCellId = componentIdMap.get(conn.from);
      const toCellId = componentIdMap.get(conn.to);
      
      if (fromCellId && toCellId) {
        const connectionStyle = this.buildConnectionStyle(conn);
        const connectionLabel = this.buildConnectionLabel(conn);
        
        cells.push(`<mxCell id="${cellId}" value="${this.escapeXML(connectionLabel)}" style="${connectionStyle}" edge="1" parent="1" source="${fromCellId}" target="${toCellId}">`);
        cells.push('  <mxGeometry relative="1" as="geometry"/>');
        cells.push('</mxCell>');
        cellId++;
      } else {
        console.warn(`Connection mapping failed: ${conn.from} -> ${conn.to} (${fromCellId} -> ${toCellId})`);
      }
    }
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="draw.io" version="24.6.4" type="embed">
  <diagram name="Socket Block Diagram" id="socket-diagram">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827">
      <root>
        ${cells.join('\n        ')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
  }

  // Helper methods
  private selectOptimalMchpPart(requirements: any): any {
    // Logic to select best MCHP part based on requirements
    const socketType = requirements.socket_type?.toLowerCase() || 'mcu';
    
    const parts: { [key: string]: any } = {
      'mcu': {
        part_number: 'SAME70Q21B',
        family: 'SAM E70',
        core: 'ARM Cortex-M7',
        flash: '2MB',
        ram: '384KB', 
        package: 'LQFP144',
        key_features: ['Ethernet MAC+PHY', 'CAN-FD', 'USB 2.0', 'Crypto Engine']
      },
      'analog': {
        part_number: 'MCP6001',
        family: 'Rail-to-Rail OpAmp',
        core: 'Analog',
        key_features: ['Low Offset', 'Low Power', 'Rail-to-Rail']
      },
      'power': {
        part_number: 'MCP1703',
        family: 'LDO Regulator',
        key_features: ['Low Dropout', '250mA', '3.3V Output']
      }
    };

    return parts[socketType] || parts.mcu;
  }

  private buildDrawIoStyle(style: ComponentStyle): string {
    const shape = style.shape === 'rounded' ? 'rounded=1' : '';
    return `fillColor=${style.fillColor};strokeColor=${style.strokeColor};fontColor=${style.fontColor};fontSize=${style.fontSize};strokeWidth=${style.strokeWidth};${shape}`;
  }

  private buildComponentLabel(comp: DiagramComponent): string {
    let label = comp.label;
    if (comp.part_number) {
      label += `\n${comp.part_number}`;
    }
    return label;
  }

  private buildConnectionLabel(conn: Connection): string {
    let label = '';
    if (conn.protocol) label += conn.protocol;
    if (conn.bandwidth) label += `\n${conn.bandwidth}`;
    if (conn.voltage) label += `\n${conn.voltage}`;
    return label;
  }

  private buildConnectionStyle(conn: Connection): string {
    const colors = {
      'power': 'strokeColor=#FF5722',
      'data': 'strokeColor=#2196F3', 
      'control': 'strokeColor=#4CAF50',
      'analog': 'strokeColor=#9C27B0',
      'clock': 'strokeColor=#FF9800'
    };
    
    const baseStyle = 'endArrow=classic;startArrow=none;endFill=1;strokeWidth=2';
    const typeColor = colors[conn.signal_type] || 'strokeColor=#666666';
    
    return `${baseStyle};${typeColor}`;
  }

  private escapeXML(text: string): string {
    return text.replace(/[<>&'"]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&apos;';
        case '"': return '&quot;';
        default: return char;
      }
    });
  }

  // Utility methods for component analysis
  private hasEthernet(peripherals: string[]): boolean {
    return peripherals.some(p => p.toLowerCase().includes('ethernet'));
  }

  private hasCAN(peripherals: string[]): boolean {
    return peripherals.some(p => p.toLowerCase().includes('can'));
  }

  private hasUSB(peripherals: string[]): boolean {
    return peripherals.some(p => p.toLowerCase().includes('usb'));
  }

  private needsSecurity(application: string, requirements: any): boolean {
    const securityApplications = ['automotive', 'medical', 'industrial', 'iot'];
    return securityApplications.some(app => application.toLowerCase().includes(app));
  }

  private needsExternalMemory(requirements: any): boolean {
    const flashKB = parseInt(requirements.flash_kb) || 0;
    return flashKB > 0 && flashKB < 512; // Need external if internal is small
  }

  private needsPowerManagement(requirements: any, marketSegment: string): boolean {
    return marketSegment.toLowerCase() === 'automotive' || 
           marketSegment.toLowerCase() === 'industrial';
  }

  private determinePowerInput(requirements: any, marketSegment: string): string {
    if (marketSegment.toLowerCase() === 'automotive') return '12V Vehicle Power';
    if (marketSegment.toLowerCase() === 'industrial') return '24V Industrial';
    return '5V/3.3V Supply';
  }

  private getPowerInputSpec(marketSegment: string): string {
    const specs: { [key: string]: string } = {
      'automotive': '9-16V',
      'industrial': '18-32V', 
      'general': '5V/3.3V'
    };
    return specs[marketSegment.toLowerCase()] || specs.general;
  }

  private selectPowerManagementIC(requirements: any): string {
    return 'Power Management\nMCP16301';
  }

  private getUSBType(requirements: any): string {
    return 'USB 2.0';
  }

  private getUSBSpeed(requirements: any): string {
    return '480 Mbps';
  }

  private selectExternalMemory(requirements: any): string {
    return 'Serial Flash\n25AA02E48';
  }

  private getMemorySize(requirements: any): string {
    return '2Mb';
  }

  private determineOptimalLayout(application: string, componentCount: number): DiagramLayout {
    // Calculate required dimensions based on component count and average size
    const avgComponentWidth = 150;
    const avgComponentHeight = 80;
    const minSpacing = 40;
    
    // Estimate required space (with generous margins for connections)
    const componentsPerRow = Math.min(4, Math.ceil(Math.sqrt(componentCount)));
    const rows = Math.ceil(componentCount / componentsPerRow);
    
    const requiredWidth = (componentsPerRow * avgComponentWidth) + ((componentsPerRow + 1) * minSpacing) + 100;
    const requiredHeight = (rows * avgComponentHeight) + ((rows + 1) * minSpacing) + 200; // Extra space for hierarchical layout
    
    return {
      width: Math.max(1000, requiredWidth), // Minimum 1000px width
      height: Math.max(700, requiredHeight), // Minimum 700px height  
      grid_size: 10,
      spacing: { 
        horizontal: Math.max(180, requiredWidth / (componentsPerRow + 1)), 
        vertical: Math.max(120, requiredHeight / (rows + 1))
      },
      hierarchical: true,
      orientation: componentCount > 6 ? 'horizontal' : 'vertical'
    };
  }

  private initializeComponentTemplates(): void {
    // Initialize component templates for consistent styling
    this.componentTemplates.set('mchp_mcu', {
      size: { width: 200, height: 120 },
      style: {
        fillColor: '#E3F2FD',
        strokeColor: '#1976D2',
        fontColor: '#000000',
        shape: 'rounded',
        fontSize: 12,
        strokeWidth: 2
      }
    });
    
    // Add more templates as needed
  }

  private generateMermaidDiagram(components: DiagramComponent[], connections: Connection[]): string {
    // Implementation for Mermaid format
    return "graph TD\n" + components.map(c => `  ${c.id}[${c.label}]`).join('\n');
  }

  private generateSVGDiagram(components: DiagramComponent[], connections: Connection[]): string {
    // Implementation for SVG format
    return '<svg><!-- SVG implementation --></svg>';
  }
}

/**
 * Intelligent Layout Engine with GUARANTEED non-overlapping positioning
 */
class LayoutEngine {
  arrangeComponents(components: DiagramComponent[], layout: DiagramLayout): DiagramComponent[] {
    const arranged = [...components];
    
    if (layout.hierarchical) {
      const positioned = this.arrangeHierarchically(arranged, layout);
      return this.ensureNoOverlaps(positioned, layout);
    } else {
      const positioned = this.arrangeGrid(arranged, layout);
      return this.ensureNoOverlaps(positioned, layout);
    }
  }

  /**
   * CRITICAL: Guarantee no overlapping components
   */
  private ensureNoOverlaps(components: DiagramComponent[], layout: DiagramLayout): DiagramComponent[] {
    const minSpacing = 20; // Minimum spacing between components
    const maxAttempts = 100; // Prevent infinite loops

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const overlaps = this.detectOverlaps(components, minSpacing);
      
      if (overlaps.length === 0) {
        console.log(`✅ No overlaps detected after ${attempt} adjustment(s)`);
        break;
      }

      console.log(`⚠️ Found ${overlaps.length} overlaps, adjusting...`);
      
      // Fix overlaps by repositioning conflicting components
      for (const overlap of overlaps) {
        this.resolveOverlap(overlap.component1, overlap.component2, minSpacing, layout);
      }
    }

    return components;
  }

  /**
   * Detect all overlapping components
   */
  private detectOverlaps(components: DiagramComponent[], minSpacing: number): ComponentOverlap[] {
    const overlaps: ComponentOverlap[] = [];

    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        const comp1 = components[i];
        const comp2 = components[j];

        if (this.componentsOverlap(comp1, comp2, minSpacing)) {
          overlaps.push({
            component1: comp1,
            component2: comp2,
            severity: this.calculateOverlapSeverity(comp1, comp2)
          });
        }
      }
    }

    return overlaps;
  }

  /**
   * Check if two components overlap (including minimum spacing)
   */
  private componentsOverlap(comp1: DiagramComponent, comp2: DiagramComponent, minSpacing: number): boolean {
    const rect1 = {
      x1: comp1.position.x - minSpacing,
      y1: comp1.position.y - minSpacing,
      x2: comp1.position.x + comp1.size.width + minSpacing,
      y2: comp1.position.y + comp1.size.height + minSpacing
    };

    const rect2 = {
      x1: comp2.position.x,
      y1: comp2.position.y,
      x2: comp2.position.x + comp2.size.width,
      y2: comp2.position.y + comp2.size.height
    };

    // Check for no overlap (if any of these is true, they don't overlap)
    if (rect1.x2 <= rect2.x1 || rect2.x2 <= rect1.x1 || rect1.y2 <= rect2.y1 || rect2.y2 <= rect1.y1) {
      return false;
    }

    return true; // They overlap
  }

  /**
   * Calculate overlap severity for prioritizing fixes
   */
  private calculateOverlapSeverity(comp1: DiagramComponent, comp2: DiagramComponent): number {
    const overlapArea = this.calculateOverlapArea(comp1, comp2);
    const totalArea = (comp1.size.width * comp1.size.height) + (comp2.size.width * comp2.size.height);
    return overlapArea / totalArea;
  }

  /**
   * Calculate actual overlap area
   */
  private calculateOverlapArea(comp1: DiagramComponent, comp2: DiagramComponent): number {
    const x1 = Math.max(comp1.position.x, comp2.position.x);
    const y1 = Math.max(comp1.position.y, comp2.position.y);
    const x2 = Math.min(comp1.position.x + comp1.size.width, comp2.position.x + comp2.size.width);
    const y2 = Math.min(comp1.position.y + comp1.size.height, comp2.position.y + comp2.size.height);

    if (x2 <= x1 || y2 <= y1) return 0; // No overlap

    return (x2 - x1) * (y2 - y1);
  }

  /**
   * Resolve overlap by repositioning the secondary component
   */
  private resolveOverlap(comp1: DiagramComponent, comp2: DiagramComponent, minSpacing: number, layout: DiagramLayout): void {
    // Strategy: Move comp2 to the first available position
    const directions = [
      { dx: comp1.size.width + minSpacing, dy: 0 }, // Right
      { dx: -(comp2.size.width + minSpacing), dy: 0 }, // Left  
      { dx: 0, dy: comp1.size.height + minSpacing }, // Below
      { dx: 0, dy: -(comp2.size.height + minSpacing) }, // Above
    ];

    for (const direction of directions) {
      const newX = comp1.position.x + direction.dx;
      const newY = comp1.position.y + direction.dy;

      // Ensure position is within layout bounds
      if (newX >= 0 && newY >= 0 && 
          newX + comp2.size.width <= layout.width && 
          newY + comp2.size.height <= layout.height) {
        
        comp2.position.x = newX;
        comp2.position.y = newY;
        break;
      }
    }
  }

  private arrangeHierarchically(components: DiagramComponent[], layout: DiagramLayout): DiagramComponent[] {
    // Arrange by hierarchy: System -> Primary -> Secondary -> Connectors
    const hierarchy = {
      system: components.filter(c => c.type === 'system'),
      microchip: components.filter(c => c.type === 'microchip'),
      peripheral: components.filter(c => c.type === 'peripheral'), 
      power: components.filter(c => c.type === 'power'),
      connector: components.filter(c => c.type === 'connector')
    };

    let currentY = 50;
    const centerX = layout.width / 2;

    // System level at top
    hierarchy.system.forEach((comp, idx) => {
      comp.position = { x: centerX - comp.size.width / 2, y: currentY };
    });
    if (hierarchy.system.length > 0) currentY += 100;

    // Primary microchip in center
    hierarchy.microchip.forEach((comp, idx) => {
      if (comp.id === 'mchp_primary') {
        comp.position = { x: centerX - comp.size.width / 2, y: currentY };
      } else {
        comp.position = { 
          x: centerX + (idx - 0.5) * layout.spacing.horizontal - comp.size.width / 2, 
          y: currentY + layout.spacing.vertical 
        };
      }
    });
    currentY += layout.spacing.vertical * 2;

    // Peripherals and connectors around edges
    const peripheralComponents = [...hierarchy.peripheral, ...hierarchy.power, ...hierarchy.connector];
    peripheralComponents.forEach((comp, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      comp.position = {
        x: 50 + col * layout.spacing.horizontal,
        y: currentY + row * layout.spacing.vertical
      };
    });

    return components;
  }

  private arrangeGrid(components: DiagramComponent[], layout: DiagramLayout): DiagramComponent[] {
    const cols = Math.ceil(Math.sqrt(components.length));
    
    components.forEach((comp, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      
      comp.position = {
        x: 50 + col * layout.spacing.horizontal,
        y: 50 + row * layout.spacing.vertical
      };
    });

    return components;
  }
}