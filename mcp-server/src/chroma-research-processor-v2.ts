import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import { ChromaClient, OpenAIEmbeddingFunction } from 'chromadb';
import { IntelligentChunker, DocumentChunk } from './intelligent-chunker';
import { ChromaLocalEmbeddingFunction } from './local-embeddings';

export interface ResearchFile {
  id: string;
  filename: string;
  content: string;
  metadata: {
    socket_type: string;
    application: string;
    market_segment: string;
    confidence_level: string;
    content_type: string;
    source_path: string;
    file_size: number;
    processed_date: string;
  };
}

export interface ChromaDocument {
  id: string;
  document: string;
  metadata: any;
}

export interface ProcessorConfig {
  useLocalEmbeddings?: boolean;      // Use local sentence-transformers vs OpenAI
  embeddingModel?: string;            // e.g., 'all-mpnet-base-v2', 'BAAI/bge-large-en-v1.5'
  enableChunking?: boolean;           // Enable intelligent chunking
  maxTokens?: number;                 // Max tokens per chunk (384 for mpnet, 512 for bge)
  overlapTokens?: number;             // Token overlap between chunks
  sectionAware?: boolean;             // Try to chunk on section boundaries
}

export class ChromaResearchProcessor {
  private openai: OpenAI | null = null;
  private chroma: ChromaClient;
  private collectionName: string;
  private embeddingFunction: any;
  private chunker: IntelligentChunker;
  private config: ProcessorConfig;

  constructor(
    openaiKey: string | null,
    chromaUrl: string = 'http://localhost:8000',
    collectionName: string = 'socket-intelligence',
    config: ProcessorConfig = {}
  ) {
    this.chroma = new ChromaClient({ path: chromaUrl });
    this.collectionName = collectionName;

    // Merge default config
    this.config = {
      useLocalEmbeddings: config.useLocalEmbeddings ?? false,
      embeddingModel: config.embeddingModel ?? 'all-mpnet-base-v2',
      enableChunking: config.enableChunking ?? true,
      maxTokens: config.maxTokens ?? 384,
      overlapTokens: config.overlapTokens ?? 50,
      sectionAware: config.sectionAware ?? true
    };

    // Initialize embedding function
    if (this.config.useLocalEmbeddings) {
      console.log(`🔧 Using local embeddings: ${this.config.embeddingModel}`);
      this.embeddingFunction = new ChromaLocalEmbeddingFunction(this.config.embeddingModel);
    } else {
      if (!openaiKey) {
        throw new Error('OpenAI API key required when not using local embeddings');
      }
      console.log('🔧 Using OpenAI embeddings: text-embedding-3-small');
      this.openai = new OpenAI({ apiKey: openaiKey });
      this.embeddingFunction = new OpenAIEmbeddingFunction({
        openai_api_key: openaiKey,
        openai_model: 'text-embedding-3-small'
      });
    }

    // Initialize chunker
    this.chunker = new IntelligentChunker({
      maxTokens: this.config.maxTokens,
      overlapTokens: this.config.overlapTokens,
      sectionAware: this.config.sectionAware,
      includeMetadata: true
    });

    console.log(`📐 Chunking: ${this.config.enableChunking ? 'enabled' : 'disabled'} ` +
                `(${this.config.maxTokens} tokens, ${this.config.overlapTokens} overlap)`);
  }

  /**
   * Process all socket research files and prepare for vector database
   */
  async processAllResearchFiles(researchPath: string): Promise<ResearchFile[]> {
    console.log('📁 Scanning research directories...');

    const researchFiles: ResearchFile[] = [];

    // Process enhanced-context directory (all research files)
    const enhancedContextPath = path.join(researchPath, 'intelligence-database', 'enhanced-context');
    if (fs.existsSync(enhancedContextPath)) {
      console.log(`📁 Reading from: ${enhancedContextPath}`);
      const allFiles = await this.processDirectory(enhancedContextPath, 'enhanced_research');
      researchFiles.push(...allFiles);

      // Log breakdown
      const deepFiles = allFiles.filter(f => f.filename.startsWith('deep-'));
      const claudeFiles = allFiles.filter(f => f.filename.startsWith('enhanced-'));
      console.log(`  📊 Found ${claudeFiles.length} Claude research files`);
      console.log(`  🔬 Found ${deepFiles.length} Gemini deep research files`);
    } else {
      console.warn(`⚠️ Enhanced context directory not found: ${enhancedContextPath}`);
    }

    console.log(`📊 Processed ${researchFiles.length} research files for vector database`);
    return researchFiles;
  }

