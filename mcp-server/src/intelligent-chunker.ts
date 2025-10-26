import { encode } from 'gpt-tokenizer';

/**
 * Intelligent chunking strategy for research documents
 * Supports:
 * - Token-based chunking (accurate sizing)
 * - Section-aware splitting (preserves document structure)
 * - Overlapping chunks (maintains context)
 * - Metadata injection (search relevance)
 */

export interface ChunkOptions {
  maxTokens: number;           // Maximum tokens per chunk (e.g., 384 for mpnet, 512 for bge)
  overlapTokens: number;        // Overlap between chunks for context (e.g., 50)
  sectionAware: boolean;        // Try to split on section boundaries
  includeMetadata: boolean;     // Prepend metadata to each chunk
}

export interface DocumentChunk {
  id: string;                   // Unique chunk ID (filename_chunk_N)
  content: string;              // Chunk text with metadata
  rawContent: string;           // Chunk text without metadata
  metadata: {
    filename: string;
    chunkIndex: number;
    totalChunks: number;
    sectionTitle?: string;      // If chunked by section
    tokenCount: number;
    socketType?: string;
    application?: string;
    marketSegment?: string;
    confidenceLevel?: string;
  };
}

export class IntelligentChunker {
  private options: ChunkOptions;

  constructor(options: Partial<ChunkOptions> = {}) {
    this.options = {
      maxTokens: options.maxTokens ?? 384,        // Default: all-mpnet-base-v2
      overlapTokens: options.overlapTokens ?? 50,
      sectionAware: options.sectionAware ?? true,
      includeMetadata: options.includeMetadata ?? true
    };
  }

  /**
   * Count tokens in text using tiktoken (GPT tokenizer)
   * Note: Approximate for non-OpenAI models, but close enough
   */
  private countTokens(text: string): number {
    try {
      return encode(text).length;
    } catch (error) {
      // Fallback: rough approximation (1 token ≈ 4 characters)
      return Math.ceil(text.length / 4);
    }
  }

  /**
   * Extract markdown sections from document
   */
  private extractSections(content: string): Array<{ title: string; content: string; level: number }> {
    const lines = content.split('\n');
    const sections: Array<{ title: string; content: string; level: number }> = [];
    let currentSection = { title: '', content: '', level: 0 };

    for (const line of lines) {
      // Match markdown headers: # Title, ## Title, etc.
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);

      if (headerMatch) {
        // Save previous section if it has content
        if (currentSection.content.trim().length > 0) {
          sections.push({ ...currentSection });
        }

        // Start new section
        const level = headerMatch[1].length;
        const title = headerMatch[2].trim();
        currentSection = { title, content: '', level };
      } else {
        currentSection.content += line + '\n';
      }
    }

    // Add final section
    if (currentSection.content.trim().length > 0) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Chunk text by tokens with overlap (simple strategy)
   */
  private chunkByTokens(text: string, metadata?: any): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const lines = text.split('\n');
    let currentChunk = '';
    let currentTokens = 0;

    // Metadata header (if enabled)
    const metadataHeader = this.createMetadataHeader(metadata);
    const metadataTokens = this.countTokens(metadataHeader);

    for (const line of lines) {
      const lineTokens = this.countTokens(line);

      // Check if adding this line exceeds limit
      if (currentTokens + lineTokens + metadataTokens > this.options.maxTokens && currentChunk.length > 0) {
        // Save current chunk
        chunks.push({
          id: `${metadata?.filename || 'doc'}_chunk_${chunks.length}`,
          content: metadataHeader + currentChunk,
          rawContent: currentChunk,
          metadata: {
            filename: metadata?.filename || 'unknown',
            chunkIndex: chunks.length,
            totalChunks: 0, // Will update at end
            tokenCount: currentTokens + metadataTokens,
            ...metadata
          }
        });

        // Start new chunk with overlap
        const overlapLines = currentChunk.split('\n').slice(-3); // Keep last 3 lines for context
        currentChunk = overlapLines.join('\n') + '\n';
        currentTokens = this.countTokens(currentChunk);
      }

      currentChunk += line + '\n';
      currentTokens += lineTokens;
    }

    // Add final chunk
    if (currentChunk.trim().length > 0) {
      chunks.push({
        id: `${metadata?.filename || 'doc'}_chunk_${chunks.length}`,
        content: metadataHeader + currentChunk,
        rawContent: currentChunk,
        metadata: {
          filename: metadata?.filename || 'unknown',
          chunkIndex: chunks.length,
          totalChunks: 0,
          tokenCount: currentTokens + metadataTokens,
          ...metadata
        }
      });
    }

    // Update totalChunks for all chunks
    chunks.forEach(chunk => {
      chunk.metadata.totalChunks = chunks.length;
    });

