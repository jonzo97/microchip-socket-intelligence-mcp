#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { ChromaResearchProcessor } from './chroma-research-processor.js';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { BlockDiagramGenerator } from './block-diagram-generator.js';
import { ParameterValidator } from './parameter-validator.js';
import { ApiRateLimiter } from './api-rate-limiter.js';
import {
  QualificationResult,
  SearchResult,
  SearchFilters,
  SocketRequirements,
  BlockDiagramRequirements,
  DisplacementContext
} from './types.js';

class SocketIntelligenceServer {
  private server: Server;
  private chromaProcessor: ChromaResearchProcessor | null = null;
  private openai: OpenAI | null = null;
  private researchCache: Map<string, any> = new Map();
  private blockDiagramGenerator: BlockDiagramGenerator;
  private parameterValidator: ParameterValidator;
  private rateLimiter: ApiRateLimiter;
  private initialized = false;

  constructor() {
    this.server = new Server(
      {
        name: "socket-intelligence-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.blockDiagramGenerator = new BlockDiagramGenerator();
    this.parameterValidator = new ParameterValidator();
    this.rateLimiter = new ApiRateLimiter();
    this.setupErrorHandling();
    this.setupToolHandlers();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize Chroma Research Processor
      const openaiKey = process.env.OPENAI_API_KEY;
      if (openaiKey) {
        this.chromaProcessor = new ChromaResearchProcessor(
          openaiKey,
          'http://localhost:8000',
          'socket-intelligence'
        );
        
        // Test connection
        const connected = await this.chromaProcessor.testConnection();
        if (connected) {
          console.log("Chroma vector database initialized successfully");
        } else {
          console.log("⚠️ Chroma server not available - vector search disabled");
          this.chromaProcessor = null;
        }
      }

      // Initialize OpenAI (if not already initialized by Chroma)
      if (openaiKey && !this.openai) {
        this.openai = new OpenAI({
          apiKey: openaiKey,
        });
        console.log("OpenAI initialized successfully");
      }

      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize services:", error);
      // Continue without external services for testing
    }
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "qualify_socket",
            description: "Qualify a socket opportunity based on technical requirements and competitive landscape",
            inputSchema: {
              type: "object",
              properties: {
                socket_type: {
                  type: "string",
                  enum: ["MCU", "FPGA", "Analog", "Power", "Clock", "Interface", "RF", "Memory"],
                  description: "Category of semiconductor socket"
                },
                requirements: {
                  type: "object",
                  description: "Technical requirements specific to socket type",
                  additionalProperties: true
                },
                application: {
                  type: "string",
                  description: "Target application or use case"
                },
                volume: {
                  type: "string",
                  enum: ["prototype", "low", "medium", "high"],
                  description: "Expected annual volume"
                },
                competition: {
                  type: "array",
                  items: { type: "string" },
                  description: "Known competitor solutions"
                }
              },
              required: ["socket_type", "requirements"]
            }
          },
          {
            name: "search_intelligence",
            description: "Semantic search across strategic research archive",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Natural language search query"
                },
                filters: {
                  type: "object",
                  properties: {
                    socket_category: { type: "string" },
                    market_segment: { type: "string" },
                    confidence_level: {
                      type: "string",
                      enum: ["A", "B", "C", "D"]
                    },
                    content_type: {
                      type: "string",
                      enum: ["market_analysis", "competitive_intel", "technical_spec", "customer_requirement"]
                    }
                  }
                },
                limit: {
                  type: "number",
                  default: 10,
                  maximum: 50
                }
              },
              required: ["query"]
            }
          },
          {
            name: "generate_block_diagram", 
            description: "Generate comprehensive system block diagram with intelligent layout - supports draw.io XML, SVG, Mermaid formats with proper component sizing and connection routing",
            inputSchema: {
              type: "object",
              properties: {
                application: {
                  type: "string",
                  description: "System or application type"
                },
                market_segment: {
                  type: "string",
                  enum: ["Automotive", "Industrial", "Medical", "Consumer", "Infrastructure"]
                },
                requirements: {
                  type: "object",
                  properties: {
                    performance_tier: {
                      type: "string",
                      enum: ["entry", "mainstream", "high_performance"]
                    },
                    certifications: {
                      type: "array",
                      items: { type: "string" }
                    },
                    special_features: {
                      type: "array",
                      items: { type: "string" }
                    }
                  }
                },
                output_format: {
                  type: "string",
                  enum: ["drawio", "mermaid", "svg", "json"],
                  default: "drawio",
                  description: "Output format: drawio (XML for draw.io), mermaid, svg, or json"
                }
              },
              required: ["application", "market_segment"]
            }
          },
          {
            name: "analyze_displacement",
            description: "Analyze opportunity to displace competitor solution",
            inputSchema: {
              type: "object",
              properties: {
                competitor_part: {
                  type: "string",
                  description: "Competitor part number or family"
                },
                customer_context: {
                  type: "object",
                  properties: {
                    current_satisfaction: {
                      type: "string",
                      enum: ["high", "medium", "low"]
                    },
                    pain_points: {
                      type: "array",
                      items: { type: "string" }
                    },
                    switching_barriers: {
                      type: "array",
                      items: { type: "string" }
                    }
                  }
                },
                timeline: {
                  type: "string",
                  description: "Design cycle timing"
                }
              },
              required: ["competitor_part"]
            }
          },
          {
            name: "find_similar_sockets",
            description: "Find similar sockets from research archive based on requirements",
            inputSchema: {
              type: "object",
              properties: {
                reference: {
                  type: "object",
                  description: "Reference socket specifications or part number"
                },
                similarity_threshold: {
                  type: "number",
                  minimum: 0,
                  maximum: 1,
                  default: 0.7
                },
                include_competitors: {
                  type: "boolean",
                  default: true
                }
              },
              required: ["reference"]
            }
          },
          {
            name: "debug_server_status",
            description: "Get server status and debugging information",
            inputSchema: {
              type: "object",
              properties: {
                include_cache: {
                  type: "boolean",
                  description: "Include cache status in response",
                  default: false
                },
                reset_circuit_breakers: {
                  type: "boolean", 
                  description: "Reset API circuit breakers",
                  default: false
                }
              }
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      await this.initialize();
      
      const { name, arguments: args } = request.params;

      try {
        let result;
        
        switch (name) {
          case "qualify_socket":
            result = await this.qualifySocket(
              args?.socket_type as string,
              args?.requirements as any,
              args?.application as string,
              args?.volume as string,
              args?.competition as string[]
            );
            break;
          
          case "search_intelligence":
            result = await this.searchIntelligence(
              args?.query as string,
              args?.filters as any,
              args?.limit as number
            );
            break;
          
          case "generate_block_diagram":
            result = await this.generateBlockDiagram(
              args?.application as string,
              args?.market_segment as string,
              args?.requirements as any,
              args?.output_format as string
            );
            break;
          
          case "analyze_displacement":
            result = await this.analyzeDisplacement(
              args?.competitor_part as string,
              args?.customer_context as any,
              args?.timeline as string
            );
            break;
          
          case "find_similar_sockets":
            result = await this.findSimilarSockets(
              args?.reference as any,
              args?.similarity_threshold as number,
              args?.include_competitors as boolean
            );
            break;
          
          case "debug_server_status":
            result = await this.getServerStatus(
              args?.include_cache as boolean,
              args?.reset_circuit_breakers as boolean
            );
            break;
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error(`Error in tool ${name}:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Enhanced error categorization
        if (error instanceof Error) {
          if (error.message.includes('Circuit breaker is open')) {
            throw new McpError(ErrorCode.InternalError, `Service temporarily unavailable: ${error.message}`);
          } else if (error.message.includes('rate limit') || error.message.includes('overloaded')) {
            throw new McpError(ErrorCode.InternalError, `Rate limit exceeded: ${error.message}`);
          } else if (error.message.includes('timeout')) {
            throw new McpError(ErrorCode.InternalError, `Operation timed out: ${error.message}`);
          }
        }
        
        throw new McpError(ErrorCode.InternalError, errorMessage);
      }
    });
  }

  // Tool Implementation Methods
  private async qualifySocket(
    socketType: string,
    requirements: SocketRequirements,
    application?: string,
    volume?: string,
    competition?: string[]
  ): Promise<QualificationResult> {
    // Validate parameters first
    const validation = await this.parameterValidator.validateSocketRequirements(
      { ...requirements, socket_type: socketType },
      application
    );

    // If critical validation errors, return them in the response
    if (!validation.valid) {
      const criticalErrors = validation.errors.filter(e => e.severity === 'critical');
      if (criticalErrors.length > 0) {
        return {
          qualification_score: 0,
          mchp_solution: {
            part: "VALIDATION_ERROR",
            match_percentage: 0,
            advantages: [],
            gaps: criticalErrors.map(e => `${e.field}: ${e.message}`)
          },
          competitive_analysis: {
            win_probability: 0,
            displacement_difficulty: "impossible" as any,
            key_differentiators: ["Fix validation errors first"]
          },
          recommendations: [
            "Address parameter validation errors:",
            ...criticalErrors.map(e => `- ${e.message}`),
            ...(validation.suggestions.length > 0 ? ["Consider these suggestions:"] : []),
            ...validation.suggestions.map(s => `- ${s.field}: ${s.reason}`)
          ]
        };
      }
    }

    // Use corrected requirements if available
    const finalRequirements = validation.correctedRequirements || { ...requirements, socket_type: socketType };

    // Enhanced qualification with validation insights
    const baseScore = 0.75;
    
    // Adjust score based on validation results
    let adjustedScore = baseScore;
    
    // Penalize for warnings
    adjustedScore -= validation.warnings.length * 0.05;
    
    // Boost for good parameter optimization
    if (validation.suggestions.some(s => s.confidence > 0.8)) {
      adjustedScore += 0.1;
    }
    
    adjustedScore = Math.max(0.1, Math.min(1.0, adjustedScore));

    // Generate enhanced recommendations including validation insights
    const recommendations = [
      "Emphasize ecosystem advantages",
      "Address power consumption concerns"
    ];

    // Add validation-based recommendations
    if (validation.warnings.length > 0) {
      recommendations.push("Parameter validation warnings:");
      validation.warnings.forEach(w => {
        recommendations.push(`- ${w.field}: ${w.message}`);
      });
    }

    if (validation.suggestions.length > 0) {
      recommendations.push("Optimization suggestions:");
      validation.suggestions.forEach(s => {
        if (s.confidence > 0.7) {
          recommendations.push(`- ${s.reason}`);
        }
      });
    }

    return {
      qualification_score: adjustedScore,
      mchp_solution: {
        part: this.selectOptimalPart(finalRequirements, application),
        match_percentage: Math.round(adjustedScore * 100),
        advantages: [
          "Better integration", 
          "Lower cost",
          ...(validation.suggestions.length > 0 ? ["Optimized parameters"] : [])
        ],
        gaps: [
          ...(validation.warnings.length > 0 ? [`${validation.warnings.length} parameter warnings`] : []),
          "Higher power consumption"
        ]
      },
      competitive_analysis: {
        win_probability: adjustedScore * 0.85, // Slightly lower than qualification score
        displacement_difficulty: validation.errors.length > 0 ? "hard" : "medium",
        key_differentiators: [
          "Superior ecosystem support",
          ...(validation.valid ? ["Well-validated requirements"] : ["Needs requirement refinement"])
        ]
      },
      recommendations
    };
  }

  private selectOptimalPart(requirements: SocketRequirements, application?: string): string {
    // Simple part selection logic based on requirements
    if (requirements.socket_type === 'MCU') {
      if (requirements.max_clock_mhz && requirements.max_clock_mhz > 200) {
        return 'SAME70Q21B'; // High performance ARM Cortex-M7
      } else if (requirements.flash_kb && requirements.flash_kb > 1024) {
        return 'SAMV71Q21B'; // Large memory ARM Cortex-M7
      } else if (application?.toLowerCase().includes('motor')) {
        return 'dsPIC33CK256MP508'; // Motor control specialized
      } else {
        return 'SAMD21G18A'; // General purpose ARM Cortex-M0+
      }
    } else if (requirements.socket_type === 'Analog') {
      return 'MCP6001'; // General purpose OpAmp
    } else if (requirements.socket_type === 'Power') {
      return 'MCP1703'; // LDO regulator
    }
    
    return 'Contact FAE for specific recommendation';
  }

  private async searchIntelligence(
    query: string,
    filters?: SearchFilters,
    limit: number = 10
  ): Promise<SearchResult[]> {
    if (!this.chromaProcessor) {
      console.log('⚠️ Vector search unavailable - Chroma not initialized');
      return [];
    }

    try {
      // Convert SearchFilters to Chroma filters
      const chromaFilters: any = {};
      if (filters?.socket_type) {
        chromaFilters.socket_type = { '$eq': filters.socket_type };
      }
      if (filters?.application) {
        chromaFilters.application = { '$eq': filters.application };
      }
      if (filters?.market_segment) {
        chromaFilters.market_segment = { '$eq': filters.market_segment };
      }
      if (filters?.confidence_level) {
        chromaFilters.confidence_level = { '$eq': filters.confidence_level };
      }

      // Search vectors in Chroma with rate limiting
      const results = await this.rateLimiter.executeChroma(
        () => this.chromaProcessor!.searchVectors(query, chromaFilters, limit),
        'vector_search'
      );
      
      // Convert Chroma results to SearchResult format
      const searchResults: SearchResult[] = [];
      for (let i = 0; i < results.ids.length; i++) {
        searchResults.push({
          id: results.ids[i],
          content: results.documents[i],
          metadata: {
            socket_type: results.metadatas[i]?.socket_type || 'Unknown',
            application: results.metadatas[i]?.application || 'General',
            confidence: results.metadatas[i]?.confidence_level || 'C',
            source: results.metadatas[i]?.filename || 'unknown.md'
          },
          score: 1.0 - (results.distances[i] || 0) // Convert distance to similarity score
        });
      }

      console.log(`🔍 Found ${searchResults.length} results for query: ${query}`);
      return searchResults;

    } catch (error) {
      console.error('❌ Vector search failed:', error);
      return [];
    }
  }

  private async generateBlockDiagram(
    application: string,
    marketSegment: string,
    requirements?: BlockDiagramRequirements,
    outputFormat: string = "drawio"
  ): Promise<any> {
    // Create mock socket requirements for diagram generation
    const socketRequirements = {
      socket_type: requirements?.performance_tier === 'high_performance' ? 'MCU' : 'MCU',
      peripherals: this.inferPeripherals(application),
      certifications: requirements?.certifications || [],
      special_features: requirements?.special_features || [],
      flash_kb: 2048,
      automotive_qualified: marketSegment.toLowerCase() === 'automotive'
    };

    // Generate comprehensive block diagram
    const diagramContent = await this.blockDiagramGenerator.generateSystemDiagram(
      application,
      marketSegment,
      socketRequirements,
      requirements,
      outputFormat as 'drawio' | 'mermaid' | 'svg' | 'json'
    );

    return {
      application,
      market_segment: marketSegment,
      format: outputFormat,
      content: diagramContent,
      socket_recommendations: this.extractSocketRecommendations(socketRequirements),
      system_notes: this.generateSystemNotes(application, marketSegment, requirements)
    };
  }

  private inferPeripherals(application: string): string[] {
    const app = application.toLowerCase();
    const peripherals: string[] = [];

    if (app.includes('automotive') || app.includes('gateway') || app.includes('telematics')) {
      peripherals.push('CAN-FD', 'LIN', 'Ethernet');
    }
    
    if (app.includes('industrial') || app.includes('automation') || app.includes('plc')) {
      peripherals.push('Ethernet', 'RS-485', 'SPI', 'I2C');
    }
    
    if (app.includes('iot') || app.includes('wireless') || app.includes('connected')) {
      peripherals.push('WiFi', 'Bluetooth', 'USB');
    }
    
    if (app.includes('medical') || app.includes('healthcare')) {
      peripherals.push('USB', 'Bluetooth', 'ADC', 'DAC');
    }

    // Default peripherals for most applications
    if (peripherals.length === 0) {
      peripherals.push('USB', 'SPI', 'I2C', 'UART');
    }

    return peripherals;
  }

  private extractSocketRecommendations(socketRequirements: any): any {
    return {
      primary_socket: 'SAME70Q21B',
      alternative_sockets: ['SAMV71Q21B', 'PIC32MZ2048EFH144'],
      rationale: 'High-performance ARM Cortex-M7 with integrated Ethernet MAC+PHY',
      bundle_opportunities: ['KSZ8081 Ethernet PHY', 'ATECC608B Crypto Auth', 'MCP2562FD CAN Transceiver']
    };
  }

  private generateSystemNotes(application: string, marketSegment: string, requirements?: BlockDiagramRequirements): string[] {
    const notes: string[] = [];
    
    if (marketSegment.toLowerCase() === 'automotive') {
      notes.push('Design must meet AEC-Q100 automotive qualification requirements');
      notes.push('Consider ISO 26262 functional safety requirements for ASIL levels');
    }
    
    if (application.toLowerCase().includes('ethernet') || application.toLowerCase().includes('network')) {
      notes.push('Implement TSN (Time-Sensitive Networking) for deterministic communication');
      notes.push('Consider EMI/EMC compliance for automotive Ethernet (100BASE-T1)');
    }
    
    if (requirements?.certifications?.includes('medical')) {
      notes.push('Ensure IEC 62304 compliance for medical device software');
      notes.push('Consider patient safety isolation requirements');
    }

    notes.push('All component selections prioritize Microchip solutions for ecosystem benefits');
    notes.push('Layout should minimize trace lengths for high-speed signals');
    
    return notes;
  }

  private async analyzeDisplacement(
    competitorPart: string,
    customerContext?: DisplacementContext,
    timeline?: string
  ): Promise<any> {
    // Mock implementation
    return {
      competitor_part: competitorPart,
      displacement_difficulty: "medium",
      win_probability: 0.60,
      key_advantages: ["Cost advantage", "Better support"],
      strategy: "Focus on total system cost and ecosystem benefits"
    };
  }

  private async findSimilarSockets(
    reference: any,
    similarityThreshold: number = 0.7,
    includeCompetitors: boolean = true
  ): Promise<any[]> {
    // Mock implementation
    return [
      {
        socket_name: "Similar Socket 1",
        similarity_score: 0.85,
        key_similarities: ["Same application space", "Similar requirements"],
        differences: ["Higher performance tier"]
      }
    ];
  }

  private async getServerStatus(includeCache: boolean = false, resetCircuitBreakers: boolean = false): Promise<any> {
    if (resetCircuitBreakers) {
      this.rateLimiter.resetCircuitBreakers();
    }

    const status = {
      server_info: {
        initialized: this.initialized,
        version: "1.0.0",
        uptime: process.uptime()
      },
      services: {
        chroma_processor: {
          available: !!this.chromaProcessor,
          status: this.chromaProcessor ? "connected" : "not_available"
        },
        openai: {
          available: !!this.openai,
          status: this.openai ? "connected" : "not_available"
        }
      },
      rate_limiter: this.rateLimiter.getStatus(),
      cache: includeCache ? {
        research_cache_size: this.researchCache.size,
        cache_keys: Array.from(this.researchCache.keys())
      } : { enabled: true, size: this.researchCache.size }
    };

    console.log('📊 Server status requested:', status);
    return status;
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Socket Intelligence MCP Server running on stdio");
  }
}

const server = new SocketIntelligenceServer();
server.run().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});