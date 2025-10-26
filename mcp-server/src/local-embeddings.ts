/**
 * Local Embedding Support using sentence-transformers
 *
 * Supports multiple models:
 * - all-mpnet-base-v2 (384 dims, fast, recommended)
 * - bge-large-en-v1.5 (1024 dims, high quality)
 * - e5-large-v2 (1024 dims, technical content)
 *
 * Requires Python with sentence-transformers installed:
 * pip install sentence-transformers chromadb
 */

import { spawn } from 'child_process';
import * as path from 'path';

export interface EmbeddingOptions {
  model: 'all-mpnet-base-v2' | 'bge-large-en-v1.5' | 'e5-large-v2' | string;
  device?: 'cpu' | 'cuda';         // Use GPU if available
  batchSize?: number;               // Process multiple texts at once
  normalizeEmbeddings?: boolean;    // L2 normalization (recommended for search)
}

export class LocalEmbeddings {
  private model: string;
  private device: string;
  private batchSize: number;
  private normalizeEmbeddings: boolean;

  constructor(options: Partial<EmbeddingOptions> = {}) {
    this.model = options.model ?? 'all-mpnet-base-v2';
    this.device = options.device ?? 'cpu';
    this.batchSize = options.batchSize ?? 32;
    this.normalizeEmbeddings = options.normalizeEmbeddings ?? true;
  }

  /**
   * Generate embeddings using Python subprocess
   * This calls a Python script that uses sentence-transformers
   */
  async embed(texts: string[]): Promise<number[][]> {
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(__dirname, 'embed.py');

      const python = spawn('python3', [
        pythonScript,
        '--model', this.model,
        '--device', this.device,
        '--batch-size', this.batchSize.toString(),
        '--normalize', this.normalizeEmbeddings.toString()
      ]);

      let stdout = '';
      let stderr = '';

      // Send texts as JSON to Python
      python.stdin.write(JSON.stringify(texts));
      python.stdin.end();

      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python embedding failed: ${stderr}`));
          return;
        }

        try {
          const embeddings = JSON.parse(stdout);
          resolve(embeddings);
        } catch (error) {
          reject(new Error(`Failed to parse embeddings: ${error}`));
        }
      });
    });
  }

  /**
   * Embed a single text (convenience method)
   */
  async embedSingle(text: string): Promise<number[]> {
    const embeddings = await this.embed([text]);
    return embeddings[0];
  }

  /**
   * Get model info
   */
  getModelInfo(): { model: string; dimensions: number; maxTokens: number } {
    const modelSpecs: Record<string, { dimensions: number; maxTokens: number }> = {
      'all-mpnet-base-v2': { dimensions: 768, maxTokens: 384 },
      'bge-large-en-v1.5': { dimensions: 1024, maxTokens: 512 },
      'e5-large-v2': { dimensions: 1024, maxTokens: 512 },
      'all-MiniLM-L6-v2': { dimensions: 384, maxTokens: 256 }
    };

    return {
      model: this.model,
      ...(modelSpecs[this.model] || { dimensions: 768, maxTokens: 512 })
    };
  }
}

/**
 * Chroma-compatible embedding function for local models
 */
export class ChromaLocalEmbeddingFunction {
  private embedder: LocalEmbeddings;

  constructor(model: string = 'all-mpnet-base-v2') {
    this.embedder = new LocalEmbeddings({ model });
  }

  async generate(texts: string[]): Promise<number[][]> {
    return this.embedder.embed(texts);
  }
}

/**
 * Example usage:
 *
 * // Option 1: Direct usage
 * const embedder = new LocalEmbeddings({ model: 'all-mpnet-base-v2' });
 * const embeddings = await embedder.embed(['text 1', 'text 2']);
 *
 * // Option 2: With Chroma
 * const embeddingFn = new ChromaLocalEmbeddingFunction('all-mpnet-base-v2');
 * const collection = await chromaClient.createCollection({
 *   name: 'socket-intelligence',
 *   embeddingFunction: embeddingFn
 * });
 */
