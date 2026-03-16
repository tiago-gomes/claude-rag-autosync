#!/usr/bin/env node
/**
 * Auto Memory Extractor
 * Analisa respostas do Claude e extrai memórias importantes automaticamente
 * Integrado com MCP RAG para armazenamento contínuo
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEMORY_DIR = path.join(__dirname, '..');
const EXTRACTION_LOG = path.join(MEMORY_DIR, 'auto-extractions.json');
const RAG_QUEUE = path.join(MEMORY_DIR, 'rag-queue.json');

/**
 * Analisa texto e extrai memórias importantes
 */
function extractMemories(text, project = 'BarberProStudio') {
  const memories = [];

  // Padrões de implementação (Português + Inglês)
  const implPatterns = [
    // Português
    /(?:Implementámos|Implementei|Criámos|Criei|Adicionámos|Adicionei|Desenvolvemos|Desenvolvi|Configurámos|Configurei|Construímos|Construí) (.+?)(?:\.|\n|$)/gi,
    /(?:Adicionei|Implementámos) (?:a )?(?:funcionalidade|feature|sistema|módulo) (.+?)(?:\.|\n|$)/gi,
    /(?:Criámos|Criei) (?:o )?(?:handler|endpoint|função|método) (.+?)(?:\.|\n|$)/gi,
    // Inglês
    /(?:I|We) (?:have )?(?:implemented|created|added|built|set up|configured|developed) (.+?)(?:\.|\n|$)/gi,
  ];

  // Padrões de correção/fix
  const fixPatterns = [
    /(?:Corrigi|Corrigimos|Resolvi|Resolvemos|Arrumei) (.+?)(?:\.|\n|$)/gi,
    /(?:Fixed|Resolved|Corrected) (.+?)(?:\.|\n|$)/gi,
  ];

  // Padrões de decisão arquitetural
  const archPatterns = [
    /(?:Refatorei|Refatoramos|Reestruturei|Reestruturamos) (.+?)(?:\.|\n|$)/gi,
    /(?:Refactored|Restructured) (.+?)(?:\.|\n|$)/gi,
  ];

  // Padrões de configuração
  const configPatterns = [
    /(?:Configurámos|Configurei|Definimos) (.+?) (?:em|para|with) (.+?)(?:\.|\n|$)/gi,
    /(?:configured|set up) (.+?) (?:to|with) (.+?)(?:\.|\n|$)/gi,
  ];

  // Detectar tecnologias mencionadas
  const techStack = [
    'React', 'TypeScript', 'Vite', 'Supabase', 'PostgreSQL', 'Stripe', 'Docker',
    'nginx', 'shadcn', 'Kotlin', 'Android', 'SMTP', 'Resend', 'RLS', 'Edge Functions',
    'MCP', 'RAG', 'Vector DB', 'Embeddings'
  ];

  // Extrair entidades do texto
  const extractEntities = (text) => {
    const entities = [];

    // File paths
    const files = text.match(/[\w\-\.\/]+\.(ts|tsx|js|jsx|py|java|go|rs|sql|json|md|kt|xml)/g);
    if (files) entities.push(...files.slice(0, 5));

    // Componentes
    const components = text.match(/\b[A-Z][a-z]+(?:[A-Z][a-z]+)+\b/g);
    if (components) entities.push(...components.slice(0, 3));

    // Tecnologias
    techStack.forEach(tech => {
      if (text.includes(tech)) entities.push(tech);
    });

    return [...new Set(entities)];
  };

  // Processar padrões
  const patternCategories = [
    { patterns: implPatterns, type: 'feature_implementation', baseImportance: 0.7 },
    { patterns: fixPatterns, type: 'bug_fix', baseImportance: 0.6 },
    { patterns: archPatterns, type: 'architecture_decision', baseImportance: 0.8 },
    { patterns: configPatterns, type: 'configuration', baseImportance: 0.75 },
  ];

  for (const category of patternCategories) {
    for (const pattern of category.patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const fullMatch = match[0].trim();

        // Evitar duplicatas muito similares
        const isDuplicate = memories.some(m =>
          m.event === fullMatch || m.event.includes(fullMatch.substring(0, 20))
        );

        if (!isDuplicate) {
          let importance = category.baseImportance;

          // Boost para palavras-chave importantes
          if (/security|critical|ssl|https|authentication/i.test(fullMatch)) importance += 0.2;
          if (/production|deploy|release/i.test(fullMatch)) importance += 0.1;
          if (/multi-tenant|rls|isolation/i.test(fullMatch)) importance += 0.15;

          memories.push({
            memory_type: 'episodic',
            event: fullMatch,
            type: category.type,
            importance: Math.min(1, importance),
            project,
            related_entities: extractEntities(fullMatch)
          });
        }
      }
    }
  }

  // Detectar informações semânticas importantes
  if (/barbershop|barberprostudio|barbearia/i.test(text)) {
    // Contexto do projeto
    const contextMatch = text.match(/(?:SaaS|Sistema|Aplicação) (?:multi-tenant )?(.+?)(?:\.|\n|$)/i);
    if (contextMatch) {
      memories.push({
        memory_type: 'semantic',
        entity: 'BarberProStudio',
        type: 'project_context',
        description: contextMatch[0].trim(),
        importance: 0.85,
        project
      });
    }
  }

  return memories;
}

