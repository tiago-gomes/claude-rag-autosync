import { readFileSync } from 'fs';
import { join } from 'path';
import { getMemoryStore } from 'file:///home/geone/.claude/memory/scripts/lib/memory-store.js';
import { promises as fs } from 'fs';

export async function memoryRAGStats() {
  const rootPath = join(process.env.HOME, '.claude/memory');
  const configPath = join(rootPath, 'config.json');
  const vectorPath = join(rootPath, 'vector');

  let config;
  try {
    config = JSON.parse(readFileSync(configPath, 'utf-8'));
  } catch (error) {
    config = {
      retrieval: { top_k: 2, min_similarity: 0.75 },
      embedding: { model: 'Xenova/all-MiniLM-L6-v2' }
    };
  }

  const memoryStore = await getMemoryStore();

  // Get memory counts
  const episodicMemories = await memoryStore.listEpisodic();
  const semanticMemories = await memoryStore.listSemantic();

  // Calculate vector DB size
  let vectorDbSize = 0;
  try {
    const files = await fs.readdir(vectorPath, { recursive: true });
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = join(vectorPath, file);
        const stats = await fs.stat(filePath);
        vectorDbSize += stats.size;
      }
    }
  } catch (error) {
    // Ignore if vector directory doesn't exist yet
  }

  return {
    episodic_count: episodicMemories.length,
    semantic_count: semanticMemories.length,
    total_memories: episodicMemories.length + semanticMemories.length,
    vector_db_size: `${(vectorDbSize / 1024 / 1024).toFixed(2)}MB`,
    config: {
      top_k: config.retrieval?.top_k || 2,
      min_similarity: config.retrieval?.min_similarity || 0.75,
      embedding_model: config.embedding?.model || 'Xenova/all-MiniLM-L6-v2'
    }
  };
}
