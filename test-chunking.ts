#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { IntelligentChunker } from './mcp-server/src/intelligent-chunker';

// Test the chunker on actual files
async function testChunking() {
  const testFiles = [
    'deep-04-motor-control-dscs.md',
    'deep-14-automotive-competitive.md',
    'deep-11-enterprise-ethernet.md'
  ];

  const basePath = path.join(__dirname, 'intelligence-database', 'enhanced-context');

  // Create chunker with different configurations
  const configs = [
    { name: 'all-mpnet-base-v2', maxTokens: 384, overlapTokens: 50 },
    { name: 'bge-large-en', maxTokens: 512, overlapTokens: 64 }
  ];

  for (const config of configs) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Testing with ${config.name} (${config.maxTokens} tokens, ${config.overlapTokens} overlap)`);
    console.log('='.repeat(80));

    const chunker = new IntelligentChunker({
      maxTokens: config.maxTokens,
      overlapTokens: config.overlapTokens,
      sectionAware: true,
      includeMetadata: true
    });

    for (const filename of testFiles) {
      const filePath = path.join(basePath, filename);

      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ File not found: ${filename}`);
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf-8');

      // Get stats first
      const stats = chunker.getChunkingStats(content);
      console.log(`\n📄 ${filename}`);
      console.log(`  Size: ${content.length.toLocaleString()} chars`);
      console.log(`  Total tokens: ${stats.totalTokens.toLocaleString()}`);
      console.log(`  Has sections: ${stats.hasSections} (${stats.sectionCount} sections found)`);
      console.log(`  Estimated chunks: ${stats.estimatedChunks}`);

      // Chunk the document
      const chunks = chunker.chunkDocument(content, filename, {
        socketType: 'MCU',
        marketSegment: 'Automotive',
        application: 'Competitive Analysis',
        confidenceLevel: 'A'
      });

      console.log(`  ✅ Created: ${chunks.length} chunks`);

      // Show first 3 chunks details
      console.log(`\n  First 3 chunks:`);
      chunks.slice(0, 3).forEach(chunk => {
        console.log(`    Chunk ${chunk.metadata.chunkIndex + 1}/${chunk.metadata.totalChunks}:`);
        console.log(`      Tokens: ${chunk.metadata.tokenCount}`);
        if (chunk.metadata.sectionTitle) {
          console.log(`      Section: "${chunk.metadata.sectionTitle}"`);
        }
        console.log(`      Preview: "${chunk.rawContent.substring(0, 100).trim()}..."`);
      });

      // Calculate coverage
      const totalChunkTokens = chunks.reduce((sum, c) => sum + c.metadata.tokenCount, 0);
      const coverage = (totalChunkTokens / stats.totalTokens) * 100;
      console.log(`\n  📊 Coverage: ${coverage.toFixed(1)}% of original content`);
      console.log(`     (vs old method: ${(8000 / content.length * 100).toFixed(1)}%)`);
    }
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log('✅ Test complete!');
}

testChunking().catch(console.error);
