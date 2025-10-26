#!/usr/bin/env python3
"""
Local embedding generation using sentence-transformers
Supports multiple models optimized for semantic search
"""

import sys
import json
import argparse
from sentence_transformers import SentenceTransformer
import numpy as np

def parse_args():
    parser = argparse.ArgumentParser(description='Generate embeddings using sentence-transformers')
    parser.add_argument('--model', type=str, default='all-mpnet-base-v2',
                        help='Model name (e.g., all-mpnet-base-v2, BAAI/bge-large-en-v1.5)')
    parser.add_argument('--device', type=str, default='cpu',
                        help='Device to use (cpu or cuda)')
    parser.add_argument('--batch-size', type=int, default=32,
                        help='Batch size for encoding')
    parser.add_argument('--normalize', type=str, default='true',
                        help='Normalize embeddings (true/false)')
    return parser.parse_args()

def main():
    args = parse_args()

    # Load model
    try:
        model = SentenceTransformer(args.model, device=args.device)
    except Exception as e:
        print(f"Error loading model: {e}", file=sys.stderr)
        sys.exit(1)

    # Read texts from stdin
    try:
        texts = json.load(sys.stdin)
        if not isinstance(texts, list):
            raise ValueError("Input must be a JSON array of strings")
    except Exception as e:
        print(f"Error reading input: {e}", file=sys.stderr)
        sys.exit(1)

    # Generate embeddings
    try:
        normalize = args.normalize.lower() == 'true'
        embeddings = model.encode(
            texts,
            batch_size=args.batch_size,
            show_progress_bar=False,
            normalize_embeddings=normalize,
            convert_to_numpy=True
        )

        # Convert to list for JSON serialization
        embeddings_list = embeddings.tolist()

        # Output as JSON
        print(json.dumps(embeddings_list))

    except Exception as e:
        print(f"Error generating embeddings: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
