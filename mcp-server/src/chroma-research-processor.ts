import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import { ChromaClient, OpenAIEmbeddingFunction } from 'chromadb';

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

export class ChromaResearchProcessor {
  private openai: OpenAI;
  private chroma: ChromaClient;
  private collectionName: string;
  private embeddingFunction: OpenAIEmbeddingFunction;

  constructor(openaiKey: string, chromaUrl: string = 'http://localhost:8000', collectionName: string = 'socket-intelligence') {
    this.openai = new OpenAI({ apiKey: openaiKey });
    this.chroma = new ChromaClient({ path: chromaUrl });
    this.collectionName = collectionName;
    
    // Create OpenAI embedding function for Chroma
    this.embeddingFunction = new OpenAIEmbeddingFunction({
      openai_api_key: openaiKey,
      openai_model: 'text-embedding-3-small'
    });
  }

  /**
   * Process all socket research files and prepare for vector database
   */
  async processAllResearchFiles(researchPath: string): Promise<ResearchFile[]> {
    console.log('📁 Scanning research directories...');
    
    const researchFiles: ResearchFile[] = [];
    
    // Process socket-research-batch outputs
    const batchOutputsPath = path.join(researchPath, 'socket-research-batch', 'outputs');
    if (fs.existsSync(batchOutputsPath)) {
      const batchFiles = await this.processDirectory(batchOutputsPath, 'batch_research');
      researchFiles.push(...batchFiles);
    }

    // Process socket-research-priority deep research
    const priorityPath = path.join(researchPath, 'socket-research-priority', 'output-dropzones');
    if (fs.existsSync(priorityPath)) {
      const priorityFiles = await this.processDirectory(priorityPath, 'deep_research');
      researchFiles.push(...priorityFiles);
    }

    console.log(`📊 Processed ${researchFiles.length} research files`);
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
   */
  async uploadToChroma(researchFiles: ResearchFile[]): Promise<void> {
    console.log('📤 Uploading to Chroma...');

    try {
      // Create or get collection
      const collection = await this.chroma.getOrCreateCollection({
        name: this.collectionName,
        embeddingFunction: this.embeddingFunction
      });

      console.log(`✅ Collection '${this.collectionName}' ready`);

      // Prepare documents for Chroma
      const chromaDocuments: ChromaDocument[] = researchFiles.map(file => ({
        id: file.id,
        document: this.createEmbeddingText(file),
        metadata: {
          ...file.metadata,
          filename: file.filename,
          content_preview: file.content.substring(0, 500)
        }
      }));

      // Upload in batches - reduced to avoid OpenAI rate limits
      const batchSize = 10; // Smaller batches to stay under 40k tokens/min limit
      for (let i = 0; i < chromaDocuments.length; i += batchSize) {
        const batch = chromaDocuments.slice(i, i + batchSize);
        console.log(`Uploading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chromaDocuments.length / batchSize)}`);
        
        await collection.add({
          ids: batch.map(doc => doc.id),
          documents: batch.map(doc => doc.document),
          metadatas: batch.map(doc => doc.metadata)
        });
        
        // Longer delay between batches to avoid rate limits (2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));
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
        status: 'ready'
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
   * Create optimized text for embedding generation
   */
  private createEmbeddingText(file: ResearchFile): string {
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
   * Generate unique ID for research file
   */
  private generateId(filename: string, filePath: string): string {
    // Use filename and path to create unique ID
    const uniqueString = `${filename}_${filePath}`.replace(/[^a-zA-Z0-9-_]/g, '_');
    // Ensure it's unique and valid for Chroma
    return uniqueString.substring(0, 63); // Chroma has 63 char limit for IDs
  }

  /**
   * Test connection to Chroma server
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.chroma.heartbeat();
      console.log('✅ Chroma server connection successful');
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to Chroma server:', error);
      console.log('💡 Make sure Chroma server is running on http://localhost:8000');
      return false;
    }
  }
}