    return chunks;
  }

  /**
   * Chunk document by sections (preserves structure)
   */
  private chunkBySections(content: string, metadata?: any): DocumentChunk[] {
    const sections = this.extractSections(content);
    const chunks: DocumentChunk[] = [];
    const metadataHeader = this.createMetadataHeader(metadata);
    const metadataTokens = this.countTokens(metadataHeader);

    let currentChunk = '';
    let currentTokens = 0;
    let currentSectionTitle = '';

    for (const section of sections) {
      const sectionText = `## ${section.title}\n${section.content}`;
      const sectionTokens = this.countTokens(sectionText);

      // If section alone exceeds limit, split it
      if (sectionTokens + metadataTokens > this.options.maxTokens) {
        // Save current chunk if exists
        if (currentChunk.length > 0) {
          chunks.push(this.createChunk(currentChunk, currentSectionTitle, chunks.length, metadata, metadataHeader));
          currentChunk = '';
          currentTokens = 0;
        }

        // Split large section into sub-chunks
        const subChunks = this.chunkByTokens(sectionText, metadata);
        subChunks.forEach(subChunk => {
          chunks.push({
            ...subChunk,
            id: `${metadata?.filename || 'doc'}_chunk_${chunks.length}`,
            metadata: {
              ...subChunk.metadata,
              sectionTitle: section.title,
              chunkIndex: chunks.length
            }
          });
        });
      }
      // If adding section exceeds limit, save current chunk and start new
      else if (currentTokens + sectionTokens + metadataTokens > this.options.maxTokens && currentChunk.length > 0) {
        chunks.push(this.createChunk(currentChunk, currentSectionTitle, chunks.length, metadata, metadataHeader));
        currentChunk = sectionText;
        currentTokens = sectionTokens;
        currentSectionTitle = section.title;
      }
      // Otherwise, add to current chunk
      else {
        currentChunk += sectionText + '\n\n';
        currentTokens += sectionTokens;
        if (!currentSectionTitle) {
          currentSectionTitle = section.title;
        }
      }
    }

    // Add final chunk
    if (currentChunk.trim().length > 0) {
      chunks.push(this.createChunk(currentChunk, currentSectionTitle, chunks.length, metadata, metadataHeader));
    }

    // Update totalChunks
    chunks.forEach(chunk => {
      chunk.metadata.totalChunks = chunks.length;
    });

    return chunks;
  }

  /**
   * Create metadata header for chunk
   */
  private createMetadataHeader(metadata?: any): string {
    if (!this.options.includeMetadata || !metadata) {
      return '';
    }

    let header = '';
    if (metadata.socketType) header += `Socket Type: ${metadata.socketType}\n`;
    if (metadata.application) header += `Application: ${metadata.application}\n`;
    if (metadata.marketSegment) header += `Market Segment: ${metadata.marketSegment}\n`;
    if (header.length > 0) header += '\n';

    return header;
  }

  /**
   * Helper to create chunk object
   */
  private createChunk(
    content: string,
    sectionTitle: string,
    index: number,
    metadata: any,
    metadataHeader: string
  ): DocumentChunk {
    return {
      id: `${metadata?.filename || 'doc'}_chunk_${index}`,
      content: metadataHeader + content,
      rawContent: content,
      metadata: {
        filename: metadata?.filename || 'unknown',
        chunkIndex: index,
        totalChunks: 0,
        sectionTitle: sectionTitle || undefined,
        tokenCount: this.countTokens(metadataHeader + content),
        socketType: metadata?.socketType,
        application: metadata?.application,
        marketSegment: metadata?.marketSegment,
        confidenceLevel: metadata?.confidenceLevel
      }
    };
  }

  /**
   * Main chunking method - automatically chooses best strategy
   */
  public chunkDocument(
    content: string,
    filename: string,
    metadata?: any
  ): DocumentChunk[] {
    const fullMetadata = {
      filename,
      ...metadata
    };

    // Check if document has sections (markdown headers)
    const hasSections = content.match(/^#{1,6}\s+.+$/m);

    if (this.options.sectionAware && hasSections) {
      console.log(`📄 Chunking by sections: ${filename}`);
      return this.chunkBySections(content, fullMetadata);
    } else {
      console.log(`📄 Chunking by tokens: ${filename}`);
      return this.chunkByTokens(content, fullMetadata);
    }
  }

  /**
   * Get chunking statistics for a document
   */
  public getChunkingStats(content: string): {
    totalTokens: number;
    estimatedChunks: number;
    hasSections: boolean;
    sectionCount: number;
  } {
    const totalTokens = this.countTokens(content);
    const sections = this.extractSections(content);
    const estimatedChunks = Math.ceil(totalTokens / (this.options.maxTokens - this.options.overlapTokens));

    return {
      totalTokens,
      estimatedChunks,
      hasSections: sections.length > 0,
      sectionCount: sections.length
    };
  }
}

/**
 * Example usage:
 *
 * const chunker = new IntelligentChunker({
 *   maxTokens: 384,        // For all-mpnet-base-v2
 *   overlapTokens: 50,
 *   sectionAware: true,
 *   includeMetadata: true
 * });
 *
 * const chunks = chunker.chunkDocument(
 *   fileContent,
 *   'deep-14-automotive-competitive.md',
 *   { socketType: 'MCU', marketSegment: 'Automotive' }
 * );
 *
 * console.log(`Created ${chunks.length} chunks`);
 * chunks.forEach(chunk => {
 *   console.log(`Chunk ${chunk.metadata.chunkIndex}: ${chunk.metadata.tokenCount} tokens`);
 *   if (chunk.metadata.sectionTitle) {
 *     console.log(`  Section: ${chunk.metadata.sectionTitle}`);
 *   }
 * });
 */