/**
 * Calcula importância baseada no conteúdo
 */
function calculateImportance(memory) {
  let score = memory.importance || 0.5;

  // Boost para tipos específicos
  if (memory.type === 'architecture_decision') score += 0.1;
  if (memory.type === 'feature_implementation') score += 0.05;

  // Boost para entidades importantes
  const importantEntities = ['Supabase', 'Stripe', 'RLS', 'Edge Functions', 'MCP'];
  if (memory.related_entities?.some(e => importantEntities.includes(e))) {
    score += 0.1;
  }

  return Math.min(1, score);
}

/**
 * Filtra memórias de baixa qualidade
 */
function filterMemories(memories) {
  return memories.filter(m => {
    // Remover memórias muito curtas
    if (m.event && m.event.length < 15) return false;

    // Remover memórias genéricas
    const generic = /^(?:OK|Sim|Não|Sure|Done|Fixed|Added)/i;
    if (m.event && generic.test(m.event)) return false;

    // Manter só memórias com importância mínima
    return calculateImportance(m) >= 0.5;
  });
}

/**
 * Main execution
 */
async function main() {
  try {
    const responseText = process.argv[2] || '';

    // Pular respostas muito curtas
    if (responseText.length < 200) {
      process.exit(0);
    }

    // Extrair memórias
    const rawMemories = extractMemories(responseText);
    const filteredMemories = filterMemories(rawMemories);

    if (filteredMemories.length === 0) {
      process.exit(0);
    }

    // Carregar fila existente
    let queue = [];
    try {
      const queueContent = await fs.readFile(RAG_QUEUE, 'utf-8');
      queue = JSON.parse(queueContent);
    } catch {
      // Fila não existe ainda
    }

    // Adicionar novas memórias à fila
    queue.push(...filteredMemories.map(m => ({
      ...m,
      timestamp: new Date().toISOString(),
      importance: calculateImportance(m)
    })));

    // Limitar fila a 50 itens
    queue = queue.slice(-50);

    // Salvar fila
    await fs.mkdir(MEMORY_DIR, { recursive: true });
    await fs.writeFile(RAG_QUEUE, JSON.stringify(queue, null, 2));

    // Log de extração
    const logEntry = {
      timestamp: new Date().toISOString(),
      response_length: responseText.length,
      extracted_count: filteredMemories.length,
      memories: filteredMemories
    };

    let logs = [];
    try {
      const logContent = await fs.readFile(EXTRACTION_LOG, 'utf-8');
      logs = JSON.parse(logContent);
    } catch {
      // Log não existe ainda
    }

    logs.push(logEntry);
    logs = logs.slice(-20); // Manter só últimos 20 logs
    await fs.writeFile(EXTRACTION_LOG, JSON.stringify(logs, null, 2));

    console.error(`✅ Extraídas ${filteredMemories.length} memórias (fila: ${queue.length})`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
