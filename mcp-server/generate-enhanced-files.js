const fs = require('fs');
const path = require('path');

class EnhancedFileGenerator {
  constructor() {
    this.sourceDirectories = [
      '../socket-research-batch/outputs',
      '../socket-research-priority/output-dropzones'
    ];
    
    this.outputBase = './intelligence-database';
    this.enhancedDir = path.join(this.outputBase, 'enhanced-context');
    this.analysisResults = {
      files: [],
      statistics: {},
      competitiveIntel: {},
      socketProfiles: {}
    };
  }

  async generateAllEnhancedFiles() {
    console.log('🚀 Starting Enhanced File Generation with Metadata Tagging\n');
    
    // Create output directories
    this.createOutputDirectories();
    
    // Process all research files
    let totalProcessed = 0;
    let filesByCategory = {};
    let filesBySegment = {};
    let confidenceCounts = { A: 0, B: 0, C: 0, D: 0 };
    
    for (const sourceDir of this.sourceDirectories) {
      const fullPath = path.join(__dirname, sourceDir);
      if (!fs.existsSync(fullPath)) continue;
      
      const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.md'));
      
      for (const filename of files) {
        const filePath = path.join(fullPath, filename);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        if (content.trim().length < 100) {
          console.log(`⚠️ Skipping empty file: ${filename}`);
          continue;
        }
        
        // Analyze and enhance the file
        const analysis = this.analyzeFile(filename, content, sourceDir);
        const enhancedContent = this.createEnhancedContent(filename, content, analysis);
        
        // Save enhanced file
        const outputPath = path.join(this.enhancedDir, `enhanced-${filename}`);
        fs.writeFileSync(outputPath, enhancedContent);
        
        // Track statistics
        totalProcessed++;
        filesByCategory[analysis.socket_category] = (filesByCategory[analysis.socket_category] || 0) + 1;
        filesBySegment[analysis.market_segment] = (filesBySegment[analysis.market_segment] || 0) + 1;
        confidenceCounts[analysis.confidence_level]++;
        
        // Store in results
        this.analysisResults.files.push({
          original_path: filePath,
          enhanced_path: outputPath,
          ...analysis
        });
        
        console.log(`✅ Enhanced: ${filename} [${analysis.socket_category}/${analysis.market_segment}/${analysis.confidence_level}]`);
      }
    }
    
    // Generate statistics
    this.analysisResults.statistics = {
      total_files_processed: totalProcessed,
      files_by_category: filesByCategory,
      files_by_segment: filesBySegment,
      confidence_distribution: confidenceCounts,
      average_content_length: this.analysisResults.files.reduce((sum, f) => sum + f.content_length, 0) / totalProcessed,
      processing_date: new Date().toISOString()
    };
    
    // Save analysis artifacts
    await this.saveAnalysisArtifacts();
    
    console.log('\n📊 GENERATION COMPLETE');
    console.log(`Total Files Enhanced: ${totalProcessed}`);
    console.log(`Output Directory: ${this.enhancedDir}`);
    
    return this.analysisResults;
  }

  analyzeFile(filename, content, sourceDir) {
    const analysis = {
      filename,
      source_directory: sourceDir,
      content_length: content.length,
      line_count: content.split('\n').length,
      socket_category: this.identifySocketCategory(filename, content),
      market_segment: this.identifyMarketSegment(filename, content),
      confidence_level: this.assessConfidenceLevel(content),
      content_type: this.identifyContentType(filename, content),
      key_insights: this.extractKeyInsights(content),
      competitive_intelligence: this.extractCompetitiveIntel(content),
      technical_tags: this.extractTechnicalTags(content),
      quality_score: this.calculateQualityScore(content),
      processing_timestamp: new Date().toISOString()
    };
    
    return analysis;
  }

