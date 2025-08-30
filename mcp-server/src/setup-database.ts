#!/usr/bin/env node

import { ContentProcessor } from './content-processor';
import { ChromaResearchProcessor } from './chroma-research-processor';
import * as path from 'path';
import * as fs from 'fs';

async function setupIntelligenceDatabase() {
  console.log('🚀 Setting up Socket Intelligence Database...\n');

  try {
    // Initialize processors
    const contentProcessor = new ContentProcessor();
    
    // Process all research content
    const basePath = path.join(__dirname, '..', '..');
    console.log('📂 Processing research files from:', basePath);
    
    const database = await contentProcessor.processAllResearchContent(basePath);
    
    // Save processed database
    const outputDir = path.join(__dirname, '..', 'intelligence-database');
    await contentProcessor.saveProcessedDatabase(database, outputDir);

    // Print summary
    console.log('\n📊 PROCESSING SUMMARY');
    console.log('=====================================');
    console.log(`Total files processed: ${database.processing_summary.total_files_processed}`);
    console.log(`Socket categories identified: ${Object.keys(database.processing_summary.files_by_category).length}`);
    console.log(`Vector DB readiness: ${database.processing_summary.vector_db_readiness_score}%`);
    
    console.log('\n🏷️ FILES BY CATEGORY:');
    Object.entries(database.processing_summary.files_by_category).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} files`);
    });

    console.log('\n📈 CONFIDENCE DISTRIBUTION:');
    Object.entries(database.processing_summary.confidence_distribution).forEach(([level, count]) => {
      console.log(`  Level ${level}: ${count} files`);
    });

    console.log('\n🎯 SOCKET PROFILES CREATED:');
    database.sockets.forEach((profile, category) => {
      console.log(`  ${category}: ${profile.key_applications.length} applications, ${profile.competitive_dynamics.primary_competitors.length} competitors`);
    });

    console.log('\n🏢 COMPETITOR PROFILES:');
    database.competitive_landscape.forEach((profile, vendor) => {
      console.log(`  ${vendor}: Threat level ${profile.overall_threat_level}`);
    });

    // Check if we have API key for vector database setup
    if (process.env.OPENAI_API_KEY) {
      console.log('\n🔮 Setting up vector database with Chroma...');
      await setupVectorDatabase(database, basePath);
    } else {
      console.log('\n⚠️ Skipping vector database setup - API key not configured');
      console.log('Set OPENAI_API_KEY environment variable to enable vector search');
    }

    console.log('\n✅ Socket Intelligence Database setup complete!');
    console.log('🔧 Enhanced context files ready for manual engineering');
    console.log('📡 MCP server ready for integration');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

async function setupVectorDatabase(database: any, basePath: string) {
  try {
    const researchProcessor = new ChromaResearchProcessor(
      process.env.OPENAI_API_KEY!,
      'http://localhost:8000',
      'socket-intelligence'
    );

    // Test connection to Chroma server
    const connected = await researchProcessor.testConnection();
    if (!connected) {
      console.log('💡 Start Chroma server with: docker run -p 8000:8000 chromadb/chroma');
      return;
    }

    // Process research files for vector embeddings
    const researchFiles = await researchProcessor.processAllResearchFiles(basePath);
    
    if (researchFiles.length === 0) {
      console.log('⚠️ No research files found for vector processing');
      return;
    }

    console.log(`📄 Found ${researchFiles.length} research files for vector processing`);

    // Upload to Chroma (handles embedding generation automatically)
    await researchProcessor.uploadToChroma(researchFiles);
    
    // Get collection stats
    const stats = await researchProcessor.getCollectionStats();
    console.log(`✅ Vector database setup complete - ${stats.document_count} documents indexed`);

  } catch (error) {
    console.error('❌ Vector database setup failed:', error);
    console.log('💡 Continuing without vector search capabilities');
  }
}

// Run if called directly
if (require.main === module) {
  setupIntelligenceDatabase();
}

export { setupIntelligenceDatabase };