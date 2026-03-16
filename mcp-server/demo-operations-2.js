#!/usr/bin/env node

/**
 * Memory Operations Demo - Part 2
 * Stores BarberProStudio-specific memories
 */

import { getEmbeddingService } from 'file:///home/geone/.claude/memory/scripts/lib/embeddings.js';
import { getMemoryStore } from 'file:///home/geone/.claude/memory/scripts/lib/memory-store.js';

const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

async function main() {
  console.log('\n=== Storing BarberProStudio Memories ===\n');

  const embeddingService = await getEmbeddingService();
  const memoryStore = await getMemoryStore();

  const memories = [
    {
      event: 'Configured Stripe payment integration with webhook handlers for appointment booking',
      type: 'feature_implementation',
      project: 'BarberProStudio',
      importance: 0.9,
      related_entities: ['stripe-webhook', 'appointments', 'payment']
    },
    {
      event: 'Implemented multi-tenant subdomain routing system for public booking pages',
      type: 'feature_implementation',
      project: 'BarberProStudio',
      importance: 0.95,
      related_entities: ['subdomain', 'booking', 'routing']
    },
    {
      event: 'Created email notification system with SMTP provider for appointment reminders',
      type: 'feature_implementation',
      project: 'BarberProStudio',
      importance: 0.85,
      related_entities: ['email', 'smtp', 'notifications']
    },
    {
      event: 'Deployed application with Docker Compose and nginx SSL configuration',
      type: 'deployment',
      project: 'BarberProStudio',
      importance: 0.8,
      related_entities: ['docker', 'nginx', 'ssl']
    }
  ];

  console.log(`${CYAN}Storing ${memories.length} BarberProStudio memories...${RESET}\n`);

  for (const memory of memories) {
    const content = memory.event;
    const memoryWithEmbedding = {
      ...memory,
      embedding: await embeddingService.generateEmbedding(content)
    };

    const stored = await memoryStore.storeEpisodic(memoryWithEmbedding);
    console.log(`${GREEN}✅ Stored:${RESET} ${memory.event.substring(0, 70)}...`);
    console.log(`   ID: ${stored.id} | Importance: ${memory.importance}\n`);
  }

  // Now search for BarberProStudio
  console.log(`${CYAN}Searching for "BarberProStudio"...${RESET}\n`);
  const queryEmbedding = await embeddingService.generateEmbedding('BarberProStudio booking payment');
  const results = await memoryStore.searchSimilar(queryEmbedding, {
    topK: 5,
    minSimilarity: 0.3,
    includeTypes: ['episodic']
  });

  console.log(`${GREEN}✅ Found ${results.length} relevant memories:${RESET}\n`);
  results.forEach((result, index) => {
    console.log(`[${index + 1}] ${result.event?.substring(0, 90)}...`);
    console.log(`    Similarity: ${result.similarity.toFixed(2)} | Importance: ${result.importance.toFixed(2)}`);
    console.log(`    Type: ${result.type}\n`);
  });

  // Final count
  const allMemories = await memoryStore.listEpisodic();
  console.log(`${CYAN}Total episodic memories: ${allMemories.length}${RESET}\n`);
  console.log('=== Done! ===\n');
}

main().catch(console.error);
