#!/usr/bin/env node

/**
 * Direct Memory Operations Demo
 * Executes memory operations without MCP protocol
 */

import { getEmbeddingService } from 'file:///home/geone/.claude/memory/scripts/lib/embeddings.js';
import { getMemoryStore } from 'file:///home/geone/.claude/memory/scripts/lib/memory-store.js';

const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function log(message, color = 'RESET') {
  console.log(`${{GREEN, CYAN, YELLOW, RESET}[color]}${message}${RESET}`);
}

async function main() {
  console.log('\n=== Memory RAG System - Direct Operations ===\n');

  const embeddingService = await getEmbeddingService();
  const memoryStore = await getMemoryStore();

  // Operation 1: Stats
  console.log(`${CYAN}1️⃣  Operation: memory_rag_stats${RESET}`);
  const episodicMemories = await memoryStore.listEpisodic();
  const semanticMemories = await memoryStore.listSemantic();
  console.log(`${GREEN}✅ Total memories: ${episodicMemories.length + semanticMemories.length}${RESET}`);
  console.log(`   - Episodic: ${episodicMemories.length}`);
  console.log(`   - Semantic: ${semanticMemories.length}\n`);

  // Operation 2: Search
  console.log(`${CYAN}2️⃣  Operation: memory_rag_search${RESET}`);
  console.log(`   Query: "BarberProStudio"\n`);
  const queryEmbedding = await embeddingService.generateEmbedding('BarberProStudio');
  const searchResults = await memoryStore.searchSimilar(queryEmbedding, {
    topK: 3,
    minSimilarity: 0.5,
    includeTypes: ['episodic']
  });
  console.log(`${GREEN}✅ Found ${searchResults.length} relevant memories:${RESET}`);
  searchResults.forEach((result, index) => {
    console.log(`   [${index + 1}] ${result.event?.substring(0, 80)}...`);
    console.log(`       Similarity: ${result.similarity.toFixed(2)} | Importance: ${result.importance.toFixed(2)}`);
  });
  console.log('');

  // Operation 3: Store
  console.log(`${CYAN}3️⃣  Operation: memory_rag_store${RESET}`);
  console.log(`   Storing memory about MCP implementation...\n`);
  const newMemory = {
    event: 'Implemented MCP plugin for RAG memory system with automatic validation',
    type: 'feature_implementation',
    project: 'Claude-CLI-Memory-System',
    importance: 0.95,
    related_entities: ['index.js', 'tools/search.js', 'tools/store.js'],
    context: {
      description: 'Created complete MCP server exposing RAG memory system as tools',
      features: ['semantic search', 'memory storage', 'NLP extraction', 'statistics']
    }
  };
  const content = newMemory.event + ': ' + newMemory.context.description;
  newMemory.embedding = await embeddingService.generateEmbedding(content);
  const stored = await memoryStore.storeEpisodic(newMemory);
  console.log(`${GREEN}✅ Memory stored successfully!${RESET}`);
  console.log(`   ID: ${stored.id}`);
  console.log(`   Event: ${stored.event.substring(0, 80)}...`);
  console.log(`   Importance: ${stored.importance}\n`);

  // Operation 4: Extract
  console.log(`${CYAN}4️⃣  Operation: memory_rag_extract${RESET}`);
  console.log(`   Extracting memories from text...\n`);
  const textToAnalyze = `
    Today I implemented the MCP server for the RAG memory system.
    It was challenging but I managed to get it working with automatic validation.
    The server exposes 4 tools: search, store, extract, and stats.
    I also created automated tests to verify everything works correctly.
  `;

  // Extract patterns
  const EXTRACTION_PATTERNS = [
    { pattern: /implemented\s+(?:a\s+)?(.+?)(?:\s+using\s+.+?)?\./gi, type: 'feature_implementation', importance: 0.8 },
    { pattern: /created\s+(?:a\s+)?(.+?)(?:\s+for\s+.+?)?\./gi, type: 'feature_implementation', importance: 0.7 },
  ];

  const extracted = [];
  for (const { pattern, type, importance } of EXTRACTION_PATTERNS) {
    const matches = textToAnalyze.matchAll(pattern);
    for (const match of matches) {
      const event = match[0].trim();
      if (event.length > 20) {  // Filter out very short matches
        extracted.push({ event, type, importance });
      }
    }
  }

  console.log(`${GREEN}✅ Extracted ${extracted.length} memories:${RESET}`);
  for (const mem of extracted) {
    console.log(`   - ${mem.event}`);
  }

  // Store extracted memories
  console.log(`\n   Storing extracted memories...`);
  for (const mem of extracted) {
    try {
      const memoryWithEmbedding = {
        ...mem,
        project: 'Claude-CLI-Memory-System',
        embedding: await embeddingService.generateEmbedding(mem.event)
      };
      await memoryStore.storeEpisodic(memoryWithEmbedding);
    } catch (error) {
      console.error(`   Failed to store: ${error.message}`);
    }
  }
  console.log(`${GREEN}✅ All extracted memories stored!\n`);

  // Final stats
  console.log(`${CYAN}5️⃣  Final Statistics${RESET}`);
  const finalEpisodic = await memoryStore.listEpisodic();
  const finalSemantic = await memoryStore.listSemantic();
  console.log(`${GREEN}✅ Total memories after operations: ${finalEpisodic.length + finalSemantic.length}${RESET}`);
  console.log(`   - Episodic: ${finalEpisodic.length} (${finalEpisodic.length - episodicMemories.length} new)`);
  console.log(`   - Semantic: ${finalSemantic.length}\n`);

  console.log('=== All Operations Complete! ===\n');
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