  identifySocketCategory(filename, content) {
    const categories = {
      'MCU': ['mcu', 'microcontroller', 'cortex', 'arm', 'dspic', 'pic32', 'sam'],
      'ANALOG': ['analog', 'amplifier', 'opamp', 'adc', 'dac', 'precision', 'sensor'],
      'POWER': ['power', 'regulator', 'converter', 'charger', 'pmic', 'ldo', 'buck', 'boost'],
      'INTERFACE': ['interface', 'ethernet', 'usb', 'can', 'spi', 'uart', 'i2c', 'serdes'],
      'RF': ['wireless', 'wifi', 'bluetooth', 'rf', 'transceiver', 'radio'],
      'MEMORY': ['memory', 'eeprom', 'flash', 'sram', 'ddr', 'controller'],
      'CLOCK': ['clock', 'timing', 'oscillator', 'pll', 'jitter', 'frequency'],
      'SECURITY': ['security', 'crypto', 'authentication', 'secure', 'trust'],
      'FPGA': ['fpga', 'programmable', 'logic', 'lut', 'cpld']
    };
    
    const lower = (filename + ' ' + content).toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lower.includes(keyword))) {
        return category;
      }
    }
    
    return 'MIXED_SIGNAL';
  }

  identifyMarketSegment(filename, content) {
    const segments = {
      'AUTOMOTIVE': ['automotive', 'vehicle', 'car', 'asil', 'aec-q', 'telematics', 'adas', 'ev'],
      'INDUSTRIAL': ['industrial', 'automation', 'plc', 'factory', 'manufacturing', 'robot', 'motor'],
      'MEDICAL': ['medical', 'healthcare', 'patient', 'diagnostic', 'hospital', 'clinical'],
      'CONSUMER': ['consumer', 'home', 'appliance', 'gaming', 'entertainment', 'wearable'],
      'INFRASTRUCTURE': ['telecom', 'network', 'base station', 'datacenter', '5g', 'cloud'],
      'IOT': ['iot', 'edge', 'sensor', 'smart', 'connected', 'mesh'],
      'AEROSPACE': ['aerospace', 'aviation', 'satellite', 'defense', 'military']
    };
    
    const lower = (filename + ' ' + content).toLowerCase();
    
    for (const [segment, keywords] of Object.entries(segments)) {
      if (keywords.some(keyword => lower.includes(keyword))) {
        return segment;
      }
    }
    
    return 'GENERAL';
  }

  assessConfidenceLevel(content) {
    let score = 0;
    
    // Length scoring
    if (content.length > 10000) score += 4;
    else if (content.length > 5000) score += 3;
    else if (content.length > 2000) score += 2;
    else if (content.length > 1000) score += 1;
    
    // Quality indicators
    if (/\d+%/.test(content)) score += 2; // Has percentages
    if (/\$[\d,]+[MBK]?/.test(content)) score += 2; // Has financial data
    if (/(market share|TAM|SAM|CAGR)/i.test(content)) score += 2; // Market metrics
    if (/(TI|STM|NXP|Infineon|Broadcom|Intel|ADI)/i.test(content)) score += 1; // Competitors
    if (/\d+\.\d+/.test(content)) score += 1; // Decimal numbers (precise data)
    if (content.includes('##')) score += 1; // Structured with subheadings
    
    // Map score to confidence level
    if (score >= 10) return 'A';
    if (score >= 7) return 'B';
    if (score >= 4) return 'C';
    return 'D';
  }

  identifyContentType(filename, content) {
    if (/(market|TAM|SAM|growth|forecast)/i.test(content)) return 'market_analysis';
    if (/(competitive|competitor|vs\.|versus|displacement)/i.test(content)) return 'competitive_intel';
    if (/(specification|datasheet|parameter|performance)/i.test(content)) return 'technical_spec';
    if (/(customer|requirement|application|use case)/i.test(content)) return 'customer_requirement';
    return 'general_research';
  }

  extractKeyInsights(content) {
    const insights = [];
    
    // Look for percentage mentions (often key metrics)
    const percentages = content.match(/.*\d+%[^.!?\n]*/g) || [];
    insights.push(...percentages.slice(0, 2).map(s => s.trim().substring(0, 150)));
    
    // Look for dollar amounts (market sizes)
    const dollars = content.match(/.*\$[\d,]+[MBK]?[^.!?\n]*/g) || [];
    insights.push(...dollars.slice(0, 2).map(s => s.trim().substring(0, 150)));
    
    // Look for bullet points (often key findings)
    const bullets = content.match(/^[\s]*[-•*]\s+(.+)/gm) || [];
    insights.push(...bullets.slice(0, 3).map(s => s.replace(/^[\s]*[-•*]\s+/, '').substring(0, 150)));
    
    // Look for "key" statements
    const keyStatements = content.match(/key\s+\w+:?\s*([^.!?\n]+)/gi) || [];
    insights.push(...keyStatements.slice(0, 2).map(s => s.substring(0, 150)));
    
    return [...new Set(insights)].slice(0, 5); // Unique, top 5
  }

  extractCompetitiveIntel(content) {
    const intel = {
      mchp_advantages: [],
      mchp_gaps: [],
      competitor_threats: [],
      win_factors: []
    };
    
    // MCHP advantages
    const advantages = content.match(/(microchip|mchp).{0,100}(advantage|strength|lead|superior|best)/gi) || [];
    intel.mchp_advantages.push(...advantages.slice(0, 2).map(s => s.substring(0, 100)));
    
    // MCHP gaps
    const gaps = content.match(/(microchip|mchp).{0,100}(gap|weakness|lack|behind|challenge)/gi) || [];
    intel.mchp_gaps.push(...gaps.slice(0, 2).map(s => s.substring(0, 100)));
    
    // Competitor mentions
    const competitors = ['TI', 'STMicroelectronics', 'STM', 'NXP', 'Infineon', 'Broadcom', 'Intel', 'ADI', 'Analog Devices'];
    for (const comp of competitors) {
      const regex = new RegExp(`${comp}.{0,100}(lead|dominate|strength|advantage)`, 'gi');
      const matches = content.match(regex) || [];
      if (matches.length > 0) {
        intel.competitor_threats.push(`${comp}: ${matches[0].substring(0, 100)}`);
      }
    }
    
    // Win factors
    const winFactors = content.match(/(win|success|advantage).{0,100}(factor|driver|reason)/gi) || [];
    intel.win_factors.push(...winFactors.slice(0, 2).map(s => s.substring(0, 100)));
    
    return intel;
  }

  extractTechnicalTags(content) {
    const tags = new Set();
    
    const technicalTerms = {
      'TSN': /\bTSN\b/i,
      'CAN-FD': /CAN-?FD/i,
      'ETHERNET': /ethernet/i,
      'USB': /\bUSB\b/i,
      'SPI': /\bSPI\b/i,
      'I2C': /\bI2C\b/i,
      'UART': /\bUART\b/i,
      'PWM': /\bPWM\b/i,
      'ADC': /\bADC\b/i,
      'DAC': /\bDAC\b/i,
      'WIRELESS': /wireless|wifi|bluetooth/i,
      'AUTOMOTIVE': /automotive|ASIL|AEC-Q/i,
      'INDUSTRIAL': /industrial|PLC|automation/i,
      'AI-ML': /\bAI\b|\bML\b|machine learning|artificial intelligence/i,
      'IOT': /\bIoT\b|internet of things/i,
      '5G': /\b5G\b/i,
      'SECURITY': /security|crypto|authentication/i,
      'POWER': /power management|PMIC|regulator/i
    };
    
    for (const [tag, regex] of Object.entries(technicalTerms)) {
      if (regex.test(content)) {
        tags.add(tag);
      }
    }
    
    return Array.from(tags);
  }

  calculateQualityScore(content) {
    let score = 0;
    const maxScore = 100;
    
    // Content depth (30 points)
    if (content.length > 15000) score += 30;
    else if (content.length > 10000) score += 25;
    else if (content.length > 5000) score += 20;
    else if (content.length > 2000) score += 10;
    else score += 5;
    
    // Structure (20 points)
    if (content.includes('###')) score += 10; // Has subsections
    if (content.includes('##')) score += 10; // Has sections
    
    // Data richness (30 points)
    if (/\d+%/.test(content)) score += 10; // Percentages
    if (/\$[\d,]+/.test(content)) score += 10; // Financial data
    if (/\d+\.\d+/.test(content)) score += 10; // Precise numbers
    
    // Competitive analysis (20 points)
    const competitorCount = (content.match(/(TI|STM|NXP|Infineon|Broadcom)/gi) || []).length;
    score += Math.min(20, competitorCount * 5);
    
    return Math.round((score / maxScore) * 100);
  }

  createEnhancedContent(filename, originalContent, analysis) {
    const enhancedHeader = `---
# SOCKET INTELLIGENCE METADATA
filename: ${filename}
generated: ${new Date().toISOString()}
processor_version: 1.0.0

## Classification
socket_category: ${analysis.socket_category}
market_segment: ${analysis.market_segment}
confidence_level: ${analysis.confidence_level}
content_type: ${analysis.content_type}
quality_score: ${analysis.quality_score}%

## Metrics
content_length: ${analysis.content_length} characters
line_count: ${analysis.line_count} lines
technical_tags: [${analysis.technical_tags.join(', ')}]

## Key Insights
${analysis.key_insights.map((insight, i) => `${i + 1}. ${insight}`).join('\n')}

## Competitive Intelligence
### MCHP Advantages
${analysis.competitive_intelligence.mchp_advantages.map(a => `- ${a}`).join('\n') || '- No explicit advantages found'}

### MCHP Gaps
${analysis.competitive_intelligence.mchp_gaps.map(g => `- ${g}`).join('\n') || '- No explicit gaps found'}

### Competitor Threats
${analysis.competitive_intelligence.competitor_threats.map(t => `- ${t}`).join('\n') || '- No explicit threats identified'}

### Win Factors
${analysis.competitive_intelligence.win_factors.map(w => `- ${w}`).join('\n') || '- No win factors extracted'}

## Processing Notes
- Original source: ${analysis.source_directory}
- Processing timestamp: ${analysis.processing_timestamp}
- Confidence assessment: Based on content depth, data richness, and structure
- Ready for vector embedding: ${analysis.confidence_level === 'A' || analysis.confidence_level === 'B' ? 'Yes' : 'Needs enhancement'}

---

# ORIGINAL RESEARCH CONTENT

${originalContent}`;

    return enhancedHeader;
  }

  createOutputDirectories() {
    if (!fs.existsSync(this.outputBase)) {
      fs.mkdirSync(this.outputBase, { recursive: true });
    }
    
    if (!fs.existsSync(this.enhancedDir)) {
      fs.mkdirSync(this.enhancedDir, { recursive: true });
    }
    
    console.log(`📁 Created output directories at: ${this.outputBase}`);
  }

  async saveAnalysisArtifacts() {
    // Save main intelligence database
    const databasePath = path.join(this.outputBase, 'socket-intelligence-database.json');
    fs.writeFileSync(databasePath, JSON.stringify(this.analysisResults, null, 2));
    console.log(`\n💾 Saved intelligence database: ${databasePath}`);
    
    // Save statistics summary
    const statsPath = path.join(this.outputBase, 'analysis-statistics.json');
    fs.writeFileSync(statsPath, JSON.stringify(this.analysisResults.statistics, null, 2));
    console.log(`📊 Saved statistics: ${statsPath}`);
    
    // Generate and save markdown summary
    const summaryPath = path.join(this.outputBase, 'ANALYSIS-SUMMARY.md');
    const summaryContent = this.generateMarkdownSummary();
    fs.writeFileSync(summaryPath, summaryContent);
    console.log(`📝 Saved analysis summary: ${summaryPath}`);
    
    // Generate competitive intelligence report
    const competitiveReport = this.generateCompetitiveReport();
    const competitivePath = path.join(this.outputBase, 'competitive-intelligence-report.md');
    fs.writeFileSync(competitivePath, competitiveReport);
    console.log(`🏢 Saved competitive report: ${competitivePath}`);
  }

  generateMarkdownSummary() {
    const stats = this.analysisResults.statistics;
    
    return `# Socket Intelligence Analysis Summary

## Processing Statistics
- **Total Files Processed**: ${stats.total_files_processed}
- **Average Content Length**: ${Math.round(stats.average_content_length)} characters
- **Processing Date**: ${stats.processing_date}

## Socket Categories Distribution
${Object.entries(stats.files_by_category)
  .sort(([,a], [,b]) => b - a)
  .map(([cat, count]) => `- **${cat}**: ${count} files`)
  .join('\n')}

## Market Segments Coverage
${Object.entries(stats.files_by_segment)
  .sort(([,a], [,b]) => b - a)
  .map(([seg, count]) => `- **${seg}**: ${count} files`)
  .join('\n')}

## Confidence Level Distribution
- **Level A (Excellent)**: ${stats.confidence_distribution.A} files
- **Level B (Good)**: ${stats.confidence_distribution.B} files
- **Level C (Fair)**: ${stats.confidence_distribution.C} files
- **Level D (Weak)**: ${stats.confidence_distribution.D} files

## Top Quality Files
${this.analysisResults.files
  .sort((a, b) => b.quality_score - a.quality_score)
  .slice(0, 10)
  .map((f, i) => `${i + 1}. **${f.filename}** (${f.quality_score}% quality, ${f.confidence_level} confidence)`)
  .join('\n')}

## Technical Coverage
${[...new Set(this.analysisResults.files.flatMap(f => f.technical_tags))]
  .map(tag => `- ${tag}`)
  .join('\n')}

## Next Steps
1. Review enhanced files in \`enhanced-context/\` directory
2. Set up vector database with API keys for semantic search
3. Run competitive intelligence research prompts in Gemini
4. Integrate with MCP server for real-time socket qualification
`;
  }

  generateCompetitiveReport() {
    const allIntel = this.analysisResults.files.map(f => f.competitive_intelligence);
    
    // Aggregate competitive intelligence
    const advantages = new Set();
    const gaps = new Set();
    const threats = new Map();
    
    allIntel.forEach(intel => {
      intel.mchp_advantages.forEach(a => advantages.add(a));
      intel.mchp_gaps.forEach(g => gaps.add(g));
      intel.competitor_threats.forEach(t => {
        const [vendor] = t.split(':');
        if (!threats.has(vendor)) threats.set(vendor, []);
        threats.get(vendor).push(t);
      });
    });
    
    return `# Competitive Intelligence Report

## Microchip Competitive Advantages
${[...advantages].slice(0, 20).map(a => `- ${a}`).join('\n') || 'No explicit advantages found in research'}

## Microchip Gaps and Challenges
${[...gaps].slice(0, 20).map(g => `- ${g}`).join('\n') || 'No explicit gaps identified'}

## Competitor Threat Analysis

${[...threats.entries()].map(([vendor, vendorThreats]) => `### ${vendor}
${vendorThreats.slice(0, 5).map(t => `- ${t}`).join('\n')}`).join('\n\n')}

## Strategic Recommendations
Based on the competitive analysis:
1. Leverage strong positions in TSN networking and serial EEPROM
2. Address gaps in wireless connectivity (WiFi/Bluetooth)
3. Focus on integrated solutions to counter TI's ecosystem
4. Emphasize automotive qualification against NXP
5. Strengthen analog portfolio to compete with ADI

## Files Analyzed
Total research files with competitive intelligence: ${allIntel.length}
`;
  }
}

// Run the generator
async function main() {
  const generator = new EnhancedFileGenerator();
  const results = await generator.generateAllEnhancedFiles();
  
  console.log('\n✨ ENHANCEMENT COMPLETE!');
  console.log('Generated artifacts:');
  console.log('  📊 socket-intelligence-database.json');
  console.log('  📈 analysis-statistics.json');
  console.log('  📝 ANALYSIS-SUMMARY.md');
  console.log('  🏢 competitive-intelligence-report.md');
  console.log(`  📁 ${results.statistics.total_files_processed} enhanced files in enhanced-context/`);
}

main().catch(console.error);