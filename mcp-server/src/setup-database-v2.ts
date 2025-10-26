#!/usr/bin/env node

import { ChromaResearchProcessor } from './chroma-research-processor-v2';
import * as path from 'path';
import * as fs from 'fs';

async function setupIntelligenceDatabase() {
  console.log('🚀 Setting up Socket Intelligence Database with Intelligent Chunking...\n');

  try {
    // Load configuration
    const configPath = path.join(__dirname, '..', 'embedding-config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    console.log('📋 Configuration:');
    console.log(`  Embedding: ${config.embedding.useLocal ? 'Local' : 'OpenAI'} ` +
                `(${config.embedding.useLocal ? config.embedding.model : config.embedding.openaiModel})`);
    console.log(`  Chunking: ${config.chunking.enabled ? 'Enabled' : 'Disabled'} ` +
                `(${config.chunking.maxTokens} tokens max, ${config.chunking.overlapTokens} overlap)`);
    console.log(`  Section-aware: ${config.chunking.sectionAware ? 'Yes' : 'No'}`);
    console.log();

    // Get API key (if using OpenAI)
    const openaiKey = config.embedding.useLocal ? null : process.env.OPENAI_API_KEY;

    if (!config.embedding.useLocal && !openaiKey) {
      console.error('❌ Error: OPENAI_API_KEY not set but local embeddings disabled');
      console.log('💡 Either:');
      console.log('   1. Set OPENAI_API_KEY environment variable');
      console.log('   2. Enable local embeddings in embedding-config.json');
      process.exit(1);
    }

    // Initialize processor
    const processor = new ChromaResearchProcessor(
      openaiKey,
      config.chroma.url,
      config.chroma.collectionName,
      {
        useLocalEmbeddings: config.embedding.useLocal,
        embeddingModel: config.embedding.model,
        enableChunking: config.chunking.enabled,
        maxTokens: config.chunking.maxTokens,
        overlapTokens: config.chunking.overlapTokens,
        sectionAware: config.chunking.sectionAware
      }
    );

    // Test Chroma connection
    console.log('🔌 Testing Chroma connection...');
    const connected = await processor.testConnection();

    if (!connected) {
      console.log('⚠️ Chroma server not available at ' + config.chroma.url);
      console.log('💡 Start Chroma server with:');
      console.log('   docker run -p 8000:8000 chromadb/chroma');
      process.exit(1);
    }

    console.log('✅ Chroma server connected\n');

    // Check for Python dependencies (if using local embeddings)
    if (config.embedding.useLocal) {
      console.log('🐍 Checking Python dependencies...');
      const { spawn } = require('child_process');

      try {
        const python = spawn('python3', ['-c',
          'import sentence_transformers; print("✅ sentence-transformers installed")'
        ]);

        await new Promise((resolve, reject) => {
          python.stdout.on('data', (data: Buffer) => console.log(data.toString().trim()));
          python.stderr.on('data', (data: Buffer) => console.error(data.toString().trim()));
          python.on('close', (code: number) => code === 0 ? resolve(null) : reject(new Error('Python check failed')));
        });
      } catch (error) {
        console.log('⚠️ sentence-transformers not installed');
        console.log('💡 Install with: pip install sentence-transformers');
        console.log('   Continuing anyway - will fail if local embeddings used...\n');
      }
    }

    // Process research files
    const basePath = path.join(__dirname, '..', '..');
    console.log(`📂 Processing research files from: ${basePath}\n`);

    const researchFiles = await processor.processAllResearchFiles(basePath);

    if (researchFiles.length === 0) {
      console.log('⚠️ No research files found!');
      console.log('💡 Check that enhanced-context directory exists with .md files');
      process.exit(1);
    }

    // Upload to Chroma with chunking
    console.log(`\n📤 Uploading ${researchFiles.length} files to vector database...\n`);
    await processor.uploadToChroma(researchFiles);

    // Get stats
    const stats = await processor.getCollectionStats();

    console.log('\n📊 DATABASE STATISTICS');
    console.log('=====================================');
    console.log(`Collection: ${stats.name}`);
    console.log(`Total documents: ${stats.document_count}`);
    console.log(`Status: ${stats.status}`);

    if (stats.config) {
      console.log('\nConfiguration:');
      console.log(`  Chunking: ${stats.config.chunking_enabled ? 'Enabled' : 'Disabled'}`);
      console.log(`  Embedding: ${stats.config.embedding_model}`);
      console.log(`  Max tokens per chunk: ${stats.config.max_tokens}`);
    }

    // Calculate improvement
    const oldApproach = researchFiles.length; // One embedding per file
    const newApproach = stats.document_count;
    const improvement = ((newApproach / oldApproach) - 1) * 100;

    console.log('\n📈 IMPROVEMENTS');
    console.log('=====================================');
    console.log(`Old approach: ${oldApproach} embeddings (one per file, truncated)`);
    console.log(`New approach: ${newApproach} embeddings (chunked, full content)`);
    console.log(`Improvement: ${improvement.toFixed(0)}% more searchable content`);

    console.log('\n✅ Socket Intelligence Database setup complete!');
    console.log('🔍 Vector search ready for use');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  setupIntelligenceDatabase();
}

export { setupIntelligenceDatabase };
