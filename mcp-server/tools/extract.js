import { getEmbeddingService } from 'file:///home/geone/.claude/memory/scripts/lib/embeddings.js';
import { getMemoryStore } from 'file:///home/geone/.claude/memory/scripts/lib/memory-store.js';

// Simple pattern matching (can be enhanced later)
const EXTRACTION_PATTERNS = [
  {
    pattern: /implemented\s+(?:a\s+)?(.+?)(?:\s+using\s+.+?)?\./gi,
    type: 'feature_implementation',
    importance: 0.8
  },
  {
    pattern: /added\s+(?:a\s+)?(.+?)\s+feature/gi,
    type: 'feature_implementation',
    importance: 0.7
  },
  {
    pattern: /created\s+(?:a\s+)?(.+?)(?:\s+for\s+.+?)?\./gi,
    type: 'feature_implementation',
    importance: 0.7
  },
  {
    pattern: /fixed\s+(?:a\s+)?(.+?)\s+bug/gi,
    type: 'bug_fix',
    importance: 0.7
  },
  {
    pattern: /resolved\s+(?:an?\s+)?issue\s+with\s+(.+?)/gi,
    type: 'bug_fix',
    importance: 0.7
  },
  {
    pattern: /deployed\s+(.+?)\s+to/gi,
    type: 'deployment',
    importance: 0.9
  },
  {
    pattern: /configured\s+(.+?)\s+for/gi,
    type: 'deployment',
    importance: 0.8
  },
  {
    pattern: /refactored\s+(.+?)\s+to/gi,
    type: 'architecture_decision',
    importance: 0.85
  },
  {
    pattern: /chose\s+(.+?)\s+over/gi,
    type: 'architecture_decision',
    importance: 0.85
  }
];

/**
 * Extract related entities from text
 */
function extractRelatedEntities(text) {
  const entities = [];

  // File paths
  const filePathMatches = text.match(/[\w\-\.\/]+\.(ts|tsx|js|jsx|py|java|go|rs)/g);
  if (filePathMatches) {
    entities.push(...filePathMatches);
  }

  // Component names (PascalCase)
  const componentMatches = text.match(/\b[A-Z][a-zA-Z0-9]*\b/g);
  if (componentMatches) {
    entities.push(...componentMatches.slice(0, 5));
  }

  return [...new Set(entities)];
}

export async function memoryRAGExtract(args) {
  const { text, project, min_importance = 0.7 } = args;

  if (!text) {
    throw new Error('text is required');
  }

  const extracted = [];

  for (const { pattern, type, importance: baseImportance } of EXTRACTION_PATTERNS) {
    const matches = text.matchAll(pattern);

    for (const match of matches) {
      const event = match[0].trim();
      let importance = baseImportance;

      // Boost importance for certain keywords
      if (event.includes('security') || event.includes('critical')) {
        importance += 0.2;
      }
      importance = Math.min(1, importance);

      if (importance >= min_importance) {
        extracted.push({
          event,
          type,
          importance,
          project,
          related_entities: extractRelatedEntities(event)
        });
      }
    }
  }

  // Store extracted memories
  const stored = [];
  const embeddingService = await getEmbeddingService();
  const memoryStore = await getMemoryStore();

  for (const memory of extracted) {
    try {
      const memoryWithEmbedding = {
        ...memory,
        embedding: await embeddingService.generateEmbedding(memory.event)
      };

      const result = await memoryStore.storeEpisodic(memoryWithEmbedding);
      stored.push({ id: result.id, event: memory.event });
    } catch (error) {
      console.error(`Failed to store memory: ${error.message}`);
    }
  }

  return {
    extracted,
    stored_count: stored.length,
    total_found: extracted.length
  };
}
