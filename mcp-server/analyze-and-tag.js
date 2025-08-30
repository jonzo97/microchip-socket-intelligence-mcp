const fs = require('fs');
const path = require('path');

// Show where all research files are and how they're tagged
class ResearchFileAnalyzer {
  constructor() {
    this.researchLocations = {
      original_batch: '../socket-research-batch/outputs',
      original_priority: '../socket-research-priority/output-dropzones',
      processed_database: './intelligence-database',
      enhanced_context: './intelligence-database/enhanced-context',
      competitive_intel: '../socket-research-priority/competitive-intelligence-prompts'
    };
  }

  analyzeCurrentState() {
    console.log('📂 SOCKET INTELLIGENCE FILE STRUCTURE\n');
    console.log('=====================================\n');

    // 1. Original Research Files (Unmodified)
    console.log('1️⃣ ORIGINAL RESEARCH FILES (87 total)\n');
    console.log('📁 Batch Research: socket-research-batch/outputs/');
    const batchFiles = this.countFiles(this.researchLocations.original_batch);
    console.log(`   └── ${batchFiles} files (40 prompts, various results)\n`);

    console.log('📁 Priority Research: socket-research-priority/output-dropzones/');
    const priorityFiles = this.countFiles(this.researchLocations.original_priority);
    console.log(`   └── ${priorityFiles} files (19 deep research prompts)\n`);

    // 2. How Files Are Tagged
    console.log('2️⃣ TAGGING SYSTEM (Automated Metadata Extraction)\n');
    console.log('Each file is analyzed and tagged with:');
    console.log('   • Socket Category: MCU, ANALOG, POWER, INTERFACE, RF, MEMORY, CLOCK');
    console.log('   • Market Segment: AUTOMOTIVE, INDUSTRIAL, MEDICAL, CONSUMER, INFRASTRUCTURE');
    console.log('   • Confidence Level: A (excellent), B (good), C (fair), D (weak)');
    console.log('   • Content Type: market_analysis, competitive_intel, technical_spec, customer_requirement');
    console.log('   • Key Insights: Top 5 extracted insights from content');
    console.log('   • Competitive Intel: MCHP advantages, gaps, competitor threats');
    console.log('   • Technical Tags: TSN, CAN-FD, ETHERNET, WIRELESS, etc.\n');

    // 3. Processing Status
    console.log('3️⃣ PROCESSING & ANALYSIS STATUS\n');
    
    // Sample a few files to show their analysis
    const sampleFiles = [
      'socket-research-batch/outputs/01-socket-results.md',
      'socket-research-batch/outputs/07-memory-controllers-results.md',
      'socket-research-priority/output-dropzones/01-TSN-results-PASTE-HERE.md'
    ];

    console.log('Sample File Analysis:');
    for (const file of sampleFiles) {
      const fullPath = path.join(__dirname, '..', file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const analysis = this.analyzeFile(path.basename(file), content);
        console.log(`\n📄 ${path.basename(file)}`);
        console.log(`   Category: ${analysis.category}`);
        console.log(`   Segment: ${analysis.segment}`);
        console.log(`   Confidence: ${analysis.confidence}`);
        console.log(`   Size: ${analysis.size} chars`);
        console.log(`   Quality: ${analysis.quality}`);
      }
    }

    // 4. Where Processed Files Will Go
    console.log('\n4️⃣ PROCESSED FILE LOCATIONS (When Generated)\n');
    console.log('📂 intelligence-database/');
    console.log('   ├── socket-intelligence-database.json  (Complete analyzed database)');
    console.log('   ├── enhanced-context/  (Files with metadata headers for manual editing)');
    console.log('   │   ├── enhanced-01-socket-results.md');
    console.log('   │   ├── enhanced-02-high-speed-serdes-results.md');
    console.log('   │   └── ... (87 enhanced files with metadata)');
    console.log('   └── competitive-data/  (Scraped competitive specifications)');

    // 5. Vector Database Structure
    console.log('\n5️⃣ VECTOR DATABASE STRUCTURE (When API Keys Set)\n');
    console.log('Pinecone Index: socket-intelligence');
    console.log('   • Namespace: research-files');
    console.log('   • Vectors: 87 embeddings (1536 dimensions each)');
    console.log('   • Metadata per vector:');
    console.log('     - filename, socket_category, market_segment');
    console.log('     - confidence_level, content_preview');
    console.log('     - embedding_text_length, processed_date\n');

    // 6. Current Storage Summary
    console.log('6️⃣ CURRENT STORAGE SUMMARY\n');
    const totalSize = this.calculateTotalSize();
    console.log(`Total Research Content: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Average File Size: ${(totalSize / 87 / 1024).toFixed(1)} KB`);
    console.log('Status: All files preserved in original locations');
    console.log('Processing: In-memory analysis, no files modified\n');

    // 7. How to Generate Enhanced Files
    console.log('7️⃣ TO GENERATE ENHANCED/TAGGED FILES:\n');
    console.log('Run: npm run setup-db');
    console.log('This will:');
    console.log('  1. Process all 87 research files');
    console.log('  2. Extract and tag metadata automatically');
    console.log('  3. Create enhanced versions with metadata headers');
    console.log('  4. Generate socket-intelligence-database.json');
    console.log('  5. Prepare for vector embedding (if API keys set)');
  }

  analyzeFile(filename, content) {
    const categories = {
      'mcu': 'MCU', 'analog': 'ANALOG', 'power': 'POWER',
      'interface': 'INTERFACE', 'memory': 'MEMORY', 'clock': 'CLOCK'
    };

    const segments = {
      'automotive': 'AUTOMOTIVE', 'industrial': 'INDUSTRIAL',
      'medical': 'MEDICAL', 'consumer': 'CONSUMER'
    };

    let category = 'MIXED';
    let segment = 'GENERAL';
    
    const lower = (filename + content).toLowerCase();
    
    for (const [key, val] of Object.entries(categories)) {
      if (lower.includes(key)) {
        category = val;
        break;
      }
    }

    for (const [key, val] of Object.entries(segments)) {
      if (lower.includes(key)) {
        segment = val;
        break;
      }
    }

    const confidence = content.length > 5000 ? 'A' : 
                       content.length > 2000 ? 'B' :
                       content.length > 1000 ? 'C' : 'D';

    const quality = content.length > 10000 ? 'EXCELLENT' :
                   content.length > 5000 ? 'GOOD' :
                   content.length > 2000 ? 'FAIR' : 'MINIMAL';

    return {
      category,
      segment,
      confidence,
      size: content.length,
      quality
    };
  }

  countFiles(dir) {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) return 0;
    return fs.readdirSync(fullPath).filter(f => f.endsWith('.md')).length;
  }

  calculateTotalSize() {
    let totalSize = 0;
    const dirs = [this.researchLocations.original_batch, this.researchLocations.original_priority];
    
    for (const dir of dirs) {
      const fullPath = path.join(__dirname, dir);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.md'));
        for (const file of files) {
          const stats = fs.statSync(path.join(fullPath, file));
          totalSize += stats.size;
        }
      }
    }
    
    return totalSize;
  }
}

// Run the analysis
const analyzer = new ResearchFileAnalyzer();
analyzer.analyzeCurrentState();