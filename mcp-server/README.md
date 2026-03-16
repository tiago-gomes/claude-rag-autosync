# 🧠 MCP RAG Server

Servidor Model Context Protocol (MCP) para armazenamento e busca semântica de memórias com RAG (Retrieval-Augmented Generation).

## 🎯 O que é?

Um servidor MCP que permite ao Claude Code:
- **Armazenar** memórias (episódicas e semânticas)
- **Buscar** memórias por similaridade semântica
- **Extrair** memórias de texto automaticamente
- **Estatísticas** sobre o sistema de memória

## 🚀 Funcionalidades

### 1. Store - Armazenar Memórias

```typescript
// Memória Episódica (eventos)
{
  memory_type: "episodic",
  event: "Implementámos sistema de autenticação",
  type: "feature_implementation",
  importance: 0.8,
  project: "BarberProStudio",
  related_entities: ["Supabase", "Auth"]
}

// Memória Semântica (conhecimento)
{
  memory_type: "semantic",
  entity: "BarberProStudio",
  type: "project_context",
  description: "SaaS multi-tenant para barbearias",
  importance: 0.9,
  project: "BarberProStudio"
}
```

### 2. Search - Buscar Memórias

```typescript
// Busca semântica por similaridade
{
  query: "sistema de autenticação",
  top_k: 5,              // Número de resultados
  min_similarity: 0.75,  // Similaridade mínima
  include_episodic: true,
  include_semantic: true
}
```

### 3. Extract - Extrair Memórias

```typescript
// Análise automática de texto
{
  text: "Implementámos sistema de pagamentos com Stripe",
  min_importance: 0.7,   // Importância mínima
  project: "BarberProStudio"
}
```

### 4. Stats - Estatísticas

Retorna:
- Número de memórias (episódicas/semânticas)
- Tamanho do vector DB
- Configuração atual

## 🔧 Instalação

```bash
npm install
```

## 📖 Uso

### Como Servidor MCP

O servidor é usado pelo Claude Code através da configuração em `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "memory-rag": {
      "command": "node",
      "args": ["/caminho/absoluto/para/index.js"]
    }
  }
}
```

### Testar Independente

```bash
# Teste rápido
npm test

# Demonstração completa
node demo-memory-operations.js
```

## 🏗️ Arquitetura

```
index.js                 # Servidor MCP principal
├── tools/               # Ferramentas MCP
│   ├── store.js        # Armazenar memórias
│   ├── search.js       # Buscar memórias
│   ├── extract.js      # Extrair memórias
│   └── stats.js        # Estatísticas
└── lib/                # Bibliotecas internas
    ├── embeddings.js   # Geração de embeddings
    ├── vector-db.js    # Vector database
    └── memory-store.js # Armazenamento
```

## 🧪 Testes

```bash
# Teste rápido
./quick-test.sh

# Teste completo
./setup-and-test.sh

# Todas as demonstrações
./run-all-demos.sh
```

## 📊 Especificação Técnica

### Embeddings
- **Modelo**: Xenova/all-MiniLM-L6-v2
- **Dimensão**: 384
- **Tipo**: Float32

### Vector Database
- **Storage**: JSON files
- **Index**: Similaridade coseno
- **Persistence**: Disco

### Memórias
- **Episódicas**: Eventos temporais com timestamp
- **Semânticas**: Conhecimento estável sobre entidades

## 📝 API

### memory_rag_store

Armazena uma nova memória no sistema.

**Parâmetros**:
- `memory_type`: "episodic" | "semantic"
- `event` (episódica): Descrição do evento
- `entity` (semântica): Nome da entidade
- `description` (semântica): Descrição detalhada
- `type`: Categoria da memória
- `importance`: 0.0 - 1.0
- `project`: Nome do projeto
- `related_entities`: Lista de entidades relacionadas

**Retorna**:
```json
{
  "success": true,
  "id": "evt_20260316_123",
  "message": "Memory stored successfully"
}
```

### memory_rag_search

Busca memórias por similaridade semântica.

**Parâmetros**:
- `query`: Texto da busca
- `top_k`: Número máximo de resultados (default: 2)
- `min_similarity`: Similaridade mínima (default: 0.75)
- `include_episodic`: Incluir memórias episódicas (default: true)
- `include_semantic`: Incluir memórias semânticas (default: false)

**Retorna**:
```json
{
  "results": [
    {
      "id": "evt_20260316_123",
      "type": "episodic",
      "event": "Implementámos sistema de autenticação",
      "similarity": 0.85,
      "timestamp": "2026-03-16T12:00:00Z",
      "importance": 0.8
    }
  ],
  "count": 1
}
```

### memory_rag_extract

Extrai memórias de texto automaticamente.

**Parâmetros**:
- `text`: Texto para analisar
- `min_importance`: Importância mínima (default: 0.7)
- `project`: Nome do projeto

**Retorna**:
```json
{
  "extracted": 3,
  "memories": [...]
}
```

### memory_rag_stats

Retorna estatísticas do sistema.

**Retorna**:
```json
{
  "episodic_count": 19,
  "semantic_count": 11,
  "total_memories": 30,
  "vector_db_size": "0.68MB",
  "config": {
    "top_k": 2,
    "min_similarity": 0.75,
    "embedding_model": "Xenova/all-MiniLM-L6-v2"
  }
}
```

## 🔒 Segurança

- As memórias são armazenadas localmente
- Nenhum dado é enviado para servidores externos
- Embeddings são gerados localmente

## 📈 Performance

- **Armazenamento**: ~50ms por memória
- **Busca**: ~100ms para 1000 memórias
- **Extração**: ~200ms para texto médio

## 🤝 Contribuir

Contribuições são bem-vindas! Por favor:

1. Fork o repositório
2. Cria uma branch
3. Commit as mudanças
4. Push para a branch
5. Abre um Pull Request

## 📄 Licença

MIT

---

**Parte do projeto Claude RAG Auto-Sync**
