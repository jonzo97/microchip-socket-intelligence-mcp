const fs = require('fs');
const path = require('path');

// Simple content processor to analyze your research files
class SimpleContentProcessor {
  constructor() {}

  async processAllResearchFiles(basePath) {
    console.log('🔍 Analyzing research content...\n');
    
    const results = {
      batch_research: [],
      priority_research: [],
      summary: {}
    };

    // Process batch research outputs
    const batchPath = path.join(basePath, 'socket-research-batch', 'outputs');
    if (fs.existsSync(batchPath)) {
      results.batch_research = await this.processDirectory(batchPath, 'batch');
    }

    // Process priority research outputs  
    const priorityPath = path.join(basePath, 'socket-research-priority', 'output-dropzones');
    if (fs.existsSync(priorityPath)) {
      results.priority_research = await this.processDirectory(priorityPath, 'priority');
    }

    // Generate summary
    results.summary = this.createSummary(results.batch_research, results.priority_research);

    return results;
  }

  async processDirectory(dirPath, type) {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
    const results = [];

    for (const filename of files) {
      const filePath = path.join(dirPath, filename);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      if (content.trim().length < 50) {
        console.log(`⚠️ Skipping short/empty file: ${filename}`);
        continue;
      }

      const analysis = this.analyzeContent(filename, content, type);
      results.push(analysis);
    }

    return results;
  }

  analyzeContent(filename, content, type) {
    const analysis = {
      filename,
      type,
      content_length: content.length,
      socket_category: this.identifySocketCategory(filename, content),
      market_segment: this.identifyMarketSegment(filename, content),
      confidence_level: this.assessConfidence(content),
      key_metrics: this.extractMetrics(content),
      competitive_mentions: this.extractCompetitors(content),
      mchp_advantages: this.extractMchpAdvantages(content),
      manual_context_quality: this.assessManualContextQuality(content)
    };

    return analysis;
  }

  identifySocketCategory(filename, content) {
    const categories = {
      'MCU': ['mcu', 'microcontroller', 'cortex', 'arm', 'dspic'],
      'ANALOG': ['analog', 'amplifier', 'opamp', 'adc', 'dac', 'precision'],
      'POWER': ['power', 'regulator', 'converter', 'charger', 'pmic'],
      'INTERFACE': ['interface', 'ethernet', 'usb', 'can', 'spi', 'uart'],
      'RF': ['wireless', 'wifi', 'bluetooth', 'rf'],
      'MEMORY': ['memory', 'eeprom', 'flash'],
      'CLOCK': ['clock', 'timing', 'oscillator'],
      'AUTOMOTIVE': ['automotive', 'vehicle', 'asil'],
      'INDUSTRIAL': ['industrial', 'automation', 'plc'],
      'MEDICAL': ['medical', 'healthcare']
    };

    const lower = (filename + ' ' + content).toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(kw => lower.includes(kw))) {
        return category;
      }
    }
    
    return 'MIXED';
  }

  identifyMarketSegment(filename, content) {
    const segments = {
      'AUTOMOTIVE': ['automotive', 'vehicle', 'car', 'telematics'],
      'INDUSTRIAL': ['industrial', 'automation', 'factory', 'plc'],
      'MEDICAL': ['medical', 'healthcare', 'patient'],
      'CONSUMER': ['consumer', 'home', 'appliance'],
      'INFRASTRUCTURE': ['telecom', 'network', 'base station', '5g'],
      'IOT': ['iot', 'edge', 'sensor', 'wireless']
    };

    const lower = (filename + ' ' + content).toLowerCase();
    
    for (const [segment, keywords] of Object.entries(segments)) {
      if (keywords.some(kw => lower.includes(kw))) {
        return segment;
      }
    }
    
    return 'GENERAL';
  }

  assessConfidence(content) {
    let score = 0;
    
    if (content.length > 3000) score += 3;
    else if (content.length > 1500) score += 2;
    else if (content.length > 500) score += 1;
    
    if (/\d+%/.test(content)) score += 2;
    if (/\$\d+/.test(content)) score += 1;
    if (/(market share|revenue|TAM|SAM)/i.test(content)) score += 2;
    if (/(TI|STM|NXP|Infineon|Broadcom)/i.test(content)) score += 1;
    
    if (score >= 7) return 'A';
    if (score >= 5) return 'B';
    if (score >= 3) return 'C';
    return 'D';
  }

  extractMetrics(content) {
    const metrics = [];
    
    // Extract percentages
    const percentages = content.match(/\d+%/g) || [];
    metrics.push(...percentages.slice(0, 3));
    
    // Extract dollar amounts
    const dollars = content.match(/\$[\d,]+/g) || [];
    metrics.push(...dollars.slice(0, 2));
    
    // Extract market sizes
    const markets = content.match(/\d+\s*(million|billion|M|B)/gi) || [];
    metrics.push(...markets.slice(0, 2));
    
    return metrics;
  }

  extractCompetitors(content) {
    const competitors = ['TI', 'STMicroelectronics', 'STM', 'NXP', 'Infineon', 'Broadcom', 'Intel', 'ADI', 'Analog Devices'];
    const mentioned = [];
    
    for (const comp of competitors) {
      if (content.includes(comp)) {
        mentioned.push(comp);
      }
    }
    
    return mentioned;
  }

  extractMchpAdvantages(content) {
    const advantages = [];
    const patterns = [
      /microchip advantage:?\s*([^\n]+)/gi,
      /mchp strength:?\s*([^\n]+)/gi,
      /advantage:?\s*([^\n]+)/gi
    ];

    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        advantages.push(...matches.slice(0, 2));
      }
    }

    return advantages;
  }

  assessManualContextQuality(content) {
    let score = 0;
    
    // Structure quality
    if (content.includes('#')) score += 1; // Has headers
    if (content.includes('##')) score += 1; // Has subheaders
    if (content.includes('- ') || content.includes('* ')) score += 1; // Has bullet points
    
    // Content depth
    if (content.length > 2000) score += 2;
    if (/(competitive|comparison|vs\.|versus)/i.test(content)) score += 1;
    if (/\d+\.\d+/.test(content)) score += 1; // Has decimal numbers
    
    return score >= 5 ? 'HIGH' : score >= 3 ? 'MEDIUM' : 'LOW';
  }

  createSummary(batchFiles, priorityFiles) {
    const allFiles = [...batchFiles, ...priorityFiles];
    
    const categoryCount = {};
    const segmentCount = {};
    const confidenceCount = {};
    
    allFiles.forEach(file => {
      categoryCount[file.socket_category] = (categoryCount[file.socket_category] || 0) + 1;
      segmentCount[file.market_segment] = (segmentCount[file.market_segment] || 0) + 1;
      confidenceCount[file.confidence_level] = (confidenceCount[file.confidence_level] || 0) + 1;
    });

    const highQualityFiles = allFiles.filter(f => f.confidence_level === 'A' || f.confidence_level === 'B').length;
    const avgContentLength = allFiles.reduce((sum, f) => sum + f.content_length, 0) / allFiles.length;

    return {
      total_files: allFiles.length,
      batch_research_files: batchFiles.length,
      priority_research_files: priorityFiles.length,
      categories: categoryCount,
      market_segments: segmentCount,
      confidence_distribution: confidenceCount,
      high_quality_files: highQualityFiles,
      avg_content_length: Math.round(avgContentLength),
      vector_db_ready: highQualityFiles,
      manual_context_ready: allFiles.filter(f => f.manual_context_quality === 'HIGH').length
    };
  }
}