  /**
   * Process files in a directory
   */
  private async processDirectory(dirPath: string, contentType: string): Promise<ResearchFile[]> {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
    const results: ResearchFile[] = [];

    for (const filename of files) {
      const filePath = path.join(dirPath, filename);
      const content = fs.readFileSync(filePath, 'utf-8');

      if (content.trim().length === 0) {
        console.log(`⚠️ Skipping empty file: ${filename}`);
        continue;
      }

      const metadata = this.extractMetadata(filename, content, contentType, filePath);

      const researchFile: ResearchFile = {
        id: this.generateId(filename, filePath),
        filename,
        content,
        metadata
      };

      results.push(researchFile);
    }

    return results;
  }

  /**
   * Extract metadata from filename and content
   */
  private extractMetadata(filename: string, content: string, contentType: string, filePath: string): ResearchFile['metadata'] {
    // Extract socket type from filename
    let socketType = 'Unknown';
    let application = 'General';
    let marketSegment = 'Mixed';
    let confidenceLevel = 'C';

    // Parse filename patterns
    if (filename.includes('automotive')) marketSegment = 'Automotive';
    else if (filename.includes('industrial')) marketSegment = 'Industrial';
    else if (filename.includes('medical')) marketSegment = 'Medical';
    else if (filename.includes('consumer')) marketSegment = 'Consumer';
    else if (filename.includes('telecom') || filename.includes('network')) marketSegment = 'Infrastructure';

    // Extract socket type from content or filename
    const socketTypes = ['MCU', 'FPGA', 'Analog', 'Power', 'Clock', 'Interface', 'RF', 'Memory'];
    for (const type of socketTypes) {
      if (content.toLowerCase().includes(type.toLowerCase()) ||
          filename.toLowerCase().includes(type.toLowerCase())) {
        socketType = type;
        break;
      }
    }

    // Determine confidence based on content quality
    const contentLength = content.length;
    if (contentLength > 5000) confidenceLevel = 'A';
    else if (contentLength > 2000) confidenceLevel = 'B';
    else if (contentLength > 500) confidenceLevel = 'C';
    else confidenceLevel = 'D';

    // Extract application from filename
    const appMatch = filename.match(/\d+-(.+?)-results/);
    if (appMatch) {
      application = appMatch[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    return {
      socket_type: socketType,
      application,
      market_segment: marketSegment,
      confidence_level: confidenceLevel,
      content_type: contentType,
      source_path: filePath,
      file_size: content.length,
      processed_date: new Date().toISOString()
    };
  }

  /**
   * Create and populate Chroma collection with research files
   * Now with intelligent chunking support!
   */
  async uploadToChroma(researchFiles: ResearchFile[]): Promise<void> {
    console.log('📤 Uploading to Chroma with intelligent chunking...');

    try {
      // Create or get collection
      const collection = await this.chroma.getOrCreateCollection({
        name: this.collectionName,
        embeddingFunction: this.embeddingFunction
      });

      console.log(`✅ Collection '${this.collectionName}' ready`);

      // Convert files to chunks
      const allChunks: DocumentChunk[] = [];
      let totalTokens = 0;

      for (const file of researchFiles) {
        if (this.config.enableChunking) {
          // Use intelligent chunking
          const chunks = this.chunker.chunkDocument(
            file.content,
            file.filename,
            {
              socketType: file.metadata.socket_type,
              application: file.metadata.application,
              marketSegment: file.metadata.market_segment,
              confidenceLevel: file.metadata.confidence_level
            }
          );

          allChunks.push(...chunks);
          totalTokens += chunks.reduce((sum, c) => sum + c.metadata.tokenCount, 0);

          console.log(`  📄 ${file.filename}: ${chunks.length} chunks, ` +
                      `${chunks.reduce((sum, c) => sum + c.metadata.tokenCount, 0)} tokens`);
        } else {
          // Legacy mode: one chunk per file (no chunking)
          const chunk: DocumentChunk = {
            id: file.id,
            content: this.createLegacyEmbeddingText(file),
            rawContent: file.content.substring(0, 8000),
            metadata: {
              filename: file.filename,
              chunkIndex: 0,
              totalChunks: 1,
              tokenCount: Math.ceil(file.content.length / 4),
              ...file.metadata
            }
          };
          allChunks.push(chunk);
        }
      }

      console.log(`\n📊 Total: ${allChunks.length} chunks, ${totalTokens.toLocaleString()} tokens`);
      console.log(`   Average: ${Math.round(totalTokens / allChunks.length)} tokens per chunk`);

      // Prepare documents for Chroma
      const chromaDocuments: ChromaDocument[] = allChunks.map(chunk => ({
        id: chunk.id,
        document: chunk.content,
        metadata: {
          ...chunk.metadata,
          content_preview: chunk.rawContent.substring(0, 200)
        }
      }));

      // Upload in batches
      const batchSize = this.config.useLocalEmbeddings ? 32 : 10; // Larger batches for local
      const delayMs = this.config.useLocalEmbeddings ? 0 : 2000;   // No delay needed for local

      for (let i = 0; i < chromaDocuments.length; i += batchSize) {
        const batch = chromaDocuments.slice(i, i + batchSize);
        const progress = `${Math.floor(i / batchSize) + 1}/${Math.ceil(chromaDocuments.length / batchSize)}`;
        console.log(`📦 Uploading batch ${progress} (${batch.length} chunks)`);

        await collection.add({
          ids: batch.map(doc => doc.id),
          documents: batch.map(doc => doc.document),
          metadatas: batch.map(doc => doc.metadata)
        });

        // Delay between batches (only for OpenAI to avoid rate limits)
        if (delayMs > 0 && i + batchSize < chromaDocuments.length) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }

      console.log('✅ Upload complete!');

      // Verify upload
      const count = await collection.count();
      console.log(`📊 Collection contains ${count} documents`);

    } catch (error) {
      console.error('❌ Error uploading to Chroma:', error);
      throw error;
    }
  }

  /**
   * Legacy embedding text creation (for backward compatibility)
   */
  private createLegacyEmbeddingText(file: ResearchFile): string {
    const { content, metadata } = file;

    // Extract key sections for embedding
    const lines = content.split('\n');
    let embeddingText = '';

    // Add metadata context
    embeddingText += `Socket Type: ${metadata.socket_type}\n`;
    embeddingText += `Application: ${metadata.application}\n`;
    embeddingText += `Market Segment: ${metadata.market_segment}\n\n`;

    // Extract headers and key content
    let currentSection = '';
    for (const line of lines) {
      if (line.startsWith('#')) {
        currentSection = line.replace(/#+\s*/, '').trim();
        embeddingText += `${currentSection}\n`;
      } else if (line.trim().length > 0 && embeddingText.length < 4000) {
        // Add non-empty lines up to token limit
        embeddingText += `${line.trim()}\n`;
      }
    }

    return embeddingText.substring(0, 8000); // Keep within embedding limits
  }

  /**
   * Search vectors in Chroma
   */
  async searchVectors(query: string, filters: any = {}, nResults: number = 10): Promise<any> {
    try {
      const collection = await this.chroma.getCollection({
        name: this.collectionName,
        embeddingFunction: this.embeddingFunction
      });

      const searchParams: any = {
        queryTexts: [query],
        nResults,
        include: ['metadatas', 'documents', 'distances']
      };

      // Add filters if provided
      if (Object.keys(filters).length > 0) {
        searchParams.where = filters;
      }

      const results = await collection.query(searchParams);

      return {
        ids: results.ids[0],
        metadatas: results.metadatas[0],
        documents: results.documents[0],
        distances: results.distances?.[0] || []
      };

    } catch (error) {
      console.error('❌ Error searching vectors:', error);
      return {
        ids: [],
        metadatas: [],
        documents: [],
        distances: []
      };
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(): Promise<any> {
    try {
      const collection = await this.chroma.getCollection({
        name: this.collectionName,
        embeddingFunction: this.embeddingFunction
      });

      const count = await collection.count();

      return {
        name: this.collectionName,
        document_count: count,
        status: 'ready',
        config: {
          chunking_enabled: this.config.enableChunking,
          embedding_model: this.config.useLocalEmbeddings ? this.config.embeddingModel : 'openai',
          max_tokens: this.config.maxTokens
        }
      };
    } catch (error) {
      console.error('❌ Error getting collection stats:', error);
      return {
        name: this.collectionName,
        document_count: 0,
        status: 'error'
      };
    }
  }

  /**
   * Test connection to Chroma server
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.chroma.heartbeat();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate unique ID for research file/chunk
   */
  private generateId(filename: string, filePath: string): string {
    // Use filename and path to create unique ID
    const uniqueString = `${filename}_${filePath}`.replace(/[^a-zA-Z0-9-_]/g, '_');
    // Ensure it's unique and valid for Chroma
    return uniqueString.substring(0, 63); // Chroma has 63 char limit for IDs
  }
}
