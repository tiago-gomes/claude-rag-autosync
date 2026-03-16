#!/usr/bin/env node
/**
 * Process RAG Queue
 * Lê a fila de memórias e prepara para armazenamento via MCP RAG
 * Uso: Claude pode chamar este script e depois usar mcp__memory-rag__memory_rag_store
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const MEMORY_DIR = path.join(path.dirname(__filename), '../..');
const RAG_QUEUE = path.join(MEMORY_DIR, 'rag-queue.json');
const PROCESSED_LOG = path.join(MEMORY_DIR, 'rag-processed.json');

/**
 * Carrega e processa a fila de memórias
 */
async function processQueue() {
  try {
    // Carregar fila
    const queueContent = await fs.readFile(RAG_QUEUE, 'utf-8');
    const queue = JSON.parse(queueContent);

    if (queue.length === 0) {
      console.log('📭 Fila vazia. Nenhuma memória para processar.');
      return [];
    }

    console.log(`📦 Processando ${queue.length} memórias da fila...`);

    // Carregar log de processados
    let processed = new Set();
    try {
      const logContent = await fs.readFile(PROCESSED_LOG, 'utf-8');
      const log = JSON.parse(logContent);
      processed = new Set(log.processed_ids || []);
    } catch {
      // Log não existe
    }

    // Filtrar memórias não processadas
    const unprocessed = queue.filter(m => !processed.has(m.event));

    if (unprocessed.length === 0) {
      console.log('✅ Todas as memórias já foram processadas.');
      return [];
    }

    // Dedicuplicar por evento similar
    const uniqueMemories = [];
    const seen = new Set();

    for (const memory of unprocessed) {
      const key = memory.event?.toLowerCase().substring(0, 30);
      if (!seen.has(key)) {
        seen.add(key);
        uniqueMemories.push(memory);
      }
    }

    console.log(`🎯 ${uniqueMemories.length} memórias únicas para armazenar`);

    // Retornar memórias para processamento via MCP
    return uniqueMemories;

  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('📭 Fila vazia (arquivo não existe).');
      return [];
    }
    throw error;
  }
}

/**
 * Marca memórias como processadas
 */
async function markAsProcessed(memoryIds) {
  try {
    let log = { processed_ids: [] };
    try {
      const content = await fs.readFile(PROCESSED_LOG, 'utf-8');
      log = JSON.parse(content);
    } catch {
      // Log não existe
    }

    log.processed_ids.push(...memoryIds);
    log.processed_ids = log.processed_ids.slice(-100); // Manter só últimos 100

    await fs.writeFile(PROCESSED_LOG, JSON.stringify(log, null, 2));

    // Limpar fila se todas foram processadas
    const queueContent = await fs.readFile(RAG_QUEUE, 'utf-8');
    const queue = JSON.parse(queueContent);

    const remaining = queue.filter(m => !memoryIds.includes(m.event));
    await fs.writeFile(RAG_QUEUE, JSON.stringify(remaining, null, 2));

    console.log(`✅ ${memoryIds.length} memórias marcadas como processadas`);
    console.log(`📼 Fila restante: ${remaining.length}`);

  } catch (error) {
    console.error('❌ Erro ao marcar como processado:', error.message);
  }
}

/**
 * Formata memórias para exibição
 */
function formatMemories(memories) {
  return memories.map((m, i) => {
    const typeIcon = {
      'feature_implementation': '✨',
      'bug_fix': '🐛',
      'architecture_decision': '🏗️',
      'configuration': '⚙️',
      'project_context': '📋'
    }[m.type] || '💾';

    const importanceBar = '█'.repeat(Math.ceil(m.importance * 5)) + '░'.repeat(5 - Math.ceil(m.importance * 5));

    return `
${typeIcon} [#${i + 1}] ${m.type}
   Evento: ${m.event}
   Importância: ${importanceBar} (${m.importance.toFixed(2)})
   Entidades: ${m.related_entities?.join(', ') || 'Nenhuma'}
`;
  }).join('\n');
}

// Main execution
const mode = process.argv[2] || 'process';

if (mode === 'process') {
  const memories = await processQueue();
  if (memories.length > 0) {
    console.log('\n📋 Memórias para armazenar:\n');
    console.log(formatMemories(memories));
    console.log('\n💡 Para armazenar, peça ao Claude: "processa a fila RAG"');
  }
} else if (mode === 'mark') {
  const ids = process.argv.slice(3);
  await markAsProcessed(ids);
} else if (mode === 'clear') {
  await fs.writeFile(RAG_QUEUE, '[]');
  console.log('🗑️ Fila limpa.');
}

export { processQueue, markAsProcessed };
