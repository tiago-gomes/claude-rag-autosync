import { getEmbeddingService } from 'file:///home/geone/.claude/memory/scripts/lib/embeddings.js';
import { getMemoryStore } from 'file:///home/geone/.claude/memory/scripts/lib/memory-store.js';

export async function memoryRAGSearch(args) {
  const { query, top_k = 2, min_similarity = 0.75, include_episodic = true, include_semantic = false } = args;

  if (!query) {
    throw new Error('Query is required');
  }

  // Get services (singleton pattern)
  const embeddingService = await getEmbeddingService();
  const memoryStore = await getMemoryStore();

  // Generate embedding for query
  const queryEmbedding = await embeddingService.generateEmbedding(query);

  // Build includeTypes array
  const includeTypes = [];
  if (include_episodic) includeTypes.push('episodic');
  if (include_semantic) includeTypes.push('semantic');

  // Search memories using existing MemoryStore.searchSimilar()
  const results = await memoryStore.searchSimilar(queryEmbedding, {
    topK: top_k,
    minSimilarity: min_similarity,
    includeTypes
  });

  return {
    results: results.map(r => ({
      id: r.id,
      type: r.event ? 'episodic' : 'semantic',
      event: r.event || r.entity,
      similarity: r.similarity,
      timestamp: r.timestamp || r.last_updated,
      importance: r.importance || r.confidence
    })),
    count: results.length,
    query
  };
}