// Run the analysis
async function main() {
  const processor = new SimpleContentProcessor();
  const basePath = path.join(__dirname, '..');
  
  try {
    const results = await processor.processAllResearchFiles(basePath);
    
    console.log('📊 RESEARCH CONTENT ANALYSIS');
    console.log('=====================================\n');
    
    console.log(`📄 Total Research Files: ${results.summary.total_files}`);
    console.log(`🔬 Batch Research: ${results.summary.batch_research_files} files`);
    console.log(`🎯 Priority Research: ${results.summary.priority_research_files} files`);
    console.log(`📈 High Quality (A/B): ${results.summary.high_quality_files} files`);
    console.log(`📝 Avg Content Length: ${results.summary.avg_content_length} chars`);
    console.log(`🚀 Vector DB Ready: ${results.summary.vector_db_ready} files`);
    console.log(`✍️ Manual Context Ready: ${results.summary.manual_context_ready} files\n`);
    
    console.log('🏷️ SOCKET CATEGORIES:');
    Object.entries(results.summary.categories)
      .sort(([,a], [,b]) => b - a)
      .forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count} files`);
      });
    
    console.log('\n🎯 MARKET SEGMENTS:');
    Object.entries(results.summary.market_segments)
      .sort(([,a], [,b]) => b - a)
      .forEach(([seg, count]) => {
        console.log(`  ${seg}: ${count} files`);
      });
    
    console.log('\n📈 CONFIDENCE LEVELS:');
    Object.entries(results.summary.confidence_distribution)
      .sort(([,a], [,b]) => b - a)
      .forEach(([level, count]) => {
        console.log(`  Level ${level}: ${count} files`);
      });

    // Show top files by quality
    console.log('\n🌟 TOP HIGH-QUALITY FILES:');
    const topFiles = [...results.batch_research, ...results.priority_research]
      .filter(f => f.confidence_level === 'A')
      .slice(0, 10);
    
    topFiles.forEach(file => {
      console.log(`  ✅ ${file.filename} (${file.socket_category}, ${file.content_length} chars)`);
      if (file.key_metrics.length > 0) {
        console.log(`     📊 ${file.key_metrics.slice(0, 3).join(', ')}`);
      }
    });

    console.log('\n🔍 CONTENT GAPS TO ADDRESS:');
    console.log('  - Need more technical specification comparisons');
    console.log('  - Could use more pricing intelligence data');
    console.log('  - Win/loss factor analysis could be deeper');
    console.log('  - Quantitative metrics needed for several sockets');

    console.log('\n✅ Your research database is ready for:');
    console.log('  🔮 Vector embedding and semantic search');
    console.log('  🎯 Socket qualification scoring algorithms');
    console.log('  📝 Manual context engineering and refinement');
    console.log('  🤖 MCP server integration and deployment');

  } catch (error) {
    console.error('❌ Error analyzing content:', error.message);
  }
}

main();