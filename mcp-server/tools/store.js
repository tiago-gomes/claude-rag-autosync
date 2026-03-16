import { getEmbeddingService } from 'file:///home/geone/.claude/memory/scripts/lib/embeddings.js';
import { getMemoryStore } from 'file:///home/geone/.claude/memory/scripts/lib/memory-store.js';

export async function memoryRAGStore(args) {
  const { memory_type, event, entity, type, description, importance = 0.5, project, related_entities = [] } = args;

  if (!memory_type) {
    throw new Error('memory_type is required');
  }

  // Get services (singleton pattern)
  const embeddingService = await getEmbeddingService();
  const memoryStore = await getMemoryStore();

  let memory;
  let content;

  if (memory_type === 'episodic') {
    if (!event) {
      throw new Error('event is required for episodic memories');
    }

    memory = {
      event,
      type: type || 'development_event',
      project,
      importance,
      related_entities,
      context: description ? { description } : {}
    };

    content = event + (description ? `: ${description}` : '');

    // Generate embedding
    memory.embedding = await embeddingService.generateEmbedding(content);

    // Store using existing MemoryStore.storeEpisodic()
    const stored = await memoryStore.storeEpisodic(memory);

    return {
      success: true,
      id: stored.id,
      message: 'Episodic memory stored successfully',
      memory_type: 'episodic'
    };
  } else {
    if (!entity) {
      throw new Error('entity is required for semantic memories');
    }

    memory = {
      entity,
      type: type || 'project',
      description: description || '',
      attributes: {},
      relationships: [],
      examples: [],
      confidence: importance,
      source: 'mcp_plugin'
    };

    // Store using existing MemoryStore.storeSemantic()
    const stored = await memoryStore.storeSemantic(memory);

    return {
      success: true,
      id: stored.id,
      message: 'Semantic memory stored successfully',
      memory_type: 'semantic'
    };
  }
}
